'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { PatternDetailDrawer } from '@/components/features/PatternDetailDrawer';
import { PatternDetail } from '@/lib/db/schemas/pattern';

// Icon mapping for patterns (currently unused)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const iconMap: Record<string, any> = {
//   persona: Icons.user,
//   'audience-persona': Icons.users,
//   'cognitive-verifier': Icons.zap,
//   'chain-of-thought': Icons.arrowRight,
//   'question-refinement': Icons.search,
//   template: Icons.file,
//   'few-shot': Icons.copy,
//   'context-control': Icons.target,
//   'output-formatting': Icons.code,
//   constraint: Icons.shield,
//   'tree-of-thoughts': Icons.github,
//   react: Icons.refresh,
//   'self-consistency': Icons.check,
//   'meta-prompting': Icons.sparkles,
//   rag: Icons.database,
//   // Add default icon
//   default: Icons.sparkles,
// };

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
      'bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-700',
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
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
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

  const getLevelBadgeVariant = (level: string): 'default' | 'secondary' | 'outline' => {
    // Use consistent badge variants with good contrast (same as prompt cards)
    if (level === 'beginner') return 'secondary';
    if (level === 'intermediate') return 'secondary';
    if (level === 'advanced') return 'default';
    return 'outline';
  };

  return (
    <div className="container py-8">
      {/* Hero Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          {patterns.length} Proven Patterns
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Master prompt engineering with battle-tested patterns from industry leaders.
          Learn proven techniques to get better results from AI.
        </p>
      </div>

      {/* Why Use Patterns Section */}
      <div className="mb-8 rounded-lg border bg-card p-6 md:p-8">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">Why Follow Proven Patterns?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-semibold">🧠 Systematic Problem-Solving</h3>
            <p className="text-sm text-muted-foreground">
              Patterns provide structured approaches to complex problems. Instead of guessing, 
              use proven frameworks like Chain-of-Thought or Cognitive Verifier to guide AI reasoning.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">📈 Better Results, Consistently</h3>
            <p className="text-sm text-muted-foreground">
              Patterns are battle-tested techniques that produce higher-quality outputs. 
              They help you avoid common pitfalls and achieve more reliable results.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">🎓 Learn from Experts</h3>
            <p className="text-sm text-muted-foreground">
              These patterns come from industry leaders, research papers, and real-world applications. 
              Learn the techniques used by top AI practitioners and teams.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">🔄 Reusable & Scalable</h3>
            <p className="text-sm text-muted-foreground">
              Once you master a pattern, you can apply it across different contexts and use cases. 
              Build a toolkit of patterns that work for your specific needs.
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Categories Section */}
      <div className="mb-8 rounded-lg border bg-card p-6 md:p-8">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">Pattern Categories</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold">🔨 Foundational</h3>
            <p className="text-sm text-muted-foreground">
              Core patterns every prompt engineer should know. Basic techniques for structuring 
              prompts and controlling output format.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">🏗️ Structural</h3>
            <p className="text-sm text-muted-foreground">
              Patterns for organizing complex prompts. Templates, few-shot examples, and 
              structured output formatting.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">🧩 Cognitive</h3>
            <p className="text-sm text-muted-foreground">
              Advanced reasoning patterns. Chain-of-Thought, Cognitive Verifier, and techniques
              that improve AI&apos;s problem-solving capabilities.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">🔄 Iterative</h3>
            <p className="text-sm text-muted-foreground">
              Patterns for refinement and improvement. Self-consistency, meta-prompting, and 
              techniques that iterate toward better solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-xl font-bold sm:text-2xl">{patterns.length}</div>
          <div className="text-xs text-muted-foreground">Total Patterns</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-xl font-bold sm:text-2xl">{new Set(patterns.map((p) => p.category)).size}</div>
          <div className="text-xs text-muted-foreground">Categories</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-xl font-bold sm:text-2xl">{new Set(patterns.map((p) => p.level)).size}</div>
          <div className="text-xs text-muted-foreground">Skill Levels</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-xl font-bold sm:text-2xl">{totalPromptsUsingPatterns}</div>
          <div className="text-xs text-muted-foreground">Prompts Using Patterns</div>
        </div>
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
                className={`cursor-pointer transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
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
                className={`cursor-pointer transition-colors ${
                  selectedLevel === level.value
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setSelectedLevel(level.value)}
              >
                {level.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        {filteredPatterns.map((pattern) => {
          return (
            <Card
              key={pattern.id}
              className="group relative flex h-full flex-col rounded-xl border border-border/50 bg-card surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl hover:shadow-primary/10 dark:surface-frosted dark:hover:surface-frosted-hover"
            >
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg transition-colors group-hover:text-white dark:group-hover:text-white">
                      {pattern.name}
                    </CardTitle>
                    <CardDescription className="text-secondary-light dark:text-secondary-light leading-relaxed">
                      {pattern.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={getLevelBadgeVariant(pattern.level)}
                    className="text-xs capitalize"
                  >
                    {pattern.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-shrink-0 space-y-3">
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-50 text-xs font-medium text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-100"
                >
                  {pattern.category}
                </Badge>
                {/* Use Cases */}
                {pattern.useCases && pattern.useCases.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {pattern.useCases
                      .slice(0, 3)
                      .map((useCase: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="border-blue-300 bg-blue-50 text-xs font-medium text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-100"
                        >
                          {useCase}
                        </Badge>
                      ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-shrink-0 items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatternId(pattern.id);
                    setIsDrawerOpen(true);
                  }}
                  className="transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Quick View
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Link href={`/patterns/${encodeURIComponent(pattern.id)}`}>
                    View Page
                    <Icons.externalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <Card className="dark:surface-frosted mt-12 border-primary/20 bg-primary/5">
        <CardContent className="py-8 text-center">
          <Icons.book className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="text-primary-light dark:text-primary-light mb-2 text-xl font-bold sm:text-2xl">
            Ready to use these patterns?
          </h3>
          <p className="text-secondary-light dark:text-secondary-light mb-6">
            Browse our library of{' '}
            {totalPromptsUsingPatterns > 0
              ? `${totalPromptsUsingPatterns}+ `
              : ''}
            expert prompts that implement these patterns
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
      {selectedPatternId && (
        <PatternDetailDrawer
          pattern={convertToPatternDetail(
            patterns.find((p) => p.id === selectedPatternId) || {}
          )}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedPatternId(null);
          }}
        />
      )}
    </div>
  );
}
