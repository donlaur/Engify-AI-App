import { Button } from '@/components/ui/button';

export type FilterType = 'all' | 'active' | 'deprecated';

interface FilterOption {
  value: FilterType;
  label: string;
  count: number;
}

interface FilterButtonsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  options: FilterOption[];
}

/**
 * Reusable filter buttons component for admin panels
 */
export function FilterButtons({ filter, onFilterChange, options }: FilterButtonsProps) {
  return (
    <div className="flex gap-2 mb-6">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={filter === option.value ? 'default' : 'outline'}
          onClick={() => onFilterChange(option.value)}
          size="sm"
        >
          {option.label} ({option.count})
        </Button>
      ))}
    </div>
  );
}

