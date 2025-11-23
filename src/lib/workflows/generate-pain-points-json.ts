/**
 * Generate Pain Points JSON - Reusable Function
 *
 * Can be called from API routes or scripts
 * Similar to prompts JSON generation - pre-builds static JSON for fast loading
 */

import { painPointRepository } from '@/lib/db/repositories/PainPointRepository';
import type { PainPoint } from '@/lib/workflows/pain-point-schema';
import fs from 'fs/promises';
import path from 'path';

interface PainPointsExport {
  version: '1.0';
  generatedAt: string;
  totalPainPoints: number;
  painPoints: PainPoint[];
  totals: {
    byStatus: Record<string, number>;
    published: number;
    draft: number;
  };
}

/**
 * Generate pain points JSON file
 */
export async function generatePainPointsJson(): Promise<void> {
  // Fetch all pain points from MongoDB
  const painPoints = await painPointRepository.getAll();

  // Count by status
  const byStatus: Record<string, number> = {};
  let published = 0;
  let draft = 0;

  painPoints.forEach((pp) => {
    byStatus[pp.status] = (byStatus[pp.status] || 0) + 1;
    if (pp.status === 'published') published++;
    if (pp.status === 'draft') draft++;
  });

  // Build new export object
  const newExportData: PainPointsExport = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalPainPoints: painPoints.length,
    painPoints,
    totals: {
      byStatus,
      published,
      draft,
    },
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  const jsonPath = path.join(dataDir, 'pain-points.json');

  // Check if content has actually changed
  let shouldWrite = true;
  try {
    const existingContent = await fs.readFile(jsonPath, 'utf-8');
    const existingData: PainPointsExport = JSON.parse(existingContent);
    
    // Compare everything except generatedAt timestamp
    const existingWithoutTimestamp = { ...existingData, generatedAt: '' };
    const newWithoutTimestamp = { ...newExportData, generatedAt: '' };
    
    if (JSON.stringify(existingWithoutTimestamp) === JSON.stringify(newWithoutTimestamp)) {
      // Content hasn't changed, just update timestamp
      existingData.generatedAt = new Date().toISOString();
      await fs.writeFile(jsonPath, JSON.stringify(existingData), 'utf-8');
      shouldWrite = false;
      console.log('[Pain Points JSON] Content unchanged, refreshed timestamp only');
    }
  } catch (error) {
    // File doesn't exist or can't be read, write new file
    shouldWrite = true;
  }

  // Write new content if it changed
  if (shouldWrite) {
    const jsonContent = JSON.stringify(newExportData);
    await fs.writeFile(jsonPath, jsonContent, 'utf-8');
    console.log('[Pain Points JSON] Content changed, regenerated file');
  }
}

