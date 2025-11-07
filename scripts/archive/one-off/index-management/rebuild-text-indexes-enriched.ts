#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Rebuild Text Indexes with Enriched Fields
 * 
 * Drops and recreates text indexes to include enriched prompt fields:
 * - caseStudies
 * - whatIs
 * - whyUse
 * - examples
 * - useCases
 * - bestPractices
 * - seoKeywords
 * - metaDescription
 * - whenNotToUse
 * 
 * This ensures RAG search includes all enriched content for better results.
 * 
 * Usage:
 *   tsx scripts/admin/rebuild-text-indexes-enriched.ts
 * 
 * For production MongoDB Atlas:
 *   tsx scripts/admin/ensure-text-indexes-atlas.ts <MONGODB_URI>
 */

import { getDb } from '@/lib/mongodb';

async function rebuildEnrichedIndexes() {
  console.log('🔍 Rebuilding text indexes with enriched fields...\n');

  try {
    const db = await getDb();
    const promptsCollection = db.collection('prompts');
    
    // Drop existing text index
    console.log('Dropping existing prompts text index...');
    try {
      const indexes = await promptsCollection.indexes();
      const textIndex = indexes.find((idx: any) => idx.textIndexVersion !== undefined);
      if (textIndex) {
        await promptsCollection.dropIndex(textIndex.name);
        console.log(`✅ Dropped old index: ${textIndex.name}\n`);
      } else {
        console.log('ℹ️  No existing text index found\n');
      }
    } catch (error: any) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️  No existing text index to drop\n');
      } else {
        throw error;
      }
    }

    // Create new index with enriched fields
    console.log('Creating new text index with enriched fields...');
    await promptsCollection.createIndex(
      {
        title: 'text',
        description: 'text',
        content: 'text',
        tags: 'text',
        // Enriched fields for better RAG search
        whatIs: 'text',
        whyUse: 'text',
        metaDescription: 'text',
        seoKeywords: 'text',
        caseStudies: 'text',
        examples: 'text',
        useCases: 'text',
        bestPractices: 'text',
        whenNotToUse: 'text',
      },
      {
        name: 'prompts_text_search',
        weights: {
          title: 10,
          description: 8,
          content: 5,
          whatIs: 6,
          whyUse: 5,
          metaDescription: 4,
          seoKeywords: 3,
          caseStudies: 4,
          examples: 4,
          useCases: 5,
          bestPractices: 4,
          whenNotToUse: 3,
          tags: 2,
        },
        default_language: 'english',
      }
    );
    console.log('✅ New enriched text index created!\n');

    // Verify index
    const indexes = await promptsCollection.indexes();
    const newIndex = indexes.find((idx: any) => idx.name === 'prompts_text_search');
    if (newIndex) {
      console.log('📋 Index details:');
      console.log(JSON.stringify(newIndex, null, 2));
    }

    console.log('\n✅ Text index rebuilt with enriched fields!');
    console.log('\n💡 The RAG system will now search:');
    console.log('   - Case studies');
    console.log('   - What is / Why use explanations');
    console.log('   - SEO keywords and meta descriptions');
    console.log('   - Examples and use cases');
    console.log('   - Best practices');
    console.log('   - And all original fields (title, description, content, tags)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error rebuilding text indexes:', error);
    process.exit(1);
  }
}

rebuildEnrichedIndexes();

