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
 * Reusable stats cards component for admin panels
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

