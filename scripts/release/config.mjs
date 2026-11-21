export function releaseConfiguration(env=process.env) {
  const target=env.WIKI_RELEASE_TARGET?.trim()||'local';
  if(!['local','staging','production'].includes(target))throw Error('Unknown release target: '+target);
  const editBranch=env.WIKI_EDIT_BRANCH?.trim()||'';
  if(target!=='local'&&!editBranch)throw Error('Published builds require WIKI_EDIT_BRANCH');
  if(target==='production'&&editBranch!=='main')throw Error('Production edit branch must be main');
  return {target,editBranch,worker:target==='production'?'kenshi-wiki':'kenshi-wiki-restoration'};
}
export function assertStaging(config,manifest) {
  if(config.target!=='staging'||config.worker!=='kenshi-wiki-restoration'||config.editBranch!=='rebuild/restoration')throw Error('Only the rebuild staging target can be uploaded by this command');
  if(manifest.target!==config.target||manifest.worker!==config.worker||manifest.editBranch!==config.editBranch)throw Error('Package target or edit branch mismatch');
}
