import assert from 'node:assert/strict';
export const worker = 'kenshi-wiki';
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const marker = new RegExp('^FreshWiki maintenance v1 return ('+uuid+') source ([a-f0-9]{40}) package ([a-f0-9]{64})$');
export function maintenanceRecord(version) {
  const message = version.annotations?.['workers/message'] ?? '';
  if (!message.startsWith('FreshWiki maintenance')) return null;
  const match = message.match(marker);
  assert.ok(match, 'Unrecognized maintenance record; inspect manually without changing traffic');
  assert.notEqual(match[1], version.id, 'Maintenance cannot restore itself');
  return {returnVersion:match[1], sourceSha:match[2], packageSha256:match[3]};
}
export function assertWikiVersion(version) {
  assert.equal(maintenanceRecord(version), null, 'Maintenance is active. Use Maintenance mode → Off before publishing the wiki');
  assert.match(version.annotations?.['workers/message'] ?? '', /^FreshWiki [a-f0-9]{40} package [a-f0-9]{64}$/, 'Expected a recorded FreshWiki release');
}
export function activeVersion(deployment) {
  assert.ok(deployment?.id, 'No current deployment');
  assert.equal(deployment.versions?.length, 1, 'Split traffic requires manual reconciliation');
  assert.equal(deployment.versions[0].percentage, 100);
  const id = deployment.versions[0].version_id;
  assert.match(id, new RegExp('^'+uuid+'$'));
  return id;
}
export function versionUrl(version) {
  assert.match(version.id, new RegExp('^'+uuid+'$'));
  const url = 'https://'+version.id.slice(0,8)+'-kenshi-wiki.prds.workers.dev';
  assert.ok(version.urls?.some(u=>u === url || u === url+'/'), 'Immutable preview URL unavailable');
  return url;
}
export function assertTrustedRun(env, sourceSha) {
  assert.match(sourceSha, /^[a-f0-9]{40}$/);
  assert.equal(env.GITHUB_ACTIONS, 'true', 'Remote maintenance actions run only in GitHub');
  assert.equal(env.GITHUB_EVENT_NAME, 'workflow_dispatch');
  assert.equal(env.GITHUB_REF, 'refs/heads/main');
  assert.equal(env.GITHUB_SHA, sourceSha);
  assert.ok(['on','off'].includes(env.WIKI_MAINTENANCE_ACTION));
}
export function chooseAction(action, current, version) {
  assert.ok(['on','off'].includes(action));
  assert.equal(activeVersion(current), version.id);
  const record = maintenanceRecord(version);
  if (!record) assertWikiVersion(version);
  return {noop:action === 'on' ? Boolean(record) : !record, returnVersion:record?.returnVersion ?? version.id};
}
export function assertEligible(id, recent) {
  assert.ok(Array.isArray(recent) && recent.slice(0,100).some(v=>v.id === id), 'Saved version is not in the 100 deployable versions; stop and recover from its recorded package');
}
export function assertApply(plan, {sourceSha, action, current, target, recent}) {
  assert.equal(plan.schema, 1); assert.equal(plan.worker, worker);
  assert.equal(plan.sourceSha, sourceSha); assert.equal(plan.action, action); assert.equal(plan.noop, false);
  assert.equal(current.id, plan.previousDeployment, 'Deployment changed while waiting; run Maintenance mode again');
  assert.equal(activeVersion(current), plan.previousVersion);
  assert.equal(target.id, plan.targetVersion); assert.equal(versionUrl(target), plan.url);
  assertEligible(target.id, recent); assertEligible(plan.returnVersion, recent);
  if (action === 'on') {assert.equal(plan.returnVersion,plan.previousVersion); assert.deepEqual(maintenanceRecord(target), {returnVersion:plan.returnVersion,sourceSha,packageSha256:plan.packageSha256});}
  else {assertWikiVersion(target); assert.equal(target.id,plan.returnVersion);}
}
