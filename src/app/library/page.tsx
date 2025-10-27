/**
 * Prompt Library Page
 *
 * Browse and search prompts
 * Filter by category and role
 */

'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { PromptCard } from '@/components/features/PromptCard';
import { EmptyState } from '@/components/features/EmptyState';
import { LoadingSpinner } from '@/components/features/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import type { Prompt, PromptCategory, UserRole } from '@/lib/schemas/prompt';
import { categoryLabels, roleLabels } from '@/lib/schemas/prompt';

// Mock data for now - will be replaced with API call
const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Code Review Assistant',
    description: 'Get detailed code reviews with actionable feedback',
    content:
      'You are an expert code reviewer. Review the following code and provide:\n1. Security issues\n2. Performance concerns\n3. Best practice violations\n4. Suggestions for improvement\n\nCode:\n{code}',
    category: 'code-generation',
    role: 'engineer',
    pattern: 'persona',
    tags: ['code-review', 'best-practices'],
    views: 1250,
    rating: 4.5,
    ratingCount: 42,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isPublic: true,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Bug Investigation Helper',
    description: 'Systematic approach to debugging complex issues',
    content:
      'Act as a senior debugging expert. Help me investigate this bug:\n\nSymptoms: {symptoms}\nExpected behavior: {expected}\nActual behavior: {actual}\n\nProvide:\n1. Potential root causes\n2. Debugging steps\n3. Questions to ask\n4. Tools to use',
    category: 'debugging',
    role: 'engineer',
    pattern: 'chain-of-thought',
    tags: ['debugging', 'troubleshooting'],
    views: 890,
    rating: 4.7,
    ratingCount: 28,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    isPublic: true,
    isFeatured: false,
  },
  {
    id: '3',
    title: 'Architecture Decision Document',
    description: 'Create comprehensive ADRs for technical decisions',
    content:
      'You are a technical architect. Create an Architecture Decision Record (ADR) for:\n\nDecision: {decision}\nContext: {context}\n\nInclude:\n1. Status\n2. Context\n3. Decision\n4. Consequences\n5. Alternatives considered',
    category: 'architecture',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['architecture', 'documentation'],
    views: 654,
    rating: 4.3,
    ratingCount: 15,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    isPublic: true,
    isFeatured: true,
  },
];

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    PromptCategory | 'all'
  >('all');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [isLoading] = useState(false);

  // Filter prompts
  const filteredPrompts = mockPrompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesRole = selectedRole === 'all' || prompt.role === selectedRole;

    return matchesSearch && matchesCategory && matchesRole;
  });

  const categories: Array<PromptCategory | 'all'> = [
    'all',
    'code-generation',
    'debugging',
    'documentation',
    'testing',
    'architecture',
  ];
  const roles: Array<UserRole | 'all'> = [
    'all',
    'engineer',
    'engineering-manager',
    'product-manager',
  ];

  return (
    <MainLayout showSidebar>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Prompt Library</h1>
          <p className="text-lg text-muted-foreground">
            Browse and discover proven prompts for your workflow
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div>
            <p className="mb-2 text-sm font-medium">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={
                    selectedCategory === category ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All' : categoryLabels[category]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <p className="mb-2 text-sm font-medium">Role</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Badge
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedRole(role)}
                >
                  {role === 'all' ? 'All' : roleLabels[role]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner text="Loading prompts..." />
        ) : filteredPrompts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                {...prompt}
                role={prompt.role ? roleLabels[prompt.role] : undefined}
                category={categoryLabels[prompt.category]}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Icons.inbox}
            title="No prompts found"
            description="Try adjusting your search or filters"
            action={{
              label: 'Clear Filters',
              onClick: () => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedRole('all');
              },
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
