/**
 * Generate Recommendations JSON - Reusable Function
 *
 * Can be called from API routes or scripts
 * Similar to prompts JSON generation - pre-builds static JSON for fast loading
 */

import { recommendationRepository } from '@/lib/db/repositories/RecommendationRepository';
import type { Recommendation } from '@/lib/workflows/recommendation-schema';
import fs from 'fs/promises';
import path from 'path';

interface RecommendationsExport {
  version: '1.0';
  generatedAt: string;
  totalRecommendations: number;
  recommendations: Recommendation[];
  totals: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    published: number;
    draft: number;
  };
}

/**
 * Generate recommendations JSON file
 */
export async function generateRecommendationsJson(): Promise<void> {
  // Fetch all recommendations from MongoDB
  const recommendations = await recommendationRepository.getAll();

  // Count by category, status, and priority
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let published = 0;
  let draft = 0;

  recommendations.forEach((rec) => {
    byCategory[rec.category] = (byCategory[rec.category] || 0) + 1;
    byStatus[rec.status] = (byStatus[rec.status] || 0) + 1;
    byPriority[rec.priority] = (byPriority[rec.priority] || 0) + 1;
    if (rec.status === 'published') published++;
    if (rec.status === 'draft') draft++;
  });

  // Build new export object
  const newExportData: RecommendationsExport = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalRecommendations: recommendations.length,
    recommendations,
    totals: {
      byCategory,
      byStatus,
      byPriority,
      published,
      draft,
    },
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  const jsonPath = path.join(dataDir, 'recommendations.json');

  // Check if content has actually changed
  let shouldWrite = true;
  try {
    const existingContent = await fs.readFile(jsonPath, 'utf-8');
    const existingData: RecommendationsExport = JSON.parse(existingContent);
    
    // Compare everything except generatedAt timestamp
    const existingWithoutTimestamp = { ...existingData, generatedAt: '' };
    const newWithoutTimestamp = { ...newExportData, generatedAt: '' };
    
    if (JSON.stringify(existingWithoutTimestamp) === JSON.stringify(newWithoutTimestamp)) {
      // Content hasn't changed, just update timestamp
      existingData.generatedAt = new Date().toISOString();
      await fs.writeFile(jsonPath, JSON.stringify(existingData), 'utf-8');
      shouldWrite = false;
      console.log('[Recommendations JSON] Content unchanged, refreshed timestamp only');
    }
  } catch (error) {
    // File doesn't exist or can't be read, write new file
    shouldWrite = true;
  }

  // Write new content if it changed
  if (shouldWrite) {
    const jsonContent = JSON.stringify(newExportData);
    await fs.writeFile(jsonPath, jsonContent, 'utf-8');
    console.log('[Recommendations JSON] Content changed, regenerated file');
  }
}

