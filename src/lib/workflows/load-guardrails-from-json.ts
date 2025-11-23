/**
 * Guardrails Static JSON Loader
 *
 * Loads guardrails from static JSON file (fast, no cold starts)
 * Falls back to backup JSON, then MongoDB if JSON files fail
 *
 * IMPORTANT: Uses filesystem (not fetch) for server-side rendering
 * to avoid DYNAMIC_SERVER_USAGE errors during static generation/ISR.
 */

import type { Workflow } from '@/lib/workflows/workflow-schema';
import { validateWorkflowsJson } from '@/lib/workflows/workflow-schema';
import { workflowRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';
import fs from 'fs/promises';
import path from 'path';

interface GuardrailsJsonData {
  version: string;
  generatedAt: string;
  totalGuardrails: number;
  guardrails: Workflow[];
}

const MAIN_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'guardrails.json');
const BACKUP_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'guardrails-backup.json');

/**
 * Helper function to process and validate guardrails data
 */
function processGuardrailsData(data: GuardrailsJsonData): Workflow[] {
  // Ensure all guardrails have category='guardrails' and clean up null values
  const validated = data.guardrails.map((g) => {
    const cleaned: any = {
      ...g,
      category: 'guardrails' as const,
    };
    
    // Remove null values for optional fields (schema expects undefined, not null)
    if (cleaned.automationTeaser === null) {
      delete cleaned.automationTeaser;
    }
    if (cleaned.cta === null) {
      delete cleaned.cta;
    }
    
    return cleaned;
  });
  
  // Try to validate using workflow schema, but don't fail if validation fails
  // Guardrails are workflows, but validation might be too strict
  try {
    const workflowsData = {
      version: data.version,
      generatedAt: data.generatedAt,
      totalWorkflows: validated.length,
      workflows: validated,
    };
    
    const validatedWorkflows = validateWorkflowsJson(workflowsData);
    
    return validatedWorkflows.workflows;
  } catch (validationError) {
    // Validation failed, but guardrails are still valid workflows
    // Log the error but return the guardrails anyway
    logger.warn('Guardrails validation failed, returning unvalidated guardrails', {
      error: validationError instanceof Error ? validationError.message : 'Unknown error',
      count: validated.length,
    });
    
    // Return guardrails as-is (they're still Workflow[] type)
    return validated as Workflow[];
  }
}

/**
 * Load guardrails from static JSON file (production-fast)
 * Uses filesystem read for server-side rendering
 * Falls back to backup JSON, then MongoDB if JSON files fail
 */
export async function loadGuardrailsFromJson(): Promise<Workflow[]> {
  try {
    // For server-side rendering, use filesystem access (faster, no network call)
    if (typeof window === 'undefined') {
      // Server-side: use filesystem
      try {
        const fileContent = await fs.readFile(MAIN_JSON_PATH, 'utf-8');
        const data: GuardrailsJsonData = JSON.parse(fileContent);
        const processed = processGuardrailsData(data);
        
        logger.debug('Loaded guardrails from static JSON', {
          count: processed.length,
          generatedAt: data.generatedAt,
        });
        
        return processed;
      } catch (fsError) {
        // File doesn't exist or can't be read - fall through to backup/MongoDB
        throw new Error(`Failed to read JSON file: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`);
      }
    }

    // Client-side: skip JSON loading, use MongoDB directly
    throw new Error('Client-side JSON loading disabled - use MongoDB');
  } catch (error) {
    // Fallback to immutable backup (FAST, RELIABLE)
    // M0 tier: Avoid MongoDB when possible due to connection limits
    logger.warn('Failed to load guardrails from main JSON, trying backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    try {
      const backupContent = await fs.readFile(BACKUP_JSON_PATH, 'utf-8');
      const backupData: GuardrailsJsonData = JSON.parse(backupContent);
      const processed = processGuardrailsData(backupData);
      
      logger.info('Successfully loaded guardrails from backup', {
        count: processed.length,
        backupGeneratedAt: backupData.generatedAt,
      });
      
      return processed;
    } catch (backupError) {
      // LAST RESORT: Use MongoDB
      logger.error('Backup fallback failed, using MongoDB', {
        backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
      });
      
      try {
        const allWorkflows = await workflowRepository.getAll();
        const guardrails = allWorkflows.filter((w) => w.category === 'guardrails');
        
        logger.info('Loaded guardrails from MongoDB fallback', {
          count: guardrails.length,
        });
        
        return guardrails;
      } catch (dbError) {
        logger.error('CRITICAL: All fallbacks failed (JSON, Backup, MongoDB)', {
          dbError: dbError instanceof Error ? dbError.message : 'Unknown error',
        });
        
        return [];
      }
    }
  }
}

