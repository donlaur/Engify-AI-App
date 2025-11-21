import { Button } from '@/components/ui/button';

export type FilterType = 'all' | 'active' | 'deprecated';

/**
 * @interface FilterOption
 */
interface FilterOption {
  value: FilterType;
  label: string;
  count: number;
}

/**
 * @interface FilterButtonsProps
 */
interface FilterButtonsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  options: FilterOption[];
}

/**
 * FilterButtons Component
 * 
 * A reusable component for displaying filter buttons with counts.
 * Provides a consistent way to filter data in admin panels.
 * 
 * @pattern FILTER_UI_COMPONENT
 * @principle DRY - Eliminates duplication of filter button markup
 * 
 * @features
 * - Button-based filter selection
 * - Count display for each filter option
 * - Active state highlighting
 * - Responsive button layout
 * 
 * @example
 * ```tsx
 * <FilterButtons
 *   filter={currentFilter}
 *   onFilterChange={setFilter}
 *   options={[
 *     { value: 'all', label: 'All', count: 100 },
 *     { value: 'active', label: 'Active', count: 75 },
 *     { value: 'deprecated', label: 'Deprecated', count: 25 },
 *   ]}
 * />
 * ```
 * 
 * @usage
 * Used in admin panels to provide quick filter options with visual feedback.
 * 
 * @function FilterButtons
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

