import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string | ReactNode;
  actions?: ReactNode;
}

/**
 * Reusable empty state component for admin panels
 */
export function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <Card className="mb-8 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Icons.info className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {typeof description === 'string' ? (
          <p className="text-sm text-blue-600 dark:text-blue-300">{description}</p>
        ) : (
          description
        )}
        {actions && <div className="flex gap-2 mt-4">{actions}</div>}
      </CardContent>
    </Card>
  );
}

