import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: keyof typeof Icons;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  const Icon = Icons[icon] || Icons.sparkles; // Fallback to prevent undefined component

  return (
    <Card className={cn('transition-shadow hover:shadow-lg', className)}>
      <CardHeader>
        <Icon className="mb-4 h-12 w-12 text-purple-600" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
