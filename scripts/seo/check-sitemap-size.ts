#!/usr/bin/env tsx
/**
 * Sitemap Size Calculator
 * Counts how many URLs are in the sitemap
 */

// IMPORTANT: Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getDb } from '@/lib/mongodb';
import { APP_URL } from '@/lib/constants';
import { getPromptSlug } from '@/lib/utils/slug';

async function calculateSitemapSize() {
  const baseUrl = APP_URL;
  const now = new Date();

  console.log('📊 Calculating Sitemap Size...\n');

  // Static pages count
  const staticPages = [
    baseUrl,
    `${baseUrl}/prompts`,
    `${baseUrl}/patterns`,
    `${baseUrl}/learn`,
    `${baseUrl}/learn/prompt-engineering-masterclass`,
    `${baseUrl}/learn/chain-of-thought-guide`,
    `${baseUrl}/learn/code-generation-guide`,
    `${baseUrl}/kernel`,
    `${baseUrl}/built-in-public`,
    `${baseUrl}/workbench`,
    `${baseUrl}/workbench/multi-agent`,
    `${baseUrl}/tags`,
    `${baseUrl}/audit`,
  ];

  const rolePages = [
    `${baseUrl}/for-c-level`,
    `${baseUrl}/for-directors`,
    `${baseUrl}/for-managers`,
    `${baseUrl}/for-engineers`,
    `${baseUrl}/for-pms`,
    `${baseUrl}/for-designers`,
    `${baseUrl}/for-qa`,
    `${baseUrl}/for-security-engineers`,
    `${baseUrl}/for-data-scientists`,
    `${baseUrl}/for-technical-writers`,
  ];

  const utilityPages = [
    `${baseUrl}/pricing`,
    `${baseUrl}/about`,
    `${baseUrl}/contact`,
    `${baseUrl}/terms`,
    `${baseUrl}/privacy`,
  ];

  console.log(`✅ Static Pages: ${staticPages.length}`);
  console.log(`✅ Role Pages: ${rolePages.length}`);
  console.log(`✅ Utility Pages: ${utilityPages.length}`);

  // Count prompts
  let promptCount = 0;
  let categoryCount = 0;
  let roleCount = 0;
  let tagCount = 0;
  try {
    const db = await getDb();
    const promptsCollection = await db.collection('prompts').find({}).toArray();
    promptCount = promptsCollection.length;

    const categories = Array.from(
      new Set(promptsCollection.map((p: any) => p.category).filter(Boolean))
    );
    categoryCount = categories.length;

    const roles = Array.from(
      new Set(promptsCollection.map((p: any) => p.role).filter(Boolean))
    );
    roleCount = roles.length;

    const allTags = Array.from(
      new Set(promptsCollection.flatMap((p: any) => p.tags || []).filter(Boolean))
    );
    tagCount = allTags.length;

    console.log(`✅ Prompts: ${promptCount}`);
    console.log(`✅ Category Pages: ${categoryCount}`);
    console.log(`✅ Role Filter Pages: ${roleCount}`);
    console.log(`✅ Tag Pages: ${tagCount}`);
  } catch (error) {
    console.error('❌ Failed to fetch prompts:', error);
  }

  // Count patterns
  let patternCount = 0;
  try {
    const db = await getDb();
    const patternsCollection = await db.collection('patterns').find({}).toArray();
    patternCount = patternsCollection.length;
    console.log(`✅ Patterns: ${patternCount}`);
  } catch (error) {
    console.error('❌ Failed to fetch patterns:', error);
  }

  // Count learning resources
  let learnCount = 0;
  try {
    const db = await getDb();
    const learningResources = await db
      .collection('learning_resources')
      .find({
        status: 'active',
        'seo.slug': { $exists: true, $ne: null },
      })
      .toArray();
    learnCount = learningResources.length;
    console.log(`✅ Learning Resources: ${learnCount}`);
  } catch (error) {
    console.error('❌ Failed to fetch learning resources:', error);
  }

  // Calculate total
  const total =
    staticPages.length +
    rolePages.length +
    utilityPages.length +
    promptCount +
    categoryCount +
    roleCount +
    tagCount +
    patternCount +
    learnCount;

  console.log('\n' + '='.repeat(50));
  console.log(`📈 TOTAL SITEMAP SIZE: ${total.toLocaleString()} URLs`);
  console.log('='.repeat(50));

  console.log('\n📋 Breakdown:');
  console.log(`   Static Pages: ${staticPages.length}`);
  console.log(`   Role Pages: ${rolePages.length}`);
  console.log(`   Utility Pages: ${utilityPages.length}`);
  console.log(`   Prompt Pages: ${promptCount.toLocaleString()}`);
  console.log(`   Pattern Pages: ${patternCount.toLocaleString()}`);
  console.log(`   Learn Pages: ${learnCount.toLocaleString()}`);
  console.log(`   Category Pages: ${categoryCount}`);
  console.log(`   Role Filter Pages: ${roleCount}`);
  console.log(`   Tag Pages: ${tagCount}`);
  console.log(`   ─────────────────────`);
  console.log(`   TOTAL: ${total.toLocaleString()} URLs`);

  // Estimate file size (rough calculation)
  // Average URL length ~60 chars + metadata ~100 chars = ~160 chars per entry
  const estimatedBytes = total * 160;
  const estimatedKB = estimatedBytes / 1024;
  const estimatedMB = estimatedKB / 1024;

  console.log('\n💾 Estimated File Size:');
  console.log(`   ${estimatedBytes.toLocaleString()} bytes`);
  console.log(`   ${estimatedKB.toFixed(2)} KB`);
  console.log(`   ${estimatedMB.toFixed(3)} MB`);

  // Sitemap limits
  console.log('\n⚠️  Sitemap Limits:');
  console.log('   - Max URLs per sitemap: 50,000');
  console.log('   - Max file size: 50 MB (uncompressed)');
  console.log(`   - Current: ${total.toLocaleString()} URLs (${((total / 50000) * 100).toFixed(1)}% of limit)`);

  if (total > 50000) {
    console.log('\n🚨 WARNING: Sitemap exceeds 50,000 URL limit!');
    console.log('   Consider splitting into multiple sitemaps.');
  } else if (total > 40000) {
    console.log('\n⚠️  WARNING: Approaching 50,000 URL limit.');
    console.log('   Consider implementing sitemap indexing soon.');
  } else {
    console.log('\n✅ Sitemap size is within limits.');
  }
}

calculateSitemapSize().catch(console.error);

