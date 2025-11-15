/**
 * Batch Audit & Enrich Script
 * 
 * Audits and enriches prompts in batches of 20
 * Marks prompts as processed for tracking
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';

const BATCH_SIZE = 20;
const ORGANIZATION_ID = 'system';

async function getNextBatch() {
  const db = await getMongoDb();
  
  // Get first 20 prompts that haven't been batch processed
  // or haven't been enriched yet
  const prompts = await db.collection('prompts').find({
    // Don't filter by isPublic/active - we want to process all
    $or: [
      { batchProcessed: { $exists: false } },
      { batchProcessed: false },
    ],
  })
    .limit(BATCH_SIZE)
    .sort({ createdAt: 1 }) // Process oldest first
    .toArray();

  return prompts;
}

async function markBatchProcessed(promptIds: string[]) {
  const db = await getMongoDb();
  await db.collection('prompts').updateMany(
    { id: { $in: promptIds } },
    { 
      $set: { 
        batchProcessed: true,
        batchProcessedAt: new Date(),
      } 
    }
  );
}

async function enrichPrompt(prompt: any) {
  const db = await getMongoDb();
  
  // Get latest audit for this prompt
  const audit = await db.collection('prompt_audit_results')
    .findOne(
      { promptId: prompt.id },
      { sort: { auditVersion: -1 } }
    );

  if (!audit) {
    console.warn(`   ⚠️  No audit found for ${prompt.id}, skipping enrichment`);
    return false;
  }

  const provider = new OpenAIAdapter('gpt-4o');
  const enrichmentFields: any = {};

  // Generate case studies if missing
  if (!prompt.caseStudies || prompt.caseStudies.length === 0) {
    try {
      const caseStudyPrompt = `Generate 3 detailed case studies for this prompt: "${prompt.title}". 
Description: ${prompt.description}
Content: ${prompt.content.substring(0, 500)}...
Return as JSON array of objects with: title, scenario, outcome, metrics.`;
      const response = await provider.execute({ prompt: caseStudyPrompt, temperature: 0.7, maxTokens: 2000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        enrichmentFields.caseStudies = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${enrichmentFields.caseStudies.length} case studies`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate case studies:', error);
    }
  }

  // Generate examples if missing
  if (!prompt.examples || prompt.examples.length === 0) {
    try {
      const examplesPrompt = `Generate 2 practical examples for this prompt: "${prompt.title}".
Return as JSON array of objects with: title, input, output.`;
      const response = await provider.execute({ prompt: examplesPrompt, temperature: 0.7, maxTokens: 1500 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        enrichmentFields.examples = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${enrichmentFields.examples.length} examples`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate examples:', error);
    }
  }

  // Generate best practices if missing
  if (!prompt.bestPractices || prompt.bestPractices.length === 0) {
    try {
      const bestPracticesPrompt = `Generate 5 best practices for using this prompt: "${prompt.title}".
Return as JSON array of strings.`;
      const response = await provider.execute({ prompt: bestPracticesPrompt, temperature: 0.7, maxTokens: 1000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        enrichmentFields.bestPractices = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${enrichmentFields.bestPractices.length} best practices`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate best practices:', error);
    }
  }

  // Generate use cases if missing
  if (!prompt.useCases || prompt.useCases.length === 0) {
    try {
      const useCasesPrompt = `Generate 5-10 use cases for this prompt: "${prompt.title}".
Return as JSON array of strings.`;
      const response = await provider.execute({ prompt: useCasesPrompt, temperature: 0.7, maxTokens: 1500 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        enrichmentFields.useCases = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${enrichmentFields.useCases.length} use cases`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate use cases:', error);
    }
  }

  // Generate best time to use if missing
  if (!prompt.bestTimeToUse) {
    try {
      const bestTimePrompt = `Generate a "best time to use" description for this prompt: "${prompt.title}".
Return a single string (1-2 sentences).`;
      const response = await provider.execute({ prompt: bestTimePrompt, temperature: 0.7, maxTokens: 200 });
      enrichmentFields.bestTimeToUse = response.content.trim();
      console.log('   ✅ Generated best time to use');
    } catch (error) {
      console.warn('   ⚠️  Failed to generate best time to use:', error);
    }
  }

  // Generate recommended model if missing
  if (!prompt.recommendedModel) {
    try {
      const modelPrompt = `Based on this prompt's complexity and use case, recommend the best AI model.
Prompt: "${prompt.title}"
Return just the model name (e.g., "gpt-4o", "claude-3-5-sonnet", "gemini-2.5-pro").`;
      const response = await provider.execute({ prompt: modelPrompt, temperature: 0.3, maxTokens: 50 });
      enrichmentFields.recommendedModel = response.content.trim();
      console.log(`   ✅ Generated recommended model: ${enrichmentFields.recommendedModel}`);
    } catch (error) {
      console.warn('   ⚠️  Failed to generate recommended model:', error);
    }
  }

  // Generate SEO keywords if missing
  if (!prompt.seoKeywords || prompt.seoKeywords.length === 0) {
    try {
      const keywordsPrompt = `Generate 10-15 SEO keywords for this prompt: "${prompt.title}".
Return as JSON array of strings.`;
      const response = await provider.execute({ prompt: keywordsPrompt, temperature: 0.5, maxTokens: 500 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        enrichmentFields.seoKeywords = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${enrichmentFields.seoKeywords.length} SEO keywords`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate SEO keywords:', error);
    }
  }

  // Generate difficulty if missing
  if (!prompt.difficulty) {
    try {
      const difficultyPrompt = `Rate the difficulty of this prompt on a scale of 1-5 (1=beginner, 5=expert).
Prompt: "${prompt.title}"
Return just the number.`;
      const response = await provider.execute({ prompt: difficultyPrompt, temperature: 0.2, maxTokens: 10 });
      const difficulty = parseInt(response.content.trim());
      if (!isNaN(difficulty) && difficulty >= 1 && difficulty <= 5) {
        enrichmentFields.difficulty = difficulty;
        console.log(`   ✅ Generated difficulty: ${difficulty}/5`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate difficulty:', error);
    }
  }

  // Generate estimated time if missing
  if (!prompt.estimatedTime) {
    try {
      const timePrompt = `Estimate the time to complete this prompt (in minutes).
Prompt: "${prompt.title}"
Return just the number (e.g., 5, 10, 15).`;
      const response = await provider.execute({ prompt: timePrompt, temperature: 0.2, maxTokens: 10 });
      const time = parseInt(response.content.trim());
      if (!isNaN(time) && time > 0) {
        enrichmentFields.estimatedTime = time;
        console.log(`   ✅ Generated estimated time: ${time} minutes`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate estimated time:', error);
    }
  }

  // Update prompt with enrichment fields
  if (Object.keys(enrichmentFields).length > 0) {
    await db.collection('prompts').updateOne(
      { id: prompt.id },
      { 
        $set: { 
          ...enrichmentFields,
          enrichedAt: new Date(),
          updatedAt: new Date(),
        } 
      }
    );
    return true;
  }

  return false;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Audit & Enrich Script (20 prompts)              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Get next batch
  const prompts = await getNextBatch();
  
  if (prompts.length === 0) {
    console.log('✅ No prompts to process - all batches complete!');
    return;
  }

  console.log(`📋 Found ${prompts.length} prompts to process\n`);

  const auditor = new PromptPatternAuditor(ORGANIZATION_ID);
  const processedIds: string[] = [];
  const enrichedIds: string[] = [];

  // Step 1: Audit all prompts
  console.log('🔍 Step 1: Auditing prompts...\n');
  for (const prompt of prompts) {
    try {
      console.log(`📊 Auditing: ${prompt.title}`);
      console.log(`   ID: ${prompt.id}`);
      
      const auditResult = await auditor.auditPrompt(prompt);
      
      // Save audit result
      const db = await getMongoDb();
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

      console.log(`   ✅ Audit complete: ${auditResult.overallScore}/10`);
      processedIds.push(prompt.id);
    } catch (error) {
      console.error(`   ❌ Audit failed:`, error instanceof Error ? error.message : String(error));
    }
    console.log('');
  }

  // Step 2: Enrich all prompts
  console.log('\n✨ Step 2: Enriching prompts...\n');
  for (const prompt of prompts) {
    try {
      console.log(`📝 Enriching: ${prompt.title}`);
      const enriched = await enrichPrompt(prompt);
      if (enriched) {
        enrichedIds.push(prompt.id);
        console.log(`   ✅ Enrichment complete`);
      } else {
        console.log(`   ℹ️  No new enrichment needed`);
      }
    } catch (error) {
      console.error(`   ❌ Enrichment failed:`, error instanceof Error ? error.message : String(error));
    }
    console.log('');
  }

  // Step 3: Mark batch as processed
  console.log('\n📌 Step 3: Marking batch as processed...\n');
  await markBatchProcessed(processedIds);

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Complete                                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Audited: ${processedIds.length}/${prompts.length}`);
  console.log(`✅ Enriched: ${enrichedIds.length}/${prompts.length}`);
  console.log(`✅ Marked as processed: ${processedIds.length} prompts\n`);
}

main().catch(console.error);

