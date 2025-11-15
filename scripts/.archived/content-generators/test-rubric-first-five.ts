/**
 * Test Rubric: Audit First 5 Prompts
 * Compares scores with the updated rubric
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';

async function auditFirstFive() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Testing Updated Rubric: First 5 Prompts                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();
  const auditor = new PromptPatternAuditor('system');

  // Get first 5 prompts
  const prompts = await db.collection('prompts')
    .find({})
    .limit(5)
    .sort({ createdAt: 1 })
    .toArray();

  console.log(`📋 Found ${prompts.length} prompts to audit\n`);

  const results: Array<{
    id: string;
    title: string;
    overallScore: number;
    categoryScores: any;
    needsFix: boolean;
    issues: string[];
    recommendations: string[];
    missingElements: string[];
  }> = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`\n[${i + 1}/${prompts.length}] Auditing: ${prompt.title || prompt.id}`);
    console.log(`   ID: ${prompt.id}`);
    
    // Get previous audit score for comparison
    const previousAudit = await db.collection('prompt_audit_results')
      .findOne(
        { promptId: prompt.id },
        { sort: { auditVersion: -1 } }
      );

    try {
      const startTime = Date.now();
      const auditResult = await auditor.auditPrompt(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      // Save new audit result
      const existingAudit = await db.collection('prompt_audit_results').findOne(
        { promptId: prompt.id },
        { sort: { auditVersion: -1 } }
      );
      const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
      const auditDate = new Date();

      await db.collection('prompt_audit_results').insertOne({
        promptId: prompt.id,
        promptTitle: prompt.title,
        auditVersion,
        auditDate,
        overallScore: auditResult.overallScore,
        categoryScores: auditResult.categoryScores,
        agentReviews: auditResult.agentReviews,
        issues: auditResult.issues,
        recommendations: auditResult.recommendations,
        missingElements: auditResult.missingElements,
        needsFix: auditResult.needsFix,
        auditedAt: auditDate,
        auditedBy: 'system',
        createdAt: auditDate,
        updatedAt: auditDate,
      });

      const previousScore = previousAudit?.overallScore || null;
      const scoreChange = previousScore ? (auditResult.overallScore - previousScore).toFixed(1) : 'N/A';
      const changeIndicator = previousScore 
        ? (auditResult.overallScore > previousScore ? '📈' : auditResult.overallScore < previousScore ? '📉' : '➡️')
        : '✨';

      console.log(`   ✅ Score: ${auditResult.overallScore}/10 ${changeIndicator} ${previousScore ? `(was ${previousScore})` : '(new)'} ${scoreChange !== 'N/A' ? `[${scoreChange > 0 ? '+' : ''}${scoreChange}]` : ''}`);
      console.log(`   Status: ${auditResult.needsFix ? '⚠️  NEEDS FIX' : '✅ GOOD'}`);
      console.log(`   Duration: ${duration}s`);
      console.log(`   Issues: ${auditResult.issues.length} | Recommendations: ${auditResult.recommendations.length} | Missing: ${auditResult.missingElements.length}`);

      results.push({
        id: prompt.id,
        title: prompt.title || 'Untitled',
        overallScore: auditResult.overallScore,
        categoryScores: auditResult.categoryScores,
        needsFix: auditResult.needsFix,
        issues: auditResult.issues,
        recommendations: auditResult.recommendations,
        missingElements: auditResult.missingElements,
      });
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : String(error));
    }
  }

  // Summary
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Summary                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
  const needsFixCount = results.filter(r => r.needsFix).length;
  const avgCompleteness = results.reduce((sum, r) => sum + r.categoryScores.completeness, 0) / results.length;
  const avgFunctionality = results.reduce((sum, r) => sum + r.categoryScores.engineeringUsefulness, 0) / results.length;
  const avgSEO = results.reduce((sum, r) => sum + r.categoryScores.seoEnrichment, 0) / results.length;
  const avgValue = results.reduce((sum, r) => sum + r.categoryScores.caseStudyQuality, 0) / results.length;

  console.log(`📊 Overall Statistics:`);
  console.log(`   Average Score: ${avgScore.toFixed(2)}/10`);
  console.log(`   Prompts Needing Fix: ${needsFixCount}/${results.length}`);
  console.log(`\n📈 Priority Category Averages:`);
  console.log(`   Completeness (30%): ${avgCompleteness.toFixed(2)}/10`);
  console.log(`   Functionality (25%): ${avgFunctionality.toFixed(2)}/10`);
  console.log(`   SEO (20%): ${avgSEO.toFixed(2)}/10`);
  console.log(`   Value (10%): ${avgValue.toFixed(2)}/10`);

  console.log(`\n📋 Individual Results:\n`);
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.title}`);
    console.log(`   Score: ${r.overallScore.toFixed(1)}/10  ${r.needsFix ? '⚠️' : '✅'}`);
    console.log(`   Completeness: ${r.categoryScores.completeness.toFixed(1)} | Functionality: ${r.categoryScores.engineeringUsefulness.toFixed(1)} | SEO: ${r.categoryScores.seoEnrichment.toFixed(1)}`);
    console.log(`   Issues: ${r.issues.length} | Recommendations: ${r.recommendations.length} | Missing: ${r.missingElements.length}`);
    console.log('');
  });

  console.log('✅ Audit complete!');
}

auditFirstFive().catch(console.error);

