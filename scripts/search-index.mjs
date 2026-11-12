import * as pagefind from 'pagefind';
import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

import { resolvePortalSections } from '../src/lib/portals.js';

const portalDir = fileURLToPath(new URL('../src/data/portals/', import.meta.url));
const wikiDir = fileURLToPath(new URL('../src/content/wiki/', import.meta.url));
const contentTypes = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

async function newIndex() {
  const { index, errors } = await pagefind.createIndex({ forceLanguage: 'en' });
  if (!index) throw new Error(`Pagefind could not start: ${errors.join('; ')}`);
  return index;
}

// Index the built pages for the Search page. Runs before cloudflareStatic, so the index ships in the deploy package.
async function indexBuild(dir, logger) {
  const site = fileURLToPath(dir);
  const index = await newIndex();
  const indexed = await index.addDirectory({ path: site });
  const written = await index.writeFiles({ outputPath: `${site}pagefind` });
  await pagefind.close();

  const failures = [...indexed.errors, ...written.errors];
  if (failures.length) throw new Error(`Pagefind failed: ${failures.join('; ')}`);
  logger.info(`Indexed ${indexed.page_count} pages for search.`);
}

// An article as a search record: its title, and its text without frontmatter, HTML tags or Markdown punctuation.
export function articleRecord(id, source) {
  const [, front = '', body = source] = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/) ?? [];
  const title = String(parseYaml(front)?.title ?? id);
  const text = body.replace(/<[^>]+>/g, ' ').replace(/\]\([^)]*\)/g, ' ').replace(/[#*_>`|[\]]/g, ' ').replace(/\s+/g, ' ');
  return { url: `/${id}`, content: `${title}. ${text}`, language: 'en', meta: { title } };
}

// The dev server has no built pages, so its index is made from the article sources and kept in memory.
async function indexArticles() {
  const files = (await readdir(wikiDir, { recursive: true })).filter((file) => file.endsWith('.md'));
  const index = await newIndex();
  const titles = new Map();
  await Promise.all(files.map(async (file) => {
    const id = file.replaceAll('\\', '/').replace(/\.md$/, '');
    const record = articleRecord(id, await readFile(`${wikiDir}${file}`, 'utf8'));
    titles.set(id, record.meta.title);
    await index.addCustomRecord(record);
  }));

  const portals = (await readdir(portalDir)).filter(file => file.endsWith('.yaml'));
  for (const file of portals) {
    const portal = parseYaml(await readFile(`${portalDir}${file}`, 'utf8'));
    const sections = resolvePortalSections(portal, titles);
    const text = [portal.title, portal.intro, ...portal.indexes.map(item => item.label)];
    for (const section of sections) {
      text.push(section.title);
      for (const row of section.articles) text.push(row.title, row.description, row.credit?.label ?? '');
    }
    await index.addCustomRecord({ url: '/' + file.slice(0, -5), language: 'en', meta: { title: portal.title }, content: text.join(' ') });
  }
  const { files: bundle } = await index.getFiles();
  await index.deleteIndex();
  return { count: files.length + portals.length, files: new Map(bundle.map((file) => [`/pagefind/${file.path.replaceAll('\\', '/')}`, file.content])) };
}

function serveIndex(getIndex) {
  return async (request, response, next) => {
    const path = request.url.split('?')[0];
    if (!path.startsWith('/pagefind/')) return next();
    try {
      const file = (await getIndex()).files.get(path);
      response.statusCode = file ? 200 : 404;
      response.setHeader('Content-Type', contentTypes[extname(path)] ?? 'application/octet-stream');
      response.setHeader('Cache-Control', 'no-store');
      response.end(file);
    } catch (error) {
      next(error);
    }
  };
}

// Search in `astro dev`: the index is built when the server starts and again a second after an article changes.
function setUpDevSearch({ server, logger }) {
  let current = indexArticles();
  const report = () => current.then(({ count }) => logger.info(`Indexed ${count} pages for search.`), (error) => logger.error(error.message));
  report();

  let timer;
  const rebuild = (path) => {
    const fullPath = resolve(path);
    const article = fullPath.startsWith(wikiDir) && fullPath.endsWith('.md');
    const portal = fullPath.startsWith(portalDir) && fullPath.endsWith('.yaml');
    if (!article && !portal) return;
    clearTimeout(timer);
    timer = setTimeout(() => { current = indexArticles(); report(); }, 1000);
  };
  for (const event of ['add', 'change', 'unlink']) server.watcher.on(event, rebuild);

  server.middlewares.use(serveIndex(() => current));
  server.httpServer?.on('close', () => pagefind.close());
}

export default function searchIndex() {
  return {
    name: 'wiki-search-index',
    hooks: {
      'astro:build:done': ({ dir, logger }) => indexBuild(dir, logger),
      'astro:server:setup': setUpDevSearch,
    },
  };
}
