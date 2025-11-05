#!/usr/bin/env tsx
/**
 * Test All AI Models with Real Prompt Audit
 * 
 * Tests each model from the ai_models database by actually auditing a prompt
 * This gives you real feedback while verifying models work correctly
 * 
 * Usage:
 *   pnpm tsx scripts/content/test-all-ai-models.ts
 *   pnpm tsx scripts/content/test-all-ai-models.ts --provider=openai  # Test only OpenAI models
 *   pnpm tsx scripts/content/test-all-ai-models.ts --provider=anthropic  # Test only Claude models
 *   pnpm tsx scripts/content/test-all-ai-models.ts --provider=google  # Test only Gemini models
 *   pnpm tsx scripts/content/test-all-ai-models.ts --prompt-id=<id>  # Test with specific prompt
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';
import { ClaudeAdapter } from '@/lib/ai/v2/adapters/ClaudeAdapter';
import { GeminiAdapter } from '@/lib/ai/v2/adapters/GeminiAdapter';

interface TestResult {
  provider: string;
  modelId: string;
  displayName: string;
  status: 'success' | 'error';
  auditFeedback?: {
    score?: number;
    issues?: string[];
    recommendations?: string[];
    responsePreview?: string;
  };
  error?: string;
  latencyMs?: number;
  tokensUsed?: number;
}

async function testModelWithPrompt(model: any, prompt: any): Promise<TestResult> {
  const startTime = Date.now();
  
  // Create a focused audit prompt for testing
  const auditPrompt = `You are reviewing a prompt for quality and completeness.

PROMPT TO REVIEW:
Title: ${prompt.title || 'N/A'}
Description: ${prompt.description?.substring(0, 200) || 'N/A'}
Content: ${prompt.content?.substring(0, 500) || 'N/A'}

Provide a brief audit:
1. Overall quality score (1-10)
2. Top 2-3 issues found
3. Top 2-3 recommendations for improvement

Keep response concise (under 200 words).`;

  try {
    let adapter: any;
    let response: any;

    if (model.provider === 'openai') {
      adapter = new OpenAIAdapter(model.id);
      response = await adapter.execute({
        prompt: auditPrompt,
        temperature: 0.3,
        maxTokens: 300,
      });
    } else if (model.provider === 'anthropic') {
      adapter = new ClaudeAdapter(model.id);
      response = await adapter.execute({
        prompt: auditPrompt,
        temperature: 0.3,
        maxTokens: 300,
      });
    } else if (model.provider === 'google') {
      adapter = new GeminiAdapter(model.id);
      response = await adapter.execute({
        prompt: auditPrompt,
        temperature: 0.3,
        maxTokens: 300,
      });
    } else {
      return {
        provider: model.provider,
        modelId: model.id,
        displayName: model.displayName,
        status: 'error',
        error: `Unsupported provider: ${model.provider}`,
      };
    }

    const latencyMs = Date.now() - startTime;
    const responseText = response.content || '';

    // Extract score from response
    const scoreMatch = responseText.match(/score[:\s]+(\d+(?:\.\d+)?)/i) || 
                       responseText.match(/(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : undefined;

    // Extract issues (look for numbered lists or bullet points)
    const issues: string[] = [];
    const issueMatches = responseText.match(/(?:issue|problem|concern)[s]?[:\s]+([^\n]+)/gi);
    if (issueMatches) {
      issues.push(...issueMatches.slice(0, 3).map(m => m.replace(/^(?:issue|problem|concern)[s]?[:\s]+/i, '').trim()));
    }

    // Extract recommendations
    const recommendations: string[] = [];
    const recMatches = responseText.match(/(?:recommend|suggest|improve)[s]?[:\s]+([^\n]+)/gi);
    if (recMatches) {
      recommendations.push(...recMatches.slice(0, 3).map(m => m.replace(/^(?:recommend|suggest|improve)[s]?[:\s]+/i, '').trim()));
    }

    return {
      provider: model.provider,
      modelId: model.id,
      displayName: model.displayName,
      status: 'success',
      auditFeedback: {
        score,
        issues: issues.length > 0 ? issues : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        responsePreview: responseText.substring(0, 200),
      },
      latencyMs,
      tokensUsed: response.usage?.totalTokens || 0,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      provider: model.provider,
      modelId: model.id,
      displayName: model.displayName,
      status: 'error',
      error: errorMessage,
      latencyMs: Date.now() - startTime,
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const providerFilter = args.find(arg => arg.startsWith('--provider='))?.split('=')[1];
  const promptIdArg = args.find(arg => arg.startsWith('--prompt-id='))?.split('=')[1];

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Model Test Suite - Real Prompt Audit                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Get a test prompt
  let testPrompt: any;
  if (promptIdArg) {
    testPrompt = await db.collection('prompts').findOne({
      $or: [
        { id: promptIdArg },
        { slug: promptIdArg },
        { _id: promptIdArg },
      ],
    });
    if (!testPrompt) {
      console.log(`❌ Prompt not found: ${promptIdArg}`);
      await db.client.close();
      process.exit(1);
    }
    console.log(`📝 Using prompt: "${testPrompt.title}" (${testPrompt.id})\n`);
  } else {
    // Get first prompt at revision 1 (not yet improved)
    testPrompt = await db.collection('prompts').findOne({
      currentRevision: { $lte: 1 },
    });
    if (!testPrompt) {
      // Fallback to any prompt
      testPrompt = await db.collection('prompts').findOne({});
    }
    if (!testPrompt) {
      console.log('❌ No prompts found in database');
      await db.client.close();
      process.exit(1);
    }
    console.log(`📝 Using prompt: "${testPrompt.title}" (${testPrompt.id})`);
    console.log(`   Use --prompt-id=<id> to test with a specific prompt\n`);
  }

  // Get all active models from database
  const query: any = { status: 'active' };
  if (providerFilter) {
    query.provider = providerFilter;
    console.log(`🔍 Filtering by provider: ${providerFilter}\n`);
  }

  const allModels = await db.collection('ai_models')
    .find(query)
    .sort({ provider: 1, recommended: -1, tier: 1 })
    .toArray();

  // Filter to only text-to-text models (skip image/video models)
  const models = allModels.filter((model: any) => {
    // Must have 'text' capability
    const capabilities = model.capabilities || [];
    if (!capabilities.includes('text')) {
      return false;
    }

    // Skip if it's primarily an image/video generation model
    const tags = model.tags || [];
    const modelId = (model.id || '').toLowerCase();
    const modelName = (model.displayName || model.name || '').toLowerCase();

    // Skip audio models (they require audio input/output)
    if (capabilities.includes('audio-generation') ||
        capabilities.includes('audio') ||
        tags.includes('audio') ||
        modelId.includes('audio') ||
        modelName.includes('audio')) {
      return false;
    }

    // Skip realtime models (they use different API endpoints)
    if (modelId.includes('realtime') ||
        modelName.includes('realtime')) {
      return false;
    }

    // Skip image generation models
    if (capabilities.includes('image-generation') || 
        tags.includes('image-generation') ||
        tags.includes('image') ||
        modelId.includes('image') ||
        modelId.includes('flux') ||
        modelId.includes('dalle') ||
        modelId.includes('midjourney') ||
        modelName.includes('image') ||
        modelName.includes('flux')) {
      return false;
    }

    // Skip video generation models
    if (capabilities.includes('video-generation') ||
        tags.includes('video-generation') ||
        tags.includes('video') ||
        modelId.includes('video') ||
        modelId.includes('sora') ||
        modelId.includes('veo') ||
        modelName.includes('video') ||
        modelName.includes('sora')) {
      return false;
    }

    return true;
  });

  const skippedCount = allModels.length - models.length;

  if (models.length === 0) {
    console.log('❌ No text-to-text models found in database');
    if (skippedCount > 0) {
      console.log(`   Skipped ${skippedCount} image/video/audio models`);
    }
    console.log('   Run: pnpm tsx scripts/db/sync-ai-models-latest.ts');
    await db.client.close();
    process.exit(1);
  }

  if (skippedCount > 0) {
    console.log(`ℹ️  Skipped ${skippedCount} non-text models (image/video/audio)`);
    console.log(`   Only testing ${models.length} text-to-text models\n`);
  }

  console.log(`📊 Testing ${models.length} text-to-text models with real prompt audit\n`);
  console.log('🚀 Starting tests...\n');

  const results: TestResult[] = [];

  // Test each model
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`[${i + 1}/${models.length}] Testing: ${model.displayName || model.id}`);
    console.log(`   Provider: ${model.provider} | ID: ${model.id}`);

    const result = await testModelWithPrompt(model, testPrompt);
    results.push(result);

    if (result.status === 'success') {
      console.log(`   ✅ Success (${result.latencyMs}ms, ${result.tokensUsed} tokens)`);
      if (result.auditFeedback?.score) {
        console.log(`   📊 Score: ${result.auditFeedback.score}/10`);
      }
      if (result.auditFeedback?.issues && result.auditFeedback.issues.length > 0) {
        console.log(`   ⚠️  Issues: ${result.auditFeedback.issues.slice(0, 2).join('; ')}`);
      }
      if (result.auditFeedback?.recommendations && result.auditFeedback.recommendations.length > 0) {
        console.log(`   💡 Recommendations: ${result.auditFeedback.recommendations.slice(0, 2).join('; ')}`);
      }
      
      // Mark model as verified/working in database
      try {
        await db.collection('ai_models').updateOne(
          { id: model.id },
          { 
            $set: { 
              lastVerified: new Date(),
              updatedAt: new Date(),
            }
          }
        );
        console.log(`   💾 Marked as verified in database`);
      } catch (error) {
        console.log(`   ⚠️  Failed to update verification status: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      console.log(`   ❌ Error: ${result.error}`);
      
      // Check if error is due to wrong model type (not deprecated, just wrong API/input type)
      const errorMsg = result.error?.toLowerCase() || '';
      const isWrongModelType = errorMsg.includes('requires') && 
                              (errorMsg.includes('audio') || errorMsg.includes('video') || errorMsg.includes('image')) ||
                              errorMsg.includes('not a chat model') ||
                              errorMsg.includes('not supported in') ||
                              errorMsg.includes('different endpoint');
      
      // If error is 404 (model not found) or explicitly deprecated, mark as deprecated
      const isDeprecated = errorMsg.includes('404') || 
                           errorMsg.includes('not found') || 
                           errorMsg.includes('not_found_error') ||
                           errorMsg.includes('deprecated') ||
                           errorMsg.includes('sunset');
      
      if (isDeprecated) {
        // Model is actually deprecated/removed
        try {
          await db.collection('ai_models').updateOne(
            { id: model.id },
            { 
              $set: { 
                status: 'deprecated',
                deprecationDate: new Date(),
                updatedAt: new Date(),
              }
            }
          );
          console.log(`   🏷️  Marked as deprecated in database (model not found/removed)`);
        } catch (error) {
          console.log(`   ⚠️  Failed to mark as deprecated: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else if (isWrongModelType) {
        // Model works but is wrong type for text-to-text - update capabilities/tags instead
        try {
          await db.collection('ai_models').updateOne(
            { id: model.id },
            { 
              $set: { 
                isAllowed: false, // Don't allow for text-to-text tasks
                updatedAt: new Date(),
              },
              $addToSet: {
                tags: errorMsg.includes('audio') ? 'audio-only' : 
                      errorMsg.includes('realtime') ? 'realtime-only' : 
                      'unsuitable-for-text'
              }
            }
          );
          console.log(`   🏷️  Marked as unsuitable for text-to-text tasks (wrong model type)`);
        } catch (error) {
          console.log(`   ⚠️  Failed to update model status: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    console.log('');
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);

  // Show best scoring models
  const scoredResults = successful.filter(r => r.auditFeedback?.score !== undefined);
  if (scoredResults.length > 0) {
    console.log('📊 Model Audit Scores:');
    scoredResults
      .sort((a, b) => (b.auditFeedback?.score || 0) - (a.auditFeedback?.score || 0))
      .slice(0, 5)
      .forEach(r => {
        console.log(`   ${r.provider}: ${r.displayName || r.modelId} - Score: ${r.auditFeedback?.score}/10`);
      });
    console.log('');
  }

  if (successful.length > 0) {
    console.log('✅ Working Models:');
    successful.forEach(r => {
      console.log(`   ${r.provider}: ${r.displayName || r.modelId}`);
      if (r.auditFeedback?.score) {
        console.log(`      Score: ${r.auditFeedback.score}/10`);
      }
    });
    console.log('');
  }

  if (failed.length > 0) {
    console.log('❌ Failed Models:');
    failed.forEach(r => {
      console.log(`   ${r.provider}: ${r.displayName || r.modelId}`);
      console.log(`      Error: ${r.error}`);
    });
    console.log('');
  }

  // Group by provider
  const byProvider = results.reduce((acc, r) => {
    if (!acc[r.provider]) {
      acc[r.provider] = { success: 0, failed: 0 };
    }
    if (r.status === 'success') {
      acc[r.provider].success++;
    } else {
      acc[r.provider].failed++;
    }
    return acc;
  }, {} as Record<string, { success: number; failed: number }>);

  console.log('📊 By Provider:');
  Object.entries(byProvider).forEach(([provider, stats]) => {
    const total = stats.success + stats.failed;
    const successRate = ((stats.success / total) * 100).toFixed(1);
    console.log(`   ${provider}: ${stats.success}/${total} (${successRate}%)`);
  });

  console.log('\n💡 Use this feedback to improve your prompt!');
  console.log(`   Prompt ID: ${testPrompt.id}`);
  console.log(`   Run: pnpm tsx scripts/content/enrich-prompt.ts --id=${testPrompt.id}\n`);

  await db.client.close();

  // Exit with error code if any tests failed
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
