#!/usr/bin/env tsx
/**
 * Analyze Parameter Failures and Update Model Database
 * 
 * Analyzes parameter failures recorded in ai_models.parameterFailures
 * and updates supportedParameters based on patterns.
 * 
 * Usage:
 *   pnpm tsx scripts/content/analyze-parameter-failures.ts
 *   pnpm tsx scripts/content/analyze-parameter-failures.ts --dry-run  # Preview changes
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';

interface ParameterFailure {
  parameter: string;
  error: string;
  attemptedValue?: any;
  timestamp: Date;
  source?: string;
}

interface SupportedParameters {
  temperature?: {
    supported: boolean;
    min?: number;
    max?: number;
    default?: number;
    notes?: string;
  };
  maxTokens?: {
    supported: boolean;
    min?: number;
    max?: number;
    default?: number;
    notes?: string;
  };
  stream?: {
    supported: boolean;
    notes?: string;
  };
  systemPrompt?: {
    supported: boolean;
    notes?: string;
  };
}

async function analyzeAndUpdateModels(dryRun: boolean = false) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Parameter Failure Analysis & Database Update            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Get all models with parameter failures
  const models = await db.collection('ai_models')
    .find({
      parameterFailures: { $exists: true, $not: { $size: 0 } },
    })
    .toArray();

  if (models.length === 0) {
    console.log('✅ No models with parameter failures found.\n');
    await db.client.close();
    return;
  }

  console.log(`📊 Found ${models.length} models with parameter failures\n`);

  let updateCount = 0;

  for (const model of models) {
    const failures: ParameterFailure[] = model.parameterFailures || [];
    
    if (failures.length === 0) continue;

    console.log(`\n🔍 Analyzing: ${model.displayName || model.id} (${model.provider})`);
    console.log(`   Failures: ${failures.length}`);

    const supportedParams: SupportedParameters = model.supportedParameters || {};
    let needsUpdate = false;

    // Group failures by parameter
    const failuresByParam: Record<string, ParameterFailure[]> = {};
    failures.forEach(f => {
      if (!failuresByParam[f.parameter]) {
        failuresByParam[f.parameter] = [];
      }
      failuresByParam[f.parameter].push(f);
    });

    // Analyze temperature failures
    if (failuresByParam['temperature']) {
      const tempFailures = failuresByParam['temperature'];
      const errorMessages = tempFailures.map(f => f.error.toLowerCase()).join(' ');
      
      console.log(`   ⚠️  Temperature failures: ${tempFailures.length}`);
      
      // Check if temperature is not supported
      if (errorMessages.includes('not supported') || 
          errorMessages.includes('invalid parameter') ||
          errorMessages.includes('unknown parameter') ||
          errorMessages.includes('unrecognized')) {
        if (!supportedParams.temperature || supportedParams.temperature.supported !== false) {
          supportedParams.temperature = {
            supported: false,
            notes: `Not supported (${tempFailures.length} failures recorded)`,
          };
          needsUpdate = true;
          console.log(`      → Marking temperature as NOT SUPPORTED`);
        }
      }
      
      // Check for range violations
      if (errorMessages.includes('range') || errorMessages.includes('between') || errorMessages.includes('must be')) {
        // Extract range hints from errors
        const rangeMatch = errorMessages.match(/between\s+(\d+(?:\.\d+)?)\s+and\s+(\d+(?:\.\d+)?)/i) ||
                          errorMessages.match(/(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)/i);
        
        if (rangeMatch) {
          const min = parseFloat(rangeMatch[1]);
          const max = parseFloat(rangeMatch[2]);
          if (!supportedParams.temperature) {
            supportedParams.temperature = {};
          }
          supportedParams.temperature.min = min;
          supportedParams.temperature.max = max;
          supportedParams.temperature.supported = true;
          needsUpdate = true;
          console.log(`      → Setting temperature range: ${min} - ${max}`);
        } else if (errorMessages.includes('0') && errorMessages.includes('1')) {
          // Gemini uses 0-1 range
          if (!supportedParams.temperature) {
            supportedParams.temperature = {};
          }
          supportedParams.temperature.min = 0;
          supportedParams.temperature.max = 1;
          supportedParams.temperature.supported = true;
          needsUpdate = true;
          console.log(`      → Setting temperature range: 0 - 1 (Gemini-style)`);
        }
      }
    }

    // Analyze maxTokens failures
    if (failuresByParam['maxTokens']) {
      const maxTokensFailures = failuresByParam['maxTokens'];
      const errorMessages = maxTokensFailures.map(f => f.error.toLowerCase()).join(' ');
      
      console.log(`   ⚠️  MaxTokens failures: ${maxTokensFailures.length}`);
      
      // Check if maxTokens is not supported (might use different name)
      if (errorMessages.includes('not supported') || 
          errorMessages.includes('invalid parameter') ||
          errorMessages.includes('unknown parameter') ||
          errorMessages.includes('unrecognized')) {
        if (errorMessages.includes('max_output_tokens') || errorMessages.includes('maxoutputtokens')) {
          // Model uses maxOutputTokens instead
          if (!supportedParams.maxTokens) {
            supportedParams.maxTokens = {};
          }
          supportedParams.maxTokens.supported = true;
          supportedParams.maxTokens.notes = 'Use maxOutputTokens parameter name instead';
          needsUpdate = true;
          console.log(`      → Note: Model uses maxOutputTokens instead`);
        } else if (!supportedParams.maxTokens || supportedParams.maxTokens.supported !== false) {
          supportedParams.maxTokens = {
            supported: false,
            notes: `Not supported (${maxTokensFailures.length} failures recorded)`,
          };
          needsUpdate = true;
          console.log(`      → Marking maxTokens as NOT SUPPORTED`);
        }
      }
    }

    // Update database if needed
    if (needsUpdate) {
      if (dryRun) {
        console.log(`   📝 [DRY RUN] Would update supportedParameters:`);
        console.log(`      ${JSON.stringify(supportedParams, null, 6)}`);
      } else {
        await db.collection('ai_models').updateOne(
          { id: model.id },
          {
            $set: {
              supportedParameters: supportedParams,
              updatedAt: new Date(),
            },
          }
        );
        console.log(`   ✅ Updated supportedParameters in database`);
        updateCount++;
      }
    } else {
      console.log(`   ℹ️  No changes needed (failures already analyzed or inconclusive)`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Summary                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log(`📝 [DRY RUN] Would update ${updateCount} models`);
    console.log(`   Run without --dry-run to apply changes\n`);
  } else {
    console.log(`✅ Updated ${updateCount} models with parameter support information\n`);
  }

  await db.client.close();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  await analyzeAndUpdateModels(dryRun);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

