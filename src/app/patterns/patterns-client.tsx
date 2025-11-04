'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  { name: 'Beginner', value: 'beginner', color: 'bg-green-100 text-green-800' },
  {
    name: 'Intermediate',
    value: 'intermediate',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    name: 'Advanced',
    value: 'advanced',
    color: 'bg-purple-100 text-purple-800',
  },
];

interface PatternsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patterns: any[];
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

export function PatternsClient({ patterns }: PatternsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [totalPrompts, setTotalPrompts] = useState(0);

  // Fetch real-time stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setTotalPrompts(data.stats?.prompts || 0);
        }
      } catch (error) {
        // Silently fail - stats are not critical for patterns page
      }
    };
    fetchStats();
  }, []);

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
        <Badge variant="secondary" className="mb-4">
          <Icons.sparkles className="mr-2 h-3 w-3" />
          Prompt Engineering Patterns
        </Badge>
        <h1 className="mb-2 text-4xl font-bold">
          {patterns.length} Proven Patterns
        </h1>
        <p className="text-xl text-muted-foreground">
          Master prompt engineering with battle-tested patterns from industry
          leaders
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{patterns.length}</div>
            <p className="text-xs text-muted-foreground">Total Patterns</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(patterns.map((p) => p.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(patterns.map((p) => p.level)).size}
            </div>
            <p className="text-xs text-muted-foreground">Skill Levels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalPrompts}</div>
            <p className="text-xs text-muted-foreground">Example Prompts</p>
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
                      <CardTitle className="text-lg">{pattern.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {pattern.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getLevelColor(pattern.level)}>
                    {pattern.level}
                  </Badge>
                </div>
                <CardDescription className="mt-3">
                  {pattern.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href={`/patterns/${encodeURIComponent(pattern.id)}`}>
                    Learn More
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
              <CardContent className="space-y-4">
                {/* Example */}
                {pattern.example && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Example:</p>
                    <div className="rounded-md bg-muted p-3">
                      <code className="text-xs">{pattern.example}</code>
                    </div>
                  </div>
                )}

                {/* Use Cases */}
                {pattern.useCases && pattern.useCases.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Use Cases:</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.useCases
                        .slice(0, 3)
                        .map((useCase: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
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
      <Card className="mt-12 border-primary/20 bg-primary/5">
        <CardContent className="py-8 text-center">
          <Icons.book className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="mb-2 text-2xl font-bold">
            Ready to use these patterns?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Browse our library of {totalPrompts}+ expert prompts that use these
            patterns
          </p>
          <Button size="lg" asChild>
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
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
}
