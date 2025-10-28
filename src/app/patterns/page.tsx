'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import { PatternDetailDrawer } from '@/components/features/PatternDetailDrawer';
import { getPatternById } from '@/data/pattern-details';

// Pattern data from PROMPT_PATTERNS_RESEARCH.md
const patterns = [
  {
    id: 1,
    name: 'Persona Pattern',
    category: 'Role/Instruction',
    level: 'Beginner',
    description:
      'Instructs the AI to adopt a specific role or expert persona before performing a task.',
    example: 'Act as a [Persona X] expert. Perform [task Y] accordingly.',
    useCases: [
      'Complex technical tasks',
      'Code review',
      'Documentation',
      'Product management',
    ],
    icon: Icons.user,
  },
  {
    id: 2,
    name: 'Audience Persona Pattern',
    category: 'Role/Instruction',
    level: 'Beginner',
    description:
      'Tailors the response for a specific audience level or background.',
    example: 'Explain [concept] to a [audience type].',
    useCases: [
      'Technical documentation',
      'Training materials',
      'Stakeholder communication',
    ],
    icon: Icons.users,
  },
  {
    id: 3,
    name: 'Cognitive Verifier Pattern',
    category: 'Reasoning',
    level: 'Intermediate',
    description:
      'Breaks down complex reasoning into smaller, verifiable questions.',
    example:
      'When asked a question, generate additional questions that help verify the answer.',
    useCases: [
      'Complex problem solving',
      'Debugging',
      'Architecture decisions',
    ],
    icon: Icons.brain,
  },
  {
    id: 4,
    name: 'Chain of Thought (CoT)',
    category: 'Reasoning',
    level: 'Beginner',
    description: 'Encourages step-by-step reasoning to improve accuracy.',
    example: "Let's think step by step...",
    useCases: ['Math problems', 'Logic puzzles', 'Debugging', 'Planning'],
    icon: Icons.link,
  },
  {
    id: 5,
    name: 'Question Refinement Pattern',
    category: 'Reasoning',
    level: 'Intermediate',
    description:
      'AI suggests better versions of your question before answering.',
    example: 'Suggest a better version of my question, then answer both.',
    useCases: ['Unclear requirements', 'Exploratory research', 'Learning'],
    icon: Icons.help,
  },
  {
    id: 6,
    name: 'Template Pattern',
    category: 'Structure/Format',
    level: 'Beginner',
    description: 'Provides a structured template for consistent output format.',
    example: 'Use this template: [template structure]',
    useCases: [
      'Reports',
      'Documentation',
      'Code generation',
      'Standardization',
    ],
    icon: Icons.file,
  },
  {
    id: 7,
    name: 'Few-Shot Learning',
    category: 'Structure/Format',
    level: 'Intermediate',
    description:
      "Provides examples to guide the AI's response style and format.",
    example: 'Here are examples: [examples]. Now do [task].',
    useCases: ['Code generation', 'Data transformation', 'Style matching'],
    icon: Icons.copy,
  },
  {
    id: 8,
    name: 'Context Control Pattern',
    category: 'Context Management',
    level: 'Intermediate',
    description: 'Explicitly manages what context the AI should focus on.',
    example: 'Focus only on [specific context]. Ignore [other context].',
    useCases: ['Large codebases', 'Focused analysis', 'Token optimization'],
    icon: Icons.focus,
  },
  {
    id: 9,
    name: 'Output Formatting Pattern',
    category: 'Context Management',
    level: 'Beginner',
    description: 'Specifies the exact output format (JSON, Markdown, etc.).',
    example: 'Return the result as JSON with these fields: [fields]',
    useCases: ['API integration', 'Data processing', 'Automation'],
    icon: Icons.code,
  },
  {
    id: 10,
    name: 'Constraint Pattern',
    category: 'Context Management',
    level: 'Beginner',
    description: 'Sets clear boundaries and limitations for the response.',
    example: 'Answer in under 100 words. Do not use technical jargon.',
    useCases: [
      'Concise responses',
      'Audience-appropriate content',
      'Token limits',
    ],
    icon: Icons.shield,
  },
  {
    id: 11,
    name: 'Tree of Thoughts (ToT)',
    category: 'Advanced',
    level: 'Expert',
    description: 'Explores multiple reasoning paths simultaneously.',
    example: 'Consider 3 different approaches to solve this problem.',
    useCases: [
      'Complex decisions',
      'Strategy planning',
      'Creative problem solving',
    ],
    icon: Icons.tree,
  },
  {
    id: 12,
    name: 'ReAct Pattern',
    category: 'Advanced',
    level: 'Expert',
    description: 'Combines reasoning with actions in an iterative loop.',
    example: 'Think about what to do, take action, observe result, repeat.',
    useCases: ['Multi-step tasks', 'Tool usage', 'Autonomous agents'],
    icon: Icons.refresh,
  },
  {
    id: 13,
    name: 'Self-Consistency',
    category: 'Advanced',
    level: 'Expert',
    description:
      'Generates multiple reasoning paths and selects the most consistent answer.',
    example:
      'Generate 3 different solutions and choose the most consistent one.',
    useCases: ['High-stakes decisions', 'Verification', 'Quality assurance'],
    icon: Icons.check,
  },
  {
    id: 14,
    name: 'Meta-Prompting',
    category: 'Advanced',
    level: 'Expert',
    description: 'Uses AI to generate or improve prompts.',
    example: 'Generate a prompt that will help me accomplish [goal].',
    useCases: ['Prompt optimization', 'Automation', 'Prompt libraries'],
    icon: Icons.sparkles,
  },
  {
    id: 15,
    name: 'Retrieval Augmented Generation (RAG)',
    category: 'Advanced',
    level: 'Expert',
    description: 'Combines AI generation with external knowledge retrieval.',
    example: 'First retrieve relevant docs, then answer based on them.',
    useCases: ['Knowledge bases', 'Documentation', 'Fact-checking'],
    icon: Icons.database,
  },
];

const categories = [
  { name: 'All Patterns', value: 'all' },
  { name: 'Role/Instruction', value: 'Role/Instruction' },
  { name: 'Reasoning', value: 'Reasoning' },
  { name: 'Structure/Format', value: 'Structure/Format' },
  { name: 'Context Management', value: 'Context Management' },
  { name: 'Advanced', value: 'Advanced' },
];

const levels = [
  { name: 'All Levels', value: 'all' },
  { name: 'Beginner', value: 'Beginner', color: 'bg-green-100 text-green-800' },
  {
    name: 'Intermediate',
    value: 'Intermediate',
    color: 'bg-blue-100 text-blue-800',
  },
  { name: 'Expert', value: 'Expert', color: 'bg-purple-100 text-purple-800' },
];

export default function PatternsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPatternId, setSelectedPatternId] = useState<number | null>(
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
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            <Icons.sparkles className="mr-2 h-3 w-3" />
            Prompt Engineering Patterns
          </Badge>
          <h1 className="mb-2 text-4xl font-bold">15 Proven Patterns</h1>
          <p className="text-xl text-muted-foreground">
            Master prompt engineering with battle-tested patterns from industry
            leaders
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Total Patterns</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Skill Levels</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">67</div>
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
                  variant={
                    selectedCategory === cat.value ? 'default' : 'outline'
                  }
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
                  variant={
                    selectedLevel === level.value ? 'default' : 'outline'
                  }
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
            const Icon = pattern.icon;
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
                        <CardTitle className="text-lg">
                          {pattern.name}
                        </CardTitle>
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
                    onClick={() => {
                      setSelectedPatternId(pattern.id);
                      setIsDrawerOpen(true);
                    }}
                  >
                    Learn More
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
                <CardContent className="space-y-4">
                  {/* Example */}
                  <div>
                    <p className="mb-2 text-sm font-medium">Example:</p>
                    <div className="rounded-md bg-muted p-3">
                      <code className="text-xs">{pattern.example}</code>
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <p className="mb-2 text-sm font-medium">Use Cases:</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.useCases.map((useCase, idx) => (
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardContent className="py-8 text-center">
            <Icons.library className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-2xl font-bold">
              Ready to use these patterns?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Browse our library of 67 expert prompts that use these patterns
            </p>
            <Button size="lg" asChild>
              <Link href="/library">
                <Icons.arrowRight className="mr-2 h-4 w-4" />
                Browse Prompt Library
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Detail Drawer */}
      {selectedPatternId && (
        <PatternDetailDrawer
          pattern={getPatternById(selectedPatternId.toString()) || null}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      )}
    </MainLayout>
  );
}
