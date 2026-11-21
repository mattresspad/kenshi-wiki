import { buildCatalog, snapshot, effectiveSnapshot } from '../src/lib/catalog.mjs';
import { articleFiles, assetRedirects } from './article-files.mjs';

const catalog = buildCatalog(articleFiles(), effectiveSnapshot, assetRedirects('public/_redirects'));
console.log(catalog.byId.size + ' article identities checked; ' + [...catalog.byId.values()].filter(a => a.filePath).length + ' editable files.');
