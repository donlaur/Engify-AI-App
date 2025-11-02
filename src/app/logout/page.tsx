'use client';

/**
 * Logout Page
 *
 * Logs out the user and redirects to homepage
 */

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut({
          redirect: false,
          callbackUrl: '/',
        });

        // Show success toast (if toast provider is available)
        if (typeof window !== 'undefined') {
          // Redirect to homepage after 1 second
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1000);
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Redirect anyway
        router.push('/');
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
          <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Logging out...</h1>
          <p className="text-center text-muted-foreground">
            You&apos;ll be redirected to the homepage shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
