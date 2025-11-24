/**
 * Verify Article Slugs
 * 
 * Checks if pillar articles exist in MongoDB with correct slugs
 * and reports any mismatches or missing articles
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Bypass BUILD_MODE check for database scripts
process.env.NODE_ENV = 'development';
process.env.NEXT_PHASE = undefined;

import { getMongoDb } from '@/lib/db/mongodb';

const REQUIRED_ARTICLES = [
  {
    slug: 'ai-upskilling-program-for-engineering-teams',
    title: 'AI Upskilling Program for Engineering Teams',
  },
  {
    slug: 'building-an-ai-first-engineering-organization',
    title: 'Building an AI-First Engineering Organization',
  },
  {
    slug: 'ultimate-guide-to-ai-assisted-software-development',
    title: 'Ultimate Guide to AI-Assisted Software Development',
  },
  {
    slug: 'context-engineering-vs-prompt-engineering',
    title: 'Context Engineering vs Prompt Engineering',
  },
];

async function verifyArticleSlugs() {
  console.log('🔍 Verifying article slugs in MongoDB...\n');

  try {
    const db = await getMongoDb();
    const collection = db.collection('learning_resources');

    const results = [];

    for (const article of REQUIRED_ARTICLES) {
      const doc = await collection.findOne({
        'seo.slug': article.slug,
        status: 'active',
      });

      if (doc) {
        console.log(`✅ Found: ${article.slug}`);
        console.log(`   Title: ${doc.title}`);
        console.log(`   Status: ${doc.status}`);
        console.log(`   Published: ${doc.publishedAt ? new Date(doc.publishedAt).toLocaleDateString() : 'Not published'}\n`);
        results.push({ slug: article.slug, exists: true, doc });
      } else {
        console.log(`❌ Missing: ${article.slug}`);
        console.log(`   Expected title: ${article.title}\n`);
        results.push({ slug: article.slug, exists: false });
      }
    }

    // Check for similar slugs
    console.log('\n🔍 Checking for similar slugs...\n');
    for (const article of REQUIRED_ARTICLES) {
      const similar = await collection
        .find({
          title: { $regex: article.title, $options: 'i' },
          status: 'active',
        })
        .toArray();

      if (similar.length > 0) {
        console.log(`⚠️  Found similar articles for "${article.title}":`);
        similar.forEach((doc) => {
          console.log(`   Slug: ${doc.seo?.slug || 'N/A'}`);
          console.log(`   Title: ${doc.title}`);
          console.log(`   Current slug: ${doc.seo?.slug}`);
          console.log(`   Expected slug: ${article.slug}`);
          if (doc.seo?.slug !== article.slug) {
            console.log(`   ⚠️  SLUG MISMATCH!\n`);
          } else {
            console.log(`   ✅ Slug matches\n`);
          }
        });
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    const found = results.filter((r) => r.exists).length;
    const missing = results.filter((r) => !r.exists).length;
    console.log(`   Found: ${found}/${REQUIRED_ARTICLES.length}`);
    console.log(`   Missing: ${missing}/${REQUIRED_ARTICLES.length}`);

    if (missing > 0) {
      console.log('\n❌ Missing articles:');
      results
        .filter((r) => !r.exists)
        .forEach((r) => {
          console.log(`   - ${r.slug}`);
        });
      console.log('\n💡 Action required: Create these articles in MongoDB or create static pages');
    }

    process.exit(missing > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Error verifying article slugs:', error);
    process.exit(1);
  }
}

verifyArticleSlugs();

