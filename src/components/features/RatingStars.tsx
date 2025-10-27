/**
 * Rating Stars Component
 * 
 * Interactive star rating component
 */

'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingStars({ 
  rating, 
  onRate, 
  readonly = false,
  size = 'md' 
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  const iconSize = sizeClasses[size];
  
  const handleClick = (value: number) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };
  
  const displayRating = hoverRating || rating;
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= displayRating;
        const isHalf = value - 0.5 === displayRating;
        
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={cn(
              'transition-colors',
              !readonly && 'cursor-pointer hover:scale-110',
              readonly && 'cursor-default'
            )}
          >
            <Icons.star 
              className={cn(
                iconSize,
                isFilled || isHalf
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
