/**
 * Generate Prompts JSON - Reusable Function
 * 
 * Can be called from API routes or scripts
 * Similar to patterns JSON generation - pre-builds static JSON for fast loading
 */

import { promptRepository } from '@/lib/db/repositories/ContentService';
import fs from 'fs/promises';
import path from 'path';
import type { Prompt } from '@/lib/db/schemas/prompt';

interface PromptExport {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  role?: string | null;
  pattern?: string | null;
  slug?: string | null;
  tags?: string[];
  difficulty?: string;
  estimatedTime?: number;
  experienceLevel?: string; // From schema
  isPublic?: boolean;
  isFeatured?: boolean;
  active?: boolean; // Used for filtering
  views?: number;
  favorites?: number;
  shares?: number;
  rating?: number; // From repository
  ratingCount?: number; // From repository
  createdAt?: Date;
  updatedAt?: Date;
}

interface PromptsExport {
  version: '1.0';
  generatedAt: string;
  totalPrompts: number;
  prompts: PromptExport[];
  totals: {
    byCategory: Record<string, number>;
    byRole: Record<string, number>;
    byPattern: Record<string, number>;
    featured: number;
    public: number;
  };
}

export async function generatePromptsJson(): Promise<void> {
  // Fetch all prompts from MongoDB
  const prompts = await promptRepository.getAll();

  // Count by category, role, and pattern
  const byCategory: Record<string, number> = {};
  const byRole: Record<string, number> = {};
  const byPattern: Record<string, number> = {};
  let featured = 0;
  let publicCount = 0;

  prompts.forEach((prompt) => {
    byCategory[prompt.category] = (byCategory[prompt.category] || 0) + 1;
    if (prompt.role) {
      byRole[prompt.role] = (byRole[prompt.role] || 0) + 1;
    }
    if (prompt.pattern) {
      byPattern[prompt.pattern] = (byPattern[prompt.pattern] || 0) + 1;
    }
    if (prompt.isFeatured) featured++;
    if (prompt.isPublic !== false) publicCount++;
  });

  // Transform prompts for export
  const promptsExport: PromptExport[] = prompts.map((prompt) => ({
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    content: prompt.content,
    category: prompt.category,
    role: prompt.role,
    pattern: prompt.pattern,
    slug: prompt.slug,
    tags: prompt.tags,
    difficulty: prompt.difficulty,
    estimatedTime: prompt.estimatedTime,
    experienceLevel: prompt.experienceLevel,
    isPublic: prompt.isPublic,
    isFeatured: prompt.isFeatured,
    active: prompt.active,
    views: prompt.views,
    favorites: prompt.favorites,
    shares: prompt.shares,
    rating: prompt.rating,
    ratingCount: prompt.ratingCount,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
  }));

  // Build export object
  const exportData: PromptsExport = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalPrompts: prompts.length,
    prompts: promptsExport,
    totals: {
      byCategory,
      byRole,
      byPattern,
      featured,
      public: publicCount,
    },
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  // Write JSON file
  const jsonPath = path.join(dataDir, 'prompts.json');
  const jsonContent = JSON.stringify(exportData, null, 2);
  
  await fs.writeFile(jsonPath, jsonContent, 'utf-8');
}

