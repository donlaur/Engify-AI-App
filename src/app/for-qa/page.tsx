'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { RoleSelector } from '@/components/roles/RoleSelector';
import Link from 'next/link';

export default function ForQAPage() {
  return (
    <MainLayout>
      <RoleSelector />
      
      <section className="container py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            <Icons.check className="mr-2 h-3 w-3" />
            For QA Engineers
          </Badge>
          <h1 className="mb-4 text-5xl font-bold">AI for QA</h1>
          <p className="mb-8 text-xl text-gray-600">
            Coming soon - AI prompts for QA engineers
          </p>
          <Button size="lg" asChild>
            <Link href="/library">Browse All Prompts</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
