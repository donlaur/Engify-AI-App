/**
 * Seed Patterns to MongoDB
 * Merges data from 3 source files into unified MongoDB collection
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { PatternSchema } from '../../src/lib/db/schemas/pattern';

// Import data from all 3 sources
import { PATTERNS } from '../../src/lib/pattern-constants';
import { patternDetails } from '../../src/data/pattern-details';
import { promptPatterns } from '../../src/data/prompt-patterns';

// Create unified pattern data
function createUnifiedPatterns(): any[] {
  const patterns: any[] = [];
  const processedIds = new Set<string>();

  // First, process PATTERNS from pattern-constants.ts (has category enum)
  PATTERNS.forEach((pattern) => {
    if (processedIds.has(pattern.id)) return;

    // Find additional data from other sources
    const details = patternDetails.find((d) => d.id === pattern.id);
    const promptPattern = promptPatterns.find((p) => p.id === pattern.id);

    const unified: any = {
      id: pattern.id,
      name: pattern.name,
      category: pattern.category,
      level: pattern.level,
      description: pattern.description,
      icon: pattern.icon,
    };

    // Add example if available
    if (promptPattern?.example) {
      unified.example = promptPattern.example;
    } else if (details?.example) {
      unified.example = details.example.after;
    }

    // Add use cases if available
    if (details?.whenToUse) {
      unified.useCases = details.whenToUse;
    }

    // Add related patterns if available
    if (details?.relatedPatterns) {
      unified.relatedPatterns = details.relatedPatterns;
    }

    patterns.push(unified);
    processedIds.add(pattern.id);
  });

  // Add any patterns from promptPatterns that weren't in PATTERNS
  promptPatterns.forEach((promptPattern) => {
    if (processedIds.has(promptPattern.id)) return;

    const details = patternDetails.find((d) => d.id === promptPattern.id);

    const unified: any = {
      id: promptPattern.id,
      name: promptPattern.name,
      category: mapCategory(promptPattern.category),
      level: mapLevel(promptPattern.difficulty),
      description: promptPattern.description,
    };

    if (promptPattern.example) {
      unified.example = promptPattern.example;
    }

    if (details?.example) {
      unified.example = details.example.after;
    }

    if (details?.whenToUse) {
      unified.useCases = details.whenToUse;
    }

    if (details?.relatedPatterns) {
      unified.relatedPatterns = details.relatedPatterns;
    }

    patterns.push(unified);
    processedIds.add(promptPattern.id);
  });

  // Add any patterns from patternDetails that weren't in other sources
  patternDetails.forEach((detail) => {
    if (processedIds.has(detail.id)) return;

    const unified: any = {
      id: detail.id,
      name: detail.name,
      category: mapCategory(detail.category),
      level: detail.level,
      description: detail.shortDescription || detail.fullDescription,
    };

    if (detail.example) {
      unified.example = detail.example.after;
    }

    if (detail.whenToUse) {
      unified.useCases = detail.whenToUse;
    }

    if (detail.relatedPatterns) {
      unified.relatedPatterns = detail.relatedPatterns;
    }

    patterns.push(unified);
  });

  return patterns;
}

function mapCategory(oldCategory: string): string {
  const mapping: Record<string, string> = {
    Foundation: 'FOUNDATIONAL',
    Foundational: 'FOUNDATIONAL',
    Structure: 'STRUCTURAL',
    Structural: 'STRUCTURAL',
    Reason: 'COGNITIVE',
    Reasoning: 'COGNITIVE',
    Cognitive: 'COGNITIVE',
    Learning: 'FOUNDATIONAL',
    Context: 'STRUCTURAL',
    'Context Management': 'STRUCTURAL',
    'Context/Refinement': 'ITERATIVE',
    Iteration: 'ITERATIVE',
    Control: 'STRUCTURAL',
    Communication: 'FOUNDATIONAL',
    Advanced: 'COGNITIVE',
    Process: 'STRUCTURAL',
    Exploration: 'COGNITIVE',
    Quality: 'COGNITIVE',
    Collaboration: 'ITERATIVE',
    Engagement: 'ITERATIVE',
    Focus: 'COGNITIVE',
    'Role/Instruction': 'FOUNDATIONAL',
    'Structure/Format': 'STRUCTURAL',
  };
  return mapping[oldCategory] || 'FOUNDATIONAL';
}

function mapLevel(oldLevel: string): string {
  return oldLevel;
}

async function seedPatterns() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('engify');
    const collection = db.collection('patterns');

    // Delete existing patterns
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing patterns\n`);

    // Create unified patterns
    const unifiedPatterns = createUnifiedPatterns();
    console.log(
      `📝 Created ${unifiedPatterns.length} unified patterns from 3 sources\n`
    );

    // Validate each pattern with Zod
    const validatedPatterns = unifiedPatterns.map((pattern) => {
      // Add timestamps
      const withTimestamps = {
        ...pattern,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return PatternSchema.parse(withTimestamps);
    });

    console.log('✅ All patterns validated with Zod schema\n');

    // Insert into MongoDB
    const insertResult = await collection.insertMany(validatedPatterns);
    console.log(
      `✅ Inserted ${insertResult.insertedCount} patterns into MongoDB\n`
    );

    // Create indexes
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ level: 1 });
    await collection.createIndex({ name: 'text', description: 'text' });
    console.log(
      '✅ Created MongoDB indexes (id, category, level, text search)\n'
    );

    // Display summary
    console.log('📊 Summary:');
    console.log(`   Total patterns: ${validatedPatterns.length}`);
    console.log(
      `   Categories: ${new Set(validatedPatterns.map((p) => p.category)).size}`
    );
    console.log(
      `   Levels: ${new Set(validatedPatterns.map((p) => p.level)).size}`
    );
    console.log('\n✅ Pattern migration complete!\n');
  } catch (error) {
    console.error('❌ Error seeding patterns:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedPatterns()
  .then(() => {
    console.log('✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
