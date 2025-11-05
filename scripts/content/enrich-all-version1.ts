#!/usr/bin/env tsx
/**
 * Batch Enrich All Version 1 Prompts
 * 
 * Finds all prompts with audit version 1 and enriches them
 * Only processes prompts that haven't been enriched yet
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';

// Import the enrichment logic directly (not the script)
async function enrichPromptWithAI(promptId: string) {
  const db = await getMongoDb();
  
  // Get the prompt
  const prompt = await db.collection('prompts').findOne({ id: promptId });
  if (!prompt) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  // Get latest audit results
  const auditResult = await db.collection('prompt_audit_results').findOne(
    { promptId: prompt.id },
    { sort: { auditVersion: -1 } }
  );

  if (!auditResult) {
    throw new Error(`No audit results found for prompt: ${promptId}`);
  }

  // Only enrich prompts at revision 1 (not yet improved)
  // Check prompt revision, not audit version
  const promptRevision = prompt.currentRevision || 1;
  if (promptRevision > 1) {
    return { skipped: true, reason: `Prompt revision ${promptRevision}, not revision 1` };
  }

  const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
  const provider = new OpenAIAdapter('gpt-4o');

  // Generate enrichment fields (same logic as enrich-prompt.ts)
  let caseStudies = prompt.caseStudies || [];
  let examples = prompt.examples || [];
  let bestPractices = prompt.bestPractices || [];
  let useCases = prompt.useCases || [];
  let bestTimeToUse = prompt.bestTimeToUse || [];
  let recommendedModel = prompt.recommendedModel || [];
  let whatIs = prompt.whatIs;
  let whyUse = prompt.whyUse || [];

  // Generate case studies if missing
  if (!caseStudies || caseStudies.length === 0) {
    try {
      const caseStudyPrompt = `Generate 3 detailed case studies for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...
Format as JSON array with: title, scenario, challenge, process, outcome, keyLearning`;
      const response = await provider.execute({ prompt: caseStudyPrompt, temperature: 0.7, maxTokens: 2000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        caseStudies = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate case studies: ${error}`);
    }
  }

  // Generate examples if missing
  if (!examples || examples.length === 0) {
    try {
      const examplePrompt = `Generate 2-3 practical examples for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array with: title, input, expectedOutput`;
      const response = await provider.execute({ prompt: examplePrompt, temperature: 0.7, maxTokens: 1500 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        examples = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate examples: ${error}`);
    }
  }

  // Generate best practices if missing
  if (!bestPractices || bestPractices.length === 0) {
    try {
      const bestPracticesPrompt = `Generate 5-7 best practices for using this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array of strings`;
      const response = await provider.execute({ prompt: bestPracticesPrompt, temperature: 0.7, maxTokens: 1000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        bestPractices = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate best practices: ${error}`);
    }
  }

  // Generate use cases if missing
  if (!useCases || useCases.length === 0) {
    try {
      const useCasesPrompt = `Generate 5-10 specific use cases for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array of strings`;
      const response = await provider.execute({ prompt: useCasesPrompt, temperature: 0.7, maxTokens: 800 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        useCases = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate use cases: ${error}`);
    }
  }

  // Generate best time to use if missing
  if (!bestTimeToUse || (Array.isArray(bestTimeToUse) && bestTimeToUse.length === 0)) {
    try {
      const bestTimePrompt = `Generate 5-7 scenarios for when to use this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array of strings`;
      const response = await provider.execute({ prompt: bestTimePrompt, temperature: 0.7, maxTokens: 800 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        bestTimeToUse = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate best time to use: ${error}`);
    }
  }

  // Generate "What is" and "Why Use" explanations if missing
  if (!whatIs || !whyUse || whyUse.length === 0) {
    // Check if whatIs is just the title or too short - regenerate if so
    const isWhatIsJustTitle = whatIs && (
      whatIs.trim() === prompt.title.trim() ||
      whatIs.trim().toLowerCase() === prompt.title.trim().toLowerCase() ||
      whatIs.length < 50 // Too short to be a proper explanation
    );
    
    if (!whatIs || isWhatIsJustTitle || !whyUse || whyUse.length === 0) {
    try {
      const explanationPrompt = `Generate educational content for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...
CATEGORY: ${prompt.category}
Requirements:
1. "What is" section: Write a comprehensive explanation (3-5 sentences) that explains what ${prompt.title} is. Do NOT just repeat the title. Explain the concept, its purpose, and how it works. Write for SEO and user education. Be specific and informative.
2. "Why Use" section: Generate 6-8 specific reasons why someone would use ${prompt.title}. Focus on practical benefits and real-world value.
IMPORTANT: The "What is" response must be a full explanation, not just the title repeated. Minimum 3 sentences explaining the concept.
Format as JSON: { "whatIs": "Full explanation (3-5 sentences, not just the title)...", "whyUse": ["reason1", "reason2", ...] }`;
      const response = await provider.execute({ prompt: explanationPrompt, temperature: 0.7, maxTokens: 1500 });
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const explanationData = JSON.parse(jsonMatch[0]);
        if (explanationData.whatIs) whatIs = explanationData.whatIs;
        if (explanationData.whyUse && Array.isArray(explanationData.whyUse)) {
          whyUse = explanationData.whyUse;
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate explanations: ${error}`);
    }
  }

  // Generate recommended models if missing
  if (!recommendedModel || recommendedModel.length === 0) {
    try {
      const modelsPrompt = `Recommend 2-3 AI models for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array with: model, provider, reason, useCase`;
      const response = await provider.execute({ prompt: modelsPrompt, temperature: 0.5, maxTokens: 1000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendedModel = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate recommended models: ${error}`);
    }
  }

  // Update prompt with enriched data
  const enrichedPrompt = {
    ...prompt,
    caseStudies: caseStudies.length > 0 ? caseStudies : prompt.caseStudies,
    examples: examples.length > 0 ? examples : prompt.examples,
    bestPractices: bestPractices.length > 0 ? bestPractices : prompt.bestPractices,
    useCases: useCases.length > 0 ? useCases : prompt.useCases,
    bestTimeToUse: bestTimeToUse.length > 0 ? bestTimeToUse : prompt.bestTimeToUse,
    recommendedModel: recommendedModel.length > 0 ? recommendedModel : prompt.recommendedModel,
    whatIs: whatIs || prompt.whatIs,
    whyUse: whyUse.length > 0 ? whyUse : prompt.whyUse,
    updatedAt: new Date(),
  };

  await db.collection('prompts').updateOne(
    { id: promptId },
    { $set: enrichedPrompt }
  );

  return { success: true, enrichedPrompt };
}

async function enrichAllVersion1Prompts() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Enrich All Version 1 Prompts                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Find prompts with revision 1 (not yet improved)
  // We want to enrich prompts that haven't been improved yet
  const prompts = await db.collection('prompts').find({
    currentRevision: { $lte: 1 } // Only revision 1 or less
  }).toArray();
  
  if (prompts.length === 0) {
    console.log('✅ No prompts found at revision 1');
    console.log('   All prompts have been enriched\n');
    await db.client.close();
    process.exit(0);
  }

  console.log(`📋 Found ${prompts.length} prompts at revision 1\n`);
  console.log('🚀 Starting batch enrichment...\n');

  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
    total: prompts.length,
  };

  // Process each prompt
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    try {
      console.log(`[${i + 1}/${prompts.length}] 📝 Enriching: "${prompt.title}"`);
      console.log(`   ID: ${prompt.id}\n`);

      const result = await enrichPromptWithAI(prompt.id);
      
      if (result.skipped) {
        results.skipped++;
        console.log(`   ℹ️  ${result.reason}\n`);
      } else if (result.success) {
        results.success++;
        console.log(`   ✅ Enrichment complete\n`);
      }
    } catch (error) {
      results.failed++;
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Enrichment Complete                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Successful: ${results.success}/${results.total}`);
  console.log(`   ℹ️  Skipped: ${results.skipped}/${results.total}`);
  console.log(`   ❌ Failed: ${results.failed}/${results.total}`);
  console.log(`\n✨ All version 1 prompts processed!\n`);

  await db.client.close();
  process.exit(0);
}

enrichAllVersion1Prompts().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
