'use strict';

const frame = document.getElementById('frame');
const rail = document.getElementById('left-navigation');
const railButton = document.getElementById('toggle-navigation');
const scrim = document.getElementById('scrim');
const settingsButton = document.getElementById('settings-button');
const settings = document.getElementById('settings-panel');
const phone = matchMedia('(max-width: 760px)');
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const pageTheme = document.documentElement;
const more = document.getElementById('site-more');
const toolsMenu = document.getElementById('tools');
const headerPopups = [more, toolsMenu, document.getElementById('article-tools'), ...document.querySelectorAll('details.edit-file')].filter(Boolean);
for (const editor of document.querySelectorAll('details.edit-file')) {
  const copy = editor.querySelector('[data-copy-file]');
  const status = editor.querySelector('[role=status]');
  if (navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(editor.querySelector('code').textContent);
        status.textContent = 'Copied';
      } catch {
        status.textContent = 'Select the path to copy it.';
      }
    });
  }
  editor.addEventListener('toggle', () => { if (!editor.open) status.textContent = ''; });
}
let desktopOpen = true;
let drawerOpen = false;
let chosenTheme = new URLSearchParams(location.search).get('theme');
try { chosenTheme ||= localStorage.getItem('wiki-theme'); } catch {}
const background = [...document.querySelectorAll('.sites-row, .page-tab, .context-cats, .context-more, .revisions, .search, .reading, .foot, .skip-to')];

function refreshTheme() {
  const theme = ['light', 'dark'].includes(chosenTheme) ? chosenTheme : (systemDark.matches ? 'dark' : 'light');
  pageTheme.dataset.theme = theme;
  for (const button of document.querySelectorAll('.theme-control')) {
    button.querySelector('.theme-caption').textContent = 'Theme: ' + (theme === 'dark' ? 'Dark' : 'Light');
    button.title = 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme';
  }
}
refreshTheme();
for (const button of document.querySelectorAll('.theme-control')) {
  button.addEventListener('click', () => {
    chosenTheme = pageTheme.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('wiki-theme', chosenTheme); } catch {}
    refreshTheme();
  });
}
systemDark.addEventListener('change', refreshTheme);

function closeSettings(focusButton = false) {
  if (settings.hidden) return;
  settings.hidden = true;
  settingsButton.setAttribute('aria-expanded', 'false');
  if (focusButton) settingsButton.focus({preventScroll:true});
}
try {
  const saved = localStorage.getItem('freshwiki-outline');
  for (const choice of settings.querySelectorAll('input')) {
    if (choice.value === saved) choice.checked = true;
  }
} catch {}
const outline = document.getElementById('article-outline');
function setOutline(choice) {
  if (!outline) return;
  outline.open = choice !== 'folded';
  for (const branch of outline.querySelectorAll('details')) branch.open = choice === 'subsections';
}
setOutline(settings.querySelector('input:checked').value);
settings.addEventListener('change', (event) => {
  if (event.target.name === 'outline') {
    setOutline(event.target.value);
    try { localStorage.setItem('freshwiki-outline', event.target.value); } catch {}
  }
});
settingsButton.addEventListener('click', () => {
  if (!settings.hidden) { closeSettings(); return; }
  settings.hidden = false;
  settingsButton.setAttribute('aria-expanded', 'true');
  settings.querySelector('input:checked').focus({preventScroll:true});
});
for (const eventName of ['pointerdown','focusin']) {
  document.addEventListener(eventName, (event) => {
    if (!event.target.closest('.rail-base')) closeSettings();
  });
}

function syncRail() {
  const mobile = phone.matches;
  const open = mobile ? drawerOpen : desktopOpen;
  frame.toggleAttribute('data-folded', !mobile && !desktopOpen);
  frame.toggleAttribute('data-drawer', mobile && drawerOpen);
  rail.hidden = !open;
  railButton.setAttribute('aria-expanded', String(open));
  scrim.hidden = !(mobile && drawerOpen);
  document.body.classList.toggle('drawer-open', mobile && drawerOpen);
  for (const element of background) element.inert = mobile && drawerOpen;
  if (!open) closeSettings();
}
function closeDrawer() {
  drawerOpen = false;
  syncRail();
  railButton.focus({preventScroll:true});
}
railButton.addEventListener('click', () => {
  if (!phone.matches) { desktopOpen = !desktopOpen; syncRail(); return; }
  if (drawerOpen) { closeDrawer(); return; }
  drawerOpen = true;
  for (const popup of headerPopups) popup.open = false;
  syncRail();
  rail.querySelector('.masthead').focus({preventScroll:true});
});
scrim.addEventListener('click', closeDrawer);
outline?.addEventListener('click', event => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (phone.matches && drawerOpen) {
    drawerOpen = false;
    syncRail();
  }
  document.getElementById(anchor.hash.slice(1))?.focus({preventScroll: true});
});
phone.addEventListener('change', () => {
  const focusWasInRail = rail.contains(document.activeElement);
  drawerOpen = false;
  closeSettings();
  syncRail();
  if (rail.hidden && focusWasInRail) railButton.focus({preventScroll:true});
});
syncRail();

function visibleInDrawer(element) {
  if (!element.getClientRects().length || element.closest('[hidden]')) return false;
  let parent = element.parentElement.closest('details');
  while (parent) {
    if (!parent.open && parent.querySelector('summary') !== element) return false;
    parent = parent.parentElement.closest('details');
  }
  return true;
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!settings.hidden) { event.preventDefault(); closeSettings(true); return; }
    const openPopups = headerPopups.filter(item => item.open);
    const popup = openPopups.filter(item => item.contains(document.activeElement)).at(-1) ?? openPopups[0];
    if (popup) { event.preventDefault(); popup.open = false; popup.querySelector('summary').focus(); return; }
    if (phone.matches && drawerOpen) { event.preventDefault(); closeDrawer(); }
  }
  if (event.key !== 'Tab' || !phone.matches || !drawerOpen) return;
  const controls = [...rail.querySelectorAll('a,summary,button,input:checked')].filter(visibleInDrawer);
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === railButton) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); railButton.focus(); }
});
for (const popup of headerPopups) {
  popup.addEventListener('toggle', () => {
    if (popup.open) {
      for (const other of headerPopups) if (!other.contains(popup) && !popup.contains(other)) other.open = false;
    } else {
      for (const child of popup.querySelectorAll('details[open]')) child.open = false;
    }
  });
}
for (const eventName of ['pointerdown','focusin']) {
  document.addEventListener(eventName, (event) => {
    for (const popup of headerPopups) if (!popup.contains(event.target)) popup.open = false;
  });
}

const band = document.getElementById('site-band');
const inline = document.getElementById('site-links');
const overflow = document.getElementById('more-links');
const links = [...overflow.children];
const measure = document.createElement('div');
measure.className = 'chip-line';
measure.setAttribute('aria-hidden','true');
measure.style.cssText = 'position:fixed;left:0;top:0;width:max-content;visibility:hidden;pointer-events:none';
for (const link of links) {
  const sample = document.createElement('span');
  sample.className = 'site-chip';
  sample.dataset.segment = link.dataset.segment;
  sample.toggleAttribute('data-icon-only', link.hasAttribute('data-icon-only'));
  sample.append(...Array.from(link.childNodes, node => node.cloneNode(true)));
  measure.append(sample);
}
document.querySelector('.top').append(measure);
function place(container, ordered) {
  ordered.forEach((node,index) => {
    if (container.children[index] !== node) container.insertBefore(node, container.children[index] || null);
  });
}
function fitRibbon() {
  const widths = [...measure.children].map(node =>
    node.getBoundingClientRect().width + parseFloat(getComputedStyle(node).marginInlineStart));
  const gap = parseFloat(getComputedStyle(inline).columnGap);
  const available = band.clientWidth;
  const full = widths.reduce((sum,w) => sum + w,0) + gap * (widths.length - 1);
  let count = links.length;
  if (full > available) {
    let used = parseFloat(getComputedStyle(more.querySelector('summary')).width);
    count = 0;
    for (const width of widths) {
      if (used + gap + width > available) break;
      used += gap + width;
      count++;
    }
  }
  const focused = document.activeElement;
  const hadMenuFocus = more.contains(focused);
  const hiddenLinks = links.slice(count);
  place(inline, links.slice(0,count));
  place(overflow, hiddenLinks);
  more.hidden = hiddenLinks.length === 0;
  if (more.hidden) more.open = false;
  if (!more.hidden && hiddenLinks.includes(focused) && !more.open) more.querySelector('summary').focus();
  else if (hadMenuFocus && more.hidden) (links.includes(focused) ? focused : inline.lastElementChild)?.focus();
  more.dataset.align = more.getBoundingClientRect().left + 170 > document.documentElement.clientWidth ? 'end' : 'start';
}
new ResizeObserver(fitRibbon).observe(band);
document.fonts.ready.then(fitRibbon);
fitRibbon();
