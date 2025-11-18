/**
 * Author Profile Button Component
 * 
 * A styled, visitor-friendly button that links to the author profile page.
 * Used throughout the site to provide easy access to author information.
 */

import Link from 'next/link';
import { Icons } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AuthorProfileButtonProps {
  variant?: 'default' | 'compact' | 'card';
  className?: string;
  showBadge?: boolean;
}

export function AuthorProfileButton({
  variant = 'default',
  className,
  showBadge = true,
}: AuthorProfileButtonProps) {
  const baseStyles = 'group inline-flex items-center gap-2 rounded-lg border transition-all duration-200 hover:shadow-md';
  
  const variantStyles = {
    default: 'px-4 py-2.5 border-primary/20 bg-white dark:bg-gray-800 hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10',
    compact: 'px-3 py-1.5 border-primary/20 bg-white dark:bg-gray-800 hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 text-sm',
    card: 'px-4 py-3 border-primary/30 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 hover:border-primary/50 hover:shadow-lg',
  };

  return (
    <Link
      href="/authors/donnie-laur"
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
        <Icons.user className="h-4 w-4" />
      </div>
      <div className="flex flex-col items-start min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            Donnie Laur
          </span>
          {showBadge && (
            <Badge variant="secondary" className="text-xs shrink-0">
              Human-created, AI-assisted
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">
          Engineering Leader & AI Guardrails Leader
        </span>
      </div>
      <Icons.arrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
    </Link>
  );
}

