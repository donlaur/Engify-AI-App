import { MainLayout } from '@/components/layout/MainLayout';
import { Icons } from '@/lib/icons';

interface LoadingStateProps {
  message?: string;
}

/**
 * LoadingState Component
 * 
 * A full-page loading state component for admin panels.
 * Displays a centered spinner with an optional message.
 * 
 * @pattern LOADING_STATE
 * @principle DRY - Consistent loading UI across admin panels
 * 
 * @features
 * - Centered spinner animation
 * - Customizable message
 * - Full-page layout with MainLayout
 * 
 * @example
 * ```tsx
 * <LoadingState message="Loading workflows..." />
 * ```
 * 
 * @usage
 * Used when data is being fetched in admin panels.
 * Provides consistent loading experience across the OpsHub area.
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

