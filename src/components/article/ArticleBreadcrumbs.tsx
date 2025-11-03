/**
 * ArticleBreadcrumbs - Reusable breadcrumb navigation
 */

import Link from 'next/link';
import { Icons } from '@/lib/icons';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface ArticleBreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
}

export function ArticleBreadcrumbs({ breadcrumbs }: ArticleBreadcrumbsProps) {
  return (
    <nav className="border-b bg-slate-50 dark:bg-slate-900">
      <div className="container flex items-center gap-2 py-3 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={index} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-medium' : 'text-muted-foreground'}>
                  {crumb.label}
                </span>
              )}
              {!isLast && <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

