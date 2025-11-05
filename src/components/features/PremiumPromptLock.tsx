/**
 * Premium Prompt Lock Component
 * Shows upgrade message for premium prompts
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import Link from 'next/link';

interface PremiumPromptLockProps {
  promptTitle: string;
}

export function PremiumPromptLock({ promptTitle }: PremiumPromptLockProps) {
  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icons.lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-xl">Premium Prompt</CardTitle>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            Premium
          </Badge>
        </div>
        <CardDescription>
          <strong>{promptTitle}</strong> is a premium prompt available to subscribers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Unlock access to hundreds of premium prompts, advanced patterns, and enterprise features.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/pricing">
                <Icons.sparkles className="mr-2 h-4 w-4" />
                View Pricing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">
                <Icons.user className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          </div>
          <div className="mt-4 rounded-lg border bg-card p-4">
            <h4 className="mb-2 font-semibold">Premium Features Include:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icons.check className="h-4 w-4 text-green-600" />
                Access to 100+ premium prompts
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="h-4 w-4 text-green-600" />
                Advanced prompt patterns and techniques
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="h-4 w-4 text-green-600" />
                Full revision history and audit scores
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="h-4 w-4 text-green-600" />
                Team collaboration features
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="h-4 w-4 text-green-600" />
                Priority support
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

