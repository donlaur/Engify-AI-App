/**
 * Prompt Duplicate Detection Utility
 * 
 * Checks if a prompt already exists in MongoDB before adding a new one.
 * Uses multiple strategies to detect duplicates:
 * 1. Exact title match
 * 2. Similar title (fuzzy matching)
 * 3. Exact content match (hash comparison)
 * 4. Category + role + pattern combination match
 */

import { promptRepository } from '@/lib/db/repositories/ContentService';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matches: Array<{
    id: string;
    title: string;
    similarity: 'exact' | 'similar' | 'content-match' | 'metadata-match';
    reason: string;
  }>;
}

export interface NewPromptData {
  title: string;
  content: string;
  category?: string;
  role?: string;
  pattern?: string;
}

/**
 * Normalize string for comparison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Calculate similarity between two strings (simple Levenshtein-like)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  
  if (s1 === s2) return 1.0;
  
  // Simple word overlap similarity
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Check for duplicate prompts
 */
export async function checkPromptDuplicate(
  newPrompt: NewPromptData
): Promise<DuplicateCheckResult> {
  const matches: DuplicateCheckResult['matches'] = [];
  
  // Get all existing prompts from MongoDB
  const allPrompts = await promptRepository.getAll();
  
  // Normalize new prompt title for comparison
  const normalizedNewTitle = normalizeString(newPrompt.title);
  const normalizedNewContent = normalizeString(newPrompt.content.substring(0, 200)); // First 200 chars
  
  for (const existingPrompt of allPrompts) {
    const existingTitle = existingPrompt.title || '';
    const existingContent = existingPrompt.content || '';
    
    const normalizedExistingTitle = normalizeString(existingTitle);
    const normalizedExistingContent = normalizeString(existingContent.substring(0, 200));
    
    // 1. Exact title match
    if (normalizedNewTitle === normalizedExistingTitle) {
      matches.push({
        id: existingPrompt.id,
        title: existingPrompt.title,
        similarity: 'exact',
        reason: 'Exact title match',
      });
      continue;
    }
    
    // 2. Similar title (>= 80% similarity)
    const titleSimilarity = calculateSimilarity(newPrompt.title, existingTitle);
    if (titleSimilarity >= 0.8) {
      matches.push({
        id: existingPrompt.id,
        title: existingPrompt.title,
        similarity: 'similar',
        reason: `Title similarity: ${Math.round(titleSimilarity * 100)}%`,
      });
      continue;
    }
    
    // 3. Content match (first 200 chars match)
    if (normalizedNewContent === normalizedExistingContent && normalizedNewContent.length > 50) {
      matches.push({
        id: existingPrompt.id,
        title: existingPrompt.title,
        similarity: 'content-match',
        reason: 'Content starts with same text',
      });
      continue;
    }
    
    // 4. Metadata match (category + role + pattern)
    if (
      newPrompt.category &&
      newPrompt.role &&
      newPrompt.pattern &&
      existingPrompt.category === newPrompt.category &&
      existingPrompt.role === newPrompt.role &&
      existingPrompt.pattern === newPrompt.pattern &&
      titleSimilarity >= 0.5 // At least 50% title similarity
    ) {
      matches.push({
        id: existingPrompt.id,
        title: existingPrompt.title,
        similarity: 'metadata-match',
        reason: 'Same category, role, and pattern with similar title',
      });
    }
  }
  
  return {
    isDuplicate: matches.length > 0,
    matches,
  };
}

/**
 * Format duplicate check result for user-friendly display
 */
export function formatDuplicateCheckResult(result: DuplicateCheckResult): string {
  if (!result.isDuplicate) {
    return '✅ No duplicates found';
  }
  
  const lines = [`⚠️  Found ${result.matches.length} potential duplicate(s):\n`];
  
  for (const match of result.matches) {
    lines.push(`- "${match.title}" (ID: ${match.id})`);
    lines.push(`  Reason: ${match.reason}`);
    lines.push(`  Similarity: ${match.similarity}`);
    lines.push('');
  }
  
  return lines.join('\n');
}

