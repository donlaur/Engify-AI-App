'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { CodeBlock } from './CodeBlock';
import 'highlight.js/styles/github-dark.css';

interface ArticleRendererProps {
  content: string;
}

export function ArticleRenderer({ content }: ArticleRendererProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeHighlight,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ]}
        components={{
          // Code blocks with copy button
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ node, inline, className, children, ...props }: any) {
            if (inline) {
              return (
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono text-slate-900 dark:bg-slate-800 dark:text-slate-100" {...props}>
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },

          // Headings with better styling
          h1: ({ children, ...props }) => (
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-8 mb-4" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-10 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mt-8 mb-3" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white mt-6 mb-2" {...props}>
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="text-base leading-7 text-slate-700 dark:text-slate-300 mb-4" {...props}>
              {children}
            </p>
          ),

          // Lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-7" {...props}>
              {children}
            </li>
          ),

          // Links
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="font-medium text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),

          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary/30 bg-slate-50 dark:bg-slate-900 pl-4 py-3 my-4 italic text-slate-600 dark:text-slate-400" {...props}>
              {children}
            </blockquote>
          ),

          // Images
          img: ({ src, alt, ...props }) => (
            <figure className="my-8">
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                {/* Placeholder for images that don't exist yet */}
                {typeof src === 'string' && src.includes('images/') ? (
                  <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    <div className="text-center px-6">
                      <div className="text-slate-400 dark:text-slate-600 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{alt}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Image coming soon</p>
                    </div>
                  </div>
                ) : (
                  <img src={src} alt={alt} className="w-full h-auto" {...props} />
                )}
              </div>
              {alt && (
                <figcaption className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400 italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),

          // Tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-slate-50 dark:bg-slate-900" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </td>
          ),

          // Horizontal rule
          hr: ({ ...props }) => (
            <hr className="my-8 border-slate-200 dark:border-slate-800" {...props} />
          ),

          // Strong/Bold
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-slate-900 dark:text-white" {...props}>
              {children}
            </strong>
          ),

          // Emphasis/Italic
          em: ({ children, ...props }) => (
            <em className="italic text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

