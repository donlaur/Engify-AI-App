#!/usr/bin/env tsx
/**
 * Single Prompt Audit Test
 * 
 * Audits one specific prompt through the multi-agent system
 * and saves the complete review process to a markdown document
 * 
 * Usage:
 *   tsx scripts/content/test-audit-single-prompt.ts --id=doc-001
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';

interface AuditProcessDocument {
  timestamp: string;
  promptId: string;
  prompt: any;
  auditResult: any;
  agentReviews: Record<string, string>;
  processSteps: Array<{
    step: number;
    agent: string;
    prompt: string;
    response: string;
    timestamp: string;
  }>;
}

async function auditSinglePromptAndDocument(promptId: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Single Prompt Audit Test - Multi-Agent Review          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // Check API keys
  const requiredKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  if (missingKeys.length > 0) {
    console.error('❌ Missing required API keys:', missingKeys.join(', '));
    console.error('Please add them to your .env.local file');
    process.exit(1);
  }

  const db = await getMongoDb();
  const auditor = new PromptPatternAuditor('system');

  // Find the prompt
  console.log(`📋 Looking for prompt with ID: ${promptId}`);
  const prompt = await db.collection('prompts').findOne({ id: promptId }) ||
                 await db.collection('prompts').findOne({ _id: promptId });
  
  if (!prompt) {
    console.error(`❌ Prompt not found: ${promptId}`);
    process.exit(1);
  }

  console.log(`✅ Found prompt: "${prompt.title}"`);
  console.log(`   Role: ${prompt.role || 'N/A'}`);
  console.log(`   Category: ${prompt.category || 'N/A'}`);
  console.log(`   Pattern: ${prompt.pattern || 'N/A'}`);
  console.log('');
  console.log('⏳ Starting multi-agent audit...\n');

  // Run audit - ONLY on this single prompt
  const startTime = Date.now();
  const auditResult = await auditor.auditPrompt(prompt);
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n✅ Audit completed in ${duration}s`);
  console.log(`   Overall Score: ${auditResult.overallScore}/10`);
  console.log(`   Issues: ${auditResult.issues.length}`);
  console.log(`   Recommendations: ${auditResult.recommendations.length}`);
  console.log(`   Missing Elements: ${auditResult.missingElements.length}`);

  // Create markdown document
  const doc: AuditProcessDocument = {
    timestamp: new Date().toISOString(),
    promptId: promptId,
    prompt: {
      id: prompt.id || prompt._id?.toString(),
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      role: prompt.role,
      pattern: prompt.pattern,
      tags: prompt.tags,
      content: prompt.content?.substring(0, 500) + (prompt.content?.length > 500 ? '...' : ''),
      slug: prompt.slug,
      qualityScore: prompt.qualityScore,
    },
    auditResult: auditResult,
    agentReviews: auditResult.agentReviews,
    processSteps: [],
  };

  // Generate markdown
  const markdown = generateMarkdownDocument(doc, duration);

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `prompt-audit-${promptId}-${timestamp}.md`;
  const filepath = path.join(process.cwd(), 'docs', 'testing', filename);
  
  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, markdown);
  console.log(`\n📄 Audit document saved to: ${filepath}`);

  return { auditResult, filepath };
}

function generateMarkdownDocument(doc: AuditProcessDocument, duration: string): string {
  const { prompt, auditResult, agentReviews } = doc;

  return `# Multi-Agent Prompt Audit Report

**Generated:** ${new Date(doc.timestamp).toLocaleString()}  
**Prompt ID:** ${doc.promptId}  
**Audit Duration:** ${duration}s

---

## 📋 Prompt Information

### Basic Details

- **Title:** ${prompt.title}
- **Role:** ${prompt.role || 'N/A'}
- **Category:** ${prompt.category || 'N/A'}
- **Pattern:** ${prompt.pattern || 'N/A'}
- **Slug:** ${prompt.slug || 'N/A'}
- **Current Quality Score:** ${prompt.qualityScore || 'N/A'}

### Description

${prompt.description || 'N/A'}

### Content Preview

${prompt.content || 'N/A'}

### Tags

${prompt.tags?.length > 0 ? prompt.tags.map((t: string) => `- ${t}`).join('\n') : 'No tags'}

---

## 🎯 Audit Results Summary

### Overall Score: **${auditResult.overallScore}/10**

**Status:** ${auditResult.needsFix ? '⚠️ **Needs Fix**' : '✅ **Passed**'}

### Category Scores

| Category | Score | Weight |
|----------|-------|--------|
| Engineering Usefulness | **${auditResult.categoryScores.engineeringUsefulness}/10** | 25% |
| Case Study Quality | **${auditResult.categoryScores.caseStudyQuality}/10** | 15% |
| Completeness | **${auditResult.categoryScores.completeness}/10** | 15% |
| SEO Enrichment | **${auditResult.categoryScores.seoEnrichment}/10** | 10% |
| Enterprise Readiness | **${auditResult.categoryScores.enterpriseReadiness}/10** | 15% |
| Security & Compliance | **${auditResult.categoryScores.securityCompliance}/10** | 10% |
| Accessibility | **${auditResult.categoryScores.accessibility}/10** | 5% |
| Performance | **${auditResult.categoryScores.performance}/10** | 5% |

### Issues Found: ${auditResult.issues.length}

${auditResult.issues.length > 0 ? auditResult.issues.map((issue: string) => `- ${issue}`).join('\n') : '✅ No issues found'}

### Missing Elements: ${auditResult.missingElements.length}

${auditResult.missingElements.length > 0 ? auditResult.missingElements.map((elem: string) => `- ${elem}`).join('\n') : '✅ No missing elements'}

### Recommendations: ${auditResult.recommendations.length}

${auditResult.recommendations.length > 0 ? auditResult.recommendations.map((rec: string) => `- ${rec}`).join('\n') : 'No recommendations'}

---

## 🤖 Agent Reviews

### ${Object.keys(agentReviews).length} Agents Reviewed This Prompt

${Object.entries(agentReviews).map(([agentRole, review], index) => `
#### ${index + 1}. ${agentRole.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}

\`\`\`
${typeof review === 'string' ? review : JSON.stringify(review, null, 2)}
\`\`\`
`).join('\n')}

---

## 📊 Detailed Analysis

### Category Breakdown

#### 1. Engineering Usefulness (${auditResult.categoryScores.engineeringUsefulness}/10)

${getCategoryAnalysis('engineeringUsefulness', auditResult)}

#### 2. Case Study Quality (${auditResult.categoryScores.caseStudyQuality}/10)

${getCategoryAnalysis('caseStudyQuality', auditResult)}

#### 3. Completeness (${auditResult.categoryScores.completeness}/10)

${getCategoryAnalysis('completeness', auditResult)}

#### 4. SEO Enrichment (${auditResult.categoryScores.seoEnrichment}/10)

${getCategoryAnalysis('seoEnrichment', auditResult)}

#### 5. Enterprise Readiness (${auditResult.categoryScores.enterpriseReadiness}/10)

${getCategoryAnalysis('enterpriseReadiness', auditResult)}

#### 6. Security & Compliance (${auditResult.categoryScores.securityCompliance}/10)

${getCategoryAnalysis('securityCompliance', auditResult)}

#### 7. Accessibility (${auditResult.categoryScores.accessibility}/10)

${getCategoryAnalysis('accessibility', auditResult)}

#### 8. Performance (${auditResult.categoryScores.performance}/10)

${getCategoryAnalysis('performance', auditResult)}

---

## 🔄 Multi-Agent Process

### Process Overview

This prompt was reviewed through a **${Object.keys(agentReviews).length}-agent audit pipeline**:

1. **Grading Rubric Expert** - Comprehensive 8-category evaluation
${Object.keys(agentReviews).filter(r => r !== 'grading_rubric').map((agent, i) => `   ${i + 2}. **${agent.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}** - Specialized review`).join('\n')}

${prompt.role ? `\n2. **${prompt.role.charAt(0).toUpperCase() + prompt.role.slice(1).replace(/-/g, ' ')} Specialist Reviewer** - Role-specific evaluation\n` : ''}
${Object.keys(agentReviews).filter(r => r !== 'grading_rubric' && !r.includes('role_specific')).map((agent, i) => `   ${i + (prompt.role ? 3 : 2)}. **${agent.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}** - Specialized review`).join('\n')}

### Agent Specializations

${Object.entries(agentReviews).map(([agentRole, review]) => {
  const roleName = agentRole.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  return `- **${roleName}**: ${getAgentDescription(agentRole)}`;
}).join('\n')}

---

## ✅ Next Steps

${auditResult.needsFix ? `
### Action Required

This prompt needs improvement. Recommended actions:

1. **Address Issues:** ${auditResult.issues.length} issue(s) need to be fixed
2. **Add Missing Elements:** ${auditResult.missingElements.length} element(s) are missing
3. **Implement Recommendations:** Review and implement ${auditResult.recommendations.length} recommendation(s)

### Priority Actions

${auditResult.issues.slice(0, 3).map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}
` : `
### No Action Required

✅ This prompt meets quality standards with a score of ${auditResult.overallScore}/10.

**Optional Improvements:**
${auditResult.recommendations.slice(0, 3).map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n') || 'No recommendations at this time'}
`}

---

## 📚 Related Documentation

- [Multi-Agent System Comprehensive Guide](../content/MULTI_AGENT_SYSTEM_COMPREHENSIVE.md)
- [Landing Page Strategy](../content/LANDING_PAGE_STRATEGY.md)
- [Cost Analysis](../content/COST_ANALYSIS_PROMPT_GENERATION.md)

---

**Report Generated:** ${new Date().toLocaleString()}  
**Audit System:** Multi-Agent Prompt & Pattern Auditor v1.0  
**Prompt ID:** ${doc.promptId}
`;
}

function getCategoryAnalysis(category: string, auditResult: any): string {
  const score = auditResult.categoryScores[category];
  const status = score >= 8 ? '✅ Excellent' : score >= 6 ? '⚠️ Good' : score >= 4 ? '⚠️ Fair' : '❌ Poor';
  return `${status} - Score: ${score}/10`;
}

function getAgentDescription(agentRole: string): string {
  const descriptions: Record<string, string> = {
    'grading_rubric': 'Comprehensive evaluation across 8 categories using detailed rubric',
    'engineering_reviewer': 'Evaluates engineering usefulness and technical accuracy',
    'product_reviewer': 'Assesses product management relevance',
    'roles_use_cases_reviewer': 'Reviews role assignments and use case quality',
    'seo_enrichment_reviewer': 'Evaluates SEO optimization',
    'enterprise_saas_expert': 'Reviews enterprise SaaS readiness',
    'enterprise_reviewer': 'Assesses enterprise compliance and scalability',
    'web_security_reviewer': 'Evaluates security and compliance',
    'compliance_reviewer': 'Reviews SOC 2, GDPR, FedRAMP compliance',
    'completeness_reviewer': 'Checks for completeness and missing elements',
  };
  
  if (agentRole.includes('role_specific')) {
    return 'Role-specific evaluation for target audience';
  }
  
  return descriptions[agentRole] || 'Specialized review agent';
}

// Main execution
const args = process.argv.slice(2);
const idArg = args.find(arg => arg.startsWith('--id='));
const promptId = idArg ? idArg.split('=')[1] : 'doc-001';

auditSinglePromptAndDocument(promptId)
  .then(({ auditResult, filepath }) => {
    console.log('\n✅ Test completed successfully!');
    console.log(`📄 Full report: ${filepath}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
