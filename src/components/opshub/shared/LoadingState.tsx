import { MainLayout } from '@/components/layout/MainLayout';
import { Icons } from '@/lib/icons';

interface LoadingStateProps {
  message?: string;
}

/**
 * Reusable loading state component for admin panels
 */
export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Icons.spinner className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

