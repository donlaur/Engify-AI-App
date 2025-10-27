/**
 * Protected Route HOC
 * Wraps components that require authentication
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '@/lib/icons';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * HOC to protect routes that require authentication
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (requireAuth && !session) {
      router.push(redirectTo);
    }
  }, [session, status, requireAuth, redirectTo, router]);

  // Show loading state
  if (status === 'loading') {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Show nothing while redirecting
  if (requireAuth && !session) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Default loading component
 */
function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Icons.spinner className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Higher-order component version
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
