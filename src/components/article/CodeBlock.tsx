'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'text';
  const codeContent = String(children).trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-border bg-slate-950">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {copied ? (
            <>
              <Icons.check className="mr-1 h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Icons.copy className="mr-1 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-4">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

