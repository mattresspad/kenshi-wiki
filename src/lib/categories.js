import { getCollection } from 'astro:content';
import { pageSlug } from './wiki.js';

// Fandom tracking categories that say nothing about the page itself.
const tracking = new Set(['Pages with non-numeric formatnum arguments']);

export const shownCategories = (categories) => categories.filter((category) => !tracking.has(category));

// Every category with the articles in it, alphabetically.
export async function categoryIndex() {
  const index = new Map();
  for (const article of await getCollection('wiki')) {
    for (const category of shownCategories(article.data.categories)) {
      if (!index.has(category)) index.set(category, []);
      index.get(category).push(article);
    }
  }

  for (const articles of index.values()) articles.sort((a, b) => a.data.title.localeCompare(b.data.title));
  return index;
}

// Paths of every page the site builds: articles, category pages and the hand-written pages.
export async function existingPaths() {
  const articles = (await getCollection('wiki')).map((article) => `/${article.id}`);
  const portals = (await getCollection('portals')).map(portal => '/' + portal.id);
  const categories = [...(await categoryIndex()).keys()].map((category) => `/category/${pageSlug(category)}`);
  const pages = Object.keys(import.meta.glob('../pages/*.astro')).map((file) => `/${file.match(/([^/]+)\.astro$/)[1]}`);
  return new Set([...articles, ...categories, ...portals, ...pages.filter((path) => !path.includes('['))]);
}
