import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const factPart = z.union([z.string(), z.tuple([z.string(), z.string()]), z.object({break:z.literal(true)})]);
const articles = defineCollection({
  // The loader caches by physical file. The catalog resolves data.articleId independently.
  loader: glob({ base: './src/content/articles', pattern: '**/*.md', generateId: ({entry}) => entry }),
  schema: z.object({
    articleId: z.string().min(1), title: z.string(), description: z.string(), categories: z.array(z.string()),
    layout: z.enum(['town', 'recipe', 'reference', 'geography', 'faction', 'race']),
    bookmarks: z.record(z.string(), z.string()).default({}), headingIds: z.record(z.string(), z.string()).default({}),
    facts: z.array(z.tuple([z.string(), factPart]).rest(factPart)).optional(), recordId: z.string().optional(),
    factTitle: z.string().optional(),
    factGroups: z.array(z.object({heading:z.string().nullable(), rows:z.array(z.tuple([z.string(), factPart]).rest(factPart))})).optional(),
    versions: z.array(z.tuple([z.string(), z.string()])).optional()
  })
});
export const collections = { articles };
