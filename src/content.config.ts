import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const factPart = z.union([z.string(), z.tuple([z.string(), z.string()])]);
const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    title: z.string(), description: z.string(), categories: z.array(z.string()),
    layout: z.enum(['town', 'recipe', 'reference']), credit: z.string(), license: z.enum(['3.0', '4.0']),
    originalCommit: z.string(), sourceRevision: z.string().optional(), fandomRevision: z.number().optional(),
    bookmarks: z.record(z.string(), z.string()).default({}), headingIds: z.record(z.string(), z.string()).default({}),
    facts: z.array(z.tuple([z.string(), factPart]).rest(factPart)).optional(), recordId: z.string().optional(),
    versions: z.array(z.tuple([z.string(), z.string()])).optional()
  })
});
export const collections = { articles };
