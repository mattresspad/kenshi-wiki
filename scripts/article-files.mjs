import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'yaml';

// Mirror the loader's repo-relative filePath for offline validation and compare it with the rendered result.
export function articleFiles(root = '.') {
  const folder = join(root, 'src/content/articles');
  return readdirSync(folder, {recursive: true}).filter(file => file.endsWith('.md')).sort().map(file => {
    const absolute = join(folder, file);
    const markdown = readFileSync(absolute, 'utf8');
    const header = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!header) throw Error('Missing article metadata in ' + absolute);
    const data = parse(header[1]);
    return {id: data.articleId, data, filePath: relative(root, absolute).split(sep).join('/')};
  });
}

export function assetRedirects(file) {
  return readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim())
    .filter(line => line && !line.startsWith('#')).map(line => {
      const [from, to, status] = line.split(/\s+/);
      return {from, to, status: Number(status)};
    });
}
