/**
 * AI Tools Client Component
 *
 * Client-side filtering and search for the AI tools page
 * Separated from server component for performance
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icons } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AITool } from '@/lib/db/schemas/ai-tool';

interface AIToolsClientProps {
  initialTools: AITool[];
  categoryStats: Record<string, number>;
  uniqueCategories: string[];
  categoryLabels: Record<string, string>;
}

type SortOption = 'alphabetical' | 'category' | 'price-low' | 'price-high';

const INITIAL_VISIBLE_CATEGORIES = 8;

export function AIToolsClient({
  initialTools,
  categoryStats,
  uniqueCategories,
  categoryLabels,
}: AIToolsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');

  // Filter tools using useMemo to prevent recalculations
  const filteredTools = useMemo(() => {
    let filtered = initialTools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.features.some((f) =>
          f.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        tool.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort tools based on selected sort option
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

        case 'category':
          // First sort by category, then alphabetically within category
          const categoryCompare = (a.category || '').localeCompare(b.category || '');
          if (categoryCompare !== 0) return categoryCompare;
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

        case 'price-low':
          // Free tools first, then by monthly price
          if (a.pricing.free && !b.pricing.free) return -1;
          if (!a.pricing.free && b.pricing.free) return 1;
          const aPriceLow = a.pricing.paid?.monthly || 0;
          const bPriceLow = b.pricing.paid?.monthly || 0;
          return aPriceLow - bPriceLow;

        case 'price-high':
          // Free tools last, then by monthly price descending
          if (a.pricing.free && !b.pricing.free) return 1;
          if (!a.pricing.free && b.pricing.free) return -1;
          const aPriceHigh = a.pricing.paid?.monthly || 0;
          const bPriceHigh = b.pricing.paid?.monthly || 0;
          return bPriceHigh - aPriceHigh;

        default:
          return 0;
      }
    });

    return sorted;
  }, [initialTools, searchQuery, selectedCategory, sortBy]);

  // Group filtered tools by category
  const byCategory: Record<string, typeof filteredTools> = {};
  filteredTools.forEach((tool) => {
    if (!byCategory[tool.category]) {
      byCategory[tool.category] = [];
    }
    byCategory[tool.category].push(tool);
  });

  // Dynamic filters from DB
  const allCategories: Array<string | 'all'> = ['all', ...uniqueCategories];

  // Limit visible items with "Show More" functionality
  const visibleCategories = showAllCategories
    ? allCategories
    : allCategories.slice(0, INITIAL_VISIBLE_CATEGORIES);

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search AI tools..."
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
                {categoryStats[selectedCategory] || 0} tools
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all'
                  ? `All (${initialTools.length})`
                  : `${categoryLabels[category] || category} (${categoryStats[category] || 0})`}
              </Badge>
            ))}
            {allCategories.length > INITIAL_VISIBLE_CATEGORIES && (
              <Badge
                variant="outline"
                className="cursor-pointer text-primary hover:bg-primary/10"
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                {showAllCategories ? (
                  <>
                    <Icons.chevronUp className="mr-1 h-3 w-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="mr-1 h-3 w-3" />
                    Show {allCategories.length - INITIAL_VISIBLE_CATEGORIES} More
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTools.length === initialTools.length
            ? `Showing all ${filteredTools.length} tools`
            : `Showing ${filteredTools.length} of ${initialTools.length} tools`}
        </p>
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-muted-foreground">
              Sort:
            </label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger id="sort-select" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Tools by Category */}
      <div className="space-y-12">
        {Object.entries(byCategory).map(([category, categoryTools]) => (
          <div key={category}>
            <div className="mb-6 flex items-center gap-3">
              <h2 className="text-2xl font-bold">
                {categoryLabels[category] || category}
              </h2>
              <Badge variant="secondary">
                {categoryTools.length}{' '}
                {categoryTools.length === 1 ? 'tool' : 'tools'}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryTools.map((tool) => {
                const pricingText = tool.pricing.free
                  ? 'Free'
                  : `$${tool.pricing.paid?.monthly || 0}/mo`;

                return (
                  <Card key={tool.id} className="group hover:border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="group-hover:text-primary">
                            <Link href={`/learn/ai-tools/${tool.slug}`}>
                              {tool.name}
                            </Link>
                          </CardTitle>
                          {tool.tagline && (
                            <CardDescription className="mt-1">
                              {tool.tagline}
                            </CardDescription>
                          )}
                        </div>
                        {/* Rating only shows when there are actual reviews */}
                        {tool.rating && (tool.reviewCount ?? 0) > 0 && (
                          <div className="flex items-center gap-1">
                            <Icons.heart className="h-4 w-4 fill-red-500 text-red-500" />
                            <span className="text-sm font-medium">
                              {tool.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Pricing */}
                        <div>
                          <Badge
                            variant={
                              tool.pricing.free ? 'default' : 'secondary'
                            }
                          >
                            {pricingText}
                          </Badge>
                        </div>

                        {/* Features Preview */}
                        {tool.features.length > 0 && (
                          <div>
                            <div className="mb-1 text-sm font-medium">
                              Key Features
                            </div>
                            <ul className="text-sm text-muted-foreground">
                              {tool.features
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li key={idx}>• {feature}</li>
                                ))}
                              {tool.features.length > 3 && (
                                <li className="text-xs">
                                  +{tool.features.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Tags */}
                        {tool.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tool.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* CTA */}
                        <Button asChild className="w-full" variant="outline">
                          <Link href={`/learn/ai-tools/${tool.slug}`}>
                            View Details
                            <Icons.arrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

