#!/usr/bin/env tsx
/**
 * Simple Article Generator - Cursor 2.0 Multi-Agent Features
 *
 * Uses OpenAI API directly to generate the article about
 * why Cursor 2.0 needs workflows and guardrails.
 *
 * This is timely content - Cursor 2.0.43 released today!
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ArticleResult {
  title: string;
  content: string;
  seoMeta: {
    description: string;
    keywords: string[];
    slug: string;
  };
}

async function generateWithAgent(
  role: string,
  systemPrompt: string,
  userPrompt: string,
  model: string = 'gpt-4-turbo-preview'
): Promise<string> {
  console.log(`   🤖 ${role}...`);

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content || '';
  console.log(`      ✅ Generated ${content.length} chars`);

  return content;
}

async function generateArticle(): Promise<ArticleResult> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Cursor 2.0 Multi-Agent Article Generator                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📝 Topic: Why Cursor 2.0 Multi-Agent Features Need Workflows');
  console.log('⏰ Timely: Cursor 2.0.43 released today (Nov 2, 2025)');
  console.log('🎯 Target: Intermediate developers');
  console.log('');
  console.log('⏳ This will take 2-3 minutes...');
  console.log('');

  // Step 1: Generate main content
  const contentPrompt = `Write a comprehensive technical article about: "Why Cursor 2.0 Multi-Agent Features Need Workflows and Guardrails"

CONTEXT: Cursor 2.0.43 was just released today (November 2, 2025) with multi-agent features that let developers spawn multiple AI agents working in parallel.

KEY POINTS TO COVER:
1. Hook: Cursor 2.0.43 multi-agent is powerful but needs structure
2. The Problem: Multiple agents without coordination = chaos
   - Conflicting code patterns (Agent A uses Vitest, Agent B uses Jest)
   - No quality enforcement
   - Token/credit waste
   - Security issues slip through

3. The Solution: Pre-commit hooks + workflows
   - Catch issues before they enter repo
   - ADRs (Architectural Decision Records) for consistency
   - Cost savings: 50-80% reduction in wasted tokens

4. Real Example from Production:
   - Pre-commit hooks that catch:
     * TypeScript 'any' types
     * Missing tests on API routes
     * Test framework mixing (enforce Vitest-only via ADR-012)
     * Security issues (hardcoded secrets)
     * Missing audit logging
   
5. Cost Analysis:
   WITHOUT hooks: 5 agents × rework = 500+ credits wasted
   WITH hooks: Issues caught immediately = 100 credits
   Result: 80% cost reduction

6. Implementation Guide:
   - Set up Husky for Git hooks
   - Create enforcement scripts
   - Define ADRs upfront
   - Test the workflow

7. Best Practices:
   - Use Agent Review strategically (not after every change)
   - Commit frequently (atomic commits)
   - Let hooks catch issues, then fix immediately

8. Conclusion: Multi-agent amplifies your processes
   - Good processes → Amplified quality
   - Bad processes → Amplified chaos

REQUIREMENTS:
- 1200-1500 words
- Professional but conversational tone
- Use "you" and "we" (not "one should")
- Include code examples in bash/typescript
- Short paragraphs (3-4 sentences)
- Real, specific examples
- Actionable advice
- End with clear call-to-action

TONE:
- Empowering, not intimidating
- "Here's what worked for us..."
- Honest about trade-offs
- Use contractions (don't, you'll, we're)
- Avoid AI voice patterns: no "delve", "landscape", "harness"

Write the article now:`;

  const mainContent = await generateWithAgent(
    'Content Generator',
    `You are an expert technical writer creating content for Engify.ai. 
Write clear, engaging, technically accurate articles that help developers master AI-assisted development.
Your style is professional but conversational, like a senior dev helping a colleague.`,
    contentPrompt,
    'gpt-4-turbo-preview'
  );

  // Step 2: SEO Optimization
  const seoPrompt = `Optimize this article for SEO. Provide:

ARTICLE:
${mainContent.substring(0, 2000)}...

Provide JSON response:
{
  "title": "SEO-optimized title (50-60 chars, includes 'Cursor 2.0')",
  "description": "Meta description (150-160 chars)",
  "keywords": ["5-8 relevant keywords"],
  "slug": "url-slug-format"
}`;

  const seoResponse = await generateWithAgent(
    'SEO Specialist',
    `You are an SEO specialist optimizing technical content. 
Focus on discoverability without keyword stuffing.
Return ONLY valid JSON.`,
    seoPrompt,
    'gpt-4-turbo-preview'
  );

  let seoMeta;
  try {
    // Extract JSON from response
    const jsonMatch = seoResponse.match(/\{[\s\S]*\}/);
    seoMeta = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : {
          title:
            'Why Cursor 2.0 Multi-Agent Features Need Workflows and Guardrails',
          description:
            "Learn how to safely use Cursor's new multi-agent features with pre-commit hooks and ADRs. Save 80% on wasted tokens.",
          keywords: [
            'cursor',
            'multi-agent',
            'workflows',
            'pre-commit-hooks',
            'ai-coding',
          ],
          slug: 'cursor-multi-agent-workflows-guardrails',
        };
  } catch (e) {
    console.warn('      ⚠️  SEO JSON parse failed, using defaults');
    seoMeta = {
      title:
        'Why Cursor 2.0 Multi-Agent Features Need Workflows and Guardrails',
      description:
        "Learn how to safely use Cursor's new multi-agent features with pre-commit hooks and ADRs. Save 80% on wasted tokens.",
      keywords: [
        'cursor',
        'multi-agent',
        'workflows',
        'pre-commit-hooks',
        'ai-coding',
      ],
      slug: 'cursor-multi-agent-workflows-guardrails',
    };
  }

  // Step 3: Polish for human tone
  const polishPrompt = `Make this article sound more human and less AI-generated:

${mainContent}

FIX THESE AI PATTERNS:
- Remove: "delve", "landscape", "realm", "harness"
- Remove: "In conclusion", "It's worth noting"
- Add contractions: "don't", "you'll", "we're"
- Vary sentence length
- Add personality and specific examples
- Make it sound like a real developer wrote it

Return the polished version:`;

  const polishedContent = await generateWithAgent(
    'Human Tone Editor',
    `You are an editor who makes AI content sound genuinely human.
Remove all "AI voice" patterns. Make it conversational and authentic.`,
    polishPrompt,
    'gpt-4-turbo-preview'
  );

  return {
    title: seoMeta.title,
    content: polishedContent,
    seoMeta,
  };
}

async function main() {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      console.error('');
      console.error('Please set it in .env.local:');
      console.error('OPENAI_API_KEY=sk-...');
      process.exit(1);
    }

    // Generate article
    const result = await generateArticle();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 GENERATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ Title: ${result.title}`);
    console.log(`📄 Word Count: ${result.content.split(/\s+/).length} words`);
    console.log(`🔑 Keywords: ${result.seoMeta.keywords.join(', ')}`);
    console.log(`🔗 Slug: /${result.seoMeta.slug}`);
    console.log('');

    // Save to file
    const outputDir = path.join(process.cwd(), 'content/drafts');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${timestamp}-${result.seoMeta.slug}.md`;
    const filepath = path.join(outputDir, filename);

    const markdown = `---
title: "${result.title}"
description: "${result.seoMeta.description}"
slug: "${result.seoMeta.slug}"
category: "Best Practices"
keywords: [${result.seoMeta.keywords.map((k) => `"${k}"`).join(', ')}]
publishDate: "${new Date().toISOString()}"
author: "Engify.ai Team"
featured: true
---

${result.content}

---

## About Engify.ai

Engify.ai helps developers master AI-assisted development with proven workflows, quality guardrails, and systematic engineering practices.

**Ready to improve your AI development workflow?**
- ✅ Check out our [pre-commit hooks guide](https://engify.ai/guides/pre-commit-hooks)
- ✅ Learn about [ADRs (Architectural Decision Records)](https://engify.ai/guides/adrs)
- ✅ Explore our [multi-agent best practices](https://engify.ai/guides/multi-agent)

---

*This article was generated using our multi-agent content publishing system - the same workflows we write about! Meta, right? 😊*
`;

    fs.writeFileSync(filepath, markdown);

    console.log('💾 Article saved:');
    console.log(`   📄 ${filepath}`);
    console.log('');
    console.log('✅ READY TO PUBLISH!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Review the article');
    console.log('2. Make any final tweaks');
    console.log('3. Add to your blog/CMS');
    console.log('4. Share on social media');
    console.log('');
    console.log('🚀 This is timely content - Cursor 2.0.43 just released!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
  } catch (error) {
    console.error('');
    console.error('❌ Error generating article:', error);
    console.error('');
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  }
}

main();
