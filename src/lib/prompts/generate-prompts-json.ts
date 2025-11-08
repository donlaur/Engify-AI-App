/**
 * Generate Prompts JSON - Reusable Function
 *
 * Can be called from API routes or scripts
 * Similar to patterns JSON generation - pre-builds static JSON for fast loading
 */

import { promptRepository } from '@/lib/db/repositories/ContentService';
import fs from 'fs/promises';
import path from 'path';

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
  // CRITICAL: Ensure all metrics default to 0 (no mock data per ADR-009)
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
    // ADR-009: Zero mock data - always default to 0 if undefined/null
    views: prompt.views ?? 0,
    favorites: prompt.favorites ?? 0,
    shares: prompt.shares ?? 0,
    rating: prompt.rating ?? 0,
    ratingCount: prompt.ratingCount ?? 0,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
  }));

  // Build new export object
  const newExportData: PromptsExport = {
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

  const jsonPath = path.join(dataDir, 'prompts.json');

  // Check if content has actually changed
  let shouldWrite = true;
  try {
    const existingContent = await fs.readFile(jsonPath, 'utf-8');
    const existingData: PromptsExport = JSON.parse(existingContent);
    
    // Compare everything except generatedAt timestamp
    const existingWithoutTimestamp = { ...existingData, generatedAt: '' };
    const newWithoutTimestamp = { ...newExportData, generatedAt: '' };
    
    if (JSON.stringify(existingWithoutTimestamp) === JSON.stringify(newWithoutTimestamp)) {
      // Content hasn't changed, just update timestamp
      existingData.generatedAt = new Date().toISOString();
      await fs.writeFile(jsonPath, JSON.stringify(existingData), 'utf-8');
      shouldWrite = false;
      console.log('[Prompts JSON] Content unchanged, refreshed timestamp only');
    }
  } catch (error) {
    // File doesn't exist or can't be read, write new file
    shouldWrite = true;
  }

  // Write new content if it changed
  if (shouldWrite) {
    const jsonContent = JSON.stringify(newExportData);
    await fs.writeFile(jsonPath, jsonContent, 'utf-8');
    console.log('[Prompts JSON] Content changed, regenerated file');
  }
}
