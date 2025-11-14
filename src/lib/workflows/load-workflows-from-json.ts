/**
 * Workflows Static JSON Loader
 *
 * Loads workflows from static JSON file (fast, no cold starts)
 * Falls back to backup JSON if main file doesn't exist
 * Falls back to MongoDB if both JSON files fail
 *
 * IMPORTANT: Uses fetch (not filesystem) to avoid DYNAMIC_SERVER_USAGE errors
 * during static generation/ISR. Filesystem access is only available at runtime.
 */

import type { Workflow } from '@/lib/workflows/workflow-schema';
import { validateWorkflowsJson } from '@/lib/workflows/workflow-schema';
import { workflowRepository } from '@/lib/db/repositories/ContentService';
import { logger } from '@/lib/logging/logger';

interface WorkflowsJsonData {
  version: string;
  generatedAt: string;
  totalWorkflows: number;
  workflows: Workflow[];
}

const JSON_FILE_URL = '/data/workflows.json';
const BACKUP_JSON_PATH = '/data/workflows-backup.json';

/**
 * Load workflows from static JSON file (production-fast)
 * Uses fetch to avoid DYNAMIC_SERVER_USAGE errors during static generation
 * Falls back to backup JSON, then MongoDB
 */
export async function loadWorkflowsFromJson(): Promise<Workflow[]> {
  try {
    // Try main JSON file first
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${JSON_FILE_URL}`, {
      cache: 'no-store', // Always fetch fresh during build
    });

    if (response.ok) {
      const data: WorkflowsJsonData = await response.json();
      const validated = validateWorkflowsJson(data);
      
      logger.debug('Loaded workflows from static JSON', {
        count: validated.workflows.length,
        generatedAt: validated.generatedAt,
      });
      
      return validated.workflows;
    }
  } catch (error) {
    logger.warn('Failed to load workflows from main JSON, trying backup', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Fallback to immutable backup (FAST, RELIABLE)
  try {
    const backupResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${BACKUP_JSON_PATH}`, {
      cache: 'no-store',
    });

    if (backupResponse.ok) {
      const backupData: WorkflowsJsonData = await backupResponse.json();
      const validated = validateWorkflowsJson(backupData);
      
      logger.info('Successfully loaded workflows from immutable backup', {
        count: validated.workflows.length,
        backupGeneratedAt: validated.generatedAt,
      });
      
      return validated.workflows;
    }
  } catch (backupError) {
    // LAST RESORT: Try MongoDB (M0 tier unreliable, may hit connection limits)
    logger.error('Backup failed, trying MongoDB as last resort', {
      backupError: backupError instanceof Error ? backupError.message : 'Unknown error',
    });
    
    try {
      return await workflowRepository.getAll();
    } catch (dbError) {
      logger.error('CRITICAL: All fallbacks failed (JSON, Backup, MongoDB)', {
        dbError: dbError instanceof Error ? dbError.message : 'Unknown error',
      });

      return [];
    }
  }

  return [];
}

/**
 * Get workflow by category and slug from JSON
 */
export async function getWorkflowByCategoryAndSlug(
  category: string,
  slug: string
): Promise<Workflow | null> {
  try {
    const workflows = await loadWorkflowsFromJson();
    return workflows.find((w) => w.category === category && w.slug === slug) || null;
  } catch (error) {
    logger.warn('Failed to load workflow from JSON, trying MongoDB', {
      category,
      slug,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Fallback to MongoDB
    return workflowRepository.getByCategoryAndSlug(category, slug);
  }
}

/**
 * List all workflow categories
 */
export async function listWorkflowCategories(): Promise<string[]> {
  const workflows = await loadWorkflowsFromJson();
  const categories = [...new Set(workflows.map((w) => w.category))];
  return categories.sort();
}

/**
 * List all workflow audiences
 */
export async function listWorkflowAudiences(): Promise<string[]> {
  const workflows = await loadWorkflowsFromJson();
  const audiences = new Set<string>();
  workflows.forEach((w) => {
    w.audience.forEach((aud) => audiences.add(aud));
  });
  return Array.from(audiences).sort();
}

/**
 * Get workflows metadata
 */
export async function getWorkflowsMetadata(): Promise<{
  version: string;
  generatedAt: string;
  totalWorkflows: number;
}> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${JSON_FILE_URL}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data: WorkflowsJsonData = await response.json();
      return {
        version: data.version,
        generatedAt: data.generatedAt,
        totalWorkflows: data.totalWorkflows,
      };
    }
  } catch (error) {
    logger.warn('Failed to load workflows metadata from JSON', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Fallback: load all workflows and calculate
  const workflows = await loadWorkflowsFromJson();
  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalWorkflows: workflows.length,
  };
}
