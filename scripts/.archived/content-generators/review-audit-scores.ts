#!/usr/bin/env tsx
/**
 * Review Audit Scores
 * Check top scores and analyze if scoring is too lenient
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';

async function reviewAuditScores() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Audit Score Review                                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Get top scores
  const topScores = await db.collection('prompt_audit_results')
    .find({})
    .sort({ overallScore: -1 })
    .limit(20)
    .toArray();

  console.log('📊 TOP 20 SCORES:\n');
  topScores.forEach((audit, i) => {
    console.log(`${i + 1}. ${audit.overallScore}/10 - ${audit.promptTitle || audit.promptId}`);
    console.log(`   Version: ${audit.auditVersion} | Issues: ${audit.issues?.length || 0} | Missing: ${audit.missingElements?.length || 0}`);
    if (audit.categoryScores) {
      console.log(`   Eng: ${audit.categoryScores.engineeringUsefulness} | Complete: ${audit.categoryScores.completeness} | Cases: ${audit.categoryScores.caseStudyQuality}`);
    }
    console.log('');
  });

  // Get score distribution
  const allAudits = await db.collection('prompt_audit_results')
    .aggregate([
      {
        $group: {
          _id: '$promptId',
          latestScore: { $max: '$overallScore' },
          latestVersion: { $max: '$auditVersion' },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgScore: { $avg: '$latestScore' },
          scoresAbove9: { $sum: { $cond: [{ $gte: ['$latestScore', 9] }, 1, 0] } },
          scoresAbove8: { $sum: { $cond: [{ $gte: ['$latestScore', 8] }, 1, 0] } },
          scoresAbove7: { $sum: { $cond: [{ $gte: ['$latestScore', 7] }, 1, 0] } },
          scoresAbove6: { $sum: { $cond: [{ $gte: ['$latestScore', 6] }, 1, 0] } },
          scoresBelow6: { $sum: { $cond: [{ $lt: ['$latestScore', 6] }, 1, 0] } },
          scoresBelow5: { $sum: { $cond: [{ $lt: ['$latestScore', 5] }, 1, 0] } },
        }
      }
    ])
    .toArray();

  const stats = allAudits[0] || {};
  console.log('📈 SCORE DISTRIBUTION (Latest Version per Prompt):\n');
  console.log(`Total Prompts Audited: ${stats.total || 0}`);
  console.log(`Average Score: ${(stats.avgScore || 0).toFixed(1)}/10`);
  console.log(`\nScore Ranges:`);
  console.log(`  9.0+: ${stats.scoresAbove9 || 0} prompts`);
  console.log(`  8.0+: ${stats.scoresAbove8 || 0} prompts`);
  console.log(`  7.0+: ${stats.scoresAbove7 || 0} prompts`);
  console.log(`  6.0+: ${stats.scoresAbove6 || 0} prompts`);
  console.log(`  Below 6.0: ${stats.scoresBelow6 || 0} prompts`);
  console.log(`  Below 5.0: ${stats.scoresBelow5 || 0} prompts`);

  // Check prompts with multiple versions
  const multiVersion = await db.collection('prompt_audit_results')
    .aggregate([
      {
        $group: {
          _id: '$promptId',
          versions: { $sum: 1 },
          latestScore: { $max: '$overallScore' },
          latestVersion: { $max: '$auditVersion' },
          promptTitle: { $first: '$promptTitle' },
        }
      },
      {
        $match: {
          versions: { $gt: 1 }
        }
      },
      {
        $sort: { latestScore: -1 }
      },
      {
        $limit: 10
      }
    ])
    .toArray();

  console.log('\n\n🔄 PROMPS WITH MULTIPLE VERSIONS (Top 10 by Score):\n');
  multiVersion.forEach((prompt, i) => {
    console.log(`${i + 1}. ${prompt.promptTitle || prompt._id}`);
    console.log(`   Versions: ${prompt.versions} | Latest: v${prompt.latestVersion} | Score: ${prompt.latestScore}/10`);
  });

  await db.client.close();
}

reviewAuditScores()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

