/**
 * Create Database Indexes for Prompt Revisions
 * 
 * Creates indexes for optimal query performance
 */

import { getMongoDb } from '@/lib/db/mongodb';

async function createRevisionIndexes() {
  try {
    const db = await getMongoDb();
    
    console.log('📊 Creating database indexes for prompt revisions...');

    // Indexes for prompt_revisions collection
    const revisionsCollection = db.collection('prompt_revisions');

    console.log('\n📝 Creating indexes on prompt_revisions collection...');

    // Compound index for fetching revisions by promptId (most common query)
    await revisionsCollection.createIndex(
      { promptId: 1, revisionNumber: -1 },
      { name: 'idx_prompt_revisions_promptId_revisionNumber' }
    );
    console.log('  ✅ Created index: promptId + revisionNumber (desc)');

    // Index for date-based queries
    await revisionsCollection.createIndex(
      { createdAt: -1 },
      { name: 'idx_prompt_revisions_createdAt' }
    );
    console.log('  ✅ Created index: createdAt (desc)');

    // Index for finding revisions by user
    await revisionsCollection.createIndex(
      { changedBy: 1 },
      { name: 'idx_prompt_revisions_changedBy' }
    );
    console.log('  ✅ Created index: changedBy');

    // Index for finding revisions by change type
    await revisionsCollection.createIndex(
      { 'changes.changeType': 1 },
      { name: 'idx_prompt_revisions_changeType' }
    );
    console.log('  ✅ Created index: changes.changeType');

    // Indexes for prompts collection (new fields)
    const promptsCollection = db.collection('prompts');

    console.log('\n📋 Creating indexes on prompts collection...');

    // Compound index for freemium queries
    await promptsCollection.createIndex(
      { isPremium: 1, isPublic: 1, active: 1 },
      { name: 'idx_prompts_freemium' }
    );
    console.log('  ✅ Created index: isPremium + isPublic + active');

    // Index for revision-based queries
    await promptsCollection.createIndex(
      { currentRevision: -1 },
      { name: 'idx_prompts_currentRevision' }
    );
    console.log('  ✅ Created index: currentRevision (desc)');

    // Index for finding recently revised prompts
    await promptsCollection.createIndex(
      { lastRevisedAt: -1 },
      { name: 'idx_prompts_lastRevisedAt' }
    );
    console.log('  ✅ Created index: lastRevisedAt (desc)');

    // Index for finding prompts by reviser
    await promptsCollection.createIndex(
      { lastRevisedBy: 1 },
      { name: 'idx_prompts_lastRevisedBy' }
    );
    console.log('  ✅ Created index: lastRevisedBy');

    console.log('\n🎉 All indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    
    // Some indexes might already exist, check error message
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('ℹ️  Some indexes already exist, continuing...');
    } else {
      throw error;
    }
  }
}

// Run if executed directly
if (require.main === module) {
  createRevisionIndexes()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { createRevisionIndexes };


