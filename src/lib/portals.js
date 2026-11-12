/** Resolve each editorial selection against the same article titles used by wiki search.
 * @param {import('astro:content').CollectionEntry<'portals'>['data']} portal
 * @param {Map<string, string>} titles
 */
export function resolvePortalSections(portal, titles) {
  const seen = new Set();
  return portal.sections.map(section => ({
    title: section.title,
    articles: section.articles.map(article => {
      const title = titles.get(article.id);
      if (!title) throw new Error(`${portal.title} portal: unknown article "${article.id}".`);
      if (seen.has(article.id)) throw new Error(`${portal.title} portal: duplicate article "${article.id}".`);
      seen.add(article.id);
      return { ...article, title, href: `/${article.id}` };
    }),
  }));
}
