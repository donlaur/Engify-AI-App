'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { RoleSelector } from '@/components/roles/RoleSelector';
import Link from 'next/link';

export default function ForQAPage() {
  return (
    <MainLayout>
      <RoleSelector />

      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Icons.check className="mr-2 h-3 w-3" />
              For QA Engineers
            </Badge>
            <h1 className="mb-4 text-5xl font-bold">AI for QA</h1>
            <p className="mb-8 text-xl text-gray-600">
              Enhance testing workflows with AI-powered test generation
            </p>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Featured Prompt
          </h2>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl">Test Case Generator</CardTitle>
              <CardDescription>
                Generate comprehensive test cases with edge cases and scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm">
                <p className="text-gray-700">
                  Generate comprehensive test cases for this feature:
                </p>
                <p className="mt-2 text-gray-700">
                  **Feature:** [describe feature]
                </p>
                <p className="mt-2 text-gray-700">
                  Include:
                  <br />
                  1. Happy path scenarios (expected behavior)
                  <br />
                  2. Edge cases (boundary conditions, limits)
                  <br />
                  3. Error scenarios (invalid inputs, failures)
                  <br />
                  4. Security tests (injection, auth, permissions)
                  <br />
                  5. Performance tests (load, stress, scalability)
                </p>
                <p className="mt-2 text-gray-700">
                  Format: Given/When/Then with expected results and test data.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Icons.copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/library">
                    <Icons.search className="mr-2 h-4 w-4" />
                    More QA Prompts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
