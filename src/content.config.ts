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

// Curated landing pages are edited independently of the Fandom article import.
const portals = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/data/portals' }),
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    indexes: z.array(z.object({ category: z.string(), label: z.string() })),
    sections: z.array(z.object({
      title: z.string(),
      articles: z.array(z.object({
        id: z.string(),
        description: z.string(),
        credit: z.object({ label: z.string(), evidence: z.url() }).optional(),
      })),
    })),
  }),
});

export const collections = { wiki, portals };
