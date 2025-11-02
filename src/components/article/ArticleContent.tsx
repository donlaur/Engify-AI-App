'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { toast } from '@/hooks/use-toast';

interface ArticleContentProps {
  html: string;
}

export function ArticleContent({ html }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Add copy buttons to all code blocks
    const codeBlocks = contentRef.current.querySelectorAll('pre');
    
    codeBlocks.forEach((block) => {
      // Skip if already has copy button
      if (block.querySelector('.copy-button')) return;

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'relative group';
      block.parentNode?.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      // Create copy button
      const button = document.createElement('button');
      button.className =
        'copy-button absolute top-2 right-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      `;
      
      button.onclick = () => {
        const code = block.textContent || '';
        navigator.clipboard.writeText(code);
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        setTimeout(() => {
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          `;
        }, 2000);
      };

      wrapper.appendChild(button);
    });
  }, [html]);

  return (
    <div
      ref={contentRef}
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

