'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MainLayout>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Icons.error className="mb-6 h-20 w-20 text-destructive" />
        <h1 className="mb-2 text-4xl font-bold">Something went wrong!</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4">
          <Button onClick={reset} size="lg">
            <Icons.refresh className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => (window.location.href = '/')}
          >
            <Icons.home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
