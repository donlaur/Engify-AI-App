import { Icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface SuccessMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function SuccessMessage({
  title = 'Success',
  message,
  className,
}: SuccessMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-green-200 bg-green-50 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icons.check className="mt-0.5 h-5 w-5 text-green-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-green-900">{title}</h3>
          <p className="mt-1 text-sm text-green-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
