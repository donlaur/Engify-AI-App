#!/usr/bin/env tsx
/**
 * Progress Tracker for Batch Operations
 * 
 * Shows progress of ongoing batch operations (audits, enrichments, etc.)
 * 
 * Usage:
 *   pnpm tsx scripts/content/track-progress.ts
 *   pnpm tsx scripts/content/track-progress.ts --type=audits
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';

async function trackProgress(type: 'audits' | 'enrichments' | 'all' = 'all') {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Operation Progress Tracker                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Get total prompts
  const totalPrompts = await db.collection('prompts').countDocuments({});
  console.log(`📋 Total Prompts: ${totalPrompts}\n`);

  // Get audit progress
  if (type === 'audits' || type === 'all') {
    const audits = await db.collection('prompt_audit_results')
      .aggregate([
        {
          $group: {
            _id: '$promptId',
            latestVersion: { $max: '$auditVersion' },
            latestDate: { $max: '$auditDate' },
            latestScore: { $last: '$overallScore' },
          }
        },
        {
          $group: {
            _id: null,
            totalAudited: { $sum: 1 },
            avgScore: { $avg: '$latestScore' },
            highScores: { $sum: { $cond: [{ $gte: ['$latestScore', 8] }, 1, 0] } },
            mediumScores: { $sum: { $cond: [{ $and: [{ $gte: ['$latestScore', 6] }, { $lt: ['$latestScore', 8] }] }, 1, 0] } },
            lowScores: { $sum: { $cond: [{ $lt: ['$latestScore', 6] }, 1, 0] } },
          }
        }
      ])
      .toArray();

    const auditStats = audits[0] || { totalAudited: 0, avgScore: 0, highScores: 0, mediumScores: 0, lowScores: 0 };
    const auditedCount = auditStats.totalAudited || 0;
    const notAudited = totalPrompts - auditedCount;
    const auditProgress = totalPrompts > 0 ? ((auditedCount / totalPrompts) * 100).toFixed(1) : '0';

    console.log('📊 AUDIT PROGRESS:');
    console.log(`   ✅ Audited: ${auditedCount}/${totalPrompts} (${auditProgress}%)`);
    console.log(`   ⏳ Not Audited: ${notAudited}`);
    console.log(`   📈 Average Score: ${(auditStats.avgScore || 0).toFixed(1)}/10`);
    console.log(`   🟢 High (8+): ${auditStats.highScores || 0}`);
    console.log(`   🟡 Medium (6-8): ${auditStats.mediumScores || 0}`);
    console.log(`   🔴 Low (<6): ${auditStats.lowScores || 0}\n`);
  }

  // Get enrichment progress
  if (type === 'enrichments' || type === 'all') {
    const enrichedPrompts = await db.collection('prompts').countDocuments({
      $or: [
        { caseStudies: { $exists: true, $ne: [], $not: { $size: 0 } } },
        { whatIs: { $exists: true, $ne: '' } },
        { whyUse: { $exists: true, $ne: [], $not: { $size: 0 } } },
        { metaDescription: { $exists: true, $ne: '' } },
      ]
    });

    const missingWhatIs = await db.collection('prompts').countDocuments({
      $or: [
        { whatIs: { $exists: false } },
        { whatIs: '' },
        { whatIs: { $regex: /^$/ } },
      ]
    });

    const missingWhyUse = await db.collection('prompts').countDocuments({
      $or: [
        { whyUse: { $exists: false } },
        { whyUse: [] },
        { whyUse: { $size: 0 } },
      ]
    });

    const missingMeta = await db.collection('prompts').countDocuments({
      $or: [
        { metaDescription: { $exists: false } },
        { metaDescription: '' },
      ]
    });

    const missingCaseStudies = await db.collection('prompts').countDocuments({
      $or: [
        { caseStudies: { $exists: false } },
        { caseStudies: [] },
        { caseStudies: { $size: 0 } },
      ]
    });

    console.log('✨ ENRICHMENT PROGRESS:');
    console.log(`   ✅ Enriched prompts: ${enrichedPrompts}/${totalPrompts}`);
    console.log(`   📖 Missing "What is": ${missingWhatIs}`);
    console.log(`   ❓ Missing "Why use": ${missingWhyUse}`);
    console.log(`   🔍 Missing meta description: ${missingMeta}`);
    console.log(`   📚 Missing case studies: ${missingCaseStudies}\n`);
  }

  // Get recent activity
  if (type === 'all') {
    const recentAudits = await db.collection('prompt_audit_results')
      .find({})
      .sort({ auditDate: -1 })
      .limit(5)
      .toArray();

    if (recentAudits.length > 0) {
      console.log('🕐 RECENT AUDITS:');
      recentAudits.forEach((audit, i) => {
        const date = new Date(audit.auditDate || audit.auditedAt).toLocaleString();
        console.log(`   ${i + 1}. ${audit.promptTitle || audit.promptId} - ${audit.overallScore}/10 (v${audit.auditVersion}) - ${date}`);
      });
      console.log('');
    }
  }

  await db.client.close();
}

const typeArg = process.argv.find(arg => arg.startsWith('--type='));
const type = typeArg ? typeArg.split('=')[1] as 'audits' | 'enrichments' | 'all' : 'all';

trackProgress(type)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

