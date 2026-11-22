import {createHash} from 'node:crypto';
export const digest=body=>createHash('sha256').update(body).digest('hex');
// Cloudflare appends one JS Detection bootstrap to HTML on the protected domain.
// Compare all remaining bytes, and report the omission rather than claiming byte identity.
export function withoutCloudflareDetection(html){
 const start=html.lastIndexOf('<script>'),end=html.indexOf('</script>',start);
 if(start<0||end<start||html.slice(end+9,end+16)!=='</body>')return {html,removed:0};
 const script=html.slice(start+8,end);
 if(!script.startsWith('(function(){function c(){var b=a.contentDocument')||
 !script.includes('window.__CF$cv$params=')||
 !script.includes("'/cdn-cgi/challenge-platform/scripts/jsd/main.js")||
 !script.includes("document.createElement('iframe')")||
 !script.endsWith('}})();'))return {html,removed:0};
 return {html:html.slice(0,start)+html.slice(end+9),removed:1};
}
