import { Icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icons.alertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
