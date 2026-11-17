import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {stringify} from 'yaml';
import {load} from 'cheerio';
import {snapshot} from '../../src/lib/catalog.mjs';
import {openSource,factParts} from '../conversion/source.mjs';
import {articleEvidence} from '../geography/evidence.mjs';
import {articleFiles} from '../article-files.mjs';

const [action,repository,directory,batchName] = process.argv.slice(2);
assert.ok(repository && directory,'Expected freeze|verify-freeze|transfer, comparison checkout and pinned build');
const source = openSource(repository,directory);
const root = 'conversion/factions';
mkdirSync(root,{recursive:true});
const records = new Map(snapshot.articles.map(article => [article.id,article]));
const support = ['guide-to-faction-relations','hostile-factions'];
const json = file => JSON.parse(readFileSync(join(root,file)));
function write(file,content) {
  if (action === 'verify-freeze') assert.equal(readFileSync(file,'utf8').replaceAll('\r\n','\n'),content,file);
  else { mkdirSync(dirname(file),{recursive:true}); writeFileSync(file,content); }
}
function freeze() {
  const compare = new Intl.Collator('en',{numeric:true,sensitivity:'base'});
  const members = snapshot.articles.filter(article => article.categories.includes('Factions'))
    .sort((a,b) => compare.compare(a.title,b.title) || a.id.localeCompare(b.id)).map(article => article.id);
  assert.equal(members.length,95);
  const remaining = new Set(members.filter(id => id !== 'the-holy-nation'));
  const batches = [];
  function take(name,ids) {
    for (const id of ids) assert.ok(remaining.delete(id) || support.includes(id),id);
    batches.push({name,ids});
  }
  take('major-factions',['united-cities','shek-kingdom','tech-hunters','slave-traders']);
  take('infobox-variants',['grayflayers','skeleton-bandits']);
  take('historical-factions',['factions-alpha','free-traders-alpha']);
  take('overview-and-guides',['factions',...support]);
  const siblings = [...remaining];
  for (let start=0,part=1; start<siblings.length; part++) {
    const size = Math.ceil((siblings.length-start)/(5-part));
    take('regional-and-smaller-'+part,siblings.slice(start,start+size));
    start += size;
  }
  assert.equal(remaining.size,0);
  const evidence = {};
  for (const id of batches.flatMap(batch=>batch.ids)) {
    source.document(id);
    const html=source.html(id);
    assert.equal(load(html)('link[rel=canonical]').attr('href'),'https://kenshi.wiki'+records.get(id).path);
    evidence[id]=articleEvidence(html,true,true);
    assert.deepEqual(evidence[id].images,[],id+' has new assets to assess');
  }
  assert.equal(Object.values(evidence).reduce((n,p)=>n+p.headings.length,0),639);
  assert.equal(Object.values(evidence).reduce((n,p)=>n+p.ids.filter(id=>/^cite_(ref|note)/.test(id)).length,0),453);
  const roster={revision:snapshot.revision,baseRevision:'dd27161e7c1b7daed95c769cd596d67bd3ebb5c6',members,existing:['the-holy-nation'],batches};
  const save=(name,data)=>write(join(root,name),JSON.stringify(data,null,2)+'\n');
  save('roster.json',roster);
  save('supporting-pages.json',{revision:snapshot.revision,ids:support});
  write(join(root,'reference.json'),'{\n  "articles": {\n'+Object.entries(evidence).map(([id,proof])=>'    '+JSON.stringify(id)+': '+JSON.stringify(proof)).join(',\n')+'\n  },\n  "assets": {}\n}\n');
  console.log('Verified 95 faction IDs, 2 supporting pages, 639 headings and 453 citation targets');
}
function transfer() {
  const roster=json('roster.json'),checkpoint=json('checkpoint.json');
  const batch=roster.batches[checkpoint.included];
  assert.equal(batch?.name,batchName,'Expected next whole batch');
  const existing=new Set(articleFiles().map(entry=>entry.data.articleId));
  const writes = new Map();
  for (const id of batch.ids) {
    assert.ok(!existing.has(id),'Already transferred '+id);
    const {front,body}=source.document(id);
    const data={articleId:id,title:front.title,description:front.description ?? '',categories:front.categories ?? [],layout:'faction'};
    if(front.infobox) {
      data.factTitle=front.infobox.title;
      data.factGroups=front.infobox.groups.map(group=>({heading:group.heading??null,
        rows:group.rows.map(([label,value])=>[label,...factParts(value)])}));
    }
    const original=records.get(id).sourceFile.slice('src/content/wiki/'.length);
    const file=join('src/content/articles',support.includes(id)?'gameplay/guides':'factions',original);
    assert.ok(!existsSync(file),file);
    writes.set(file,'---\n'+stringify(data,{lineWidth:0}).trimEnd()+'\n---\n\n'+body+'\n');
  }
  const localPaths=new Set([...existing,...batch.ids].map(id=>records.get(id).path));
  const originalRules=readFileSync('public/_redirects','utf8').split('# Restored redirects from the frozen inventory')[0].trimEnd();
  const covered=new Set(originalRules.split(/\r?\n/).map(line=>line.split(/\s+/)[0]));
  const rules=snapshot.redirects.filter(rule=>localPaths.has(rule.to)&&!covered.has(rule.from));
  writes.set('public/_redirects',originalRules+'\n\n# Restored redirects from the frozen inventory\n'+rules.map(rule=>[rule.from,rule.to,rule.status].join(' ')).join('\n')+'\n');
  if(checkpoint.included===0) {
    const policy=JSON.parse(readFileSync('conversion/category-policy.json'));
    policy.reviewedCategories=[...new Set([...policy.reviewedCategories,'Factions'])];
    writes.set('conversion/category-policy.json',JSON.stringify(policy,null,2)+'\n');
  }
  writes.set(join(root,'checkpoint.json'),JSON.stringify({included:checkpoint.included+1})+'\n');
  for(const [file,content] of writes) write(file,content);
  console.log('Transferred '+batch.name+' · '+batch.ids.length+' articles');
}
if (['freeze','verify-freeze'].includes(action)) freeze();
else if (action==='transfer') transfer();
else throw Error('Unknown intake action');
