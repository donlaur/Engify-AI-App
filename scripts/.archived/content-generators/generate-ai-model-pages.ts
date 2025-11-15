#!/usr/bin/env tsx
/**
 * Generate AI Model Content Pages - Batch Generator
 *
 * Generates comprehensive, SEO-optimized content pages for AI models
 * using the multi-agent content publishing pipeline.
 *
 * Based on research from: docs/content/GEMINI_DEEP_RESEARCH_AI_MODELS_TOOLS.md
 *
 * Usage:
 *   tsx scripts/content/generate-ai-model-pages.ts
 *   tsx scripts/content/generate-ai-model-pages.ts --model=gpt-5
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env.local' });

import { ContentPublishingService } from '@/lib/content/content-publishing-pipeline';
import fs from 'fs';
import path from 'path';

interface AIModelSpec {
  id: string;
  name: string;
  provider: string;
  topic: string;
  category: string;
  keywords: string[];
  tone: 'beginner' | 'intermediate' | 'advanced';
  priority: 'high' | 'medium' | 'low';
}

// AI Models from research - prioritized by SEO value
const AI_MODELS: AIModelSpec[] = [
  // === FRONTIER MODELS (HIGH PRIORITY) ===
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    topic:
      "GPT-5: Complete Guide to OpenAI's Flagship Model (Features, Pricing, Use Cases)",
    category: 'AI Models',
    keywords: [
      'gpt-5',
      'openai',
      'gpt-5 pricing',
      'gpt-5 features',
      'gpt-5 use cases',
      'flagship model',
    ],
    tone: 'intermediate',
    priority: 'high',
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    topic:
      'Claude Sonnet 4.5: The Best Coding Model? Complete Analysis (vs GPT-5 & Gemini)',
    category: 'AI Models',
    keywords: [
      'claude 4.5',
      'claude sonnet',
      'anthropic',
      'best coding model',
      'agentic coding',
      'refactoring',
    ],
    tone: 'intermediate',
    priority: 'high',
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    topic:
      "Gemini 2.5 Pro: Google's 1M Context Reasoning Model (Greenfield Development)",
    category: 'AI Models',
    keywords: [
      'gemini 2.5 pro',
      'google ai',
      '1m context',
      'gemini pro',
      'greenfield development',
    ],
    tone: 'intermediate',
    priority: 'high',
  },

  // === VELOCITY MODELS (HIGH PRIORITY) ===
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    topic:
      'GPT-4o mini: Cost-Efficient AI for High-Volume Tasks (Complete Pricing Guide)',
    category: 'AI Models',
    keywords: [
      'gpt-4o mini',
      'gpt-4o-mini pricing',
      'cost-efficient ai',
      'high-volume',
      'rag',
    ],
    tone: 'intermediate',
    priority: 'high',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    topic:
      'Claude Haiku 4.5: Near-Frontier Performance at High Speed (vs GPT-4o mini)',
    category: 'AI Models',
    keywords: [
      'claude haiku 4.5',
      'claude haiku',
      'near-frontier',
      'latency-sensitive',
      'high-velocity',
    ],
    tone: 'intermediate',
    priority: 'high',
  },
  {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    topic: 'Gemini 2.5 Flash: Best Price-Performance for Large Context Tasks',
    category: 'AI Models',
    keywords: [
      'gemini flash',
      'gemini 2.5 flash',
      'price-performance',
      'large context',
      '1m tokens',
    ],
    tone: 'intermediate',
    priority: 'high',
  },

  // === DEPRECATED/EOL MODELS (MEDIUM PRIORITY - SEO VALUE) ===
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    topic: 'Claude 3.5 Sonnet: RETIRED - Migration Guide to Claude 4.5 Sonnet',
    category: 'AI Models',
    keywords: [
      'claude 3.5 sonnet',
      'claude retired',
      'claude deprecation',
      'migration guide',
      'claude 4.5',
    ],
    tone: 'intermediate',
    priority: 'high', // HIGH because it's causing production breakage NOW
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    topic: 'GPT-4o: Transitional Model Status & Migration Path to GPT-5',
    category: 'AI Models',
    keywords: [
      'gpt-4o',
      'gpt-4o deprecation',
      'gpt-4o status',
      'migrate to gpt-5',
    ],
    tone: 'intermediate',
    priority: 'medium',
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    provider: 'OpenAI',
    topic:
      'o4-mini: Fast Reasoning Model (Successor to o1-mini, Transitional to GPT-5 mini)',
    category: 'AI Models',
    keywords: [
      'o4-mini',
      'o-series',
      'reasoning model',
      'math coding',
      'o1-mini replacement',
    ],
    tone: 'advanced',
    priority: 'low',
  },
];

async function generateModelPage(model: AIModelSpec): Promise<void> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🤖 Generating: ${model.name} (${model.provider})`);
  console.log(`${'='.repeat(70)}`);

  const service = new ContentPublishingService('ai-model-generation');

  try {
    const result = await service.generateArticle(model.topic, {
      category: model.category,
      targetKeywords: model.keywords,
      tone: model.tone,
    });

    // Save to file
    const outputDir = path.join(process.cwd(), 'content', 'ai-models');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const slug = result.seoMetadata.slug || model.id;
    const filename = `${slug}.md`;
    const filepath = path.join(outputDir, filename);

    // Generate frontmatter
    const frontmatter = `---
title: "${result.seoMetadata.title}"
description: "${result.seoMetadata.description}"
slug: "${slug}"
category: "${model.category}"
keywords: [${result.seoMetadata.keywords.map((k) => `"${k}"`).join(', ')}]
author: "Engify.ai Research Team"
featured: ${model.priority === 'high'}
level: "${model.tone}"
provider: "${model.provider}"
modelId: "${model.id}"
publishedAt: "${new Date().toISOString()}"
updatedAt: "${new Date().toISOString()}"
---

`;

    const fullContent = frontmatter + result.finalContent;

    fs.writeFileSync(filepath, fullContent, 'utf-8');

    console.log(`\n✅ SUCCESS: ${model.name}`);
    console.log(`   📄 File: ${filename}`);
    console.log(`   📊 Score: ${result.readabilityScore.toFixed(1)}/10`);
    console.log(`   🔗 URL: /learn/ai-models/${slug}`);
    console.log(`   📈 Publish Ready: ${result.publishReady ? 'YES' : 'NO'}`);

    // Save metadata for later review
    const metaFile = path.join(outputDir, `${slug}.meta.json`);
    fs.writeFileSync(
      metaFile,
      JSON.stringify(
        {
          model,
          result: {
            topic: result.topic,
            readabilityScore: result.readabilityScore,
            publishReady: result.publishReady,
            seoMetadata: result.seoMetadata,
            reviews: result.reviews.map((r) => ({
              agentName: r.agentName,
              approved: r.approved,
              score: r.score,
              feedback: r.feedback.substring(0, 200),
            })),
          },
          generatedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error(`\n❌ ERROR: ${model.name}`);
    console.error(error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const modelArg = args.find((a) => a.startsWith('--model='))?.split('=')[1];

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log(
    '║       AI Model Content Pages - Batch Generator              ║'
  );
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📊 Models to Generate:');

  const modelsToGenerate = modelArg
    ? AI_MODELS.filter((m) => m.id === modelArg)
    : AI_MODELS;

  if (modelsToGenerate.length === 0) {
    console.error(`❌ Model not found: ${modelArg}`);
    console.log('Available models:', AI_MODELS.map((m) => m.id).join(', '));
    process.exit(1);
  }

  // Show queue
  modelsToGenerate.forEach((m, i) => {
    const priority =
      m.priority === 'high' ? '🔥' : m.priority === 'medium' ? '⚡' : '📌';
    console.log(`   ${i + 1}. ${priority} ${m.name} (${m.provider})`);
  });

  console.log('');
  console.log(`⏱️  Estimated time: ${modelsToGenerate.length * 3} minutes`);
  console.log('');

  // Generate in priority order
  const sorted = [...modelsToGenerate].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  for (const model of sorted) {
    await generateModelPage(model);
    // Brief pause between generations
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 BATCH GENERATION COMPLETE');
  console.log('='.repeat(70));
  console.log(`\n📁 Output: content/ai-models/`);
  console.log(`\n📝 Next Steps:`);
  console.log(`   1. Review generated content in content/ai-models/`);
  console.log(
    `   2. Publish using: tsx scripts/content/publish-article.ts content/ai-models/[file].md`
  );
  console.log(`   3. Verify at: https://engify.ai/learn/ai-models/[slug]`);
  console.log('');
}

main().catch(console.error);
