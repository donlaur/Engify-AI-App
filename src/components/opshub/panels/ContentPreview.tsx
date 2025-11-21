/**
 * Content Preview Component
 * Renders markdown content with proper formatting, code highlighting, and styling
 */

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface ContentPreviewProps {
  content: string;
  className?: string;
}

/**
 * ContentPreview Component
 * 
 * A component for previewing markdown content with syntax highlighting.
 * Renders markdown content as formatted HTML with GitHub Flavored Markdown support.
 * 
 * @component
 * @pattern CONTENT_PREVIEW
 * @principle DRY - Centralizes content preview rendering
 * 
 * @features
 * - Markdown rendering with ReactMarkdown
 * - GitHub Flavored Markdown support
 * - Prose styling for readability
 * - Dark mode support
 * - Custom className support
 * 
 * @param content - Markdown content string to preview
 * @param className - Optional CSS class name for custom styling
 * 
 * @example
 * ```tsx
 * <ContentPreview
 *   content="# Hello World\n\nThis is **markdown** content."
 *   className="max-w-2xl"
 * />
 * ```
 * 
 * @usage
 * Used throughout OpsHub for previewing markdown content.
 * Provides consistent content preview rendering.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function ContentPreview({ content, className = '' }: ContentPreviewProps) {
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <div className="relative group my-4">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                    }}
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                  >
                    Copy
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  className="rounded-lg !my-0"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          // Headings with anchors
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 pb-2 border-b">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold mt-6 mb-3 pb-2 border-b">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mt-5 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-semibold mt-4 mb-2">{children}</h4>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic bg-blue-50 dark:bg-blue-950/20">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm">{children}</td>
          ),
          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="my-4 leading-7">{children}</p>
          ),
          // Horizontal rules
          hr: () => (
            <hr className="my-8 border-gray-300 dark:border-gray-700" />
          ),
          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg my-4 max-w-full h-auto"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
