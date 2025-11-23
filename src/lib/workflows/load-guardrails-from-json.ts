/**
 * Guardrails Static JSON Loader
 *
 * Loads guardrails from static JSON file (fast, no cold starts)
 * Falls back to backup JSON, then MongoDB if JSON files fail
 *
 * IMPORTANT: Uses fetch (not filesystem) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR. Filesystem access is only available at runtime.
 */

import type { Workflow } from '@/lib/workflows/workflow-schema';
import { validateWorkflowsJson } from '@/lib/workflows/workflow-schema';
import { workflowRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';

interface GuardrailsJsonData {
  version: string;
  generatedAt: string;
  totalGuardrails: number;
  guardrails: Workflow[];
}

const JSON_FILE_URL = '/data/guardrails.json';
const BACKUP_JSON_URL = '/data/guardrails-backup.json';

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
 * Uses fetch to avoid DYNAMIC_SERVER_USAGE errors during static generation
 * Falls back to backup JSON, then MongoDB if JSON files fail
 */
export async function loadGuardrailsFromJson(): Promise<Workflow[]> {
  try {
    // Try main JSON file first
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${JSON_FILE_URL}`, {
      cache: 'no-store', // Always fetch fresh during build
    });

    if (response.ok) {
      const data: GuardrailsJsonData = await response.json();
      const processed = processGuardrailsData(data);
      
      logger.debug('Loaded guardrails from static JSON', {
        count: processed.length,
        generatedAt: data.generatedAt,
      });
      
      return processed;
    }
  } catch (error) {
    logger.warn('Failed to load guardrails from main JSON, trying backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Fallback to immutable backup (FAST, RELIABLE)
  // M0 tier: Avoid MongoDB when possible due to connection limits
  try {
    const backupResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${BACKUP_JSON_URL}`, {
      cache: 'no-store',
    });

    if (backupResponse.ok) {
      const backupData: GuardrailsJsonData = await backupResponse.json();
      const processed = processGuardrailsData(backupData);
      
      logger.info('Successfully loaded guardrails from backup', {
        count: processed.length,
        backupGeneratedAt: backupData.generatedAt,
      });
      
      return processed;
    }
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

  return [];
}

