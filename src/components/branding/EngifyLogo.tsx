import { cn } from '@/lib/utils';

interface EngifyLogoProps {
  /**
   * Render only the round mark when set to "mark". Defaults to full wordmark.
   */
  variant?: 'full' | 'mark';
  /**
   * Optional className applied to the outer container (for layout/spacing).
   */
  className?: string;
  /**
   * Optional className forwarded to the SVG mark.
   */
  markClassName?: string;
  /**
   * Optional className forwarded to the wordmark text when present.
   */
  wordmarkClassName?: string;
}

const NAVY = '#0F284A';
const MID_BLUE = '#1F4F86';
const WAVE_BLUE = '#3973B8';
const LIGHT_BLUE = '#78A9E6';
const SKY_BLUE = '#A9C8F7';

export function EngifyLogo({
  variant = 'full',
  className,
  markClassName,
  wordmarkClassName,
}: EngifyLogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground',
        className
      )}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden={variant === 'mark'}
        className={cn('h-8 w-8', markClassName)}
      >
        <defs>
          <clipPath id="engify-mark-clip">
            <circle cx="32" cy="32" r="32" />
          </clipPath>
        </defs>
        <g clipPath="url(#engify-mark-clip)">
          <circle cx="32" cy="32" r="32" fill={NAVY} />
          {/* Upper wave */}
          <path
            d="M-6 36c10 6 21 10 35 10s28-4 41-16v14C57 53 45 58 32 58S7 52-6 41Z"
            fill={MID_BLUE}
            opacity="0.75"
          />
          {/* Mid wave */}
          <path
            d="M-8 44c12 8 26 12 40 12s30-5 44-18v18C63 69 46 76 32 76S6 67-8 54Z"
            fill={WAVE_BLUE}
            opacity="0.8"
          />
          {/* Lower wave */}
          <path
            d="M-4 52c12 9 26 14 44 14s32-6 46-20v16c-16 17-37 26-60 24S0 69-4 60Z"
            fill={LIGHT_BLUE}
            opacity="0.85"
          />
          {/* Ship body */}
          <path d="M24 28h16l-4 14H28Z" fill={LIGHT_BLUE} />
          {/* Ship cabin */}
          <path d="M26.5 20h11l-1.5 6h-8Z" fill={SKY_BLUE} />
        </g>
      </svg>

      {variant === 'full' && (
        <span className={cn('inline-flex items-baseline gap-1 text-xl font-semibold', wordmarkClassName)}>
          <span className="tracking-tight">Engify</span>
          <span className="text-primary/80 tracking-tight">.ai</span>
        </span>
      )}
    </span>
  );
}
