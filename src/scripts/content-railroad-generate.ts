#!/usr/bin/env tsx
/**
 * CONTENT RAILROAD - Multi-Agent Article Generator
 * 
 * Generates articles section-by-section from MongoDB research data.
 * Each section is a "train car" with specific E-E-A-T cargo.
 * 
 * Usage:
 *   pnpm tsx src/scripts/content-railroad-generate.ts <article-id>
 *   pnpm tsx src/scripts/content-railroad-generate.ts --list
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { ArticleResearchRepository } from '@/lib/db/repositories/article-research.repository';
import { ContentPublishingService, CONTENT_AGENTS } from '@/lib/content/content-publishing-pipeline';
import { detectAISlop, printDetectionReport } from '@/lib/content/ai-slop-detector';
import { scoreContent, printQualityReport } from '@/lib/content/content-quality-scorer';
import type { ArticleResearch, ArticleSection } from '@/lib/db/schemas/article-research.schema';

interface SectionResult {
  section: ArticleSection;
  content: string;
  wordCount: number;
  slopScore: number;
}

async function listArticles() {
  console.log('📋 Available Articles:\n');
  
  const ready = await ArticleResearchRepository.findByStatus('ready');
  const generating = await ArticleResearchRepository.findByStatus('generating');
  const review = await ArticleResearchRepository.findByStatus('review');
  
  if (ready.length > 0) {
    console.log('✅ Ready for Generation:');
    ready.forEach(a => console.log(`   ${a._id} - ${a.workingTitle}`));
    console.log('');
  }
  
  if (generating.length > 0) {
    console.log('⏳ Currently Generating:');
    generating.forEach(a => console.log(`   ${a._id} - ${a.workingTitle}`));
    console.log('');
  }
  
  if (review.length > 0) {
    console.log('📝 In Review:');
    review.forEach(a => console.log(`   ${a._id} - ${a.workingTitle}`));
    console.log('');
  }
}

async function generateSection(
  service: ContentPublishingService,
  section: ArticleSection, 
  research: ArticleResearch
): Promise<string> {
  const prompt = `
Write the "${section.title}" section for the article: "${research.workingTitle}"

**Section Purpose:** ${section.purpose}
**Target Word Count:** ${section.targetWords} words

**Research Context:**
${section.context}

${research.pricing ? `**Pricing Data:**\n${research.pricing}\n` : ''}

${research.corePhilosophy ? `**Core Philosophy:**
Cursor: ${research.corePhilosophy.cursor || 'N/A'}
Windsurf: ${research.corePhilosophy.windsurf || 'N/A'}
` : ''}

**Target Keywords:** ${research.keywords.slice(0, 3).join(', ')}

**CRITICAL REQUIREMENTS:**
1. Write ONLY this section (don't write other sections)
2. Use the research data provided
3. Include personal testing: "I tested...", "We found..."
4. Add specific metrics and version numbers
5. NO AI slop: delve, leverage, utilize, em dashes
6. Vary sentence length
7. Be honest about limitations

Write the section now in markdown:
`;

  return service['runAgent'](CONTENT_AGENTS[0], prompt);
}

async function generateArticle(articleId: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Generate Article from MongoDB Research              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Load research from DB
  const research = await ArticleResearchRepository.findById(articleId);
  
  if (!research) {
    console.error(`❌ Article not found: ${articleId}`);
    process.exit(1);
  }

  console.log(`📝 Article: "${research.workingTitle}"`);
  console.log(`   Status: ${research.status}`);
  console.log(`   Keywords: ${research.keywords.length}`);
  console.log(`   Sections: ${research.sections.length}`);
  console.log('');

  // Update status to generating
  await ArticleResearchRepository.updateStatus(articleId, 'generating');

  const service = new ContentPublishingService('db-generator');
  const sectionResults: SectionResult[] = [];
  let totalWords = 0;

  // Generate each section
  for (let i = 0; i < research.sections.length; i++) {
    const section = research.sections[i];
    console.log(`${'─'.repeat(70)}`);
    console.log(`📄 Section ${i + 1}/${research.sections.length}: ${section.title}`);
    console.log(`   Purpose: ${section.purpose}`);
    console.log(`   Target: ${section.targetWords} words`);
    console.log(`${'─'.repeat(70)}\n`);

    const content = await generateSection(service, section, research);
    const wordCount = content.split(/\s+/).length;
    const slopDetection = detectAISlop(content);
    
    console.log(`   ✅ Generated: ${wordCount} words`);
    console.log(`   📊 Slop score: ${slopDetection.qualityScore}/10`);
    console.log(`   🚩 Flags: ${slopDetection.flags.length}\n`);

    sectionResults.push({
      section,
      content,
      wordCount,
      slopScore: slopDetection.qualityScore
    });

    totalWords += wordCount;
  }

  // Combine sections
  const fullArticle = `# ${research.workingTitle}\n\n${sectionResults.map(s => s.content).join('\n\n')}\n\n---\n**Last Updated:** November 2025\n**Keywords:** ${research.keywords.join(', ')}`;

  // Final quality score
  console.log(`${'='.repeat(70)}`);
  console.log(`🔍 FINAL QUALITY SCORE`);
  console.log(`${'='.repeat(70)}`);
  const qualityScore = scoreContent(fullArticle, research.keywords);
  printQualityReport(qualityScore);

  // Save to DB
  await ArticleResearchRepository.updateGenerated(articleId, {
    content: fullArticle,
    wordCount: totalWords,
    slopScore: qualityScore.overall,
    generatedAt: new Date()
  });

  await ArticleResearchRepository.updateStatus(articleId, 'review');

  // Save to file
  const timestamp = new Date().toISOString().split('T')[0];
  const slug = research.workingTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const outputDir = path.join(process.cwd(), 'content/drafts');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const articlePath = path.join(outputDir, `${timestamp}-${slug}-db.md`);
  fs.writeFileSync(articlePath, fullArticle);

  console.log(`\n✅ Article saved: ${articlePath}`);
  console.log(`✅ Updated in DB: ${articleId}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total Words: ${totalWords}`);
  console.log(`   Avg Slop Score: ${(sectionResults.reduce((s, r) => s + r.slopScore, 0) / sectionResults.length).toFixed(1)}/10`);
  console.log(`   Status: review\n`);
}

async function main() {
  const arg = process.argv[2];
  
  if (!arg) {
    console.error('❌ Usage: pnpm tsx src/scripts/content-railroad-generate.ts <article-id>');
    console.error('   Or:     pnpm tsx src/scripts/content-railroad-generate.ts --list');
    process.exit(1);
  }

  if (arg === '--list' || arg === '-l') {
    await listArticles();
  } else {
    await generateArticle(arg);
  }
}

main();
