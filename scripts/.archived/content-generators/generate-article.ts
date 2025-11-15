#!/usr/bin/env tsx
/**
 * Generate Article - CLI Tool
 * 
 * Use the multi-agent content publishing pipeline to generate
 * SEO-rich, human-sounding, actionable articles for Engify.ai
 * 
 * Usage:
 *   tsx scripts/content/generate-article.ts "How to use Cursor Agent Review"
 *   tsx scripts/content/generate-article.ts "Mastering AI Prompts" --category="Guide" --tone="beginner"
 */

// IMPORTANT: Load environment variables FIRST before any imports
// This prevents MongoDB from throwing errors during module load
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { ContentPublishingService } from '@/lib/content/content-publishing-pipeline';

interface GenerateOptions {
  topic: string;
  category?: string;
  keywords?: string[];
  tone?: 'beginner' | 'intermediate' | 'advanced';
  outputDir?: string;
}

async function generateArticle(options: GenerateOptions): Promise<void> {
  const {
    topic,
    category = 'Tutorial',
    keywords = [],
    tone = 'intermediate',
    outputDir = 'content/drafts',
  } = options;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Content Publishing Pipeline - Multi-Agent Article Generator  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📝 Topic: "${topic}"`);
  console.log(`📂 Category: ${category}`);
  console.log(`🎯 Tone: ${tone}`);
  if (keywords.length > 0) {
    console.log(`🔑 Keywords: ${keywords.join(', ')}`);
  }
  console.log('');
  console.log('⏳ This will take 2-3 minutes...');
  console.log('');

  try {
    // Create publishing service
    const service = new ContentPublishingService('cli-generation');

    // Generate article
    const result = await service.generateArticle(topic, {
      category,
      targetKeywords: keywords,
      tone,
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 GENERATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ Status: ${result.publishReady ? 'READY TO PUBLISH' : 'NEEDS REVISION'}`);
    console.log(`📈 Overall Score: ${result.readabilityScore.toFixed(1)}/10`);
    console.log(`📄 Word Count: ${result.finalContent.split(/\s+/).length} words`);
    console.log('');

    // Show agent results
    console.log('🤖 Agent Reviews:');
    result.reviews.forEach((review) => {
      const status = review.approved ? '✅' : '⚠️';
      console.log(`   ${status} ${review.agentName}: ${review.score}/10`);
      if (review.improvements.length > 0) {
        console.log(`      → ${review.improvements.length} improvements suggested`);
      }
    });
    console.log('');

    // Show SEO metadata
    console.log('🔍 SEO Metadata:');
    console.log(`   Title: ${result.seoMetadata.title}`);
    console.log(`   Slug: /${result.seoMetadata.slug}`);
    console.log(`   Keywords: ${result.seoMetadata.keywords.join(', ')}`);
    console.log(`   Description: ${result.seoMetadata.description.substring(0, 80)}...`);
    console.log('');

    // Generate output files
    const slug = result.seoMetadata.slug || topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Ensure output directory exists
    const fullOutputDir = path.join(process.cwd(), outputDir);
    if (!fs.existsSync(fullOutputDir)) {
      fs.mkdirSync(fullOutputDir, { recursive: true });
    }

    // Save final content
    const contentPath = path.join(fullOutputDir, `${timestamp}-${slug}.md`);
    const contentWithMeta = `---
title: "${result.seoMetadata.title}"
description: "${result.seoMetadata.description}"
slug: "${result.seoMetadata.slug}"
category: "${category}"
keywords: [${result.seoMetadata.keywords.map(k => `"${k}"`).join(', ')}]
publishReady: ${result.publishReady}
score: ${result.readabilityScore.toFixed(1)}
generatedAt: "${new Date().toISOString()}"
---

${result.finalContent}
`;
    fs.writeFileSync(contentPath, contentWithMeta);

    // Save review report
    const reportPath = path.join(fullOutputDir, `${timestamp}-${slug}-REVIEW.md`);
    const report = service.generateReport(result);
    fs.writeFileSync(reportPath, report);

    // Save original draft for comparison
    const draftPath = path.join(fullOutputDir, `${timestamp}-${slug}-DRAFT.md`);
    fs.writeFileSync(draftPath, result.originalDraft);

    console.log('💾 Files saved:');
    console.log(`   📄 ${contentPath}`);
    console.log(`   📋 ${reportPath}`);
    console.log(`   📝 ${draftPath}`);
    console.log('');

    // Next steps
    if (result.publishReady) {
      console.log('✅ READY TO PUBLISH!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Review the final content in:', contentPath);
      console.log('2. Check SEO metadata is correct');
      console.log('3. Add to your CMS or content directory');
      console.log('4. Schedule for publication');
    } else {
      console.log('⚠️  NEEDS REVISION');
      console.log('');
      console.log('Issues to address:');
      const allImprovements = result.reviews.flatMap(r => r.improvements);
      allImprovements.slice(0, 5).forEach((imp, idx) => {
        console.log(`${idx + 1}. ${imp}`);
      });
      if (allImprovements.length > 5) {
        console.log(`... and ${allImprovements.length - 5} more (see report)`);
      }
      console.log('');
      console.log('Review the full report:', reportPath);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('');
    console.error('❌ Error generating article:', error);
    console.error('');
    throw error;
  }
}

// Parse CLI arguments
function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0].startsWith('--')) {
    console.error('Usage: tsx scripts/content/generate-article.ts "<topic>" [options]');
    console.error('');
    console.error('Options:');
    console.error('  --category=<category>        Article category (default: Tutorial)');
    console.error('  --tone=<tone>                beginner|intermediate|advanced (default: intermediate)');
    console.error('  --keywords=<k1,k2,k3>        Comma-separated keywords');
    console.error('  --output=<dir>               Output directory (default: content/drafts)');
    console.error('');
    console.error('Examples:');
    console.error('  tsx scripts/content/generate-article.ts "How to use Cursor Agent Review"');
    console.error('  tsx scripts/content/generate-article.ts "Mastering AI Prompts" --category="Guide" --tone="beginner"');
    console.error('  tsx scripts/content/generate-article.ts "Multi-Agent Workflows" --keywords="ai,cursor,automation"');
    process.exit(1);
  }

  const topic = args[0];
  const options: GenerateOptions = { topic };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1];
    } else if (arg.startsWith('--tone=')) {
      const tone = arg.split('=')[1] as 'beginner' | 'intermediate' | 'advanced';
      if (['beginner', 'intermediate', 'advanced'].includes(tone)) {
        options.tone = tone;
      }
    } else if (arg.startsWith('--keywords=')) {
      options.keywords = arg.split('=')[1].split(',').map(k => k.trim());
    } else if (arg.startsWith('--output=')) {
      options.outputDir = arg.split('=')[1];
    }
  }

  return options;
}

// Main execution
async function main() {
  const options = parseArgs();
  await generateArticle(options);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

