import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const inlineFactPart = z.union([z.string(), z.tuple([z.string(), z.string()]), z.object({break:z.literal(true)}), z.object({strike:z.literal(true),text:z.string(),href:z.string().optional()}), z.object({strong:z.literal(true),text:z.string(),href:z.string().optional()})]);
const factPart = z.union([inlineFactPart, z.object({list:z.array(z.array(inlineFactPart))})]);
const articles = defineCollection({
  // The loader caches by physical file. The catalog resolves data.articleId independently.
  loader: glob({ base: './src/content/articles', pattern: '**/*.md', generateId: ({entry}) => entry }),
  schema: z.object({
    articleId: z.string().min(1), title: z.string(), description: z.string(), categories: z.array(z.string()),
    layout: z.enum(['town', 'recipe', 'reference', 'geography', 'faction', 'race', 'animal', 'character', 'item', 'building', 'crafting', 'technology', 'shop', 'gameplay', 'event', 'lore', 'modding']),
    bookmarks: z.record(z.string(), z.string()).default({}), headingIds: z.record(z.string(), z.string()).default({}),
    facts: z.array(z.tuple([z.string(), factPart]).rest(factPart)).optional(), recordId: z.string().optional(),
    contextNotice:z.string().optional(), factTitle: z.string().optional(), factImage:z.object({src:z.string(),alt:z.string()}).optional(), factCaption:z.string().optional(), recordedItemText:z.string().optional(), contentLanguage:z.enum(['en','tr']).default('en'),
    factGroups: z.array(z.object({heading:z.string().nullable(), rows:z.array(z.tuple([z.string(), factPart]).rest(factPart))})).optional(),
    versions: z.array(z.tuple([z.string(), z.string()])).optional()
  }).refine(data=>!(data.recordedItemText && data.factCaption),{message:'Recorded item text must replace, not duplicate, the fact caption.'})
});
const site = defineCollection({loader:glob({base:'./src/content/site',pattern:'**/*.md',generateId:({entry})=>entry}),schema:z.object({pageId:z.enum(['about-kenshi','contributors','copyright-and-permissions','contact','contact-copyright']),title:z.string(),description:z.string()})});
export const collections = { articles, site };
