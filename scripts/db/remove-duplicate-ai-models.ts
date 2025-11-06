#!/usr/bin/env tsx

/**
 * Find and Remove Duplicate AI Models
 * 
 * Identifies duplicate models by checking:
 * - Same provider + name combination
 * - Same slug
 * - Similar display names
 * 
 * Keeps the most complete/non-empty model and removes duplicates.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { AIModel } from '@/lib/db/schemas/ai-model';
import { generateSlug } from '@/lib/utils/slug';

interface DuplicateGroup {
  key: string; // e.g., "openai:gpt-4"
  models: AIModel[];
  keep: AIModel; // Model to keep
  remove: AIModel[]; // Models to remove
}

/**
 * Generate a unique key for duplicate detection
 */
function getDuplicateKey(model: AIModel): string {
  // Use provider + name (normalized)
  const normalizedName = model.name.toLowerCase().trim();
  return `${model.provider}:${normalizedName}`;
}

/**
 * Generate alternative keys for fuzzy matching
 */
function getAlternativeKeys(model: AIModel): string[] {
  const keys: string[] = [];
  const normalizedName = model.name.toLowerCase().trim();
  const normalizedDisplayName = model.displayName?.toLowerCase().trim() || '';
  
  // Provider + name
  keys.push(`${model.provider}:${normalizedName}`);
  
  // Provider + displayName (if different)
  if (normalizedDisplayName && normalizedDisplayName !== normalizedName) {
    keys.push(`${model.provider}:${normalizedDisplayName}`);
  }
  
  // Slug-based key
  if (model.slug) {
    keys.push(`slug:${model.slug}`);
  }
  
  // Extract base name (remove version numbers, etc.)
  const baseName = normalizedName.replace(/[-_]?v?\d+\.?\d*\.?\d*/g, '').trim();
  if (baseName && baseName !== normalizedName) {
    keys.push(`${model.provider}:${baseName}`);
  }
  
  return keys;
}

/**
 * Score a model to determine which one to keep
 * Higher score = better candidate to keep
 */
function scoreModel(model: AIModel): number {
  let score = 0;
  
  // Prefer models with more complete data
  if (model.description) score += 10;
  if (model.modalities) score += 5;
  if (model.features) score += 5;
  if (model.tools) score += 5;
  if (model.endpoints && model.endpoints.length > 0) score += 5;
  if (model.supportedParameters) score += 5;
  if (model.performanceMetrics) score += 5;
  
  // Prefer models with OpenRouter-style IDs (more complete)
  if (model.id.includes('/')) score += 10;
  
  // Prefer newer models (more recent lastVerified)
  if (model.lastVerified) {
    const daysSinceVerified = (Date.now() - model.lastVerified.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 30 - daysSinceVerified); // Max 30 points for recent verification
  }
  
  // Prefer active models
  if (model.status === 'active') score += 10;
  if (model.isAllowed) score += 5;
  
  // Prefer models with slugs
  if (model.slug && model.slug !== 'untitled') score += 5;
  
  // Prefer models with pricing data
  if (model.costPer1kInputTokens > 0 || model.costPer1kOutputTokens > 0) score += 5;
  
  // Prefer models with more capabilities
  if (model.capabilities && model.capabilities.length > 0) {
    score += model.capabilities.length;
  }
  
  // Slight preference for recommended/default models
  if (model.recommended) score += 3;
  if (model.isDefault) score += 3;
  
  return score;
}

/**
 * Compare two models to determine which to keep
 */
function compareModels(a: AIModel, b: AIModel): AIModel {
  const scoreA = scoreModel(a);
  const scoreB = scoreModel(b);
  
  if (scoreA > scoreB) return a;
  if (scoreB > scoreA) return b;
  
  // Tie-breaker: prefer newer updatedAt
  if (a.updatedAt && b.updatedAt) {
    return a.updatedAt > b.updatedAt ? a : b;
  }
  
  // Final tie-breaker: prefer longer ID (more complete)
  return a.id.length > b.id.length ? a : b;
}

/**
 * Find all duplicate groups
 */
async function findDuplicates(): Promise<DuplicateGroup[]> {
  const db = await getMongoDb();
  const collection = db.collection<AIModel>('ai_models');
  
  const allModels = await collection.find({}).toArray();
  console.log(`📊 Analyzing ${allModels.length} models for duplicates...\n`);
  
  // Group models by duplicate keys
  const groupsByKey = new Map<string, AIModel[]>();
  
  for (const model of allModels) {
    const keys = getAlternativeKeys(model);
    for (const key of keys) {
      if (!groupsByKey.has(key)) {
        groupsByKey.set(key, []);
      }
      groupsByKey.get(key)!.push(model);
    }
  }
  
  // Find groups with duplicates
  const duplicateGroups: DuplicateGroup[] = [];
  const processedIds = new Set<string>();
  
  for (const [key, models] of groupsByKey.entries()) {
    // Filter out already processed models
    const unprocessedModels = models.filter(m => !processedIds.has(m.id));
    
    if (unprocessedModels.length > 1) {
      // This is a duplicate group
      // Deduplicate models array (in case same model appears multiple times)
      const uniqueModels = Array.from(
        new Map(unprocessedModels.map(m => [m.id, m])).values()
      );
      
      if (uniqueModels.length > 1) {
        // Find which model to keep
        const keep = uniqueModels.reduce((best, current) => 
          compareModels(current, best)
        );
        
        const remove = uniqueModels.filter(m => m.id !== keep.id);
        
        duplicateGroups.push({
          key,
          models: uniqueModels,
          keep,
          remove,
        });
        
        // Mark all models as processed
        uniqueModels.forEach(m => processedIds.add(m.id));
      }
    }
  }
  
  return duplicateGroups;
}

/**
 * Remove duplicates
 */
async function removeDuplicates(
  duplicateGroups: DuplicateGroup[],
  dryRun: boolean = true
): Promise<{ removed: number; kept: number }> {
  const db = await getMongoDb();
  const collection = db.collection<AIModel>('ai_models');
  
  let removed = 0;
  let kept = 0;
  const modelsToRemove = new Set<string>();
  
  // Collect all models to remove
  for (const group of duplicateGroups) {
    kept++;
    for (const model of group.remove) {
      modelsToRemove.add(model.id);
    }
  }
  
  console.log(`\n📋 Summary:`);
  console.log(`   🔍 Found ${duplicateGroups.length} duplicate groups`);
  console.log(`   ✅ Will keep: ${kept} models`);
  console.log(`   ❌ Will remove: ${modelsToRemove.size} duplicates\n`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
    return { removed: 0, kept };
  }
  
  // Remove duplicates
  console.log('🗑️  Removing duplicates...\n');
  
  for (const modelId of modelsToRemove) {
    const result = await collection.deleteOne({ id: modelId });
    if (result.deletedCount > 0) {
      removed++;
      console.log(`   ✅ Removed: ${modelId}`);
    }
  }
  
  return { removed, kept };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  console.log('🔍 Finding duplicate AI models...\n');
  
  try {
    await getMongoDb();
    console.log('✅ Database connected\n');
    
    // Find duplicates
    const duplicateGroups = await findDuplicates();
    
    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicates found!\n');
      return;
    }
    
    // Display duplicates
    console.log(`\n📊 Found ${duplicateGroups.length} duplicate groups:\n`);
    
    for (const group of duplicateGroups) {
      console.log(`🔗 Group: ${group.key}`);
      console.log(`   ✅ KEEP: ${group.keep.id} (${group.keep.displayName || group.keep.name})`);
      console.log(`      Score: ${scoreModel(group.keep)}`);
      console.log(`      Provider: ${group.keep.provider}, Name: ${group.keep.name}`);
      if (group.keep.slug) console.log(`      Slug: ${group.keep.slug}`);
      
      for (const model of group.remove) {
        console.log(`   ❌ REMOVE: ${model.id} (${model.displayName || model.name})`);
        console.log(`      Score: ${scoreModel(model)}`);
        console.log(`      Provider: ${model.provider}, Name: ${model.name}`);
        if (model.slug) console.log(`      Slug: ${model.slug}`);
      }
      console.log('');
    }
    
    // Remove duplicates
    const result = await removeDuplicates(duplicateGroups, dryRun);
    
    if (dryRun) {
      console.log('\n💡 To actually remove duplicates, run with --execute flag:');
      console.log('   tsx scripts/db/remove-duplicate-ai-models.ts --execute\n');
    } else {
      console.log('\n✅ Duplicate removal completed!');
      console.log(`   ✅ Kept: ${result.kept} models`);
      console.log(`   ❌ Removed: ${result.removed} duplicates\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

