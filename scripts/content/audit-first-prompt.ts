#!/usr/bin/env tsx
/**
 * Audit first prompt and apply improvements
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';

async function auditAndImprove() {
  console.log('🎯 Auditing First Prompt and Applying Improvements\n');
  
  const db = await getMongoDb();
  
  // Get first prompt
  const prompt = await db.collection('prompts').findOne({});
  
  if (!prompt) {
    console.error('❌ No prompts found');
    await db.client.close();
    process.exit(1);
  }
  
  console.log(`✅ Found: "${prompt.title}"`);
  console.log(`   ID: ${prompt.id}\n`);
  
  // Run audit with fast mode and caching
  console.log('⏳ Running audit (fast mode)...\n');
  const auditor = new PromptPatternAuditor('system', { skipExecutionTest: true, useCache: true });
  const auditResult = await auditor.auditPrompt(prompt);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 AUDIT RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`🎯 Overall Score: ${auditResult.overallScore}/10`);
  console.log(`   Status: ${auditResult.needsFix ? '⚠️  NEEDS FIX' : '✅ GOOD'}\n`);
  console.log('📈 Category Scores:');
  Object.entries(auditResult.categoryScores).forEach(([category, score]) => {
    console.log(`   ${category}: ${score.toFixed(1)}/10`);
  });
  console.log(`\n🔍 Issues: ${auditResult.issues.length}`);
  console.log(`💡 Recommendations: ${auditResult.recommendations.length}`);
  console.log(`📋 Missing Elements: ${auditResult.missingElements.length}\n`);
  
  // Save audit result
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
  
  console.log(`✅ Audit saved (Version: ${auditVersion})\n`);
  
  // Apply improvements based on audit feedback
  console.log('✨ Applying improvements based on audit feedback...\n');
  const provider = new OpenAIAdapter('gpt-4o');
  
  const improvements: Record<string, any> = {};
  
  // Generate missing elements
  if (auditResult.missingElements.includes('caseStudies') || !prompt.caseStudies || prompt.caseStudies.length === 0) {
    console.log('📚 Generating case studies...');
    try {
      const caseStudyPrompt = `Generate 3 detailed case studies for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content?.substring(0, 500) || ''}

Requirements:
- Real-world scenarios where this prompt would be used
- Show challenge, process, outcome, and key learning
- Include measurable outcomes
- Diverse use cases

Format as JSON array:
[
  {
    "title": "...",
    "scenario": "...",
    "challenge": "...",
    "process": "...",
    "outcome": "...",
    "keyLearning": "..."
  }
]`;
      
      const response = await provider.execute({
        prompt: caseStudyPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        improvements.caseStudies = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${improvements.caseStudies.length} case studies`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate case studies:', error);
    }
  }
  
  // Generate use cases
  if (auditResult.missingElements.includes('useCases') || !prompt.useCases || prompt.useCases.length === 0) {
    console.log('💼 Generating use cases...');
    try {
      const useCasePrompt = `Generate 3-5 use cases for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content?.substring(0, 500) || ''}

Return as JSON array of strings:
["Use case 1", "Use case 2", ...]`;
      
      const response = await provider.execute({
        prompt: useCasePrompt,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        improvements.useCases = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${improvements.useCases.length} use cases`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate use cases:', error);
    }
  }
  
  // Generate best practices
  if (auditResult.missingElements.includes('bestPractices') || !prompt.bestPractices || prompt.bestPractices.length === 0) {
    console.log('📖 Generating best practices...');
    try {
      const bestPracticesPrompt = `Generate 3-5 best practices for using this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content?.substring(0, 500) || ''}

Return as JSON array of strings:
["Best practice 1", "Best practice 2", ...]`;
      
      const response = await provider.execute({
        prompt: bestPracticesPrompt,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        improvements.bestPractices = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${improvements.bestPractices.length} best practices`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate best practices:', error);
    }
  }
  
  // Update prompt with improvements
  if (Object.keys(improvements).length > 0) {
    await db.collection('prompts').updateOne(
      { id: prompt.id },
      { 
        $set: {
          ...improvements,
          updatedAt: new Date(),
          enrichedAt: new Date(),
        }
      }
    );
    console.log(`\n✅ Prompt updated with ${Object.keys(improvements).length} improvements`);
  } else {
    console.log('\n✅ No improvements needed (or generation failed)');
  }
  
  await db.client.close();
  process.exit(0);
}

auditAndImprove().catch(console.error);

