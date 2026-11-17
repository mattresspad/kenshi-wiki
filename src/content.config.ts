import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const articles = defineCollection({
  loader: glob({ base:'./src/content/articles', pattern:'**/*.md', generateId: ({entry}) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    title:z.string(), description:z.string(), categories:z.array(z.string()),
    layout:z.enum(['town','recipe']), credit:z.string(), license:z.enum(['3.0','4.0']),
    originalCommit:z.string(), fandomRevision:z.number().optional(),
    bookmarks:z.record(z.string(),z.string()).default({}), recordId:z.string().optional(), headingIds:z.record(z.string(),z.string()).default({}), facts:z.array(z.tuple([z.string(),z.string(),z.string().optional()])).optional(),
    versions:z.array(z.tuple([z.string(),z.string()])).optional()
  })
});
export const collections = {articles};
