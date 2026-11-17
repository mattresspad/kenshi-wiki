import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,resolve,basename,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const [compiler,tools,mapStore,map,zip,python,...flags]=process.argv.slice(2);
assert.ok(python,'Arguments: compiler-directory KDT-directory map-store-directory KiMap-directory pinned-ZIP Python-executable [--live]');
const run=resolve('reports/technical-data/run-'+Date.now());
fs.mkdirSync(run,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const save=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
const json=file=>JSON.parse(fs.readFileSync(file));
function files(root,at='') {
  return fs.readdirSync(join(root,at),{withFileTypes:true}).filter(e=>e.name!=='__pycache__'&&!e.name.endsWith('.pyc'))
    .flatMap(e=>e.isDirectory()?files(root,join(at,e.name)):[join(at,e.name)]).sort();
}
function pin(root,names) {
  return names.flatMap(name=>fs.statSync(join(root,name)).isDirectory()?files(join(root,name)).map(file=>join(name,file)):[name])
    .sort().map(file=>{const bytes=fs.readFileSync(join(root,file));return {file:file.replaceAll('\\','/'),bytes:bytes.length,sha256:hash(bytes)};});
}
function git(root,...args) {
  const result=spawnSync('git',['-c','safe.directory='+root.replaceAll('\\','/'),'-C',root,...args],{encoding:'utf8'});
  return result.status===0?result.stdout.trim():null;
}
function source(root,names) {
  const inventory=pin(root,names);
  return {head:git(root,'rev-parse','--verify','HEAD'),workingChanges:git(root,'status','--short')?.split(/\r?\n/).filter(Boolean),
    digest:hash(JSON.stringify(inventory)),inventory};
}
const pins={
  compiler:source(compiler,['src','data/config','data/input','data/reference','schemas','pyproject.toml']),
  tools:source(tools,['KenshiData.Core/TownsFCSExtractor.cs','KenshiData.Core/FactionExtractor.cs','KenshiData.Core/RacesExtractor.cs','KenshiData.Core/ReferenceManager.cs','KenshiData.Core/ConfigurationManifest.cs','KenshiData.Core/KenshiData.Core.csproj']),
  mapStore:source(mapStore,['vanilla.lock.json','scripts/publication.mjs','src/datasets.json','src']),
  map:source(map,['modules','stores','package.json'])
};
save(join(run,'source-pins.json'),pins);
const copy=join(run,'compiler');
for(const file of ['src','data/config','data/input','data/reference','schemas','pyproject.toml'])
  fs.cpSync(join(compiler,file),join(copy,file),{recursive:true,filter:path=>!path.includes('__pycache__')&&!path.endsWith('.pyc')});
const publications=[];
for(const iteration of ['one','two']) {
  const output=join(run,iteration);
  const command=spawnSync(python,['-m','kenshi_data_compiler','build-publication','--publication','data/config/publications/vanilla-wiki-v0.1.json','--output',output],
    {cwd:copy,env:{...process.env,PYTHONPATH:join(copy,'src'),PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8',maxBuffer:16*1024*1024});
  fs.writeFileSync(join(run,'compiler-'+iteration+'.log'),command.stdout+'\n'+command.stderr);
  assert.equal(command.status,0,command.stdout+'\n'+command.stderr);
  const root=join(output,'vanilla-wiki-v0.1');
  const revision=fs.readdirSync(root).find(name=>/^[a-f0-9]{64}$/.test(name));
  assert.ok(revision);
  publications.push(join(root,revision));
}
assert.deepEqual(pin(publications[0],files(publications[0])),pin(publications[1],files(publications[1])),'Non-deterministic compiler publication');
const manifest=json(join(publications[0],'manifest.json'));
const records=fs.readFileSync(join(publications[0],'records.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const contexts=fs.readFileSync(join(publications[0],'context_catalog.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const {readVanillaArchive}=await import(pathToFileURL(join(mapStore,'scripts/publication.mjs')));
const bytes=fs.readFileSync(zip), publication=readVanillaArchive(bytes);
const contract=publication.contract.getmapdata;
const datasets=Object.fromEntries(Object.entries(contract.datasets).map(([key,entry])=>[key,JSON.parse(Buffer.from(publication.files[basename(entry.url)]))]));
const inputs=json(join(compiler,'data/config/input_sources.json')).sources;
const tests=[
  {type:'Town',dataset:'townFcsData',id:'33-gamedata.quack'},
  {type:'Town',dataset:'townFcsData',id:'1533709-__world reactions Slavers.mod'},
  {type:'WorldEventState',dataset:'worldStates',id:'1533710-__world reactions Slavers.mod'},
  {type:'Faction',dataset:'factions',id:'defaultEmpireFactionSID'},
  {type:'Race',dataset:'races',id:'17-gamedata.quack'}
];
const comparisons=tests.map(test=>{
  const raw=datasets[test.dataset].find(row=>row.StringId===test.id);
  assert.ok(raw,test.id);
  const compiled=records.find(row=>row.stringId===test.id);
  assert.ok(compiled,test.id);
  const changed=(left,right)=>[...new Set([...Object.keys(left??{}),...Object.keys(right??{})])].filter(key=>!isEqual(left?.[key],right?.[key]));
  assert.equal(compiled.type,test.type);
  assert.equal(compiled.objectKey,compiled.type+':'+test.id);
  return {...test,name:raw.Name,objectKey:compiled.objectKey,
    mapSource:basename(contract.datasets[test.dataset].url),compilerSource:compiled.sourceFile,
    valuesChanged:changed(raw.Values,compiled.values),referencesChanged:changed(raw.ReferenceCategories,compiled.referenceCategories)};
});
function stable(value) {
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
  return value;
}
function isEqual(a,b){return JSON.stringify(stable(a))===JSON.stringify(stable(b));}
const example=Object.fromEntries(tests.map(test=>{
  const raw=datasets[test.dataset].find(row=>row.StringId===test.id);
  return [test.type+':'+test.id,{name:raw.Name,values:raw.Values,referenceCategories:raw.ReferenceCategories,
    provenance:{archiveSha256:hash(bytes),publicationRevision:publication.revision,sourceFile:basename(contract.datasets[test.dataset].url)}}];
}));
const index=Buffer.from(JSON.stringify(stable(example))+'\n');
assert.equal(hash(index),hash(Buffer.from(JSON.stringify(stable(Object.fromEntries(Object.entries(example).reverse())))+'\n')));
fs.writeFileSync(join(run,'example-index.json'),index);
const {normalizeScenarioBaseline}=await import(pathToFileURL(join(map,'modules/scenario/baseline.js')));
const {replayScenario}=await import(pathToFileURL(join(map,'stores/scenario-session.js')));
const baseline=normalizeScenarioBaseline({contract,datasets});
const fresh=replayScenario(baseline,[]);
const shiro='1533707-__world reactions Slavers.mod';
const dead=replayScenario(baseline,[{id:'audit-shiro',type:'SetCharacterStatus',payload:{characterId:shiro,status:0,playerInvolved:true},occurredAt:'2026-11-17T00:00:00.000Z'}]);
const captured=replayScenario(baseline,[{id:'audit-shiro',type:'SetCharacterStatus',payload:{characterId:shiro,status:2,playerInvolved:true},occurredAt:'2026-11-17T00:00:00.000Z'}]);
const towns=Object.fromEntries(Object.entries({fresh,dead,captured}).map(([phase,result])=>[phase,result.snapshot.world.towns['33-gamedata.quack']]));
assert.equal(towns.fresh.activeTownId,'33-gamedata.quack');
assert.equal(towns.fresh.ownerId,'defaultEmpireFactionSID');
for(const phase of ['dead','captured']) {
  assert.equal(towns[phase].activeTownId,'1533709-__world reactions Slavers.mod');
  assert.equal(towns[phase].ownerId,'96359-rebirth.mod');
}
const readIndex=json(join(run,'example-index.json'));
const uc=readIndex['Faction:defaultEmpireFactionSID'];
assert.equal(uc.values['default relation'],0);
assert.equal(uc.referenceCategories.relations.find(row=>row.StringId==='1083-gamedata.base').Value0,-100);
assert.equal(uc.referenceCategories.relations.find(row=>row.StringId==='1084-gamedata.base').Value0,60);
assert.equal(readIndex['Race:17-gamedata.quack'].values['bleed rate'],1);
assert.equal(readIndex['Race:17-gamedata.quack'].values['min blood'],75);
assert.equal(readIndex['Race:17-gamedata.quack'].values['max blood'],150);
const consumer={baselineKey:baseline.key,diagnostics:baseline.diagnostics,towns,
  shiroConditions:baseline.worldStateById['1533710-__world reactions Slavers.mod'],
  race:readIndex['Race:17-gamedata.quack'].values,allExampleQueriesPassed:true};
save(join(run,'map-consumer.json'),consumer);
const {createFactionOverviewCatalog}=await import(pathToFileURL(join(map,'modules/faction-overview/index.js')));
const factions=createFactionOverviewCatalog({datasets,baseline});
assert.equal(factions.available,true);
assert.ok(factions.factions.some(row=>row.id==='defaultEmpireFactionSID'));
let live={checked:false};
if(flags.includes('--live')) {
  const url='https://map.kenshi.wiki/map-data/vanilla.json';
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200);
  const served=await response.json();
  assert.deepEqual(served,publication.contract,'Live bootstrap differs from the pinned map publication');
  const results=[];
  for(const dataset of ['townFcsData','factions','races','worldStates']) {
    const entry=served.getmapdata.datasets[dataset],target=new URL(entry.url,url);
    const result=await fetch(target,{signal:AbortSignal.timeout(30000)});
    assert.equal(result.status,200);
    const data=Buffer.from(await result.arrayBuffer()),expected=publication.files[basename(target.pathname)];
    assert.equal(hash(data),hash(expected),dataset+' live bytes');
    results.push({dataset,url:target.href,bytes:data.length,sha256:hash(data),source:result.headers.get('X-KiMap-Source')});
  }
  live={checked:true,at:new Date().toISOString(),bootstrap:url,matchingDatasets:results};
}
const report={sourcePins:Object.fromEntries(Object.entries(pins).map(([key,value])=>[key,{head:value.head,digest:value.digest,workingTreeChanges:value.workingChanges?.length??null}])),
  archive:{name:basename(zip),sha256:hash(bytes),bytes:bytes.length,revision:publication.revision,members:publication.inventory.length,datasets:Object.keys(datasets).length,kenshiVersion:contract.manifest.kenshiVersion},
  compiler:{version:manifest.compilerVersion,revision:manifest.revision,counts:manifest.counts,scope:manifest.scope,contextCatalog:contexts,artifacts:manifest.artifacts,deterministic:true},
  comparisons,exampleIndex:{records:tests.length,bytes:index.length,sha256:hash(index)},mapConsumer:{factionCount:factions.factions.length,available:factions.available,diagnostics:factions.diagnostics,baselineDiagnostics:baseline.diagnostics,towns,exampleQueriesPassed:true},live};
save(join(run,'report.json'),report);
save('reports/technical-data/latest.json',{directory:relative(process.cwd(),run).replaceAll('\\','/'),...report});
console.log(JSON.stringify({directory:run,revision:manifest.revision,counts:manifest.counts,comparisons,live:live.checked},null,2));
