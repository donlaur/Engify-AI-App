import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Custom 404 Page
 * Fun, on-brand error page for when users hit a broken link
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-500 via-purple-600 to-blue-600 p-4">
      <Card className="w-full max-w-2xl border-2 border-white/20 bg-black/40 backdrop-blur-xl">
        <CardContent className="space-y-8 py-12 text-center">
          {/* Robot Icon */}
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
            <Icons.alertTriangle className="h-16 w-16 text-white" />
          </div>

          {/* Fun Message */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white">404</h1>
            <h2 className="text-3xl font-bold text-white">
              The Robot Has Failed You! 🤖
            </h2>
            <p className="mx-auto max-w-md text-lg text-gray-200">
              Even our AI couldn&apos;t find this page. Maybe it&apos;s time to
              prompt engineer a better URL?
            </p>
          </div>

          {/* Helpful Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="default"
              asChild
              className="bg-white text-purple-900 hover:bg-gray-100"
            >
              <Link href="/">
                <Icons.home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/prompts">
                <Icons.book className="mr-2 h-4 w-4" />
                Browse Library
              </Link>
            </Button>
          </div>

          {/* Fun Fact */}
          <p className="text-sm text-gray-300">
            <strong>AI Tip:</strong> When prompting fails, add &quot;Let&apos;s
            think step by step&quot; - works 60% of the time, every time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
