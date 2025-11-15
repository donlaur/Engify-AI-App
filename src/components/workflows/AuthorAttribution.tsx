import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface AuthorAttributionProps {
  showFull?: boolean;
  className?: string;
}

export function AuthorAttribution({ showFull = false, className = '' }: AuthorAttributionProps) {
  return (
    <div className={`rounded-lg border bg-slate-50 p-4 dark:bg-slate-900 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Icons.user className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href="/authors/donnie-laur"
              className="font-semibold text-foreground hover:text-primary hover:underline"
            >
              Donnie Laur
            </Link>
            {showFull && (
              <Badge variant="secondary" className="text-xs">
                Human-created, AI-assisted
              </Badge>
            )}
          </div>
          {showFull ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Engineering Leader & AI Guardrails Leader. Creator of Engify.ai, helping teams
              operationalize AI through structured workflows and guardrails based on real production
              incidents.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="italic">Human-created, AI-assisted</span>
            </p>
          )}
          {showFull && (
            <div className="mt-2 flex gap-2">
              <Link
                href="/authors/donnie-laur"
                className="text-xs text-primary hover:underline"
              >
                View profile →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

