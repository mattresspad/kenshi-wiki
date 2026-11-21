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
