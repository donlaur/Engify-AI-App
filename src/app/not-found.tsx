import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Icons.alertTriangle className="mb-6 h-20 w-20 text-muted-foreground" />
        <h1 className="mb-2 text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/">
              <Icons.home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/library">
              <Icons.book className="mr-2 h-4 w-4" />
              Browse Library
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
