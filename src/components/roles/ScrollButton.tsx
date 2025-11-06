'use client';

import { Button } from '@/components/ui/button';

interface ScrollButtonProps {
  targetId: string;
  label: string;
  className?: string;
}

export function ScrollButton({ targetId, label, className }: ScrollButtonProps) {
  const handleClick = () => {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
      aria-label={`Scroll to ${label}`}
    >
      {label}
    </button>
  );
}
