/**
 * MongoDB Prompt Fetching Utilities (DEPRECATED)
 *
 * ⚠️ USE @/lib/db/repositories/PromptRepository INSTEAD
 * 
 * This file is kept for backward compatibility but should be migrated
 * to use the unified repository pattern.
 * 
 * @deprecated Use promptRepository from @/lib/db/repositories/ContentService
 */

import { promptRepository } from '@/lib/db/repositories/ContentService';
import type { Prompt } from '@/lib/schemas/prompt';

/**
 * Fetch all public prompts from MongoDB
 * @deprecated Use promptRepository.getAll() instead
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  return promptRepository.getAll();
}

/**
 * Fetch a single prompt by ID or slug from MongoDB
 * @deprecated Use promptRepository.getById() instead
 */
export async function getPromptById(idOrSlug: string): Promise<Prompt | null> {
  return promptRepository.getById(idOrSlug);
}

/**
 * Fetch prompts by category from MongoDB
 * @deprecated Use promptRepository.getByCategory() instead
 */
export async function getPromptsByCategory(
  category: string
): Promise<Prompt[]> {
  return promptRepository.getByCategory(category);
}

/**
 * Fetch prompts by role from MongoDB
 * @deprecated Use promptRepository.getByRole() instead
 */
export async function getPromptsByRole(role: string): Promise<Prompt[]> {
  return promptRepository.getByRole(role);
}
