'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import { PatternDetailDrawer } from '@/components/features/PatternDetailDrawer';
import { PatternDetail } from '@/lib/db/schemas/pattern';

// Icon mapping for patterns
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  persona: Icons.user,
  'audience-persona': Icons.users,
  'cognitive-verifier': Icons.zap,
  'chain-of-thought': Icons.arrowRight,
  'question-refinement': Icons.search,
  template: Icons.file,
  'few-shot': Icons.copy,
  'context-control': Icons.target,
  'output-formatting': Icons.code,
  constraint: Icons.shield,
  'tree-of-thoughts': Icons.github,
  react: Icons.refresh,
  'self-consistency': Icons.check,
  'meta-prompting': Icons.sparkles,
  rag: Icons.database,
  // Add default icon
  default: Icons.sparkles,
};

const categories = [
  { name: 'All Patterns', value: 'all' },
  { name: 'FOUNDATIONAL', value: 'FOUNDATIONAL' },
  { name: 'STRUCTURAL', value: 'STRUCTURAL' },
  { name: 'COGNITIVE', value: 'COGNITIVE' },
  { name: 'ITERATIVE', value: 'ITERATIVE' },
];

const levels = [
  { name: 'All Levels', value: 'all' },
  {
    name: 'Beginner',
    value: 'beginner',
    color:
      'bg-brand-green/20 text-brand-green border-brand-green/30 dark:bg-brand-green/20 dark:text-brand-green dark:border-brand-green/30',
  },
  {
    name: 'Intermediate',
    value: 'intermediate',
    color:
      'bg-brand-blue/20 text-brand-blue border-brand-blue/30 dark:bg-brand-blue/20 dark:text-brand-blue dark:border-brand-blue/30',
  },
  {
    name: 'Advanced',
    value: 'advanced',
    color:
      'bg-primary/20 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/30',
  },
];

interface PatternsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patterns: any[];
  promptsByPattern?: Map<string, number>;
  totalPromptsUsingPatterns?: number;
}

// Helper function to convert MongoDB pattern to PatternDetail
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToPatternDetail(pattern: any): PatternDetail | null {
  if (!pattern.shortDescription || !pattern.fullDescription) {
    // Pattern doesn't have all required fields
    return null;
  }

  return {
    id: pattern.id,
    name: pattern.name,
    category: pattern.category,
    level: pattern.level,
    shortDescription: pattern.shortDescription,
    fullDescription: pattern.fullDescription,
    howItWorks: pattern.howItWorks || pattern.fullDescription,
    whenToUse: pattern.useCases || [],
    example:
      typeof pattern.example === 'string'
        ? { before: '', after: pattern.example, explanation: '' }
        : pattern.example || { before: '', after: '', explanation: '' },
    bestPractices: pattern.bestPractices || [],
    commonMistakes: pattern.commonMistakes || [],
    relatedPatterns: pattern.relatedPatterns || [],
  };
}

export function PatternsClient({
  patterns,
  promptsByPattern: _promptsByPattern = new Map(),
  totalPromptsUsingPatterns = 0,
}: PatternsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [_selectedPatternId, _setSelectedPatternId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredPatterns = patterns.filter((pattern) => {
    const categoryMatch =
      selectedCategory === 'all' || pattern.category === selectedCategory;
    const levelMatch =
      selectedLevel === 'all' || pattern.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const getLevelColor = (level: string) => {
    const levelObj = levels.find((l) => l.value === level);
    return levelObj?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-primary-light dark:text-primary-light mb-2 text-4xl font-bold">
          {patterns.length} Proven Patterns
        </h1>
        <p className="text-secondary-light dark:text-secondary-light text-xl">
          Master prompt engineering with battle-tested patterns from industry
          leaders
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-primary-light dark:text-primary-light text-2xl font-bold">
              {patterns.length}
            </div>
            <p className="text-tertiary dark:text-tertiary text-xs">
              Total Patterns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-primary-light dark:text-primary-light text-2xl font-bold">
              {new Set(patterns.map((p) => p.category)).size}
            </div>
            <p className="text-tertiary dark:text-tertiary text-xs">
              Categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-primary-light dark:text-primary-light text-2xl font-bold">
              {new Set(patterns.map((p) => p.level)).size}
            </div>
            <p className="text-tertiary dark:text-tertiary text-xs">
              Skill Levels
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-primary-light dark:text-primary-light text-2xl font-bold">
              {totalPromptsUsingPatterns}
            </div>
            <p className="text-tertiary dark:text-tertiary text-xs">
              Example Prompts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Level</label>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Badge
                key={level.value}
                variant={selectedLevel === level.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedLevel(level.value)}
              >
                {level.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatterns.map((pattern) => {
          const Icon = iconMap[pattern.id] || iconMap.default;
          return (
            <Card
              key={pattern.id}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-primary-light dark:text-primary-light text-lg">
                        {pattern.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="mt-1 border-brand-blue text-xs text-brand-blue dark:border-brand-blue dark:text-brand-blue"
                      >
                        {pattern.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getLevelColor(pattern.level)}>
                    {pattern.level}
                  </Badge>
                </div>
                <CardDescription className="text-secondary-light dark:text-secondary-light mt-3 leading-relaxed">
                  {pattern.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/patterns/${encodeURIComponent(pattern.id)}`}
                  className="link-primary dark:link-primary group flex w-full items-center justify-center text-base font-medium"
                >
                  Learn More
                  <Icons.arrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
              <CardContent className="space-y-4">
                {/* Example */}
                {pattern.example && (
                  <div>
                    <p className="text-tertiary dark:text-tertiary mb-2 text-sm font-medium">
                      Example:
                    </p>
                    <div className="rounded-md border border-border/50 bg-muted/50 p-3">
                      <code className="text-secondary-light dark:text-secondary-light text-xs">
                        {pattern.example}
                      </code>
                    </div>
                  </div>
                )}

                {/* Use Cases */}
                {pattern.useCases && pattern.useCases.length > 0 && (
                  <div>
                    <p className="text-tertiary dark:text-tertiary mb-2 text-sm font-medium">
                      Use Cases:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.useCases
                        .slice(0, 3)
                        .map((useCase: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="border-brand-blue/30 bg-brand-blue/20 text-xs text-brand-blue dark:border-brand-blue/30 dark:bg-brand-blue/20 dark:text-brand-blue"
                          >
                            {useCase}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <Card className="dark:surface-frosted mt-12 border-primary/20 bg-primary/5">
        <CardContent className="py-8 text-center">
          <Icons.book className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="text-primary-light dark:text-primary-light mb-2 text-2xl font-bold">
            Ready to use these patterns?
          </h3>
          <p className="text-secondary-light dark:text-secondary-light mb-6">
            Browse our library of{' '}
            {totalPromptsUsingPatterns > 0
              ? `${totalPromptsUsingPatterns}+ `
              : ''}
            expert prompts that use these patterns
          </p>
          <Button
            size="lg"
            className="gradient-brand text-white hover:opacity-90"
            asChild
          >
            <Link href="/prompts">
              <Icons.arrowRight className="mr-2 h-4 w-4" />
              Browse Prompt Library
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Pattern Detail Drawer */}
      {_selectedPatternId && (
        <PatternDetailDrawer
          pattern={convertToPatternDetail(
            patterns.find((p) => p.id === _selectedPatternId) || {}
          )}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
}
