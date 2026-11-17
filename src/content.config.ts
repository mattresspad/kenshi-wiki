import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const factPart = z.union([z.string(), z.tuple([z.string(), z.string()])]);
const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md', generateId: ({ data }) => {
    if (typeof data.articleId !== 'string' || !data.articleId.trim()) throw Error('Every article must declare its registered articleId');
    return data.articleId;
  } }),
  schema: z.object({
    articleId: z.string().min(1), title: z.string(), description: z.string(), categories: z.array(z.string()),
    layout: z.enum(['town', 'recipe', 'reference']),
    bookmarks: z.record(z.string(), z.string()).default({}), headingIds: z.record(z.string(), z.string()).default({}),
    facts: z.array(z.tuple([z.string(), factPart]).rest(factPart)).optional(), recordId: z.string().optional(),
    versions: z.array(z.tuple([z.string(), z.string()])).optional()
  })
});
export const collections = { articles };
