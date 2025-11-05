/**
 * Check which prompts have revision history
 */

import { getMongoDb } from '@/lib/db/mongodb';

async function checkRevisionHistory() {
  try {
    const db = await getMongoDb();
    
    // Get all prompts with revision counts
    const revisionsCollection = db.collection('prompt_revisions');
    const promptsCollection = db.collection('prompts');
    
    // Get revision counts per prompt
    const revisionCounts = await revisionsCollection.aggregate([
      {
        $group: {
          _id: '$promptId',
          revisionCount: { $sum: 1 },
          latestRevision: { $max: '$revisionNumber' },
          latestDate: { $max: '$createdAt' },
        },
      },
      {
        $sort: { revisionCount: -1 },
      },
      {
        $limit: 20,
      },
    ]).toArray();
    
    console.log('📊 Prompts with Revision History:\n');
    
    if (revisionCounts.length === 0) {
      console.log('No revisions found in database.');
      return;
    }
    
    // Get prompt details for each
    for (const rev of revisionCounts) {
      const prompt = await promptsCollection.findOne({
        $or: [
          { id: rev._id },
          { slug: rev._id },
          { _id: rev._id },
        ],
      });
      
      if (prompt) {
        console.log(`✅ ${prompt.title}`);
        console.log(`   ID: ${prompt.id || prompt.slug || prompt._id}`);
        console.log(`   Revisions: ${rev.revisionCount} (Latest: v${rev.latestRevision})`);
        console.log(`   Last Updated: ${rev.latestDate ? new Date(rev.latestDate).toLocaleString() : 'N/A'}`);
        console.log(`   URL: /prompts/${prompt.id || prompt.slug || prompt._id}`);
        console.log('');
      }
    }
    
    // Summary
    const totalPromptsWithRevisions = revisionCounts.length;
    const totalRevisions = revisionCounts.reduce((sum, r) => sum + r.revisionCount, 0);
    
    // Check for prompts with multiple revisions (actual updates)
    const promptsWithMultipleRevisions = revisionCounts.filter(r => r.revisionCount > 1);
    
    console.log('\n📈 Summary:');
    console.log(`   Total prompts with revisions: ${totalPromptsWithRevisions}`);
    console.log(`   Total revisions: ${totalRevisions}`);
    console.log(`   Average revisions per prompt: ${(totalRevisions / totalPromptsWithRevisions).toFixed(2)}`);
    console.log(`   Prompts with multiple revisions: ${promptsWithMultipleRevisions.length}`);
    
    if (promptsWithMultipleRevisions.length > 0) {
      console.log('\n🔄 Prompts with Multiple Revisions (Actual Updates):');
      for (const rev of promptsWithMultipleRevisions.slice(0, 10)) {
        const prompt = await promptsCollection.findOne({
          $or: [
            { id: rev._id },
            { slug: rev._id },
            { _id: rev._id },
          ],
        });
        
        if (prompt) {
          console.log(`   ✅ ${prompt.title} - ${rev.revisionCount} revisions (Latest: v${rev.latestRevision})`);
        }
      }
    } else {
      console.log('\n💡 Note: All prompts currently have only initial revision (v1).');
      console.log('   Update a prompt to see revision history in action!');
    }
    
  } catch (error) {
    console.error('❌ Error checking revision history:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  checkRevisionHistory()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { checkRevisionHistory };

