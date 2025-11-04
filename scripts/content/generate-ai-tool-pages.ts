#!/usr/bin/env tsx
/**
 * Generate AI Tool Content Pages - Batch Generator
 *
 * Generates comprehensive, SEO-optimized content pages for AI developer tools
 * using the multi-agent content publishing pipeline.
 *
 * Based on research from: docs/content/GEMINI_DEEP_RESEARCH_AI_MODELS_TOOLS.md
 *
 * Usage:
 *   tsx scripts/content/generate-ai-tool-pages.ts
 *   tsx scripts/content/generate-ai-tool-pages.ts --tool=cursor
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env.local' });

import { ContentPublishingService } from '@/lib/content/content-publishing-pipeline';
import fs from 'fs';
import path from 'path';

interface AIToolSpec {
  id: string;
  name: string;
  provider: string;
  topic: string;
  category: string;
  keywords: string[];
  tone: 'beginner' | 'intermediate' | 'advanced';
  priority: 'high' | 'medium' | 'low';
  marketShare?: string;
}

// AI Tools from research - prioritized by market share and SEO value
const AI_TOOLS: AIToolSpec[] = [
  // === IDE TOOLS (HIGH PRIORITY - Market Leaders) ===
  {
    id: 'cursor',
    name: 'Cursor',
    provider: 'Anysphere',
    topic:
      'Cursor: Complete Guide to the AI-First IDE (43% Market Share, Features, Pricing)',
    category: 'AI Tools',
    keywords: [
      'cursor ide',
      'cursor ai',
      'cursor pricing',
      'cursor vs copilot',
      'ai-first ide',
      'composer',
    ],
    tone: 'intermediate',
    priority: 'high',
    marketShare: '43%',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    provider: 'GitHub/Microsoft',
    topic:
      'GitHub Copilot: Enterprise AI Coding Assistant (Agent Mode, Pricing, vs Cursor)',
    category: 'AI Tools',
    keywords: [
      'github copilot',
      'copilot agent mode',
      'copilot pricing',
      'microsoft ai',
      'pair programmer',
    ],
    tone: 'intermediate',
    priority: 'high',
    marketShare: '37%',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    provider: 'Codeium',
    topic:
      'Windsurf: Fast, Beginner-Friendly AI IDE (Cascade Agent, vs Cursor)',
    category: 'AI Tools',
    keywords: [
      'windsurf ide',
      'windsurf ai',
      'cascade agent',
      'codeium',
      'beginner ai ide',
    ],
    tone: 'beginner',
    priority: 'high',
  },

  // === SPECIALIZED CODE ASSISTANTS (MEDIUM PRIORITY) ===
  {
    id: 'claude-code',
    name: 'Claude Code',
    provider: 'Anthropic',
    topic:
      "Claude Code: Anthropic's Web-Based Coding Assistant (For Claude Pro Users)",
    category: 'AI Tools',
    keywords: [
      'claude code',
      'anthropic code',
      'claude pro',
      'web-based coding',
      'claude assistant',
    ],
    tone: 'intermediate',
    priority: 'medium',
  },
  {
    id: 'gemini-ai-studio',
    name: 'Gemini AI Studio',
    provider: 'Google',
    topic:
      'Gemini AI Studio: Build Apps with Vibe Coding (No-Code AI Development)',
    category: 'AI Tools',
    keywords: [
      'gemini ai studio',
      'vibe coding',
      'google gemini',
      'no-code ai',
      'rapid prototyping',
    ],
    tone: 'beginner',
    priority: 'medium',
  },

  // === TERMINAL/CLI TOOLS (LOW PRIORITY - Niche) ===
  {
    id: 'warp',
    name: 'Warp',
    provider: 'Warp',
    topic: 'Warp: AI-Powered Terminal for Modern Developers',
    category: 'AI Tools',
    keywords: ['warp terminal', 'ai terminal', 'warp ai', 'command line ai'],
    tone: 'advanced',
    priority: 'low',
  },
];

async function generateToolPage(tool: AIToolSpec): Promise<void> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🛠️  Generating: ${tool.name} (${tool.provider})`);
  if (tool.marketShare) {
    console.log(`   📊 Market Share: ${tool.marketShare}`);
  }
  console.log(`${'='.repeat(70)}`);

  const service = new ContentPublishingService('ai-tool-generation');

  try {
    const result = await service.generateArticle(tool.topic, {
      category: tool.category,
      targetKeywords: tool.keywords,
      tone: tool.tone,
    });

    // Save to file
    const outputDir = path.join(process.cwd(), 'content', 'ai-tools');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const slug = result.seoMetadata.slug || tool.id;
    const filename = `${slug}.md`;
    const filepath = path.join(outputDir, filename);

    // Generate frontmatter
    const frontmatter = `---
title: "${result.seoMetadata.title}"
description: "${result.seoMetadata.description}"
slug: "${slug}"
category: "${tool.category}"
keywords: [${result.seoMetadata.keywords.map((k) => `"${k}"`).join(', ')}]
author: "Engify.ai Research Team"
featured: ${tool.priority === 'high'}
level: "${tool.tone}"
provider: "${tool.provider}"
toolId: "${tool.id}"
${tool.marketShare ? `marketShare: "${tool.marketShare}"` : ''}
publishedAt: "${new Date().toISOString()}"
updatedAt: "${new Date().toISOString()}"
---

`;

    const fullContent = frontmatter + result.finalContent;

    fs.writeFileSync(filepath, fullContent, 'utf-8');

    console.log(`\n✅ SUCCESS: ${tool.name}`);
    console.log(`   📄 File: ${filename}`);
    console.log(`   📊 Score: ${result.readabilityScore.toFixed(1)}/10`);
    console.log(`   🔗 URL: /learn/ai-tools/${slug}`);
    console.log(`   📈 Publish Ready: ${result.publishReady ? 'YES' : 'NO'}`);

    // Save metadata for later review
    const metaFile = path.join(outputDir, `${slug}.meta.json`);
    fs.writeFileSync(
      metaFile,
      JSON.stringify(
        {
          tool,
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
    console.error(`\n❌ ERROR: ${tool.name}`);
    console.error(error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const toolArg = args.find((a) => a.startsWith('--tool='))?.split('=')[1];

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log(
    '║       AI Tool Content Pages - Batch Generator               ║'
  );
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📊 Tools to Generate:');

  const toolsToGenerate = toolArg
    ? AI_TOOLS.filter((t) => t.id === toolArg)
    : AI_TOOLS;

  if (toolsToGenerate.length === 0) {
    console.error(`❌ Tool not found: ${toolArg}`);
    console.log('Available tools:', AI_TOOLS.map((t) => t.id).join(', '));
    process.exit(1);
  }

  // Show queue
  toolsToGenerate.forEach((t, i) => {
    const priority =
      t.priority === 'high' ? '🔥' : t.priority === 'medium' ? '⚡' : '📌';
    const share = t.marketShare ? ` (${t.marketShare})` : '';
    console.log(`   ${i + 1}. ${priority} ${t.name} ${share}`);
  });

  console.log('');
  console.log(`⏱️  Estimated time: ${toolsToGenerate.length * 3} minutes`);
  console.log('');

  // Generate in priority order
  const sorted = [...toolsToGenerate].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  for (const tool of sorted) {
    await generateToolPage(tool);
    // Brief pause between generations
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 BATCH GENERATION COMPLETE');
  console.log('='.repeat(70));
  console.log(`\n📁 Output: content/ai-tools/`);
  console.log(`\n📝 Next Steps:`);
  console.log(`   1. Review generated content in content/ai-tools/`);
  console.log(
    `   2. Publish using: tsx scripts/content/publish-article.ts content/ai-tools/[file].md`
  );
  console.log(`   3. Verify at: https://engify.ai/learn/ai-tools/[slug]`);
  console.log('');
}

main().catch(console.error);
