import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const inlineFactPart = z.union([z.string(), z.tuple([z.string(), z.string()]), z.object({break:z.literal(true)}), z.object({strike:z.literal(true),text:z.string(),href:z.string().optional()}), z.object({strong:z.literal(true),text:z.string(),href:z.string().optional()})]);
const factPart = z.union([inlineFactPart, z.object({list:z.array(z.array(inlineFactPart))})]);
const articles = defineCollection({
  // The loader caches by physical file. The catalog resolves data.articleId independently.
  loader: glob({ base: './src/content/articles', pattern: '**/*.md', generateId: ({entry}) => entry }),
  schema: z.object({
    articleId: z.string().min(1), title: z.string(), description: z.string(), categories: z.array(z.string()),
    layout: z.enum(['town', 'recipe', 'reference', 'geography', 'faction', 'race', 'animal', 'character', 'item', 'building', 'crafting', 'technology', 'shop', 'gameplay', 'event']),
    bookmarks: z.record(z.string(), z.string()).default({}), headingIds: z.record(z.string(), z.string()).default({}),
    facts: z.array(z.tuple([z.string(), factPart]).rest(factPart)).optional(), recordId: z.string().optional(),
    factTitle: z.string().optional(), factImage:z.object({src:z.string(),alt:z.string()}).optional(), factCaption:z.string().optional(),
    factGroups: z.array(z.object({heading:z.string().nullable(), rows:z.array(z.tuple([z.string(), factPart]).rest(factPart))})).optional(),
    versions: z.array(z.tuple([z.string(), z.string()])).optional()
  })
});
export const collections = { articles };
