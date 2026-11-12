import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Every article's title and path, so the header search can suggest pages as fast as one types.
export const GET: APIRoute = async () => {
  const [articles, portals] = await Promise.all([getCollection('wiki'), getCollection('portals')]);
  const pages = [['About Kenshi', '/about-kenshi'], ['Contributors', '/contributors']];
  const titles = [...pages, ...[...articles, ...portals].map(({ id, data }) => [data.title, `/${id}`])];
  return new Response(JSON.stringify(titles), { headers: { 'Content-Type': 'application/json' } });
};
