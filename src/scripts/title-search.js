import {normalizeTitle,titleSuggestions} from '../lib/search-policy.mjs';
let titles;
export function loadTitles(){return titles??=fetch('/search-titles.json').then(r=>{if(!r.ok)throw Error('Title index unavailable');return r.json()}).catch(e=>{titles=null;throw e})}
export function attachTitleSuggestions(){for(const [number,form] of [...document.querySelectorAll('form[data-wiki-search],form.search')].entries()){
 const input=form.querySelector('input[name=q]');if(!input)continue;let ticket=0,active=-1,matches=[];
 const list=document.createElement('ul');list.id='title-suggestions-'+number;list.className='title-suggestions';list.setAttribute('role','listbox');list.setAttribute('aria-label','Suggested page titles');list.hidden=true;form.append(list);
 input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls',list.id);input.setAttribute('aria-expanded','false');input.autocomplete='off';
 function hide(){list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1}
 async function suggest(){const mine=++ticket,value=input.value;hide();if(!normalizeTitle(value))return;try{const entries=await loadTitles();if(mine!==ticket)return;matches=titleSuggestions(entries,value);list.replaceChildren();for(const [i,m]of matches.entries()){const item=document.createElement('li'),a=document.createElement('a');item.id=list.id+'-'+i;item.setAttribute('role','option');item.setAttribute('aria-selected','false');a.href=m.path;a.textContent=m.title;a.tabIndex=-1;item.append(a);list.append(item)}list.hidden=!matches.length;input.setAttribute('aria-expanded',String(!!matches.length))}catch{hide()}}
 input.addEventListener('input',suggest);input.addEventListener('focus',suggest);
 input.addEventListener('keydown',e=>{if(e.key==='Escape'){++ticket;hide();return}if(!list.hidden&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:matches.length-1)+matches.length)%matches.length;[...list.children].forEach((el,i)=>el.setAttribute('aria-selected',String(i===active)));input.setAttribute('aria-activedescendant',list.children[active].id);list.children[active].scrollIntoView({block:'nearest'})}if(e.key==='Enter'&&active>=0&&!list.hidden){e.preventDefault();location.assign(matches[active].path)}});
 document.addEventListener('pointerdown',e=>{if(!form.contains(e.target)){++ticket;hide()}});input.addEventListener('blur',()=>setTimeout(()=>{if(!form.contains(document.activeElement)){++ticket;hide()}},150));form.addEventListener('submit',()=>{++ticket;hide()});
 }}
attachTitleSuggestions();
