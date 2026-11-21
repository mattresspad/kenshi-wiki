import {loadTitles} from './title-search.js';
import {normalizeTitle} from '../lib/search-policy.mjs';
const form=document.querySelector('.full-search'),input=form.querySelector('[name=q]'),full=form.querySelector('[name=fulltext]'),status=document.querySelector('#search-status'),results=document.querySelector('.search-results'),pager=document.querySelector('.search-pagination'),retry=document.querySelector('#search-retry');
let serial=0,engine,attempt=0;
function searchUrl(q,page,all){const p=new URLSearchParams({q});if(all)p.set('fulltext','1');if(page>1)p.set('page',page);return '/search?'+p;}
function plainExcerpt(html){const doc=new DOMParser().parseFromString(html,'text/html');return doc.body.textContent??''}
async function run(){const current=++serial,params=new URLSearchParams(location.search),q=params.get('q')??'',all=params.get('fulltext')==='1';input.value=q;full.checked=all;results.replaceChildren();pager.replaceChildren();retry.hidden=true;
 if(!normalizeTitle(q)){status.textContent='Enter a title or words to search the wiki.';return}
 status.textContent='Searching…';
 try{
  const titles=await loadTitles().catch(()=>[]);if(current!==serial)return;
  const exact=titles.find(([title])=>normalizeTitle(title)===normalizeTitle(q));if(exact&&!all){location.assign(exact[1]);return}
  engine??=import(/* @vite-ignore */ '/pagefind/pagefind.js'+(attempt++?'?retry='+attempt:''));const api=await engine;if(current!==serial)return;
  const found=await api.search(q.replaceAll('_',' ').trim());if(current!==serial)return;
  const total=found.results.length,last=Math.max(1,Math.ceil(total/20)),page=Math.min(last,Math.max(1,Number.parseInt(params.get('page')??'1',10)||1));
  if(!total){status.textContent='No matches. Try fewer words, a different spelling, or browse a topic below.';return}
  const data=await Promise.all(found.results.slice((page-1)*20,page*20).map(r=>r.data()));if(current!==serial)return;
  results.start=(page-1)*20+1;
  for(const record of data){const li=document.createElement('li'),h=document.createElement('h2'),a=document.createElement('a'),p=document.createElement('p');const url=new URL(record.url,location.origin);if(url.origin!==location.origin)throw Error('Unexpected search destination');a.href=url.pathname+url.hash;a.textContent=record.meta.title;h.append(a);p.textContent=plainExcerpt(record.excerpt??'');li.append(h,p);results.append(li)}
  status.textContent=total+(total===1?' result — page ':' results — page ')+page+' of '+last+'.';
  for(const [label,n]of [['Previous',page-1],['Next',page+1]])if(n>=1&&n<=last){const a=document.createElement('a');a.href=searchUrl(q,n,true);a.textContent=label;pager.append(a)}
 }catch(error){if(current!==serial)return;engine=null;status.textContent='The search index could not be loaded. Retry, or use the browsing links below.';retry.hidden=false;}
}
form.addEventListener('submit',e=>{e.preventDefault();history.pushState(null,'',searchUrl(input.value,1,full.checked));run()});pager.addEventListener('click',e=>{const a=e.target.closest('a');if(a){e.preventDefault();history.pushState(null,'',a.href);run();status.focus()}});retry.addEventListener('click',run);addEventListener('popstate',run);run();
