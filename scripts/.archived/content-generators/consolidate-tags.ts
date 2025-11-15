#!/usr/bin/env tsx
/**
 * Tag Consolidation Script
 * 
 * Analyzes prompts and ensures:
 * - Minimum 4 tags per prompt
 * - Maximum 8 tags per prompt
 * - Tag naming consistency (kebab-case)
 * - Removes duplicate tags
 * 
 * Usage:
 *   pnpm exec tsx scripts/content/consolidate-tags.ts --dry-run
 *   pnpm exec tsx scripts/content/consolidate-tags.ts --fix
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

interface TagStats {
  tag: string;
  count: number;
  prompts: string[];
}

interface PromptTagInfo {
  id: string;
  title: string;
  currentTags: string[];
  tagCount: number;
  needsFix: boolean;
  issues: string[];
}

async function analyzeTags() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('engify');
    const collection = db.collection('prompts');

    // Get all prompts
    const prompts = await collection.find({}).toArray();
    console.log(`📊 Analyzing ${prompts.length} prompts...\n`);

    // Analyze tag usage
    const tagMap = new Map<string, Set<string>>();
    const promptIssues: PromptTagInfo[] = [];

    prompts.forEach((prompt) => {
      const tags = prompt.tags || [];
      const id = prompt.id || prompt._id.toString();
      const title = prompt.title || 'Untitled';
      const issues: string[] = [];

      // Check tag count
      if (tags.length < 4) {
        issues.push(`Only ${tags.length} tags (minimum 4 required)`);
      }
      if (tags.length > 8) {
        issues.push(`${tags.length} tags (maximum 8 allowed)`);
      }

      // Check tag format (kebab-case)
      tags.forEach((tag) => {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) {
          issues.push(`Invalid tag format: "${tag}" (should be kebab-case)`);
        }

        // Track tag usage
        if (!tagMap.has(tag)) {
          tagMap.set(tag, new Set());
        }
        tagMap.get(tag)!.add(id);
      });

      // Check for duplicates
      const uniqueTags = new Set(tags);
      if (uniqueTags.size !== tags.length) {
        issues.push(`Duplicate tags found`);
      }

      if (issues.length > 0) {
        promptIssues.push({
          id,
          title,
          currentTags: tags,
          tagCount: tags.length,
          needsFix: true,
          issues,
        });
      }
    });

    // Generate tag statistics
    const tagStats: TagStats[] = Array.from(tagMap.entries())
      .map(([tag, promptIds]) => ({
        tag,
        count: promptIds.size,
        prompts: Array.from(promptIds),
      }))
      .sort((a, b) => b.count - a.count);

    // Report
    console.log('='.repeat(70));
    console.log('📊 TAG ANALYSIS REPORT\n');
    console.log(`Total prompts: ${prompts.length}`);
    console.log(`Prompts with issues: ${promptIssues.length}`);
    console.log(`Total unique tags: ${tagStats.length}\n`);

    // Top 20 most used tags
    console.log('🏷️  TOP 20 MOST USED TAGS:\n');
    tagStats.slice(0, 20).forEach((stat, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${stat.tag.padEnd(30)} (${stat.count} prompts)`);
    });

    // Tags with only 1 prompt (potential duplicates)
    const singleUseTags = tagStats.filter((s) => s.count === 1);
    if (singleUseTags.length > 0) {
      console.log(`\n⚠️  Tags used only once (${singleUseTags.length} tags - potential duplicates):`);
      singleUseTags.slice(0, 10).forEach((stat) => {
        console.log(`     - ${stat.tag}`);
      });
      if (singleUseTags.length > 10) {
        console.log(`     ... and ${singleUseTags.length - 10} more`);
      }
    }

    // Prompts with issues
    if (promptIssues.length > 0) {
      console.log(`\n⚠️  PROMPTS WITH TAG ISSUES (${promptIssues.length}):\n`);
      promptIssues.slice(0, 20).forEach((p) => {
        console.log(`  ${p.title}`);
        console.log(`    Tags: ${p.currentTags.join(', ') || '(none)'}`);
        p.issues.forEach((issue) => {
          console.log(`    ❌ ${issue}`);
        });
        console.log('');
      });
      if (promptIssues.length > 20) {
        console.log(`  ... and ${promptIssues.length - 20} more prompts with issues`);
      }
    } else {
      console.log('\n✅ All prompts have valid tags!');
    }

    return { promptIssues, tagStats };
  } catch (error) {
    console.error('❌ Error analyzing tags:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

async function fixTags(promptIssues: PromptTagInfo[], dryRun: boolean) {
  if (promptIssues.length === 0) {
    console.log('\n✅ No prompts need fixing!');
    return;
  }

  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('engify');
    const collection = db.collection('prompts');

    console.log(`\n${dryRun ? '🔬 DRY RUN: ' : '🔧 '}Fixing tag issues...\n`);

    let fixedCount = 0;

    for (const prompt of promptIssues) {
      const tags = prompt.currentTags;
      let fixedTags = [...tags];

      // Remove duplicates
      fixedTags = Array.from(new Set(fixedTags));

      // Fix tag format (convert to kebab-case)
      fixedTags = fixedTags.map((tag) =>
        tag
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );

      // Remove empty tags
      fixedTags = fixedTags.filter((t) => t.length > 0);

      // If too few tags, add category/role as fallback
      if (fixedTags.length < 4) {
        const promptDoc = await collection.findOne({
          $or: [{ id: prompt.id }, { _id: prompt.id }],
        });
        if (promptDoc) {
          if (promptDoc.category && !fixedTags.includes(promptDoc.category)) {
            fixedTags.push(promptDoc.category);
          }
          if (promptDoc.role && !fixedTags.includes(promptDoc.role)) {
            fixedTags.push(promptDoc.role);
          }
          if (promptDoc.pattern && !fixedTags.includes(promptDoc.pattern)) {
            fixedTags.push(promptDoc.pattern);
          }
        }
      }

      // Limit to 8 tags
      fixedTags = fixedTags.slice(0, 8);

      // If still too few, add generic tags
      if (fixedTags.length < 4) {
        const genericTags = ['general', 'prompt-engineering', 'ai', 'productivity'];
        genericTags.forEach((tag) => {
          if (fixedTags.length < 4 && !fixedTags.includes(tag)) {
            fixedTags.push(tag);
          }
        });
      }

      if (!dryRun) {
        await collection.updateOne(
          { $or: [{ id: prompt.id }, { _id: prompt.id }] },
          { $set: { tags: fixedTags, updatedAt: new Date() } }
        );
      }

      fixedCount++;
      if (fixedCount <= 10) {
        console.log(`  ✅ ${prompt.title}`);
        console.log(`     Before: ${tags.join(', ') || '(none)'}`);
        console.log(`     After:  ${fixedTags.join(', ')}`);
      }
    }

    if (fixedCount > 10) {
      console.log(`  ... and ${fixedCount - 10} more prompts fixed`);
    }

    console.log(`\n✅ Fixed ${fixedCount} prompts${dryRun ? ' (dry run)' : ''}`);
  } catch (error) {
    console.error('❌ Error fixing tags:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fix = args.includes('--fix');

  console.log('\n🏷️  TAG CONSOLIDATION ANALYSIS\n');
  console.log('='.repeat(70));

  const { promptIssues } = await analyzeTags();

  if (fix) {
    await fixTags(promptIssues, dryRun);
  } else {
    console.log('\n💡 To fix issues, run:');
    console.log('   pnpm exec tsx scripts/content/consolidate-tags.ts --fix --dry-run');
    console.log('   pnpm exec tsx scripts/content/consolidate-tags.ts --fix');
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

