import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
}

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <Card className={cn('text-center', className)}>
      <CardContent className="pt-6">
        <div className="text-5xl font-bold text-purple-600">{value}</div>
        <div className="mt-2 text-sm text-gray-600">{label}</div>
      </CardContent>
    </Card>
  );
}
