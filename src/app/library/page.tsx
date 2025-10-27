/**
 * Prompt Library Page
 *
 * Browse and search prompts
 * Filter by category and role
 */

'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/lib/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { PromptCard } from '@/components/features/PromptCard';
import { EmptyState } from '@/components/features/EmptyState';
import { LibraryPageSkeleton } from '@/components/features/LibraryPageSkeleton';
import { Badge } from '@/components/ui/badge';
import type { Prompt, PromptCategory, UserRole } from '@/lib/schemas/prompt';
import { categoryLabels, roleLabels } from '@/lib/schemas/prompt';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    PromptCategory | 'all'
  >('all');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // Fetch prompts from API on mount
  useEffect(() => {
    async function fetchPrompts() {
      try {
        const res = await fetch('/api/prompts');
        if (res.ok) {
          const data = await res.json();
          setPrompts(data.prompts || []);
        } else {
          // Fallback to static data
          setPrompts(getSeedPromptsWithTimestamps());
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
        setPrompts(getSeedPromptsWithTimestamps());
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrompts();
  }, []);

  // Filter prompts
  const filteredPrompts = prompts.filter((prompt) => {
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
    'c-level',
    'engineering-manager',
    'engineer',
    'product-manager',
    'designer',
    'qa',
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
          <LibraryPageSkeleton />
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
      </div>
    </MainLayout>
  );
}
