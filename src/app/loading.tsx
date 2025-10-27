import { Icons } from '@/lib/icons';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Icons.spinner className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
