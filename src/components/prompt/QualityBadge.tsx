/**
 * QualityBadge Component
 * Displays a quality score badge for prompts
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface QualityBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function QualityBadge({
  score,
  size = 'sm',
  showLabel = false,
  className = '',
}: QualityBadgeProps) {
  if (score === null || score === undefined) {
    return null;
  }

  const getScoreColor = (s: number) => {
    if (s >= 4.5) return 'bg-green-100 text-green-800 border-green-300';
    if (s >= 4) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (s >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getIcon = (s: number) => {
    if (s >= 4.5) return <Icons.checkCircle className="h-3 w-3" />;
    if (s >= 4) return <Icons.star className="h-3 w-3 fill-current" />;
    if (s >= 3) return <Icons.alertCircle className="h-3 w-3" />;
    return <Icons.cancel className="h-3 w-3" />;
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  return (
    <Badge
      className={`${getScoreColor(score)} ${sizeClasses[size]} ${className} inline-flex items-center gap-1`}
      variant="outline"
    >
      {getIcon(score)}
      <span>{score.toFixed(1)}</span>
      {showLabel && <span className="ml-1">Quality</span>}
    </Badge>
  );
}

