const form=document.querySelector('.work-filters'),view=document.querySelector('[data-work-view]');
if(form&&view){
 const list=document.querySelector('.work-filter-results'),ordinary=document.querySelector('.work-static'),status=document.querySelector('.work-filter-status');let data,loading;
 const disclosure=form.closest('details');disclosure.hidden=false;disclosure.open=!matchMedia('(max-width:760px)').matches;form.hidden=false;
 const controls=['q','mark','type','family','priority'].map(name=>form.elements.namedItem(name));
 const params=new URLSearchParams(location.search);controls.forEach(e=>e.value=params.get(e.name)??'');
 async function filter(){
  const [query,mark,type,family,priority]=controls.map(e=>e.value),active=controls.some(e=>e.value),ticket=++filter.ticket;
  if(!active){ordinary.hidden=false;list.hidden=true;status.textContent='';return;}
  status.textContent='Loading work index…';
  try {data??=await(loading??=fetch('/pages-needing-work/index.json').then(r=>{if(!r.ok)throw Error();return r.json()}));}catch{loading=null;status.textContent='The filter index could not be loaded. The ordinary page links below remain available.';ordinary.hidden=false;list.hidden=true;return;}
  if(ticket!==filter.ticket)return;
  const tasks=new Map(data.tasks.map(t=>[t.id,t])),history=view.dataset.workView==='history';
  const matches=data.articles.filter(a=>{
   if(!(history?a.historyHref:a.queueHref)||mark&&!a.markings.includes(mark)||family&&!a.families.includes(family))return false;
   const relevant=(history?a.closed:a.open).map(id=>tasks.get(id));
   if((type||priority)&&!relevant.some(t=>(!type||t.type===type)&&(!priority||t.priority===priority)))return false;
   return !query||[a.title,a.path,...relevant.map(t=>t.search)].join(' ').toLowerCase().includes(query.toLowerCase());
  });
  list.replaceChildren();for(const a of matches){const li=document.createElement('li'),link=document.createElement('a');link.href=history?a.historyHref:a.queueHref;link.textContent=a.title;li.append(link,document.createTextNode(' · '+(history?a.closed.length+' resolved tasks':a.open.length+' open tasks')));list.append(li);}
  ordinary.hidden=true;list.hidden=false;status.textContent=matches.length+' matching articles. Open an entry for evidence and editing options.';
 }
 filter.ticket=0;form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',()=>{const q=new URLSearchParams();for(const e of controls)if(e.value)q.set(e.name,e.value);history.replaceState(null,'',location.pathname+(q.size?'?'+q:'')+location.hash);filter()});form.addEventListener('reset',()=>setTimeout(()=>{history.replaceState(null,'',location.pathname);filter()},0));if(controls.some(e=>e.value)){disclosure.open=true;filter();}
}
for(const button of document.querySelectorAll('[data-copy-work]')){if(!navigator.clipboard)continue;button.hidden=false;button.addEventListener('click',async()=>{const status=button.nextElementSibling;try{await navigator.clipboard.writeText(button.dataset.copyWork);status.textContent='Copied.'}catch{status.textContent='Select and copy the path above.'}})}
