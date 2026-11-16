// Every group stays whole and columns retain the alphabet's reading order.
function partition(heights, count, gap) {
  const n = heights.length;
  const sums = [0];
  for (const height of heights) sums.push(sums.at(-1) + height);
  const costs = Array.from({ length: count + 1 }, () => Array(n + 1).fill(Infinity));
  const breaks = Array.from({ length: count + 1 }, () => Array(n + 1).fill(0));
  costs[0][0] = 0;
  for (let columns = 1; columns <= count; columns++) {
    for (let end = columns; end <= n; end++) {
      for (let start = columns - 1; start < end; start++) {
        const height = sums[end] - sums[start] + (end - start - 1) * gap;
        const cost = Math.max(costs[columns - 1][start], height);
        if (cost < costs[columns][end]) {
          costs[columns][end] = cost;
          breaks[columns][end] = start;
        }
      }
    }
  }
  const columns = [];
  for (let column = count, end = n; column; column--) {
    const start = breaks[column][end];
    columns.unshift(Array.from({ length: end - start }, (_, i) => start + i));
    end = start;
  }
  return { columns, height: costs[count][n] };
}

/** Inputs are measured pixels: fixed heading/edges, natural list height, and the first two entries' height. */
export function categoryLayout(groups, count, available, gap) {
  if (!groups.length || count < 1 || available <= 0) return null;
  count = Math.min(count, groups.length);
  const sizes = cap => groups.map(group => Math.min(group.natural, Math.max(group.minimum, cap)));
  const pack = lists => partition(groups.map((group, i) => group.fixed + lists[i]), count, gap);
  const minimum = sizes(0);
  // A small allowance prevents subpixel rounding from creating an outer scrollbar.
  const budget = available - 1;
  if (pack(minimum).height > budget) return null;
  const natural = groups.map(group => group.natural);
  const whole = pack(natural);
  if (whole.height <= budget) return { columns: whole.columns, lists: natural };
  // Search integer quarter-pixels so a cap exactly on a boundary is not rounded down twice.
  let low = 0, high = Math.ceil(Math.max(...natural) * 4);
  while (low < high) {
    const cap = Math.ceil((low + high) / 2);
    if (pack(sizes(cap / 4)).height <= budget) low = cap;
    else high = cap - 1;
  }
  const lists = sizes(low / 4);
  return { columns: pack(lists).columns, lists };
}

export function categoryGroups(articles) {
  const groups = Array.from({ length: 26 }, (_, i) => ({ letter: String.fromCharCode(65 + i), articles: [] }));
  const other = { letter: '#', articles: [] };
  for (const article of articles.toSorted((a, b) => a.data.title.localeCompare(b.data.title, 'en'))) {
    const initial = article.data.title[0]?.toUpperCase();
    const group = /^[A-Z]$/.test(initial) ? groups[initial.charCodeAt(0) - 65] : other;
    group.articles.push(article);
  }
  return other.articles.length ? [other, ...groups] : groups;
}
