#!/usr/bin/env tsx
/**
 * Publish Pillar Page
 * 
 * Changes status from 'draft' to 'active' in MongoDB
 * Updates pillar-pages.ts config status to 'complete'
 * 
 * Usage:
 *   tsx scripts/content/publish-pillar-page.ts --id=ultimate-guide-ai-assisted-development
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { getPillarPage, PILLAR_PAGES } from '@/lib/data/pillar-pages';

async function publishPillarPage(pillarId: string) {
  const config = getPillarPage(pillarId);
  
  if (!config) {
    console.error(`❌ Pillar page not found: ${pillarId}`);
    console.log('\nAvailable pillar pages:');
    PILLAR_PAGES.forEach((p) => {
      console.log(`   - ${p.id} (${p.status}): ${p.title}`);
    });
    process.exit(1);
  }

  const db = await getMongoDb();
  const collection = db.collection('learning_resources');

  // Check if exists in DB
  const existing = await collection.findOne({ id: config.slug });
  
  if (!existing) {
    console.error(`❌ Pillar page not found in MongoDB: ${config.slug}`);
    console.log('   Run the generation script first:');
    console.log(`   pnpm tsx scripts/content/generate-pillar-page.ts --id=${pillarId} --no-images`);
    process.exit(1);
  }

  if (existing.status === 'active') {
    console.log(`✅ Pillar page is already published: ${config.slug}`);
    console.log(`   URL: https://engify.ai/learn/${config.slug}`);
    return;
  }

  // Update status to 'active'
  await collection.updateOne(
    { id: config.slug },
    {
      $set: {
        status: 'active',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 PILLAR PAGE PUBLISHED!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📄 Title: ${config.title}`);
  console.log(`📊 Word Count: ${existing.wordCount || 'N/A'} words`);
  console.log(`📋 Sections: ${existing.sections?.length || 'N/A'}`);
  console.log(`❓ FAQ Items: ${existing.faq?.length || 0}`);
  console.log('');
  console.log('🌐 URLs:');
  console.log(`   View: https://engify.ai/learn/${config.slug}`);
  console.log(`   Admin: https://engify.ai/api/admin/content/review`);
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Update pillar-pages.ts config status to "complete"');
  console.log('2. Test the page at the URL above');
  console.log('3. Run audit script if needed:');
  console.log(`   pnpm tsx scripts/content/audit-pillar-pages.ts --id=${pillarId}`);
  console.log('');
}

async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find((arg) => arg.startsWith('--id='));

  if (!idArg) {
    console.error('❌ No pillar page ID specified');
    console.log('\nUsage:');
    console.log('  tsx scripts/content/publish-pillar-page.ts --id=<pillar-id>');
    console.log('\nAvailable pillar pages:');
    PILLAR_PAGES.forEach((p) => {
      console.log(`   - ${p.id} (${p.status}): ${p.title}`);
    });
    process.exit(1);
  }

  const pillarId = idArg.split('=')[1];
  await publishPillarPage(pillarId);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

