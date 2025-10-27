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

export default function ForDesignersPage() {
  return (
    <MainLayout>
      <RoleSelector />

      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Icons.palette className="mr-2 h-3 w-3" />
              For Designers
            </Badge>
            <h1 className="mb-4 text-5xl font-bold">AI for Design</h1>
            <p className="mb-8 text-xl text-gray-600">
              Enhance your design workflow with AI-powered prompts
            </p>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Featured Prompt
          </h2>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl">
                Design System Generator
              </CardTitle>
              <CardDescription>
                Create comprehensive design systems with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm">
                <p className="text-gray-700">
                  Create a comprehensive design system for a [product type] with
                  the following components:
                </p>
                <p className="mt-2 text-gray-700">
                  1. Color palette (primary, secondary, accent, neutrals)
                  <br />
                  2. Typography scale (headings, body, captions)
                  <br />
                  3. Spacing system (margins, padding, gaps)
                  <br />
                  4. Component library (buttons, cards, forms)
                  <br />
                  5. Accessibility guidelines (WCAG 2.1 AA compliance)
                </p>
                <p className="mt-2 text-gray-700">
                  Include design tokens, usage examples, and Figma/Sketch
                  implementation notes.
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
                    More Design Prompts
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
