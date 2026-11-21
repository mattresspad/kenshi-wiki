import {historicalSourceRedirects,utilityStage} from './utility-routes.mjs';
import assert from 'node:assert/strict';
import {validateResolution,targetOf,digest} from '../../scripts/gaps/core.mjs';
export function resolveWorkFindings({curated,detected,baseline,sourcePages,sourceByPath,redirects,atlas,local,assetExists,assetBytes,familyOf}) {
  const classes=new Set(['pending conversion','omitted article','missing alias','incomplete import','genuinely absent material','unresolved']);
  const rows=curated.findings.map(row=>{
    assert.ok(classes.has(row.classification),'Bad classification '+row.id);
    for(const field of ['origin','priority','verification','status','finding','proposedResolution','uncertainty','postCutover'])assert.ok(typeof row[field]==='string'&&row[field].length,'Missing '+field+' on '+row.id);
    const occurrences=detected.get(row.id)?.occurrences??row.occurrences??[];
    let resolved=false,resolution=null;
    const sourcePage=sourceByPath.get(row.target);
    const currentPath=atlas.byId.get(sourcePage?.id)?.path??targetOf(row.target,'/',redirects)?.path??row.target;
    const historical=utilityStage>=3&&historicalSourceRedirects.find(r=>r.from===row.target);
    if(historical&&['availability','media'].includes(row.kind)){resolved=true;resolution={method:'immutable historical source endpoint redirect; active styling is independent',target:historical.to,status:historical.status};}
    else if(row.kind==='availability') {
      resolved=atlas.local.has(currentPath)||assetExists(currentPath);
      if(resolved)resolution={method:'local output exists; route/catalog checks run in the build',target:currentPath};
    } else if(row.kind==='media'&&row.target.startsWith('/')) {
      const file=row.target;
      resolved=!!baseline.assets[row.target]?.exists&&assetExists(file);
      if(resolved){
        const checksum=digest(assetBytes(file));
        const authoredResource=/\.(?:txt|css|json)$/i.test(row.target);
        if(!authoredResource)assert.equal(checksum,baseline.assets[row.target].sha256,'Changed source media '+row.target);
        resolution={method:authoredResource?'local resource available; independently maintained contents':'local media matches pinned file SHA-256',sha256:checksum,sourceSha256:baseline.assets[row.target].sha256};
      }
    } else if(row.kind==='fragment') {
      const t=targetOf(row.target,'/',redirects);
      resolved=!!local.get(t.path)?.ids.includes(t.fragment.slice(1));
      if(resolved)resolution={method:'exact fragment exists in rendered local article',target:t.target};
    }
    if(row.kind==='empty-section'){
      const t=targetOf(row.target,'/',redirects),page=local.get(t.path);
      resolved=!!page?.ids.includes(t.fragment.slice(1))&&!page.emptySections.some(s=>s.section===t.fragment.slice(1));
      if(resolved)resolution={method:'bookmarked section has content in the local article',target:t.target};
    }
    if(row.kind==='media'&&row.presentationRepair){
      const original=sourcePages.get(row.presentationRepair.articleId),page=local.get(atlas.byId.get(row.presentationRepair.articleId)?.path);
      assert.ok(original?.media.some(m=>m.url===row.target),'Repair lacks source image evidence '+row.id);
      resolved=!!page && !page.media.some(m=>m.url===row.target) && page.links.some(l=>l.href===row.target&&l.label===row.presentationRepair.linkText);
      if(resolved)resolution={method:'malformed source image restored as identical-URL text link; no gameplay verification',articleId:original.id,target:row.target,label:row.presentationRepair.linkText,sourceRevision:original.sourceRevision,sourceSha256:original.sourceSha256};
    }
    validateResolution(row,resolved);
    return {...row,status:resolved?'resolved':row.status,resolution:resolution??row.resolution??null,
      occurrences,families:[...new Set(occurrences.flatMap(o=>familyOf(o.pageId)))].sort(),affectedPages:[...new Set(occurrences.map(o=>o.pageId))]};
  });
  return rows;
}
