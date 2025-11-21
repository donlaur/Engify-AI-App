import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCard {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning';
}

interface StatsCardsProps {
  stats: StatCard[];
}

/**
 * StatsCards Component
 * 
 * A reusable component for displaying statistics in a grid layout.
 * Provides consistent styling for stat cards with optional color variants.
 * 
 * @pattern REUSABLE_UI_COMPONENT
 * @principle DRY - Eliminates duplication of stat card markup
 * 
 * @features
 * - Grid layout (responsive: 1 column on mobile, 4 on desktop)
 * - Color variants (default, success, warning)
 * - Consistent card styling
 * 
 * @example
 * ```tsx
 * <StatsCards
 *   stats={[
 *     { label: 'Total', value: 1234 },
 *     { label: 'Active', value: 567, variant: 'success' },
 *     { label: 'Pending', value: 89, variant: 'warning' },
 *   ]}
 * />
 * ```
 * 
 * @usage
 * Used in admin panels to display key metrics and statistics.
 * 
 * @see AdminStatsCard for a more feature-rich alternative
 */
export function StatsCards({ stats }: StatsCardsProps) {
  const getValueColor = (variant?: StatCard['variant']) => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      default:
        return '';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getValueColor(stat.variant)}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

