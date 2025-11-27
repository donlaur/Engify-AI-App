#!/usr/bin/env tsx
/**
 * Migrate Published Articles
 * 
 * Migrates published articles from generated_content to learning_resources
 * and regenerates the JSON file.
 * 
 * Usage:
 *   tsx scripts/migrate-published-articles.ts [slug]
 * 
 * If slug is provided, only migrates that specific article.
 * Otherwise, migrates all published articles.
 */

// Allow database operations in scripts
process.env.NODE_ENV = 'development';
process.env.ALLOW_DB_OPERATIONS = 'true';
process.env.NEXT_PHASE = undefined;
process.env.VERCEL_ENV = undefined;

import { getDb } from '@/lib/mongodb';
import { generatedContentService } from '@/lib/services/GeneratedContentService';
import { generateLearningResourcesJson } from '@/lib/learning/generate-learning-json';
import { marked } from 'marked';
import { ObjectId } from 'mongodb';

// Map contentType to learning resource type
const typeMap: Record<string, 'article' | 'guide' | 'tutorial'> = {
  'pillar-page': 'article',
  'hub-spoke': 'article',
  'tutorial': 'tutorial',
  'guide': 'guide',
  'news': 'article',
  'case-study': 'article',
  'comparison': 'article',
  'best-practices': 'guide',
};

// Determine level from category or default to intermediate
const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
  'beginner': 'beginner',
  'intermediate': 'intermediate',
  'advanced': 'advanced',
};

async function migrateArticle(content: any) {
  // Generate slug if not exists
  const slug = content.slug || content.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Generate URL based on category for SEO-rich structure
  const categoryMap: Record<string, string> = {
    'ai-sdlc': 'ai-sdlc',
    'agile': 'agile',
    'workflows': 'workflows',
    'tools': 'ai-tools',
    'models': 'ai-models',
    'wsjf': 'wsjf',
    'wsjf-spokes': 'wsjf',
  };
  const categoryPath = categoryMap[content.category || ''] || content.category || '';
  const url = categoryPath ? `/learn/${categoryPath}/${slug}` : `/learn/${slug}`;

  // Convert markdown to HTML
  const contentHtml = marked(content.content, { breaks: true });

  // Determine level
  const level = levelMap[content.category?.toLowerCase() || ''] || 'intermediate';

  // Check if article already exists in learning_resources
  const db = await getDb();
  const learningResourcesCollection = db.collection('learning_resources');
  const existing = await learningResourcesCollection.findOne({
    'seo.slug': slug,
    organizationId: null,
  });

  if (existing) {
    console.log(`⚠️  Article already exists in learning_resources: ${slug}`);
    console.log(`   Updating existing article...`);
    
    // Update existing article
    await learningResourcesCollection.updateOne(
      { 'seo.slug': slug, organizationId: null },
      {
        $set: {
          title: content.title,
          description: content.description || content.title,
          category: content.category || 'Tutorial',
          type: typeMap[content.contentType] || 'article',
          level,
          tags: content.keywords || [],
          author: content.createdBy || 'Engify.ai Team',
          contentHtml,
          seo: {
            metaTitle: content.title,
            metaDescription: content.description || content.title,
            keywords: content.keywords || [],
            slug,
            canonicalUrl: `https://engify.ai${url}`,
          },
          updatedAt: new Date(),
        },
      }
    );
    console.log(`✅ Updated article: ${slug}`);
    return;
  }

  // Create new article
  const learningResourceId = new ObjectId().toString();
  const now = new Date();
  const publishedAt = content.publishedAt || now;

  await learningResourcesCollection.insertOne({
    id: learningResourceId,
    title: content.title,
    description: content.description || content.title,
    category: content.category || 'Tutorial',
    type: typeMap[content.contentType] || 'article',
    level,
    tags: content.keywords || [],
    author: content.createdBy || 'Engify.ai Team',
    featured: false,
    status: 'active',
    contentHtml,
    organizationId: null, // Public content
    seo: {
      metaTitle: content.title,
      metaDescription: content.description || content.title,
      keywords: content.keywords || [],
      slug,
      canonicalUrl: `https://engify.ai${url}`,
    },
    views: 0,
    shares: 0,
    publishedAt,
    createdAt: now,
    updatedAt: now,
  } as any);

  console.log(`✅ Migrated article: ${slug}`);
  console.log(`   URL: ${url}`);
}

async function main() {
  const slugArg = process.argv[2];

  try {
    console.log('🚀 Migrating published articles...\n');

    // Get all published content
    const publishedContent = await generatedContentService.getAll({
      status: 'published',
    });

    if (publishedContent.length === 0) {
      console.log('ℹ️  No published content found in generated_content');
      return;
    }

    console.log(`📝 Found ${publishedContent.length} published article(s)\n`);

    let migrated = 0;
    let skipped = 0;

    for (const content of publishedContent) {
      const slug = content.slug || content.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // If slug arg provided, only migrate that article
      if (slugArg && slug !== slugArg) {
        skipped++;
        continue;
      }

      try {
        await migrateArticle(content);
        migrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate article "${content.title}":`, error);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);

    if (migrated > 0) {
      console.log(`\n🔄 Regenerating JSON file...`);
      await generateLearningResourcesJson();
      console.log(`✅ JSON file regenerated`);
    }

    console.log(`\n✅ Migration complete!`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);


