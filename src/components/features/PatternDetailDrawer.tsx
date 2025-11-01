'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Icons } from '@/lib/icons';
import { PatternDetail } from '@/lib/db/schemas/pattern';

interface PatternDetailDrawerProps {
  pattern: PatternDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatternDetailDrawer({
  pattern,
  isOpen,
  onClose,
}: PatternDetailDrawerProps) {
  if (!pattern) return null;

  const levelColors = {
    beginner:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate:
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advanced:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl overflow-y-auto">
          <DrawerHeader>
            <div className="flex items-start justify-between">
              <div>
                <DrawerTitle className="text-2xl font-bold">
                  {pattern.name}
                </DrawerTitle>
                <DrawerDescription className="mt-2 text-base">
                  {pattern.shortDescription}
                </DrawerDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={levelColors[pattern.level]}>
                  {pattern.level}
                </Badge>
                <Badge variant="outline">{pattern.category}</Badge>
              </div>
            </div>
          </DrawerHeader>

          <div className="space-y-6 px-4 pb-6">
            {/* Full Description */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Icons.info className="h-5 w-5 text-blue-600" />
                What Is This Pattern?
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {pattern.fullDescription}
              </p>
            </section>

            {/* How It Works */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Icons.settings className="h-5 w-5 text-purple-600" />
                How It Works
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {pattern.howItWorks}
              </p>
            </section>

            {/* When To Use */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Icons.check className="h-5 w-5 text-green-600" />
                When To Use This Pattern
              </h3>
              <ul className="space-y-2">
                {pattern.whenToUse.map((use, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icons.arrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-muted-foreground">{use}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Example */}
            <section className="rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Icons.code className="h-5 w-5 text-orange-600" />
                Before & After Example
              </h3>

              <div className="space-y-4">
                {/* Before */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      ❌ Before (Weak)
                    </Badge>
                  </div>
                  <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                    <code className="text-sm text-red-900 dark:text-red-100">
                      {pattern.example.before}
                    </code>
                  </div>
                </div>

                {/* After */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-green-600 text-xs">
                      ✅ After (Strong)
                    </Badge>
                  </div>
                  <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                    <code className="whitespace-pre-wrap text-sm text-green-900 dark:text-green-100">
                      {pattern.example.after}
                    </code>
                  </div>
                </div>

                {/* Explanation */}
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Why this works:</strong>{' '}
                    {pattern.example.explanation}
                  </p>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Icons.sparkles className="h-5 w-5 text-yellow-600" />
                Best Practices
              </h3>
              <ul className="space-y-2">
                {pattern.bestPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-muted-foreground">{practice}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Common Mistakes */}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Icons.alertTriangle className="h-5 w-5 text-red-600" />
                Common Mistakes to Avoid
              </h3>
              <ul className="space-y-2">
                {pattern.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icons.x className="mt-1 h-4 w-4 flex-shrink-0 text-red-600" />
                    <span className="text-muted-foreground">{mistake}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Related Patterns */}
            {pattern.relatedPatterns.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                  <Icons.link className="h-5 w-5 text-blue-600" />
                  Related Patterns
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pattern.relatedPatterns.map((relatedId) => (
                    <Badge key={relatedId} variant="secondary">
                      {relatedId}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
            <Button>
              <Icons.copy className="mr-2 h-4 w-4" />
              Try This Pattern
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
