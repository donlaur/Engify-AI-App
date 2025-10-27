/**
 * Signup Prompt Component
 * Shows when users try to use AI features without being logged in
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';

export function SignupPrompt() {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
          <Icons.sparkles className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Sign Up to Use AI</CardTitle>
        <CardDescription className="text-base">
          Create a free account to execute prompts with our AI providers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icons.check className="h-5 w-5 text-green-600" />
            <span className="text-sm">Free forever - no credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.check className="h-5 w-5 text-green-600" />
            <span className="text-sm">Access to OpenAI, Google AI, and more</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.check className="h-5 w-5 text-green-600" />
            <span className="text-sm">Track your prompt history and favorites</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.check className="h-5 w-5 text-green-600" />
            <span className="text-sm">Personalized learning paths</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600" asChild>
            <Link href="/signup">
              Create Free Account
              <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full" asChild>
            <Link href="/login">Already have an account? Sign in</Link>
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500">
          Browse our library and patterns for free. Sign up to execute prompts.
        </p>
      </CardContent>
    </Card>
  );
}
