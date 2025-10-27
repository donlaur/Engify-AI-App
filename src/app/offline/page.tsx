'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <MainLayout>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
        <Card className="max-w-md text-center">
          <CardHeader>
            <Icons.wifi className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <CardTitle className="text-2xl">You&apos;re Offline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              It looks like you&apos;ve lost your internet connection. Some
              features may be limited.
            </p>
            <div className="space-y-2 text-left">
              <p className="text-sm font-semibold">Available offline:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Browse saved prompts</li>
                <li>• View patterns</li>
                <li>• Read learning content</li>
              </ul>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              <Icons.refresh className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
