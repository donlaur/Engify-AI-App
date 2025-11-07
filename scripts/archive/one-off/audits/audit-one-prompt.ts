#!/usr/bin/env tsx
/**
 * Quick audit of a single prompt - direct execution
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';
import fs from 'fs';
import path from 'path';

async function auditSinglePrompt(promptId: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Single Prompt Audit - Multi-Agent Review               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();
  
  // Check for quick mode flag
  const quickMode = process.argv.includes('--quick') || process.argv.includes('-q');
  const fastMode = process.argv.includes('--fast') || process.argv.includes('-f');
  
  const auditor = new PromptPatternAuditor('system', { 
    quickMode: quickMode,
    skipExecutionTest: fastMode || quickMode, // Skip execution test in quick mode
    useCache: true,
  });
  
  if (quickMode) {
    console.log('⚡⚡ QUICK MODE: Running only 3 core agents\n');
  }

  // Find the prompt
  console.log(`📋 Looking for prompt: ${promptId}`);
  const prompt = await db.collection('prompts').findOne({ id: promptId }) ||
                 await db.collection('prompts').findOne({ _id: promptId });
  
  if (!prompt) {
    console.error(`❌ Prompt not found: ${promptId}`);
    process.exit(1);
  }

  console.log(`✅ Found: "${prompt.title}"`);
  console.log(`   Role: ${prompt.role || 'N/A'}`);
  console.log(`   Pattern: ${prompt.pattern || 'N/A'}`);
  console.log(`   Category: ${prompt.category || 'N/A'}\n`);

  console.log('⏳ Running multi-agent audit...\n');

  // Run audit
  const auditResult = await auditor.auditPrompt(prompt);

  // Display results
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 AUDIT RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log(`📌 Title: ${auditResult.title}`);
  console.log(`🎯 Overall Score: ${auditResult.overallScore}/10`);
  console.log(`   Status: ${auditResult.needsFix ? '⚠️  NEEDS FIX' : '✅ GOOD'}\n`);

  console.log('📈 Category Scores:');
  console.log(`   Engineering Usefulness: ${auditResult.categoryScores.engineeringUsefulness.toFixed(1)}/10`);
  console.log(`   Case Study Quality: ${auditResult.categoryScores.caseStudyQuality.toFixed(1)}/10`);
  console.log(`   Completeness: ${auditResult.categoryScores.completeness.toFixed(1)}/10`);
  console.log(`   SEO Enrichment: ${auditResult.categoryScores.seoEnrichment.toFixed(1)}/10`);
  console.log(`   Enterprise Readiness: ${auditResult.categoryScores.enterpriseReadiness.toFixed(1)}/10`);
  console.log(`   Security & Compliance: ${auditResult.categoryScores.securityCompliance.toFixed(1)}/10`);
  console.log(`   Accessibility: ${auditResult.categoryScores.accessibility.toFixed(1)}/10`);
  console.log(`   Performance: ${auditResult.categoryScores.performance.toFixed(1)}/10\n`);

  // Save to database with versioning
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

  console.log(`\n💾 Saved to database (Version ${auditVersion})`);
  console.log(`   Date: ${auditDate.toISOString()}\n`);

  if (auditResult.issues.length > 0) {
    console.log('⚠️  Issues Found:');
    auditResult.issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('');
  }

  if (auditResult.missingElements.length > 0) {
    console.log('❌ Missing Elements:');
    auditResult.missingElements.forEach((elem, i) => {
      console.log(`   ${i + 1}. ${elem}`);
    });
    console.log('');
  }

  if (auditResult.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    auditResult.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    console.log('');
  }

  // Save detailed report
  const reportDir = path.join(process.cwd(), 'docs', 'testing');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportDir, `prompt-audit-${promptId}-${timestamp}.md`);

  const report = `# Prompt Audit Report

**Prompt ID:** ${promptId}  
**Title:** ${auditResult.title}  
**Audited:** ${new Date().toISOString()}  
**Overall Score:** ${auditResult.overallScore}/10  
**Status:** ${auditResult.needsFix ? '⚠️ NEEDS FIX' : '✅ GOOD'}

---

## Category Scores

| Category | Score | Weight |
|----------|-------|--------|
| Engineering Usefulness | ${auditResult.categoryScores.engineeringUsefulness.toFixed(1)}/10 | 25% |
| Case Study Quality | ${auditResult.categoryScores.caseStudyQuality.toFixed(1)}/10 | 15% |
| Completeness | ${auditResult.categoryScores.completeness.toFixed(1)}/10 | 15% |
| SEO Enrichment | ${auditResult.categoryScores.seoEnrichment.toFixed(1)}/10 | 10% |
| Enterprise Readiness | ${auditResult.categoryScores.enterpriseReadiness.toFixed(1)}/10 | 15% |
| Security & Compliance | ${auditResult.categoryScores.securityCompliance.toFixed(1)}/10 | 10% |
| Accessibility | ${auditResult.categoryScores.accessibility.toFixed(1)}/10 | 5% |
| Performance | ${auditResult.categoryScores.performance.toFixed(1)}/10 | 5% |

---

## Issues Found

${auditResult.issues.length > 0 ? auditResult.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n') : '✅ No issues found'}

---

## Missing Elements

${auditResult.missingElements.length > 0 ? auditResult.missingElements.map((elem, i) => `${i + 1}. ${elem}`).join('\n') : '✅ All required elements present'}

---

## Recommendations

${auditResult.recommendations.length > 0 ? auditResult.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n') : '✅ No recommendations'}

---

## Agent Reviews

${Object.entries(auditResult.agentReviews).map(([agent, review]) => `### ${agent}\n\n${review}`).join('\n\n---\n\n')}
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n✅ Detailed report saved to: ${reportPath}`);

  return auditResult;
}

// Get prompt ID from command line
const promptId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1] || 
                 process.argv[2];

if (!promptId) {
  console.error('Usage: tsx audit-one-prompt.ts --id=<prompt-id>');
  process.exit(1);
}

auditSinglePrompt(promptId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

