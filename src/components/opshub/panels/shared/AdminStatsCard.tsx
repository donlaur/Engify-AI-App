import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

type ColorVariant = 'default' | 'green' | 'gray' | 'blue' | 'purple' | 'orange' | 'red';

interface AdminStatsCardProps {
  label: string;
  value: number | string;
  variant?: ColorVariant;
  icon?: ReactNode;
}

const colorVariantMap: Record<ColorVariant, string> = {
  default: '',
  green: 'text-green-600',
  gray: 'text-gray-400',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
};

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
