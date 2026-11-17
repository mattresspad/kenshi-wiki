import type { APIRoute } from 'astro';
import { readWiki } from '../lib/wiki';

export const GET: APIRoute = async () => {
  const {searchTitles} = await readWiki();
  return Response.json(searchTitles);
};
