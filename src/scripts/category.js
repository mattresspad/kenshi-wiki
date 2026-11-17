const board = document.querySelector('.az-board');
const main = board.closest('main');
const groups = Array.from(board.querySelectorAll('.az-group'));
const desktop = matchMedia('screen and (min-width: 761px)');
const gap = 9;

function flowingLayout() {
  board.removeAttribute('data-fit');
  for (const el of board.querySelectorAll('.az-entries[tabindex]')) {
    for (const attr of ['tabindex','role','aria-labelledby']) el.removeAttribute(attr);
  }
}

function fit() {
  const bounds = board.getBoundingClientRect();
  const boardTop = bounds.top - main.getBoundingClientRect().top + main.scrollTop;
  const height = Math.floor(main.clientHeight - boardTop - parseFloat(getComputedStyle(main).paddingBottom) - 1);
  if (!desktop.matches || height < 280) { flowingLayout(); return; }

  // Fix the width before measuring. Long labels can acquire another line once a scrollbar appears.
  const columns = Math.min(groups.length, Math.max(1, Math.floor((bounds.width+gap)/220)));
  const width = Math.floor((bounds.width-gap*(columns-1))/columns);
  board.style.setProperty('--group-width', width+'px');
  board.setAttribute('data-fit','');
  const stacks = Array.from({length:columns},()=>[]);
  for (const [index,group] of groups.entries()) {
    const list = group.querySelector('.az-entries');
    const items = list.querySelectorAll('li');
    const natural = list.scrollHeight;
    const minimum = Math.min(natural, Array.from(items).slice(0,2).reduce((sum,li)=>sum+li.offsetHeight,0));
    const fixed = group.offsetHeight - list.offsetHeight;
    stacks[Math.floor(index*columns/groups.length)].push({group,list,natural,minimum,fixed});
  }
  let used = 0;
  for (const [column, stack] of stacks.entries()) {
    const available = height - (stack.length-1)*gap - stack.reduce((sum,row)=>sum+row.fixed,0);
    if (stack.reduce((sum,row)=>sum+row.minimum,0) > available) { flowingLayout(); return; }
    const desired = cap => stack.reduce((sum,row)=>sum+Math.min(row.natural,Math.max(cap,row.minimum)),0);
    let low=0, high=available;
    while (low < high) {
      const middle=Math.ceil((low+high)/2);
      if (desired(middle) <= available) low=middle;
      else high=middle-1;
    }
    let top=0;
    for (const row of stack) {
      const size=Math.min(row.natural,Math.max(low,row.minimum));
      row.group.style.setProperty('--group-x',column*(width+gap)+'px');
      row.group.style.setProperty('--group-y',top+'px');
      row.list.style.setProperty('--list-height',size+'px');
      if (row.list.scrollHeight > row.list.clientHeight+1) {
        row.list.tabIndex=0;
        row.list.setAttribute('role','region');
        row.list.setAttribute('aria-labelledby',row.group.querySelector('h2').id);
      } else {
        for (const attr of ['tabindex','role','aria-labelledby']) row.list.removeAttribute(attr);
      }
      top += row.fixed+size+gap;
    }
    used=Math.max(used,top-gap);
  }
  board.style.setProperty('--board-height',used+'px');
}
let frame=0;
function schedule() { cancelAnimationFrame(frame);frame=requestAnimationFrame(fit); }
new ResizeObserver(schedule).observe(main);
desktop.addEventListener('change',schedule);
document.fonts.ready.then(schedule);
window.addEventListener('beforeprint',flowingLayout);
window.addEventListener('afterprint',schedule);
board.addEventListener('keydown',event=>{
  const el=event.target;
  if (!el.matches('.az-entries[tabindex]') || !['Home','End'].includes(event.key)) return;
  event.preventDefault();
  el.scrollTop=event.key==='End'?el.scrollHeight:0;
});
fit();
