#!/usr/bin/env tsx
/**
 * Populate Missing Pattern Data
 * 
 * Adds missing example and useCases fields to patterns in MongoDB
 * Uses data from src/data/prompt-patterns.ts as source
 * 
 * Usage:
 *   tsx scripts/db/populate-pattern-data.ts
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getDb } from '@/lib/mongodb';
import { promptPatterns } from '@/data/prompt-patterns';
import { logger } from '@/lib/logging/logger';

/**
 * Mapping from old pattern IDs to new MongoDB IDs
 * Some patterns may have different IDs in MongoDB
 */
const PATTERN_ID_MAPPING: Record<string, string[]> = {
  'chain-of-thought': ['chain-of-thought', 'chain-of-thought-prompting'],
  'few-shot': ['few-shot', 'few-shot-learning'],
  'persona': ['persona', 'audience-persona'],
  'audience': ['audience-persona', 'persona'],
  rag: ['rag', 'retrieval-augmented-generation', 'retrieval-augmented'],
  'retrieval-augmented': ['rag', 'retrieval-augmented-generation', 'retrieval-augmented'],
};

/**
 * Generate use cases from pattern description
 */
function generateUseCases(patternId: string, description: string): string[] {
  const useCases: Record<string, string[]> = {
    'chain-of-thought': [
      'Complex problems requiring multi-step reasoning',
      'You need to verify the AI\'s logic',
      'Mathematical or logical problems',
    ],
    'cognitive-verifier': [
      'Critical decisions where accuracy matters',
      'You need to verify AI reasoning',
      'Complex problem-solving scenarios',
    ],
    'hypothesis-testing': [
      'Exploratory problem-solving',
      'Multiple plausible solutions exist',
      'Need to evaluate different approaches',
    ],
    rag: [
      'Need up-to-date information',
      'Working with domain-specific knowledge',
      'Want to ground AI responses in facts',
    ],
    'reverse-engineering': [
      'Understanding complex outputs',
      'Need to explain AI reasoning',
      'Debugging AI-generated solutions',
    ],
    'audience-persona': [
      'Tailoring responses for specific audiences',
      'Need role-appropriate communication',
      'Creating content for different skill levels',
    ],
  };

  return useCases[patternId] || [
    'Complex problem-solving scenarios',
    'When you need structured responses',
    'Professional or technical contexts',
  ];
}

/**
 * Generate example from pattern description
 */
function generateExample(patternId: string, description: string): string {
  const examples: Record<string, string> = {
    'chain-of-thought': "Let's think step by step:\n1. First, identify the problem\n2. Then, break it down into components\n3. Finally, solve each component systematically",
    'cognitive-verifier': 'Before proceeding, let me verify my reasoning:\n- Is this assumption correct?\n- Are there alternative explanations?\n- What evidence supports this?',
    'hypothesis-testing': 'Let me explore multiple hypotheses:\nHypothesis 1: [explanation]\nHypothesis 2: [explanation]\nHypothesis 3: [explanation]\nBased on evidence, Hypothesis X is most likely.',
    rag: 'Based on the following context from [knowledge base]:\n[Retrieved information]\n\nUsing this information, [your question/request]',
    'reverse-engineering': 'Given this solution, let me work backwards:\n- What assumptions were made?\n- What steps led to this conclusion?\n- What was the reasoning process?',
    'audience-persona': 'You are a senior software architect with 10 years of experience.\n\nExplain [topic] to a junior developer:\n[Response tailored for junior audience]',
  };

  return examples[patternId] || description;
}

async function populatePatternData() {
  try {
    const db = await getDb();
    const collection = db.collection('patterns');

    logger.info('Starting pattern data population...');

    // Get all patterns from MongoDB
    const mongoPatterns = await collection.find({}).toArray();
    logger.info(`Found ${mongoPatterns.length} patterns in MongoDB`);

    let updated = 0;
    let skipped = 0;

    for (const mongoPattern of mongoPatterns) {
      const patternId = mongoPattern.id || mongoPattern._id?.toString();
      if (!patternId) {
        logger.warn('Pattern missing ID, skipping', { pattern: mongoPattern });
        skipped++;
        continue;
      }

      // Check if pattern already has example and useCases
      const hasExample = mongoPattern.example && typeof mongoPattern.example === 'string' && mongoPattern.example.length > 0;
      const hasUseCases = mongoPattern.useCases && Array.isArray(mongoPattern.useCases) && mongoPattern.useCases.length > 0;

      if (hasExample && hasUseCases) {
        logger.debug(`Pattern ${patternId} already has example and useCases, skipping`);
        skipped++;
        continue;
      }

      // Try to find matching pattern in old data
      const oldPattern = promptPatterns.find(
        (p) => p.id === patternId || PATTERN_ID_MAPPING[p.id]?.includes(patternId)
      );

      const updates: Record<string, unknown> = {};

      // Add example if missing
      if (!hasExample) {
        if (oldPattern?.example) {
          updates.example = oldPattern.example;
        } else {
          updates.example = generateExample(patternId, mongoPattern.description || '');
        }
      }

      // Add useCases if missing
      if (!hasUseCases) {
        updates.useCases = generateUseCases(patternId, mongoPattern.description || '');
      }

      if (Object.keys(updates).length > 0) {
        await collection.updateOne(
          { id: patternId },
          {
            $set: {
              ...updates,
              updatedAt: new Date(),
            },
          }
        );
        logger.info(`Updated pattern ${patternId}`, { updates });
        updated++;
      }
    }

    logger.info(`Pattern data population complete!`, {
      total: mongoPatterns.length,
      updated,
      skipped,
    });

    return { total: mongoPatterns.length, updated, skipped };
  } catch (error) {
    logger.error('Failed to populate pattern data', { error });
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  populatePatternData()
    .then((result) => {
      console.log('✅ Pattern data population complete!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to populate pattern data:', error);
      process.exit(1);
    });
}

export { populatePatternData };

