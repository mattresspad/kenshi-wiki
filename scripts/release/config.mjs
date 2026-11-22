export function releaseConfiguration(env=process.env) {
  const target=env.WIKI_RELEASE_TARGET?.trim()||'local';
  if(!['local','staging','production'].includes(target))throw Error('Unknown release target: '+target);
  const editBranch=env.WIKI_EDIT_BRANCH?.trim()||'';
  if(target!=='local'&&!editBranch)throw Error('Published builds require WIKI_EDIT_BRANCH');
  if(target==='production'&&editBranch!=='main')throw Error('Production edit branch must be main');
  return {target,editBranch,worker:target==='production'?'kenshi-wiki':'kenshi-wiki-restoration'};
}
export function assertStaging(config,manifest) {
  if(config.target!=='staging'||config.worker!=='kenshi-wiki-restoration'||config.editBranch!=='main')throw Error('Only the explicit main staging target can be uploaded by this command');
  if(manifest.target!==config.target||manifest.worker!==config.worker||manifest.editBranch!==config.editBranch)throw Error('Package target or edit branch mismatch');
}

export function assertRehearsal(env,sha) {
 if(!/^[0-9a-f]{40}$/.test(env.WIKI_EXPECTED_SHA||'')||env.WIKI_EXPECTED_SHA!==sha)throw Error('Rehearsal requires the exact WIKI_EXPECTED_SHA');
 if(env.GITHUB_ACTIONS&&(env.GITHUB_EVENT_NAME!=='workflow_dispatch'||env.GITHUB_REF!=='refs/heads/main'||env.GITHUB_SHA!==sha))throw Error('Only an explicit trusted-main rehearsal may prepare a release');
}


// The routine release path uses one production package and an inactive version.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function assertReleaseRun(env,sha,{githubOnly=false}={}) {
 if(!/^[a-f0-9]{40}$/.test(sha)||env.WIKI_EXPECTED_SHA!==sha)throw Error('Select the exact release commit');
 if(githubOnly&&env.GITHUB_ACTIONS!=='true')throw Error('Upload and publication run only in the visible GitHub workflow');
 if(env.GITHUB_ACTIONS&&(env.GITHUB_REF!=='refs/heads/main'||env.GITHUB_SHA!==sha||!['push','workflow_dispatch'].includes(env.GITHUB_EVENT_NAME)))throw Error('Only trusted main can release');
}
export function assertProductionPackage(candidate) {
 if(candidate.target!=='production'||candidate.worker!=='kenshi-wiki'||candidate.editBranch!=='main')throw Error('Preview and publish require the final production package');
 if(!/^[a-f0-9]{64}$/.test(candidate.packageSha256))throw Error('Missing package checksum');
}
export function assertVersionUrl(version,url) {
 if(!uuid.test(version??''))throw Error('Invalid Worker version');
 const parsed=new URL(url),expected='https://'+version.slice(0,8)+'-kenshi-wiki.prds.workers.dev';
 if(parsed.origin!==expected||parsed.href!==expected+'/')throw Error('Version URL does not match the production Worker version');
}
export function assertPromotion(env,{sourceSha,head,current,version}) {
 assertReleaseRun(env,sourceSha,{githubOnly:true});assertVersionUrl(env.WIKI_VERSION,env.WIKI_VERSION_URL);
 if(sourceSha!==head)throw Error('Main advanced; approve its newer preview');
 if(env.WIKI_RELEASE_TARGET!=='production'||env.WIKI_EDIT_BRANCH!=='main')throw Error('Wrong publication target');
 if(!/^[a-f0-9]{64}$/.test(env.WIKI_PACKAGE_SHA256??''))throw Error('Missing tested package hash');
 if(!uuid.test(env.WIKI_ROLLBACK_VERSION??'')||current.id!==env.WIKI_PREVIOUS_DEPLOYMENT||current.versions.length!==1||current.versions[0].version_id!==env.WIKI_ROLLBACK_VERSION||current.versions[0].percentage!==100)throw Error('Live deployment changed since preview');
 if(version.id!==env.WIKI_VERSION||!version.urls.includes(env.WIKI_VERSION_URL)||version.annotations?.['workers/message']!=='FreshWiki '+sourceSha+' package '+env.WIKI_PACKAGE_SHA256)throw Error('Uploaded version does not match the tested commit and package');
}
