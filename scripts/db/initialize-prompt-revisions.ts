/**
 * Initialize Revision Tracking for Existing Prompts
 * 
 * This script:
 * 1. Sets currentRevision: 1 on all existing prompts
 * 2. Optionally creates initial revision entries
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { createRevision } from '@/lib/db/schemas/prompt-revision';

async function initializeRevisions() {
  try {
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');
    const revisionsCollection = db.collection('prompt_revisions');

    console.log('📋 Initializing revision tracking for existing prompts...');

    // Step 1: Set currentRevision: 1 on all prompts that don't have it
    const updateResult = await promptsCollection.updateMany(
      {
        $or: [
          { currentRevision: { $exists: false } },
          { currentRevision: null },
        ],
      },
      {
        $set: {
          currentRevision: 1,
          lastRevisedAt: new Date(),
        },
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} prompts with currentRevision: 1`);

    // Step 2: Create initial revisions for prompts that don't have any
    const promptsWithoutRevisions = await promptsCollection
      .find({
        currentRevision: 1,
      })
      .toArray();

    console.log(`\n📝 Found ${promptsWithoutRevisions.length} prompts to create initial revisions for...`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const prompt of promptsWithoutRevisions) {
      const promptId = prompt.id || prompt._id.toString();

      // Check if revision already exists
      const existingRevision = await revisionsCollection.findOne({
        promptId,
        revisionNumber: 1,
      });

      if (existingRevision) {
        skippedCount++;
        continue;
      }

      // Create initial revision
      const revision = createRevision(
        promptId,
        {}, // No old prompt (initial creation)
        prompt, // New prompt
        prompt.authorId || 'system',
        'Initial creation'
      );

      await revisionsCollection.insertOne({
        ...revision,
        revisionNumber: 1,
        createdAt: prompt.createdAt || new Date(),
      });

      createdCount++;

      if (createdCount % 10 === 0) {
        console.log(`  Created ${createdCount} initial revisions...`);
      }
    }

    console.log(`\n✅ Created ${createdCount} initial revisions`);
    console.log(`⏭️  Skipped ${skippedCount} prompts (already have revisions)`);

    // Step 3: Set freemium defaults for prompts that don't have them
    const freemiumUpdateResult = await promptsCollection.updateMany(
      {
        $or: [
          { isPremium: { $exists: false } },
          { isPublic: { $exists: false } },
          { requiresAuth: { $exists: false } },
        ],
      },
      {
        $set: {
          isPremium: false,
          isPublic: true,
          requiresAuth: false,
        },
      }
    );

    console.log(`\n✅ Set freemium defaults for ${freemiumUpdateResult.modifiedCount} prompts`);

    console.log('\n🎉 Revision initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing revisions:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  initializeRevisions()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { initializeRevisions };

