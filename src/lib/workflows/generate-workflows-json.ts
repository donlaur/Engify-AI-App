/**
 * Generate Workflows JSON - Reusable Function
 *
 * Can be called from API routes or scripts
 * Similar to prompts JSON generation - pre-builds static JSON for fast loading
 */

import { workflowRepository } from '@/lib/db/repositories/ContentService';
import fs from 'fs/promises';
import path from 'path';
import type { Workflow } from '@/lib/workflows/workflow-schema';

interface WorkflowsExport {
  version: string;
  generatedAt: string;
  totalWorkflows: number;
  workflows: Workflow[];
}

export async function generateWorkflowsJson(): Promise<void> {
  // Fetch all workflows from MongoDB
  const workflows = await workflowRepository.getAll();

  // Build new export object
  const newExportData: WorkflowsExport = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalWorkflows: workflows.length,
    workflows: workflows,
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  const jsonPath = path.join(dataDir, 'workflows.json');
  const backupPath = path.join(dataDir, 'workflows-backup.json');

  // Check if content has actually changed
  let shouldWrite = true;
  try {
    const existingContent = await fs.readFile(jsonPath, 'utf-8');
    const existingData: WorkflowsExport = JSON.parse(existingContent);
    
    // Compare everything except generatedAt timestamp
    const existingWithoutTimestamp = { ...existingData, generatedAt: '' };
    const newWithoutTimestamp = { ...newExportData, generatedAt: '' };
    
    if (JSON.stringify(existingWithoutTimestamp) === JSON.stringify(newWithoutTimestamp)) {
      // Content hasn't changed, just update timestamp
      existingData.generatedAt = new Date().toISOString();
      await fs.writeFile(jsonPath, JSON.stringify(existingData, null, 2), 'utf-8');
      shouldWrite = false;
      console.log('[Workflows JSON] Content unchanged, refreshed timestamp only');
    }
  } catch (error) {
    // File doesn't exist or can't be read, write new file
    shouldWrite = true;
  }

  // Write new content if it changed
  if (shouldWrite) {
    const jsonContent = JSON.stringify(newExportData, null, 2);
    
    // Write main file
    await fs.writeFile(jsonPath, jsonContent, 'utf-8');
    
    // Write backup file (immutable, committed to git)
    await fs.writeFile(backupPath, jsonContent, 'utf-8');
    
    console.log('[Workflows JSON] Content changed, regenerated file and backup');
  }
}

