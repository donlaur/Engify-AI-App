/**
 * Fix Context Engineering Article Slug
 * 
 * Updates the slug in MongoDB to match the expected slug
 * from: context-engineering-vs-prompt-engineering-what-s-the-difference
 * to: context-engineering-vs-prompt-engineering
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Bypass BUILD_MODE check for database scripts
process.env.NODE_ENV = 'development';
process.env.NEXT_PHASE = undefined;

import { getMongoDb } from '@/lib/db/mongodb';

async function fixContextEngineeringSlug() {
  console.log('🔧 Fixing context engineering article slug...\n');

  try {
    const db = await getMongoDb();
    const collection = db.collection('learning_resources');

    // Find the article with the old slug
    const oldSlug = 'context-engineering-vs-prompt-engineering-what-s-the-difference';
    const newSlug = 'context-engineering-vs-prompt-engineering';

    const article = await collection.findOne({
      'seo.slug': oldSlug,
      status: 'active',
    });

    if (!article) {
      console.log(`❌ Article with slug "${oldSlug}" not found`);
      console.log('💡 Checking if article with new slug already exists...\n');
      
      const existing = await collection.findOne({
        'seo.slug': newSlug,
        status: 'active',
      });

      if (existing) {
        console.log('✅ Article with new slug already exists!');
        console.log(`   Title: ${existing.title}`);
        process.exit(0);
      } else {
        console.log('❌ Article not found with either slug');
        process.exit(1);
      }
    }

    console.log(`📄 Found article: ${article.title}`);
    console.log(`   Current slug: ${article.seo?.slug}`);
    console.log(`   New slug: ${newSlug}\n`);

    // Update the slug
    const result = await collection.updateOne(
      { 'seo.slug': oldSlug },
      {
        $set: {
          'seo.slug': newSlug,
          'seo.canonicalUrl': `https://engify.ai/learn/${newSlug}`,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated slug!');
      console.log(`   Modified ${result.modifiedCount} document(s)\n`);
      
      // Verify the update
      const updated = await collection.findOne({
        'seo.slug': newSlug,
        status: 'active',
      });
      
      if (updated) {
        console.log('✅ Verification: Article found with new slug');
        console.log(`   Title: ${updated.title}`);
        console.log(`   Slug: ${updated.seo?.slug}`);
        console.log(`   Canonical URL: ${updated.seo?.canonicalUrl}\n`);
      }
    } else {
      console.log('⚠️  No documents were modified');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing slug:', error);
    process.exit(1);
  }
}

fixContextEngineeringSlug();

