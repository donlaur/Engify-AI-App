/**
 * Generate AI Tools JSON - Reusable Function
 *
 * Can be called from API routes or scripts
 * Similar to prompts JSON generation - pre-builds static JSON for fast loading
 */

import { aiToolService } from '@/lib/services/AIToolService';
import type { AITool } from '@/lib/db/schemas/ai-tool';
import fs from 'fs/promises';
import path from 'path';

interface AIToolsExport {
  version: '1.0';
  generatedAt: string;
  totalTools: number;
  tools: AITool[];
  totals: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    active: number;
    deprecated: number;
    sunset: number;
  };
}

/**
 * Generate AI tools JSON file
 */
export async function generateAIToolsJson(): Promise<void> {
  // Fetch all tools from MongoDB
  const tools = await aiToolService.find({});

  // Count by category and status
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let active = 0;
  let deprecated = 0;
  let sunset = 0;

  tools.forEach((tool) => {
    byCategory[tool.category] = (byCategory[tool.category] || 0) + 1;
    byStatus[tool.status] = (byStatus[tool.status] || 0) + 1;
    if (tool.status === 'active') active++;
    if (tool.status === 'deprecated') deprecated++;
    if (tool.status === 'sunset') sunset++;
  });

  // Build new export object
  const newExportData: AIToolsExport = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalTools: tools.length,
    tools,
    totals: {
      byCategory,
      byStatus,
      active,
      deprecated,
      sunset,
    },
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  const jsonPath = path.join(dataDir, 'ai-tools.json');

  // Check if content has actually changed
  let shouldWrite = true;
  try {
    const existingContent = await fs.readFile(jsonPath, 'utf-8');
    const existingData: AIToolsExport = JSON.parse(existingContent);
    
    // Compare everything except generatedAt timestamp
    const existingWithoutTimestamp = { ...existingData, generatedAt: '' };
    const newWithoutTimestamp = { ...newExportData, generatedAt: '' };
    
    if (JSON.stringify(existingWithoutTimestamp) === JSON.stringify(newWithoutTimestamp)) {
      // Content hasn't changed, just update timestamp
      existingData.generatedAt = new Date().toISOString();
      await fs.writeFile(jsonPath, JSON.stringify(existingData), 'utf-8');
      shouldWrite = false;
      console.log('[AI Tools JSON] Content unchanged, refreshed timestamp only');
    }
  } catch (error) {
    // File doesn't exist or can't be read, write new file
    shouldWrite = true;
  }

  // Write new content if it changed
  if (shouldWrite) {
    const jsonContent = JSON.stringify(newExportData);
    await fs.writeFile(jsonPath, jsonContent, 'utf-8');
    console.log('[AI Tools JSON] Content changed, regenerated file');
  }
}

