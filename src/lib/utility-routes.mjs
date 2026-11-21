import checkpoint from '../../conversion/utilities/checkpoint.json' with {type:'json'};
import snapshot from '../../conversion/reference.json' with {type:'json'};
export const utilityStage=checkpoint.included;
export const proseUtilities=[{id:'about-kenshi',path:'/about-kenshi',title:'About Kenshi',sourceFile:'src/pages/about-kenshi.astro'},{id:'contributors',path:'/contributors',title:'Contributors',sourceFile:'src/pages/contributors.astro'}];
export const activeUtilityPaths=utilityStage>=3?['/about-kenshi','/contributors',...(utilityStage>=4?['/search','/random']:[])]:[];
export const historicalSourceRedirects=[{from:'/sources/outland.css.txt',to:'https://github.com/mattresspad/kenshi-wiki/blob/'+snapshot.revision+'/src/styles/global.css',status:301},{from:'/sources/wiki-header.css.txt',to:'https://github.com/mattresspad/kenshi-wiki/blob/'+snapshot.revision+'/src/styles/wiki-header.css',status:301}];
export function isIndexablePath(path){return !['/search','/random','/404','/404.html'].includes(path)&&!path.startsWith('/pages-needing-work/');}
export function isGeneratedUtilityPath(path){return path==='/404'||path==='/404.html'||path==='/pagefind'||path.startsWith('/pagefind/');}
