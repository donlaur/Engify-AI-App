import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
}

/**
 * StatCard Component - Consistent Stats Display
 *
 * Follows Vibrant Dark Mode style guide:
 * - Uses `surface-frosted` for glass effect in dark mode
 * - Uses `text-primary-light` for value (bright white)
 * - Uses `text-tertiary` for label (muted gray)
 * - Matches styling from /learn and /prompts pages
 *
 * Usage:
 * ```tsx
 * <StatCard value={123} label="Total Items" />
 * ```
 */
export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <Card className={cn('surface-frosted', className)}>
      <CardContent className="pt-6">
        <div className="text-primary-light dark:text-primary-light text-2xl font-bold">
          {value}
        </div>
        <p className="text-tertiary dark:text-tertiary text-xs">{label}</p>
      </CardContent>
    </Card>
  );
}
