import type { MarkdownHeading } from 'astro';

type SectionLink = { id: string; title: string };
export type OutlineSection = SectionLink & { children?: SectionLink[] };

export function articleOutline(headings: MarkdownHeading[]): OutlineSection[] {
  const outline: OutlineSection[] = [];
  let major: OutlineSection | undefined;
  for (const { depth, text, slug } of headings) {
    if ((depth !== 2 && depth !== 3) || !text.trim() || !slug) continue;
    const section = { id: slug, title: text };
    if (depth === 3 && major) {
      (major.children ??= []).push(section);
    } else {
      outline.push(section);
      if (depth === 2) major = section;
    }
  }
  return outline;
}
