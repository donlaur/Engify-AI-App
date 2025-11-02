/**
 * Library Client Component
 *
 * Client-side filtering and search for the library page
 * Separated from server component for performance
 */

'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { PromptCard } from '@/components/features/PromptCard';
import { EmptyState } from '@/components/features/EmptyState';
import { Badge } from '@/components/ui/badge';
import type { Prompt, PromptCategory, UserRole } from '@/lib/schemas/prompt';
import { categoryLabels, roleLabels } from '@/lib/schemas/prompt';

interface LibraryClientProps {
  initialPrompts: Prompt[];
  categoryStats: Record<string, number>;
  roleStats: Record<string, number>;
  uniqueCategories: string[];
  uniqueRoles: string[];
}

export function LibraryClient({
  initialPrompts,
  categoryStats,
  roleStats,
  uniqueCategories,
  uniqueRoles,
}: LibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    PromptCategory | 'all'
  >('all');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');

  // Filter prompts
  const filteredPrompts = initialPrompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesRole = selectedRole === 'all' || prompt.role === selectedRole;

    return matchesSearch && matchesCategory && matchesRole;
  });

  // Dynamic filters from DB
  const categories: Array<PromptCategory | 'all'> = [
    'all',
    ...(uniqueCategories as PromptCategory[]),
  ];

  const roles: Array<UserRole | 'all'> = [
    'all',
    ...(uniqueRoles as UserRole[]),
  ];

  return (
    <>
      {/* Stats Panel */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Prompts</div>
          <div className="text-2xl font-bold">{initialPrompts.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Categories</div>
          <div className="text-2xl font-bold">{uniqueCategories.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Roles</div>
          <div className="text-2xl font-bold">{uniqueRoles.length}</div>
        </div>
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
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Category</p>
            {selectedCategory !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {categoryStats[selectedCategory] || 0} prompts
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all'
                  ? `All (${initialPrompts.length})`
                  : `${categoryLabels[category] || category} (${categoryStats[category] || 0})`}
              </Badge>
            ))}
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Role</p>
            {selectedRole !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {roleStats[selectedRole] || 0} prompts
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedRole(role)}
              >
                {role === 'all'
                  ? `All (${initialPrompts.length})`
                  : `${roleLabels[role] || role} (${roleStats[role] || 0})`}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPrompts.length === initialPrompts.length
            ? `Showing all ${filteredPrompts.length} prompts`
            : `Showing ${filteredPrompts.length} of ${initialPrompts.length} prompts`}
        </p>
        {(searchQuery ||
          selectedCategory !== 'all' ||
          selectedRole !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedRole('all');
            }}
            className="text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results */}
      {filteredPrompts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              {...prompt}
              role={
                (prompt.role && prompt.role in roleLabels
                  ? roleLabels[prompt.role as UserRole]
                  : undefined) as UserRole | undefined
              }
              category={prompt.category as PromptCategory}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Icons.brain}
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
    </>
  );
}
