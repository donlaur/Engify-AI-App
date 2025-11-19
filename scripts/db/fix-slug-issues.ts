/**
 * Fix Slug Issues Script
 * 
 * This script fixes several slug-related issues:
 * 1. AI Model slugs with concatenated provider names (e.g., "anthropicclaude-3-opus")
 * 2. Prompt slugs that are internal IDs (e.g., "ref-001", "generated-1761973543589-8v6n5e9")
 * 3. Tag slugs with special characters or spaces
 * 4. Ensures proper slug formatting for SEO
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Bypass BUILD_MODE check for database scripts
process.env.NODE_ENV = 'development';
process.env.NEXT_PHASE = undefined;

import { getMongoDb } from '@/lib/db/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';

/**
 * Fix AI model slugs that have concatenated provider names
 * Examples:
 * - "anthropicclaude-3-opus" → "anthropic-claude-3-opus" or "claude-3-opus"
 * - "mistralaimistral-7b-instruct-v03" → "mistral-7b-instruct-v03"
 * - "meta-llamallama-4-scout-17b-16e-instruct" → "llama-4-scout-17b-16e-instruct"
 */
async function fixAIModelSlugs() {
  console.log('🔍 Fixing AI Model slugs...\n');

  try {
    const db = await getMongoDb();
    const modelsCollection = db.collection('ai_models');

    // Find models with problematic slugs (concatenated provider names)
    const problematicSlugs = await modelsCollection
      .find({
        slug: {
          $regex: /^(anthropic|mistralai|meta-llamallama|ai21|googlegemini|openaigpt|openaio|openaicodex|qwenqwen|inflectioninflection|alfredproscodellama|inceptionmercury|undi95remm|perplexity|together)/i,
        },
      })
      .toArray();

    console.log(`📊 Found ${problematicSlugs.length} models with potentially problematic slugs\n`);

    let fixed = 0;
    let skipped = 0;

    for (const model of problematicSlugs) {
      const currentSlug = model.slug;
      const modelId = model.id || model._id?.toString();
      const modelName = model.name || model.displayName || modelId;
      const provider = model.provider;

      // Extract model name from ID if it contains a slash (e.g., "anthropic/claude-3-opus")
      let modelNameForSlug = modelName;
      if (modelId && modelId.includes('/')) {
        const parts = modelId.split('/');
        modelNameForSlug = parts[parts.length - 1]; // Get the last part after the slash
      }

      // Generate a clean slug from the model name (not the full ID)
      const newSlug = generateSlug(modelNameForSlug);

      // Check if the slug is actually problematic (concatenated provider names)
      const isProblematic =
        currentSlug.includes('anthropicclaude') ||
        currentSlug.includes('mistralaimistral') ||
        currentSlug.includes('mistralaimagistral') ||
        currentSlug.includes('meta-llamallama') ||
        currentSlug.includes('ai21jamba') ||
        currentSlug.includes('googlegemini') ||
        currentSlug.startsWith('openaigpt') ||
        currentSlug.startsWith('openaio') ||
        currentSlug.startsWith('openaicodex') ||
        currentSlug.startsWith('qwenqwen') ||
        currentSlug.startsWith('inflectioninflection') ||
        currentSlug.startsWith('alfredproscodellama') ||
        currentSlug.startsWith('inceptionmercury') ||
        currentSlug.startsWith('undi95remm') ||
        currentSlug.includes('perplexitysonar') ||
        currentSlug.includes('togethercomputer');

      if (!isProblematic) {
        skipped++;
        continue;
      }

      // Check for duplicate slugs
      const existingWithSlug = await modelsCollection.findOne({
        slug: newSlug,
        id: { $ne: modelId },
      });

      let finalSlug = newSlug;
      if (existingWithSlug) {
        // Append provider prefix if there's a duplicate
        finalSlug = generateSlug(`${provider}-${modelNameForSlug}`);
      }

      // Update the model
      await modelsCollection.updateOne(
        { _id: model._id },
        { $set: { slug: finalSlug } }
      );

      console.log(`✅ Fixed: ${currentSlug} → ${finalSlug} (${modelName})`);
      fixed++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${fixed} models`);
    console.log(`   ⏭️  Skipped: ${skipped} models\n`);
  } catch (error) {
    logger.error('Failed to fix AI model slugs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Fix prompt slugs that are internal IDs
 * Examples:
 * - "ref-001" → Generate from title
 * - "cg-002" → Generate from title
 * - "generated-1761973543589-8v6n5e9" → Generate from title or mark as invalid
 */
async function fixPromptSlugs() {
  console.log('🔍 Fixing Prompt slugs...\n');

  try {
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');

    // Find prompts with problematic slugs (IDs, generated IDs, etc.)
    const problematicPrompts = await promptsCollection
      .find({
        $or: [
          { slug: { $regex: /^(ref-|cg-|doc-|db-|dir-|gen-|arch-|test-|decision-|conflict-|facilitator-|generated-)/i } },
          { slug: { $regex: /^[a-z]{2,4}-\d{3}$/i } }, // Pattern like "ref-001", "gen-001", "arch-001"
          { slug: { $regex: /-\d{3}$/ } }, // Ends with -001, -002, etc. (likely internal IDs)
        ],
      })
      .toArray();

    console.log(`📊 Found ${problematicPrompts.length} prompts with potentially problematic slugs\n`);

    let fixed = 0;
    let skipped = 0;
    let invalid = 0;

    for (const prompt of problematicPrompts) {
      const currentSlug = prompt.slug;
      const promptId = prompt.id || prompt._id?.toString();
      const title = prompt.title;

      // If no title, we can't generate a proper slug
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        console.log(`⚠️  Skipping prompt ${promptId}: No title to generate slug from`);
        invalid++;
        continue;
      }

      // Generate a clean slug from the title
      let newSlug = generateSlug(title);
      
      // Check for duplicate/redundant patterns in slug (e.g., "security-test-case-generator-owasp-top-10-qa-security-test-case-generator")
      // Simple heuristic: if slug is very long (>40 chars) and contains repeated 3+ word sequences, it's likely a duplicate
      if (newSlug.length > 40) {
        const words = newSlug.split('-');
        // Check for repeated sequences of 3+ words
        for (let seqLen = 3; seqLen <= Math.min(5, Math.floor(words.length / 2)); seqLen++) {
          for (let i = 0; i <= words.length - seqLen * 2; i++) {
            const sequence1 = words.slice(i, i + seqLen).join('-');
            for (let j = i + seqLen; j <= words.length - seqLen; j++) {
              const sequence2 = words.slice(j, j + seqLen).join('-');
              if (sequence1 === sequence2) {
                // Found duplicate sequence, remove the second occurrence
                newSlug = [...words.slice(0, j), ...words.slice(j + seqLen)].join('-');
                break;
              }
            }
            if (newSlug.length <= 40) break; // Already fixed
          }
          if (newSlug.length <= 40) break; // Already fixed
        }
      }

      // Check if the slug is actually problematic
      const isProblematic =
        currentSlug.startsWith('ref-') ||
        currentSlug.startsWith('cg-') ||
        currentSlug.startsWith('doc-') ||
        currentSlug.startsWith('db-') ||
        currentSlug.startsWith('dir-') ||
        currentSlug.startsWith('gen-') ||
        currentSlug.startsWith('arch-') ||
        currentSlug.startsWith('test-') ||
        currentSlug.startsWith('decision-') ||
        currentSlug.startsWith('conflict-') ||
        currentSlug.startsWith('facilitator-') ||
        currentSlug.startsWith('generated-') ||
        /^[a-z]{2,4}-\d{3}$/i.test(currentSlug) || // Pattern like "ref-001", "gen-001"
        /-\d{3}$/.test(currentSlug); // Ends with -001, -002, etc. (likely internal IDs)

      if (!isProblematic) {
        skipped++;
        continue;
      }

      // Check for duplicate slugs
      const existingWithSlug = await promptsCollection.findOne({
        slug: newSlug,
        id: { $ne: promptId },
      });

      let finalSlug = newSlug;
      if (existingWithSlug) {
        // Append a suffix if there's a duplicate
        let counter = 2;
        while (await promptsCollection.findOne({ slug: `${newSlug}-${counter}`, id: { $ne: promptId } })) {
          counter++;
        }
        finalSlug = `${newSlug}-${counter}`;
      }

      // Update the prompt
      await promptsCollection.updateOne(
        { _id: prompt._id },
        { $set: { slug: finalSlug } }
      );

      console.log(`✅ Fixed: ${currentSlug} → ${finalSlug} (${title.substring(0, 50)}...)`);
      fixed++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${fixed} prompts`);
    console.log(`   ⏭️  Skipped: ${skipped} prompts`);
    console.log(`   ⚠️  Invalid (no title): ${invalid} prompts\n`);
  } catch (error) {
    logger.error('Failed to fix prompt slugs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Report on tag encoding issues
 * Tags with spaces, quotes, or special characters should be URL-encoded
 */
async function reportTagIssues() {
  console.log('🔍 Reporting Tag encoding issues...\n');

  try {
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');

    // Get all unique tags
    const prompts = await promptsCollection.find({ tags: { $exists: true, $ne: [] } }).toArray();
    const allTags = new Set<string>();
    prompts.forEach((prompt) => {
      if (Array.isArray(prompt.tags)) {
        prompt.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    // Find problematic tags
    const problematicTags: string[] = [];
    for (const tag of allTags) {
      if (
        tag.includes(' ') || // Spaces
        tag.includes('"') || // Quotes
        tag.includes("'") || // Single quotes
        tag.includes(',') || // Commas
        /[^a-z0-9-]/i.test(tag) // Other special characters
      ) {
        problematicTags.push(tag);
      }
    }

    if (problematicTags.length > 0) {
      console.log(`⚠️  Found ${problematicTags.length} tags with encoding issues:\n`);
      problematicTags.forEach((tag) => {
        const encoded = encodeURIComponent(tag);
        console.log(`   - "${tag}" → Should be encoded as: "${encoded}"`);
      });
      console.log('\n💡 Note: These tags should be URL-encoded when used in URLs.\n');
    } else {
      console.log('✅ No tag encoding issues found!\n');
    }
  } catch (error) {
    logger.error('Failed to report tag issues', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Slug Fix Script...\n');

  try {
    await fixAIModelSlugs();
    await fixPromptSlugs();
    await reportTagIssues();

    console.log('✨ All fixes completed successfully!');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();

