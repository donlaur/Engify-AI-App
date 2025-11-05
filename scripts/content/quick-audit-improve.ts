#!/usr/bin/env tsx
/**
 * Simple audit script that bypasses the class import issue
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';

async function quickAudit() {
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
  
  // Simple audit using OpenAI directly
  console.log('⏳ Running quick audit...\n');
  const provider = new OpenAIAdapter('gpt-4o');
  
  const auditPrompt = `You are an audit expert. Evaluate this prompt and return ONLY valid JSON (no markdown, no text, just JSON):

PROMPT:
Title: ${prompt.title || 'N/A'}
Description: ${prompt.description || 'N/A'}
Content: ${(prompt.content || '').substring(0, 1000)}
Category: ${prompt.category || 'N/A'}
Slug: ${prompt.slug || 'N/A'}
Case Studies: ${prompt.caseStudies?.length || 0}
Examples: ${prompt.examples?.length || 0}
Use Cases: ${prompt.useCases?.length || 0}
Best Practices: ${prompt.bestPractices?.length || 0}

Evaluate on scale 1-10 for:
1. Completeness (has all required fields)
2. Engineering Usefulness (works as one-shot prompt)
3. SEO Enrichment (title, description, keywords optimized)
4. Case Study Quality (has examples showing value)

Return ONLY this JSON format (no other text):
{
  "overallScore": 8.5,
  "completeness": 8,
  "engineeringUsefulness": 9,
  "seoEnrichment": 7,
  "caseStudyQuality": 8,
  "issues": ["Issue 1"],
  "recommendations": ["Rec 1"],
  "missingElements": ["caseStudies"]
}`;
  
  try {
    const response = await provider.execute({
      prompt: auditPrompt,
      temperature: 0.2,
      maxTokens: 2000,
    });
    
          // Parse JSON - try multiple patterns
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let auditData: any = null;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonBlockMatch = response.content.match(/```json\s*([\s\S]*?)```/);
      if (jsonBlockMatch) {
        auditData = JSON.parse(jsonBlockMatch[1]);
      } else {
        // Try to extract JSON without markdown
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          auditData = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('❌ Failed to parse JSON:', error);
      console.log('Response was:', response.content.substring(0, 500));
      await db.client.close();
      process.exit(1);
    }
    
    if (!auditData) {
      console.error('❌ Failed to parse audit results');
      console.log('Response:', response.content);
      await db.client.close();
      process.exit(1);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 AUDIT RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`🎯 Overall Score: ${auditData.overallScore}/10`);
    console.log(`   Completeness: ${auditData.completeness}/10`);
    console.log(`   Engineering Usefulness: ${auditData.engineeringUsefulness}/10`);
    console.log(`   SEO Enrichment: ${auditData.seoEnrichment}/10`);
    console.log(`   Case Study Quality: ${auditData.caseStudyQuality}/10`);
    console.log(`\n🔍 Issues: ${auditData.issues?.length || 0}`);
    console.log(`💡 Recommendations: ${auditData.recommendations?.length || 0}`);
    console.log(`📋 Missing Elements: ${auditData.missingElements?.length || 0}\n`);
    
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
      overallScore: auditData.overallScore,
      categoryScores: {
        completeness: auditData.completeness || 0,
        engineeringUsefulness: auditData.engineeringUsefulness || 0,
        seoEnrichment: auditData.seoEnrichment || 0,
        caseStudyQuality: auditData.caseStudyQuality || 0,
        enterpriseReadiness: 0,
        securityCompliance: 0,
        accessibility: 0,
        performance: 0,
      },
      issues: auditData.issues || [],
      recommendations: auditData.recommendations || [],
      missingElements: auditData.missingElements || [],
      needsFix: auditData.overallScore < 6.0,
      auditedAt: auditDate,
      auditedBy: 'system',
      createdAt: auditDate,
      updatedAt: auditDate,
    });
    
    console.log(`✅ Audit saved (Version: ${auditVersion})\n`);
    
    // Now apply improvements
    console.log('✨ Applying improvements...\n');
    const improvements: Record<string, any> = {};
    
    // Generate missing elements
    if (auditData.missingElements?.includes('caseStudies') || !prompt.caseStudies || prompt.caseStudies.length === 0) {
      console.log('📚 Generating case studies...');
      try {
        const caseStudyPrompt = `Generate 3 case studies for: "${prompt.title}"\n\n${prompt.description}\n\nReturn JSON array with: title, scenario, challenge, process, outcome, keyLearning`;
        const csResponse = await provider.execute({ prompt: caseStudyPrompt, temperature: 0.7, maxTokens: 2000 });
        const csJson = csResponse.content.match(/\[[\s\S]*\]/);
        if (csJson) {
          improvements.caseStudies = JSON.parse(csJson[0]);
          console.log(`   ✅ Generated ${improvements.caseStudies.length} case studies`);
        }
      } catch (e) {
        console.warn('   ⚠️  Failed:', e);
      }
    }
    
    if (auditData.missingElements?.includes('useCases') || !prompt.useCases || prompt.useCases.length === 0) {
      console.log('💼 Generating use cases...');
      try {
        const ucPrompt = `Generate 3-5 use cases for: "${prompt.title}"\n\nReturn JSON array of strings`;
        const ucResponse = await provider.execute({ prompt: ucPrompt, temperature: 0.7, maxTokens: 1000 });
        const ucJson = ucResponse.content.match(/\[[\s\S]*\]/);
        if (ucJson) {
          improvements.useCases = JSON.parse(ucJson[0]);
          console.log(`   ✅ Generated ${improvements.useCases.length} use cases`);
        }
      } catch (e) {
        console.warn('   ⚠️  Failed:', e);
      }
    }
    
    if (auditData.missingElements?.includes('bestPractices') || !prompt.bestPractices || prompt.bestPractices.length === 0) {
      console.log('📖 Generating best practices...');
      try {
        const bpPrompt = `Generate 3-5 best practices for: "${prompt.title}"\n\nReturn JSON array of strings`;
        const bpResponse = await provider.execute({ prompt: bpPrompt, temperature: 0.7, maxTokens: 1000 });
        const bpJson = bpResponse.content.match(/\[[\s\S]*\]/);
        if (bpJson) {
          improvements.bestPractices = JSON.parse(bpJson[0]);
          console.log(`   ✅ Generated ${improvements.bestPractices.length} best practices`);
        }
      } catch (e) {
        console.warn('   ⚠️  Failed:', e);
      }
    }
    
    // Save improvements
    if (Object.keys(improvements).length > 0) {
      await db.collection('prompts').updateOne(
        { id: prompt.id },
        { $set: { ...improvements, updatedAt: new Date(), enrichedAt: new Date() } }
      );
      console.log(`\n✅ Prompt updated with ${Object.keys(improvements).length} improvements`);
    } else {
      console.log('\n✅ No improvements needed');
    }
    
    await db.client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await db.client.close();
    process.exit(1);
  }
}

quickAudit().catch(console.error);

