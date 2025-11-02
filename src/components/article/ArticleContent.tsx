/**
 * ArticleContent Component
 * 
 * Ultra-minimal server component for rendering article HTML.
 * No client-side code, no hooks, no interactivity.
 * 
 * Fixed: React error #130 - removed all client-side logic
 */

interface ArticleContentProps {
  html: string;
}

export function ArticleContent({ html }: ArticleContentProps) {
  return (
    <div
      className="article-content prose prose-slate dark:prose-invert prose-lg max-w-none
        prose-headings:font-bold prose-headings:tracking-tight
        prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
        prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-2
        prose-p:text-base prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:font-semibold prose-strong:text-slate-900 dark:prose-strong:text-slate-100
        prose-code:text-pink-600 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-lg 
        prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:my-6
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
        prose-li:my-1 prose-li:leading-relaxed
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
        prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-6
        prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
        prose-hr:my-12 prose-hr:border-slate-200 dark:prose-hr:border-slate-700
        prose-table:my-6 prose-table:border-collapse
        prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:px-4 prose-th:py-2
        prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 
        prose-td:px-4 prose-td:py-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
