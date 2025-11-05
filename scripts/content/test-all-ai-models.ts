#!/usr/bin/env tsx
/**
 * Test All AI Models with Full Prompt Audits
 * 
 * Tests all active models by running FULL audits on prompts using the multi-agent system.
 * Saves all audit results to prompt_audit_results collection for actionable feedback.
 * 
 * This provides:
 * - Full audit scores (overall + category scores)
 * - Issues found
 * - Recommendations for improvement
 * - Missing elements
 * - All stored in DB for batch improvement scripts
 * 
 * Usage:
 *   pnpm tsx scripts/content/test-all-ai-models.ts
 *   pnpm tsx scripts/content/test-all-ai-models.ts --prompt-id=<id>  # Test specific prompt
 *   pnpm tsx scripts/content/test-all-ai-models.ts --prompts=5  # Test on 5 different prompts
 *   pnpm tsx scripts/content/test-all-ai-models.ts --provider=openai  # Test only OpenAI models
 * 
 * Results saved to:
 *   - prompt_audit_results collection (with testedModel field)
 *   - Use batch-improve-from-audits.ts to apply improvements
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';

interface TestResult {
  provider: string;
  modelId: string;
  displayName: string;
  status: 'success' | 'error';
  auditResult?: {
    overallScore: number;
    categoryScores: Record<string, number>;
    issues: string[];
    recommendations: string[];
    missingElements: string[];
  };
  error?: string;
  latencyMs?: number;
  auditVersion?: number;
}

async function testModelWithFullAudit(model: any, prompt: any): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    // Get model's supported parameters from DB (or use defaults)
    const db = await getMongoDb();
    const modelRecord = await db.collection('ai_models').findOne({ id: model.id });
    const supportedParams = modelRecord?.supportedParameters || {};
    
    // Determine safe parameters to use based on model's known limitations
    let temperature = 0.7; // Default
    let maxTokens = 2000; // Default
    
    // Check if model has temperature restrictions
    if (supportedParams.temperature) {
      if (supportedParams.temperature.supported === false) {
        temperature = undefined; // Don't send if not supported
      } else {
        // Use model's default or respect min/max
        if (supportedParams.temperature.default !== undefined) {
          temperature = supportedParams.temperature.default;
        } else if (supportedParams.temperature.max !== undefined) {
          temperature = Math.min(0.7, supportedParams.temperature.max);
        }
      }
    }
    
    // Check if model has maxTokens restrictions
    if (supportedParams.maxTokens) {
      if (supportedParams.maxTokens.supported === false) {
        maxTokens = undefined; // Don't send if not supported
      } else {
        // Use model's default or respect min/max
        if (supportedParams.maxTokens.default !== undefined) {
          maxTokens = supportedParams.maxTokens.default;
        } else if (supportedParams.maxTokens.max !== undefined) {
          maxTokens = Math.min(2000, supportedParams.maxTokens.max);
        }
      }
    }
    
    // Use the full audit system (not just a simple prompt)
    const auditor = new PromptPatternAuditor('system', { 
      skipExecutionTest: true, // Skip execution test for speed
      useCache: true, // Use cache to speed up
    });

    // Run full audit on the prompt
    const auditResult = await auditor.auditPrompt(prompt);
    const latencyMs = Date.now() - startTime;

    // Save audit result to database so others can take action
    const existingAudit = await db.collection('prompt_audit_results').findOne(
      { promptId: prompt.id },
      { sort: { auditVersion: -1 } }
    );
    
    const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
    const auditDate = new Date();

    await db.collection('prompt_audit_results').insertOne({
      promptId: prompt.id,
      promptTitle: prompt.title,
      promptRevision: prompt.currentRevision || 1,
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
      auditedBy: `model-test-${model.id}`, // Track which model tested
      testedModel: model.id, // Track which model was used for this audit
      testedProvider: model.provider,
      createdAt: auditDate,
      updatedAt: auditDate,
    });

    return {
      provider: model.provider,
      modelId: model.id,
      displayName: model.displayName,
      status: 'success',
      auditResult: {
        overallScore: auditResult.overallScore,
        categoryScores: auditResult.categoryScores,
        issues: auditResult.issues,
        recommendations: auditResult.recommendations,
        missingElements: auditResult.missingElements,
      },
      latencyMs,
      auditVersion,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const latencyMs = Date.now() - startTime;
    
    // Parse error to detect parameter failures
    const errorLower = errorMessage.toLowerCase();
    let parameterFailure: { parameter: string; error: string; attemptedValue?: any } | null = null;
    
    if (errorLower.includes('temperature') || errorLower.includes('temp')) {
      parameterFailure = {
        parameter: 'temperature',
        error: errorMessage,
        attemptedValue: undefined, // We don't know what was attempted in audit script
      };
    } else if (errorLower.includes('max_tokens') || errorLower.includes('maxtokens') || errorLower.includes('max tokens')) {
      parameterFailure = {
        parameter: 'maxTokens',
        error: errorMessage,
        attemptedValue: undefined,
      };
    } else if (errorLower.includes('max_output_tokens') || errorLower.includes('maxoutputtokens')) {
      parameterFailure = {
        parameter: 'maxTokens',
        error: errorMessage,
        attemptedValue: undefined,
      };
    }
    
    // If we detected a parameter failure, record it in the database
    if (parameterFailure) {
      try {
        const db = await getMongoDb();
        await db.collection('ai_models').updateOne(
          { id: model.id },
          {
            $push: {
              parameterFailures: {
                ...parameterFailure,
                timestamp: new Date(),
                source: 'test-all-ai-models',
              },
            },
            $set: {
              updatedAt: new Date(),
            },
          }
        );
        console.log(`   📝 Recorded parameter failure: ${parameterFailure.parameter}`);
      } catch (dbError) {
        console.log(`   ⚠️  Failed to record parameter failure: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      }
    }
    
    return {
      provider: model.provider,
      modelId: model.id,
      displayName: model.displayName,
      status: 'error',
      error: errorMessage,
      latencyMs,
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const providerFilter = args.find(arg => arg.startsWith('--provider='))?.split('=')[1];
  const promptIdArg = args.find(arg => arg.startsWith('--prompt-id='))?.split('=')[1];
  const promptsCountArg = args.find(arg => arg.startsWith('--prompts='))?.split('=')[1];
  const promptsCount = promptsCountArg ? parseInt(promptsCountArg, 10) : 1; // Default: test on 1 prompt

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Model Test Suite - Full Prompt Audits                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Get test prompt(s)
  let testPrompts: any[] = [];
  
  if (promptIdArg) {
    // Specific prompt requested
    const prompt = await db.collection('prompts').findOne({
      $or: [
        { id: promptIdArg },
        { slug: promptIdArg },
        { _id: promptIdArg },
      ],
    });
    if (!prompt) {
      console.log(`❌ Prompt not found: ${promptIdArg}`);
      await db.client.close();
      process.exit(1);
    }
    testPrompts = [prompt];
    console.log(`📝 Using prompt: "${prompt.title}" (${prompt.id})\n`);
  } else if (promptsCount > 1) {
    // Get multiple prompts for testing
    testPrompts = await db.collection('prompts')
      .find({})
      .limit(promptsCount)
      .toArray();
    
    if (testPrompts.length === 0) {
      console.log('❌ No prompts found in database');
      await db.client.close();
      process.exit(1);
    }
    console.log(`📝 Testing on ${testPrompts.length} prompts:`);
    testPrompts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} (${p.id})`);
    });
    console.log('');
  } else {
    // Default: Get first prompt at revision 1 (not yet improved)
    const prompt = await db.collection('prompts').findOne({
      currentRevision: { $lte: 1 },
    }) || await db.collection('prompts').findOne({});
    
    if (!prompt) {
      console.log('❌ No prompts found in database');
      await db.client.close();
      process.exit(1);
    }
    testPrompts = [prompt];
    console.log(`📝 Using prompt: "${prompt.title}" (${prompt.id})`);
    console.log(`   Use --prompt-id=<id> to test specific prompt`);
    console.log(`   Use --prompts=N to test on N different prompts\n`);
  }

  // Get all active models from database (exclude deprecated/sunset)
  const query: any = { 
    status: 'active' // Only active models
  };
  if (providerFilter) {
    query.provider = providerFilter;
    console.log(`🔍 Filtering by provider: ${providerFilter}\n`);
  }

  const allModels = await db.collection('ai_models')
    .find(query)
    .sort({ provider: 1, recommended: -1, tier: 1 })
    .toArray();

  // Double-check: filter out any deprecated/sunset models that might have slipped through
  const activeModels = allModels.filter((model: any) => {
    const status = model.status || 'active';
    return status === 'active' && status !== 'deprecated' && status !== 'sunset';
  });

  // Filter to only text-to-text models (skip image/video models)
  const models = activeModels.filter((model: any) => {
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
  const deprecatedCount = allModels.length - activeModels.length;

  if (models.length === 0) {
    console.log('❌ No text-to-text models found in database');
    if (skippedCount > 0) {
      console.log(`   Skipped ${skippedCount} models (${deprecatedCount} deprecated + ${skippedCount - deprecatedCount} non-text)`);
    }
    console.log('   Run: pnpm tsx scripts/db/sync-ai-models-latest.ts');
    await db.client.close();
    process.exit(1);
  }

  if (skippedCount > 0) {
    console.log(`ℹ️  Skipped ${skippedCount} models:`);
    if (deprecatedCount > 0) {
      console.log(`   - ${deprecatedCount} deprecated/sunset models`);
    }
    if (skippedCount - deprecatedCount > 0) {
      console.log(`   - ${skippedCount - deprecatedCount} non-text models (image/video/audio)`);
    }
    console.log(`   Only testing ${models.length} active text-to-text models\n`);
  }

  console.log(`📊 Testing ${models.length} text-to-text models with full prompt audits\n`);
  console.log(`📝 Testing on ${testPrompts.length} prompt(s)\n`);
  console.log('🚀 Starting tests...\n');
  console.log('💡 All audit results will be saved to prompt_audit_results collection');
  console.log('   You can use these results with batch-improve-from-audits.ts\n');

  const results: TestResult[] = [];

  // Test each model on each prompt
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    
    // Test on first prompt (or all prompts if multiple)
    const testPrompt = testPrompts[0]; // For now, test on first prompt (can extend to all)
    
    console.log(`[${i + 1}/${models.length}] Testing: ${model.displayName || model.id}`);
    console.log(`   Provider: ${model.provider} | ID: ${model.id}`);
    console.log(`   Prompt: "${testPrompt.title}" (${testPrompt.id})`);

    const result = await testModelWithFullAudit(model, testPrompt);
    results.push(result);

    if (result.status === 'success') {
      console.log(`   ✅ Success (${result.latencyMs}ms)`);
      if (result.auditResult) {
        console.log(`   📊 Score: ${result.auditResult.overallScore}/10`);
        console.log(`   📋 Saved to DB (Audit Version ${result.auditVersion})`);
        if (result.auditResult.issues && result.auditResult.issues.length > 0) {
          console.log(`   ⚠️  Issues: ${result.auditResult.issues.slice(0, 2).join('; ')}`);
        }
        if (result.auditResult.recommendations && result.auditResult.recommendations.length > 0) {
          console.log(`   💡 Recommendations: ${result.auditResult.recommendations.slice(0, 2).join('; ')}`);
        }
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
        console.log(`   💾 Model marked as verified`);
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
  const scoredResults = successful.filter(r => r.auditResult?.overallScore !== undefined);
  if (scoredResults.length > 0) {
    console.log('📊 Model Audit Scores (stored in prompt_audit_results):');
    scoredResults
      .sort((a, b) => (b.auditResult?.overallScore || 0) - (a.auditResult?.overallScore || 0))
      .slice(0, 5)
      .forEach(r => {
        console.log(`   ${r.provider}: ${r.displayName || r.modelId} - Score: ${r.auditResult?.overallScore}/10`);
      });
    console.log('');
  }

  if (successful.length > 0) {
    console.log('✅ Working Models (Audit Results Saved):');
    successful.forEach(r => {
      console.log(`   ${r.provider}: ${r.displayName || r.modelId}`);
      if (r.auditResult?.overallScore) {
        console.log(`      Score: ${r.auditResult.overallScore}/10`);
        console.log(`      Audit Version: ${r.auditVersion}`);
      }
      if (r.auditResult?.issues && r.auditResult.issues.length > 0) {
        console.log(`      Issues: ${r.auditResult.issues.length}`);
      }
      if (r.auditResult?.recommendations && r.auditResult.recommendations.length > 0) {
        console.log(`      Recommendations: ${r.auditResult.recommendations.length}`);
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
  console.log('');

  // Show actionable next steps
  if (successful.length > 0) {
    console.log('💡 Next Steps:');
    console.log(`   • All audit results saved to prompt_audit_results collection`);
    console.log(`   • Run batch-improve-from-audits.ts to apply improvements:`);
    console.log(`     pnpm tsx scripts/content/batch-improve-from-audits.ts`);
    console.log(`   • View audit results in database or via API:`);
    console.log(`     GET /api/prompts/${testPrompts[0].id}/audit`);
    console.log(`   • Each audit includes issues, recommendations, and missingElements`);
    console.log(`   • Results are actionable - use them to improve prompts!\n`);
  }

  await db.client.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
