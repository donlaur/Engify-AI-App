#!/usr/bin/env tsx
/**
 * AI-Powered Prompt Enrichment Based on Audit Feedback
 * Uses AI to generate case studies, examples, and best practices based on audit recommendations
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';

async function enrichPromptWithAI(promptId: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI-Powered Prompt Enrichment Based on Audit Feedback ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();
  
  // Get the prompt
  const prompt = await db.collection('prompts').findOne({ id: promptId });
  if (!prompt) {
    console.error(`❌ Prompt not found: ${promptId}`);
    process.exit(1);
  }

  // Get latest audit results
  const auditResult = await db.collection('prompt_audit_results').findOne(
    { promptId: prompt.id },
    { sort: { auditVersion: -1 } }
  );

  if (!auditResult) {
    console.error(`❌ No audit results found for prompt: ${promptId}`);
    console.error('   Please run audit first: pnpm tsx scripts/content/test-audit-adr.ts');
    process.exit(1);
  }

  // Only enrich prompts at audit version 1 (first audit)
  if (auditResult.auditVersion !== 1) {
    console.log(`ℹ️  Skipping enrichment: Prompt already enriched (audit version ${auditResult.auditVersion})`);
    console.log(`   Only enriching prompts at audit version 1`);
    process.exit(0);
  }

  console.log(`📝 Enriching: "${prompt.title}"`);
  console.log(`   Current Score: ${auditResult.overallScore}/10`);
  console.log(`   Missing Elements: ${auditResult.missingElements?.length || 0}`);
  console.log(`   Recommendations: ${auditResult.recommendations?.length || 0}\n`);

  const provider = new OpenAIAdapter('gpt-4o');

  // Generate case studies
  let caseStudies = prompt.caseStudies || [];
  if (!caseStudies || caseStudies.length === 0) {
    console.log('📚 Generating case studies...');
    const caseStudyPrompt = `Generate 3 detailed case studies for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...

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

    try {
      const response = await provider.execute({
        prompt: caseStudyPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      });
      
      // Extract JSON from response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        caseStudies = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${caseStudies.length} case studies`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate case studies:', error);
    }
  }

  // Generate examples
  let examples = prompt.examples || [];
  if (!examples || examples.length === 0) {
    console.log('💡 Generating examples...');
    const examplePrompt = `Generate 2-3 practical examples for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...

Requirements:
- Show concrete input/output pairs
- Practical, real-world scenarios
- Clear title for each example

Format as JSON array:
[
  {
    "title": "...",
    "input": "...",
    "expectedOutput": "..."
  }
]`;

    try {
      const response = await provider.execute({
        prompt: examplePrompt,
        temperature: 0.7,
        maxTokens: 1500,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        examples = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${examples.length} examples`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate examples:', error);
    }
  }

  // Generate best practices
  let bestPractices = prompt.bestPractices || [];
  if (!bestPractices || bestPractices.length === 0) {
    console.log('✅ Generating best practices...');
    const bestPracticesPrompt = `Generate 5-7 best practices for using this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...

Requirements:
- Actionable, specific advice
- Based on prompt content and purpose
- Practical tips for effective use

Format as JSON array:
["practice 1", "practice 2", ...]`;

    try {
      const response = await provider.execute({
        prompt: bestPracticesPrompt,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        bestPractices = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${bestPractices.length} best practices`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate best practices:', error);
    }
  }

  // Generate use cases
  let useCases = prompt.useCases || [];
  if (!useCases || useCases.length === 0) {
    console.log('📝 Generating use cases...');
    const useCasesPrompt = `Generate 5-10 specific use cases for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}

Requirements:
- Specific scenarios where this prompt would be valuable
- Clear, actionable use cases
- Diverse applications

Format as JSON array:
["use case 1", "use case 2", ...]`;

    try {
      const response = await provider.execute({
        prompt: useCasesPrompt,
        temperature: 0.7,
        maxTokens: 800,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        useCases = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${useCases.length} use cases`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate use cases:', error);
    }
  }

  // Generate best time to use
  let bestTimeToUse = prompt.bestTimeToUse || [];
  if (!bestTimeToUse || (Array.isArray(bestTimeToUse) && bestTimeToUse.length === 0)) {
    console.log('⏰ Generating "best time to use" scenarios...');
    const bestTimePrompt = `Generate 5-7 scenarios for when to use this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}

Requirements:
- Specific situations/timing
- Clear guidance on when this prompt is most valuable

Format as JSON array:
["scenario 1", "scenario 2", ...]`;

    try {
      const response = await provider.execute({
        prompt: bestTimePrompt,
        temperature: 0.7,
        maxTokens: 800,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        bestTimeToUse = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${bestTimeToUse.length} "best time to use" scenarios`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate best time to use:', error);
    }
  }

  // Generate "What is" and "Why Use" explanations
  let whatIs = prompt.whatIs;
  let whyUse = prompt.whyUse || [];
  
  if (!whatIs || !whyUse || whyUse.length === 0) {
    console.log('📖 Generating "What is" and "Why Use" explanations...');
    const explanationPrompt = `Generate educational content for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...
CATEGORY: ${prompt.category}

Requirements:
1. "What is" section: A clear, comprehensive explanation (2-3 sentences) of what ${prompt.title} is, written for SEO and user education. Explain the concept clearly.

2. "Why Use" section: Generate 6-8 specific reasons why someone would use ${prompt.title}. Focus on practical benefits and real-world value.

Format as JSON:
{
  "whatIs": "Clear explanation of what this concept is...",
  "whyUse": [
    "Reason 1",
    "Reason 2",
    ...
  ]
}`;

    try {
      const response = await provider.execute({
        prompt: explanationPrompt,
        temperature: 0.7,
        maxTokens: 1500,
      });
      
      // Extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const explanationData = JSON.parse(jsonMatch[0]);
        if (explanationData.whatIs) {
          whatIs = explanationData.whatIs;
        }
        if (explanationData.whyUse && Array.isArray(explanationData.whyUse)) {
          whyUse = explanationData.whyUse;
        }
        console.log(`   ✅ Generated "What is" and ${whyUse.length} "Why Use" reasons`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate explanations:', error);
    }
  }

  // Generate recommended models
  let recommendedModel = prompt.recommendedModel || [];
  if (!recommendedModel || recommendedModel.length === 0) {
    console.log('🤖 Generating recommended models...');
    const modelsPrompt = `Recommend 2-3 AI models for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 300)}...

Requirements:
- Consider prompt complexity and requirements
- Include models from different providers (OpenAI, Anthropic, etc.)
- Provide reason for each recommendation

Format as JSON array:
[
  {
    "model": "gpt-4o",
    "provider": "openai",
    "reason": "...",
    "useCase": "..."
  }
]`;

    try {
      const response = await provider.execute({
        prompt: modelsPrompt,
        temperature: 0.5,
        maxTokens: 1000,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendedModel = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Generated ${recommendedModel.length} recommended models`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate recommended models:', error);
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
    // Add meta description if missing
    metaDescription: prompt.metaDescription || prompt.description.substring(0, 160),
  };

  // Update in database
  await db.collection('prompts').updateOne(
    { id: promptId },
    { $set: enrichedPrompt }
  );

  console.log('\n✅ Prompt enriched with:');
  if (caseStudies.length > 0) console.log(`   📚 ${caseStudies.length} case studies`);
  if (examples.length > 0) console.log(`   💡 ${examples.length} examples`);
  if (bestPractices.length > 0) console.log(`   ✅ ${bestPractices.length} best practices`);
  if (useCases.length > 0) console.log(`   📝 ${useCases.length} use cases`);
  if (bestTimeToUse.length > 0) console.log(`   ⏰ ${bestTimeToUse.length} "best time to use" scenarios`);
  if (recommendedModel.length > 0) console.log(`   🤖 ${recommendedModel.length} recommended models`);
  if (whatIs) console.log(`   📖 "What is" explanation`);
  if (whyUse.length > 0) console.log(`   ❓ ${whyUse.length} "Why Use" reasons`);
  console.log(`\n📄 Updated prompt saved to database!\n`);

  await db.client.close();
  return enrichedPrompt;
}

// Export for use in batch scripts
export { enrichPromptWithAI };

// Get prompt ID from command line (only if run directly)
if (require.main === module) {
  const promptId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1] || 
                   process.argv[2];

  if (!promptId) {
    console.error('Usage: tsx enrich-prompt.ts --id=<prompt-id>');
    process.exit(1);
  }

  enrichPromptWithAI(promptId)
    .then(() => {
      console.log('✨ Enrichment complete! Run audit again to see score improvement.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
