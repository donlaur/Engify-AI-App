/**
 * Login Page
 * Email/password authentication with future OAuth support
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Force a hard redirect to ensure session is loaded
        window.location.href = '/dashboard';
      } else {
        console.warn('🔐 [LOGIN] Unexpected result:', result);
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('🔐 [LOGIN] Exception:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex items-center justify-center">
            <Icons.sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-center text-2xl text-gray-900 dark:text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-300">
            Sign in to your Engify.ai account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'email-error' : undefined}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'password-error' : undefined}
                className="bg-white dark:bg-gray-800"
              />
            </div>

            {error && (
              <div
                id="form-error"
                role="alert"
                aria-live="polite"
                className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                <Icons.alertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
