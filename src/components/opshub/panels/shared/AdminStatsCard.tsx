import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

/**
 * Color variant options for AdminStatsCard
 * 
 * @pattern COLOR_VARIANT
 * @usage Used to style stat cards with semantic colors
 */
type ColorVariant = 'default' | 'green' | 'gray' | 'blue' | 'purple' | 'orange' | 'red';

/**
 * Props for the AdminStatsCard component
 * 
 * @interface AdminStatsCardProps
 */
interface AdminStatsCardProps {
  /** Display label for the stat (e.g., "Total Users", "Active") */
  label: string;
  /** Numeric or string value to display (e.g., 123, "1.2K") */
  value: number | string;
  /** Color variant for the value text */
  variant?: ColorVariant;
  /** Optional icon to display next to the label */
  icon?: ReactNode;
}

/**
 * Color variant to Tailwind CSS class mapping
 * 
 * Maps semantic color variants to Tailwind text color classes
 */
const colorVariantMap: Record<ColorVariant, string> = {
  default: '',
  green: 'text-green-600',
  gray: 'text-gray-400',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
};

/**
 * AdminStatsCard Component
 * 
 * A reusable card component for displaying statistics in admin panels.
 * Provides consistent styling and layout for numeric metrics with optional
 * color variants and icons.
 * 
 * @pattern REUSABLE_UI_COMPONENT
 * @principle DRY - Eliminates duplication of stat card markup
 * 
 * @features
 * - Consistent card layout and styling
 * - Semantic color variants for different metric types
 * - Optional icon support
 * - Responsive design
 * 
 * @usage
 * Used throughout OpsHub admin panels to display statistics like user counts,
 * workflow metrics, content statistics, etc.
 * 
 * @example
 * ```tsx
 * <AdminStatsCard 
 *   label="Total Users" 
 *   value={1234} 
 *   variant="blue" 
 * />
 * 
 * <AdminStatsCard 
 *   label="Active Workflows" 
 *   value={56} 
 *   variant="green"
 *   icon={<Icons.workflow />}
 * />
 * ```
 * 
 * @function AdminStatsCard
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function AdminStatsCard({
  label,
  value,
  variant = 'default',
  icon,
}: AdminStatsCardProps) {
  const colorClass = colorVariantMap[variant];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs">{label}</CardDescription>
          {icon && <div className="ml-2">{icon}</div>}
        </div>
        <CardTitle className={`text-4xl font-bold ${colorClass}`}>
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
