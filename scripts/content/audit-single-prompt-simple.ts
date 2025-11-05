#!/usr/bin/env tsx
/**
 * Simple Single Prompt Audit
 * Audits ONE prompt and shows detailed feedback from each agent
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';
import fs from 'fs';
import path from 'path';

async function auditOnePrompt(promptId: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Single Prompt Audit - Detailed Agent Feedback         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();
  const auditor = new PromptPatternAuditor('system');

  // Find the prompt
  console.log(`📋 Finding prompt: ${promptId}`);
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
  console.log('━'.repeat(60));

  // Run audit
  const startTime = Date.now();
  const auditResult = await auditor.auditPrompt(prompt);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Display results
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 AUDIT RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log(`🎯 Overall Score: ${auditResult.overallScore}/10`);
  console.log(`   Status: ${auditResult.needsFix ? '⚠️  NEEDS FIX' : '✅ GOOD'}`);
  console.log(`   Duration: ${duration}s\n`);

  console.log('📈 Category Scores:');
  console.log(`   Engineering Usefulness: ${auditResult.categoryScores.engineeringUsefulness.toFixed(1)}/10`);
  console.log(`   Case Study Quality: ${auditResult.categoryScores.caseStudyQuality.toFixed(1)}/10`);
  console.log(`   Completeness: ${auditResult.categoryScores.completeness.toFixed(1)}/10`);
  console.log(`   SEO Enrichment: ${auditResult.categoryScores.seoEnrichment.toFixed(1)}/10`);
  console.log(`   Enterprise Readiness: ${auditResult.categoryScores.enterpriseReadiness.toFixed(1)}/10`);
  console.log(`   Security & Compliance: ${auditResult.categoryScores.securityCompliance.toFixed(1)}/10`);
  console.log(`   Accessibility: ${auditResult.categoryScores.accessibility.toFixed(1)}/10`);
  console.log(`   Performance: ${auditResult.categoryScores.performance.toFixed(1)}/10\n`);

  // Show agent feedback
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🤖 AGENT FEEDBACK');
  console.log('═══════════════════════════════════════════════════════════\n');

  const agentCount = Object.keys(auditResult.agentReviews).length;
  console.log(`📝 ${agentCount} agents reviewed this prompt:\n`);

  Object.entries(auditResult.agentReviews).forEach(([agentName, review], index) => {
    const displayName = agentName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    
    console.log(`${index + 1}. ${displayName}`);
    console.log('━'.repeat(60));
    
    // Show first 500 chars of review, then indicate if there's more
    const reviewText = typeof review === 'string' ? review : JSON.stringify(review, null, 2);
    if (reviewText.length > 500) {
      console.log(reviewText.substring(0, 500) + '...\n');
    } else {
      console.log(reviewText + '\n');
    }
  });

  // Issues and recommendations
  if (auditResult.issues.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️  ISSUES FOUND');
    console.log('═══════════════════════════════════════════════════════════\n');
    auditResult.issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    console.log('');
  }

  if (auditResult.missingElements.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('❌ MISSING ELEMENTS');
    console.log('═══════════════════════════════════════════════════════════\n');
    auditResult.missingElements.forEach((elem, i) => {
      console.log(`${i + 1}. ${elem}`);
    });
    console.log('');
  }

  if (auditResult.recommendations.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');
    auditResult.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
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

  const report = `# Prompt Audit Report: ${prompt.title}

**Prompt ID:** ${promptId}  
**Audited:** ${new Date().toISOString()}  
**Duration:** ${duration}s  
**Overall Score:** ${auditResult.overallScore}/10  
**Status:** ${auditResult.needsFix ? '⚠️ NEEDS FIX' : '✅ GOOD'}

---

## Prompt Details

- **Title:** ${prompt.title}
- **Role:** ${prompt.role || 'N/A'}
- **Pattern:** ${prompt.pattern || 'N/A'}
- **Category:** ${prompt.category || 'N/A'}
- **Description:** ${prompt.description || 'N/A'}

### Content Preview

${prompt.content?.substring(0, 1000) || 'N/A'}

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

## Agent Reviews

${Object.entries(auditResult.agentReviews).map(([agentName, review], index) => {
    const displayName = agentName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const reviewText = typeof review === 'string' ? review : JSON.stringify(review, null, 2);
    return `### ${index + 1}. ${displayName}

\`\`\`
${reviewText}
\`\`\`
`;
  }).join('\n---\n\n')}

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

**Report Generated:** ${new Date().toLocaleString()}  
**Audit System:** Multi-Agent Prompt & Pattern Auditor v1.0
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n✅ Detailed report saved to: ${reportPath}\n`);

  return auditResult;
}

// Get prompt ID from command line
const promptId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1] || 
                 process.argv[2];

if (!promptId) {
  console.error('Usage: tsx audit-single-prompt-simple.ts --id=<prompt-id>');
  process.exit(1);
}

auditOnePrompt(promptId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

