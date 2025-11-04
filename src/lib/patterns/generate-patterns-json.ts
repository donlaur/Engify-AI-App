/**
 * Generate Patterns JSON - Reusable Function
 *
 * Can be called from API routes or scripts
 */

import { patternRepository } from '@/lib/db/repositories/ContentService';
import { promptRepository } from '@/lib/db/repositories/ContentService';
import fs from 'fs/promises';
import path from 'path';

interface PatternExport {
  id: string;
  name: string;
  category: string;
  level: string;
  description: string;
  shortDescription?: string;
  fullDescription?: string;
  howItWorks?: string;
  example?: string | { before: string; after: string; explanation: string };
  useCases?: string[];
  bestPractices?: string[];
  commonMistakes?: string[];
  relatedPatterns?: string[];
  icon?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  promptCount?: number;
}

interface PatternsExport {
  version: '1.0';
  generatedAt: string;
  totalPatterns: number;
  patterns: PatternExport[];
  totals: {
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
    totalPromptsUsingPatterns: number;
  };
}

export async function generatePatternsJson(): Promise<void> {
  // Fetch all patterns from MongoDB
  const patterns = await patternRepository.getAll();

  // Fetch all prompts to count by pattern
  const allPrompts = await promptRepository.getAll();

  // Count prompts per pattern
  const promptsByPattern = new Map<string, number>();
  allPrompts.forEach((prompt) => {
    if (prompt.pattern) {
      promptsByPattern.set(
        prompt.pattern,
        (promptsByPattern.get(prompt.pattern) || 0) + 1
      );
    }
  });

  const totalPromptsUsingPatterns = Array.from(
    promptsByPattern.values()
  ).reduce((sum, count) => sum + count, 0);

  // Count by category and level
  const byCategory: Record<string, number> = {};
  const byLevel: Record<string, number> = {};

  patterns.forEach((pattern) => {
    byCategory[pattern.category] = (byCategory[pattern.category] || 0) + 1;
    byLevel[pattern.level] = (byLevel[pattern.level] || 0) + 1;
  });

  // Transform patterns for export
  const patternsExport: PatternExport[] = patterns.map((pattern) => ({
    id: pattern.id,
    name: pattern.name,
    category: pattern.category,
    level: pattern.level,
    description: pattern.description,
    shortDescription: pattern.shortDescription,
    fullDescription: pattern.fullDescription,
    howItWorks: pattern.howItWorks,
    example: pattern.example,
    useCases: pattern.useCases,
    bestPractices: pattern.bestPractices,
    commonMistakes: pattern.commonMistakes,
    relatedPatterns: pattern.relatedPatterns,
    icon: pattern.icon,
    tags: pattern.tags,
    createdAt: pattern.createdAt,
    updatedAt: pattern.updatedAt,
    promptCount: promptsByPattern.get(pattern.id) || 0,
  }));

  // Build export object
  const exportData: PatternsExport = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalPatterns: patterns.length,
    patterns: patternsExport,
    totals: {
      byCategory,
      byLevel,
      totalPromptsUsingPatterns,
    },
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  // Write JSON file (minified for smaller file size)
  const jsonPath = path.join(dataDir, 'patterns.json');
  const jsonContent = JSON.stringify(exportData); // Minified (no indentation)

  await fs.writeFile(jsonPath, jsonContent, 'utf-8');
}
