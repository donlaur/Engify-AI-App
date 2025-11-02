/**
 * ArticleRenderer Component
 * 
 * ULTRA-MINIMAL server component for rendering article HTML.
 * No Tailwind, no complexity - just raw HTML rendering.
 */

export function ArticleRenderer({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
