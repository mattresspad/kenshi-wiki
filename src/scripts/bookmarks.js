// Legacy fragments keep their public spelling, but keyboard reading resumes at the real section.
function focusBookmark() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const alias = document.getElementById(id);
  if (!alias?.matches('.bookmark[data-bookmark-target]')) return;
  const target = document.getElementById(alias.dataset.bookmarkTarget);
  if (!target) return;
  if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
  target.focus({preventScroll: true});
  target.scrollIntoView({block: 'start'});
}
// Initial native fragment navigation can finish after module evaluation.
window.addEventListener('pageshow', focusBookmark);
if (document.readyState === 'complete') focusBookmark();
window.addEventListener('hashchange', focusBookmark);
// Clicking the already-selected fragment does not fire hashchange.
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.target || link.hasAttribute('download')) return;
  if (link.href === location.href) setTimeout(focusBookmark, 0);
});
