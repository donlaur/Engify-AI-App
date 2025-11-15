#!/usr/bin/env tsx
/**
 * Unified Content Seeding Script
 *
 * DRY approach: One script to seed all content types to MongoDB
 *
 * Usage:
 *   pnpm tsx scripts/content/seed-all-content.ts
 *   pnpm tsx scripts/content/seed-all-content.ts --only=prompts
 *   pnpm tsx scripts/content/seed-all-content.ts --only=patterns,ai-adoption
 */

import { Db } from 'mongodb';
import { getMongoDb } from '@/lib/db/mongodb';

// Parse command line arguments
const args = process.argv.slice(2);
const onlyFlag = args.find((arg) => arg.startsWith('--only='));
const onlyTypes = onlyFlag ? onlyFlag.replace('--only=', '').split(',') : null;

interface Seeder {
  name: string;
  collection: string;
  type: string;
  seed: (db: Db) => Promise<{ inserted: number; deleted: number }>;
}

/**
 * Patterns Seeder
 */
async function seedPatterns(db: Db) {
  const { PATTERNS } = await import('../../src/lib/pattern-constants');
  const { patternDetails } = await import('../../src/data/pattern-details');
  const { promptPatterns } = await import('../../src/data/prompt-patterns');

  const collection = db.collection('patterns');

  // Merge pattern data from all 3 sources
  const unified = PATTERNS.map((pattern) => {
    const details = patternDetails.find((d) => d.id === pattern.id);
    const prompt = promptPatterns.find((p) => p.id === pattern.id);

    return {
      ...pattern,
      shortDescription: details?.shortDescription,
      fullDescription: details?.fullDescription,
      howItWorks: details?.howItWorks,
      bestPractices: details?.bestPractices || [],
      commonMistakes: details?.commonMistakes || [],
      example:
        prompt?.example ||
        (details?.example ? details.example.after : pattern.example),
      useCases: details?.whenToUse || pattern.useCases,
      relatedPatterns: details?.relatedPatterns || pattern.relatedPatterns,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const deleteResult = await collection.deleteMany({});
  const insertResult = await collection.insertMany(unified);

  return {
    inserted: insertResult.insertedCount,
    deleted: deleteResult.deletedCount,
  };
}

/**
 * AI Adoption Questions Seeder
 */
async function seedAIAdoptionQuestions(db: Db) {
  const { aiAdoptionQuestions } = await import(
    '../../src/data/content/ai-adoption-questions'
  );

  const collection = db.collection('learning_content');

  const learningContent = aiAdoptionQuestions.map((question) => ({
    type: 'ai_adoption_question',
    category: question.category,
    title: question.question,
    content: `
# ${question.question}

## Why This Matters
${question.why}

## How to Answer This Question
${question.howToAnswer.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Red Flags to Watch For
${question.redFlags.map((flag) => `⚠️ ${flag}`).join('\n')}

## Success Indicators
${question.successIndicators.map((indicator) => `✅ ${indicator}`).join('\n')}

${
  question.relatedFrameworks && question.relatedFrameworks.length > 0
    ? `
## Related Frameworks
${question.relatedFrameworks.map((fw) => `- ${fw}`).join('\n')}
`
    : ''
}
    `.trim(),
    tags: [
      'ai-adoption',
      'engineering-leadership',
      question.category.toLowerCase().replace(/\s+/g, '-'),
      ...question.howToAnswer
        .map((step) => {
          const terms = step
            .toLowerCase()
            .match(
              /\b(roi|cost|security|compliance|testing|team|workflow|vendor|strategy|metrics|culture)\b/g
            );
          return terms || [];
        })
        .flat(),
    ].filter((tag, index, self) => self.indexOf(tag) === index),
    metadata: {
      questionId: question.id,
      category: question.category,
      relatedFrameworks: question.relatedFrameworks || [],
      difficulty: 'intermediate',
      targetAudience: [
        'CTO',
        'VP Engineering',
        'Engineering Manager',
        'Director',
      ],
    },
    searchableText: `
      ${question.question}
      ${question.why}
      ${question.howToAnswer.join(' ')}
      ${question.redFlags.join(' ')}
      ${question.successIndicators.join(' ')}
    `.toLowerCase(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const deleteResult = await collection.deleteMany({
    type: 'ai_adoption_question',
  });
  const insertResult = await collection.insertMany(learningContent);

  return {
    inserted: insertResult.insertedCount,
    deleted: deleteResult.deletedCount,
  };
}

/**
 * Affiliate Links Seeder
 */
async function seedAffiliateLinks(db: Db) {
  const { affiliateLinks, partnershipOutreach } = await import(
    '../../src/data/affiliate-links'
  );

  const affiliateCollection = db.collection('affiliate_config');
  const outreachCollection = db.collection('partnership_outreach');

  const affiliateDeleteResult = await affiliateCollection.deleteMany({});
  const affiliateInsertResult =
    affiliateLinks.length > 0
      ? await affiliateCollection.insertMany(
          affiliateLinks.map((link) => ({
            ...link,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        )
      : { insertedCount: 0 };

  const outreachDeleteResult = await outreachCollection.deleteMany({});
  const outreachInsertResult =
    partnershipOutreach.length > 0
      ? await outreachCollection.insertMany(
          partnershipOutreach.map((outreach) => ({
            ...outreach,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        )
      : { insertedCount: 0 };

  return {
    inserted:
      affiliateInsertResult.insertedCount + outreachInsertResult.insertedCount,
    deleted:
      affiliateDeleteResult.deletedCount + outreachDeleteResult.deletedCount,
  };
}

/**
 * All Seeders Registry
 */
const seeders: Seeder[] = [
  {
    name: 'Patterns',
    collection: 'patterns',
    type: 'patterns',
    seed: seedPatterns,
  },
  {
    name: 'AI Adoption Questions',
    collection: 'learning_content',
    type: 'ai-adoption',
    seed: seedAIAdoptionQuestions,
  },
  {
    name: 'Affiliate Links',
    collection: 'affiliate_config, partnership_outreach',
    type: 'affiliate',
    seed: seedAffiliateLinks,
  },
];

/**
 * Main Seeding Function
 */
async function seedAllContent() {
  try {
    console.log('🌱 Starting content seeding...\n');
    
    const db = await getMongoDb();
    console.log('✅ Connected to MongoDB\n');

    // Filter seeders if --only flag is provided
    const activeSeeders = onlyTypes
      ? seeders.filter((s) => onlyTypes.includes(s.type))
      : seeders;

    if (activeSeeders.length === 0) {
      console.error('❌ No valid content types specified');
      console.log('\nAvailable types:');
      seeders.forEach((s) => console.log(`  - ${s.type}: ${s.name}`));
      process.exit(1);
    }

    console.log(`🌱 Seeding ${activeSeeders.length} content type(s)...\n`);

    const results = [];

    for (const seeder of activeSeeders) {
      console.log(`📦 ${seeder.name}...`);
      try {
        const result = await seeder.seed(db);
        results.push({
          name: seeder.name,
          collection: seeder.collection,
          ...result,
        });
        console.log(
          `   ✅ ${result.inserted} inserted, ${result.deleted} deleted\n`
        );
      } catch (error) {
        console.error(`   ❌ Error seeding ${seeder.name}:`, error);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Seeding Summary\n');
    results.forEach((r) => {
      console.log(`${r.name}:`);
      console.log(`  Collection: ${r.collection}`);
      console.log(`  Inserted: ${r.inserted}`);
      console.log(`  Deleted: ${r.deleted}`);
      console.log('');
    });

    const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);

    console.log(`Total: ${totalInserted} inserted, ${totalDeleted} deleted`);
    console.log('✨ Seeding complete!\n');
  } catch (error) {
    console.error('❌ Error seeding content:', error);
    process.exit(1);
  }
}

// Run the seeding
seedAllContent();
