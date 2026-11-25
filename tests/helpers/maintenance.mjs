import fs from 'node:fs';
import {resolve,join} from 'node:path';
import {Miniflare} from 'miniflare';
import {readBuildOutput} from '@cloudflare/build-output-utils';
import {buildMaintenance} from '../../scripts/maintenance/package.mjs';
import {digest} from '../../scripts/maintenance/documents.mjs';
export const crawlFiles={
 '/robots.txt':'User-agent: *\nAllow: /\nSitemap: https://kenshi.wiki/sitemap-index.xml\n',
 '/sitemap-index.xml':'<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://kenshi.wiki/sitemap-0.xml</loc></sitemap></sitemapindex>',
 '/sitemap-0.xml':'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://kenshi.wiki/history-of-kenshi/tr</loc></url><url><loc>https://kenshi.wiki/catun</loc></url></urlset>'
};
export const fixtureSnapshot={documents:Object.fromEntries(Object.entries(crawlFiles).map(([p,text])=>[p,{base64:Buffer.from(text).toString('base64'),type:p.endsWith('.xml')?'application/xml; charset=utf-8':'text/plain; charset=utf-8'}])),hashes:Object.fromEntries(Object.entries(crawlFiles).map(([p,t])=>[p,digest(t)]))};
export async function openMaintenance(suffix='local') {
 const root=resolve('reports/maintenance/fixture-'+suffix);await buildMaintenance(root,fixtureSnapshot);
 const {workers}=await readBuildOutput(root);const {config,bundleDir}=workers.default;
 const modules=Object.fromEntries(Object.entries(config.manifest.modules).map(([name,d])=>[name,{type:d.type,contents:fs.readFileSync(join(bundleDir,name),'utf8')}]));
 return new Miniflare({host:'127.0.0.1',port:0,cf:false,enableDevRegistry:false,logRequests:false,workers:[{config:{...config,manifest:{mainModule:config.manifest.mainModule,modulesRoot:bundleDir,modules}}}]});
}
