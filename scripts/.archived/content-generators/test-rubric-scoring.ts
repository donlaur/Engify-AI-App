/**
 * Test Rubric & Scoring Calibration
 * 
 * Audits a known good prompt to verify scoring is realistic
 * Helps calibrate the rubric to ensure fair scoring
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';

async function testRubricScoring() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Rubric & Scoring Calibration Test                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();
  const auditor = new PromptPatternAuditor('system');

  // Get a prompt that should score well (has enrichment data)
  const enrichedPrompt = await db.collection('prompts').findOne({
    id: 'doc-001',
  });

  if (!enrichedPrompt) {
    console.error('❌ Test prompt not found. Run enrichment first.');
    return;
  }

  console.log('📋 Testing Prompt:');
  console.log(`   Title: ${enrichedPrompt.title}`);
  console.log(`   Has caseStudies: ${enrichedPrompt.caseStudies ? enrichedPrompt.caseStudies.length : 0}`);
  console.log(`   Has examples: ${enrichedPrompt.examples ? enrichedPrompt.examples.length : 0}`);
  console.log(`   Has useCases: ${enrichedPrompt.useCases ? enrichedPrompt.useCases.length : 0}`);
  console.log(`   Has bestPractices: ${enrichedPrompt.bestPractices ? enrichedPrompt.bestPractices.length : 0}`);
  console.log(`   Has bestTimeToUse: ${!!enrichedPrompt.bestTimeToUse}`);
  console.log(`   Has recommendedModel: ${!!enrichedPrompt.recommendedModel}`);
  console.log(`   Has seoKeywords: ${enrichedPrompt.seoKeywords ? enrichedPrompt.seoKeywords.length : 0}`);
  console.log('');

  console.log('🔍 Running audit...\n');
  const startTime = Date.now();
  const result = await auditor.auditPrompt(enrichedPrompt);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Audit Results                                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`🎯 Overall Score: ${result.overallScore}/10`);
  console.log(`   Status: ${result.needsFix ? '⚠️  NEEDS FIX' : '✅ GOOD'}`);
  console.log(`   Duration: ${duration}s\n`);

  console.log('📊 Category Scores:\n');
  const categoryWeights = {
    engineeringUsefulness: 0.25,
    caseStudyQuality: 0.15,
    completeness: 0.15,
    seoEnrichment: 0.10,
    enterpriseReadiness: 0.15,
    securityCompliance: 0.10,
    accessibility: 0.05,
    performance: 0.05,
  };

  const categories = [
    { key: 'engineeringUsefulness', label: 'Engineering Usefulness', weight: categoryWeights.engineeringUsefulness },
    { key: 'caseStudyQuality', label: 'Case Study Quality', weight: categoryWeights.caseStudyQuality },
    { key: 'completeness', label: 'Completeness', weight: categoryWeights.completeness },
    { key: 'seoEnrichment', label: 'SEO Enrichment', weight: categoryWeights.seoEnrichment },
    { key: 'enterpriseReadiness', label: 'Enterprise Readiness', weight: categoryWeights.enterpriseReadiness },
    { key: 'securityCompliance', label: 'Security & Compliance', weight: categoryWeights.securityCompliance },
    { key: 'accessibility', label: 'Accessibility', weight: categoryWeights.accessibility },
    { key: 'performance', label: 'Performance', weight: categoryWeights.performance },
  ];

  categories.forEach(({ key, label, weight }) => {
    const score = result.categoryScores[key as keyof typeof result.categoryScores];
    const contribution = score * weight;
    const status = score >= 7 ? '✅' : score >= 5 ? '⚠️' : '❌';
    console.log(`   ${status} ${label.padEnd(30)} ${score.toFixed(1)}/10  (weight: ${(weight * 100).toFixed(0)}%, contributes: ${contribution.toFixed(2)})`);
  });

  console.log(`\n   ────────────────────────────────────────────────────────────`);
  console.log(`   Total Weighted Score: ${result.overallScore.toFixed(2)}/10\n`);

  console.log(`📝 Issues: ${result.issues.length}`);
  if (result.issues.length > 0) {
    result.issues.slice(0, 5).forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    if (result.issues.length > 5) {
      console.log(`   ... and ${result.issues.length - 5} more`);
    }
  }

  console.log(`\n💡 Recommendations: ${result.recommendations.length}`);
  if (result.recommendations.length > 0) {
    result.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    if (result.recommendations.length > 5) {
      console.log(`   ... and ${result.recommendations.length - 5} more`);
    }
  }

  console.log(`\n❌ Missing Elements: ${result.missingElements.length}`);
  if (result.missingElements.length > 0) {
    result.missingElements.forEach((elem, i) => {
      console.log(`   ${i + 1}. ${elem}`);
    });
  }

  // Analysis
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Scoring Analysis                                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const avgCategoryScore = Object.values(result.categoryScores).reduce((a, b) => a + b, 0) / 8;
  console.log(`Average Category Score: ${avgCategoryScore.toFixed(2)}/10`);
  console.log(`Overall Score: ${result.overallScore.toFixed(2)}/10`);
  console.log(`Difference: ${(result.overallScore - avgCategoryScore).toFixed(2)}`);

  // Identify low-scoring categories
  const lowScoringCategories = categories.filter(({ key }) => {
    const score = result.categoryScores[key as keyof typeof result.categoryScores];
    return score < 6;
  });

  if (lowScoringCategories.length > 0) {
    console.log(`\n⚠️  Low-scoring categories (< 6):`);
    lowScoringCategories.forEach(({ key, label, weight }) => {
      const score = result.categoryScores[key as keyof typeof result.categoryScores];
      console.log(`   - ${label}: ${score.toFixed(1)}/10 (weight: ${(weight * 100).toFixed(0)}%)`);
    });
  }

  // Recommendations for rubric adjustment
  console.log('\n💡 Recommendations:');
  
  if (result.overallScore < 6) {
    console.log('   ⚠️  Overall score is low (< 6). Consider:');
    console.log('      - Adjusting rubric criteria to be less strict');
    console.log('      - Increasing base scores for prompts with enrichment data');
    console.log('      - Reducing weight of categories that consistently score low');
  }

  if (result.overallScore >= 7 && result.overallScore < 8) {
    console.log('   ✅ Score is reasonable (7-8). Rubric appears calibrated.');
  }

  if (result.overallScore >= 8) {
    console.log('   ✅ Score is high (≥ 8). Rubric may be too lenient or prompt is excellent.');
  }

  const needsFixThreshold = 7.0;
  if (result.overallScore < needsFixThreshold && result.overallScore >= 6) {
    console.log(`\n   📌 Current needsFix threshold: ${needsFixThreshold}`);
    console.log(`   Consider adjusting threshold to ${needsFixThreshold - 0.5} for enriched prompts`);
  }

  console.log('');
}

testRubricScoring().catch(console.error);

