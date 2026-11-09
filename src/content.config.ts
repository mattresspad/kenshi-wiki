import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { pageSlug } from './lib/wiki.js';

const row = z.tuple([z.string(), z.string()]);

// The file path is the page's URL path, so it must already be in canonical form: a file such as Nodachi.md would build
// at /Nodachi while every link points to /nodachi.
function articleId({ entry }: { entry: string }) {
  const id = entry.replace(/\.md$/, '');
  if (id !== pageSlug(id)) throw new Error(`src/content/wiki/${entry} must be named ${pageSlug(id)}.md`);
  return id;
}

// Articles imported from the Kenshi Fandom wiki by scripts/import-fandom.mjs.
const wiki = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/wiki', generateId: articleId }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    source: z.object({ title: z.string(), revision: z.number() }),
    categories: z.array(z.string()).default([]),
    infobox: z.object({
      title: z.string(),
      image: z.string().optional(),
      caption: z.string().optional(),
      groups: z.array(z.object({ heading: z.string().nullable(), rows: z.array(row) })),
    }).optional(),
  }),
});

export const collections = { wiki };
