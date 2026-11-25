import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import manifest from '../public/notices/restored-game-artwork.json' with {type:'json'};
import directory from '../src/data/directory.json' with {type:'json'};

test('restored artwork retains the pinned source bytes and distinct placements',()=>{
  assert.equal(manifest.sourceRevision,'83abc179fafa63b826d7f2662c4a18a134a9e6c1');
  assert.equal(manifest.assets.length,17);
  assert.equal(new Set(manifest.assets.map(a=>a.path)).size,17);
  for(const asset of manifest.assets){
    assert.equal(asset.sourceFile,asset.path);
    assert.match(asset.path,/^public\/(images\/kenshi\/main-page\/[a-z]+\.(webp|png)|kenshi-(logo|wordmark)\.png|favicon\.ico)$/);
    const bytes=readFileSync(asset.path);
    assert.equal(bytes.length,asset.bytes,asset.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);
    assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),asset.gitBlob,asset.path);
  }
});

test('each Home topic has its own recorded image; equipment uses the preserved cutouts',()=>{
  const groups=directory.subjects.flatMap(s=>s.groups);
  const recorded=manifest.assets.filter(a=>a.path.includes('/main-page/')).map(a=>a.path.slice(6));
  assert.equal(groups.length,14);
  assert.deepEqual(groups.map(g=>g.image).sort(),recorded.sort());
  assert.deepEqual(groups.filter(g=>g.cutout).map(g=>g.label),['Gear','Armour']);
});
