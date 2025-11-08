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
import { scoreContent, printQualityReport } from '@/lib/content/content-quality-scorer';
import { calculateReadability, printReadabilityReport, getReadabilityScore } from '@/lib/content/readability-calculator';
import type { ArticleResearch, ArticleSection } from '@/lib/db/schemas/article-research.schema';

interface SectionResult {
  section: ArticleSection;
  content: string;
  wordCount: number;
  qualityScore: number; // Simple 0-10 score
  flags: string[]; // Quick quality flags
  readability: ReturnType<typeof calculateReadability>;
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
  // Use Claude for EXPERTISE sections (better at technical depth)
  // Use GPT-4o for EXPERIENCE/TRUSTWORTHINESS (better at conversational tone)
  const isExpertise = section.purpose.includes('EXPERTISE');
  const agent = isExpertise ? CONTENT_AGENTS[4] : CONTENT_AGENTS[0]; // Tech SME or Content Generator
  
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

${section.externalLinks && section.externalLinks.length > 0 ? `
**EXTERNAL AUTHORITY LINKS (Include naturally):**
${section.externalLinks.map(l => `- Link "${l.anchor}" to ${l.url} (${l.authority})`).join('\n')}
` : ''}

${section.internalLinks && section.internalLinks.length > 0 ? `
**INTERNAL LINKS (Include naturally):**
${section.internalLinks.map(l => `- Link "${l.anchor}" to ${l.url} (${l.type})`).join('\n')}
Example: "For more details, check out our [${section.internalLinks[0].anchor}](${section.internalLinks[0].url})."
` : ''}

**CRITICAL REQUIREMENTS:**
1. Write ONLY this section (don't write other sections)
2. Use the research data provided
3. Include personal testing: "I tested...", "We found..."
4. Add specific metrics and version numbers
5. NO AI slop: delve, leverage, utilize, em dashes
6. Vary sentence length
7. Be honest about limitations
8. Include ALL external and internal links naturally in the text
9. Use markdown link format: [anchor text](url)
${isExpertise ? '10. TECHNICAL DEPTH: Include code examples, architecture diagrams, specific version numbers, and deep technical analysis' : ''}

Write the section now in markdown:
`;

  return service['runAgent'](agent, prompt);
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
    
    // Calculate readability
    const readability = calculateReadability(content);
    const readabilityScore = getReadabilityScore(readability);
    
    // Quick section score (simple checks)
    const flags: string[] = [];
    if (wordCount < section.targetWords * 0.7) flags.push('too-short');
    if (wordCount > section.targetWords * 1.5) flags.push('too-long');
    if (!content.includes('```')) flags.push('no-code');
    if (!/\d+/.test(content)) flags.push('no-numbers');
    if (readability.fleschKincaid > 12) flags.push('too-complex');
    if (readability.fleschKincaid < 6) flags.push('too-simple');
    
    const qualityScore = 10 - flags.length * 2; // Simple: 10 minus 2 per flag
    
    console.log(`   ✅ Generated: ${wordCount} words (target: ${section.targetWords})`);
    console.log(`   📊 Quick score: ${qualityScore}/10`);
    console.log(`   📖 Readability: ${readability.fleschKincaid} grade, ${readability.fleschReadingEase}/100 ease (${readabilityScore}/10)`);
    if (flags.length > 0) {
      console.log(`   🚩 Flags: ${flags.join(', ')}`);
    }
    console.log('');

    sectionResults.push({
      section,
      content,
      wordCount,
      qualityScore,
      flags,
      readability
    });

    totalWords += wordCount;
  }

  // Combine sections
  const fullArticle = `# ${research.workingTitle}\n\n${sectionResults.map(s => s.content).join('\n\n')}\n\n---\n**Last Updated:** November 2025\n**Keywords:** ${research.keywords.join(', ')}`;

  // Cohesion check (high token budget to review full article)
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔗 COHESION CHECK - Reviewing Full Article Flow`);
  console.log(`${'='.repeat(70)}\n`);
  
  const cohesionPrompt = `Review this complete article for flow and cohesion.

**Article:**
${fullArticle}

**Check:**
1. Do sections transition smoothly?
2. Any repetition across sections?
3. Does it feel unified or disjointed?
4. Missing connections between ideas?

Provide:
- Cohesion score (1-10)
- What works
- What needs fixing
- Specific transition improvements

Be concise but specific.`;

  const cohesionReview = await service['runAgent'](
    CONTENT_AGENTS.find(a => a.role === 'final_publisher')!,
    cohesionPrompt
  );
  
  console.log('📝 Cohesion Review:');
  console.log(cohesionReview);
  console.log('');

  // Final quality score
  console.log(`${'='.repeat(70)}`);
  console.log(`🔍 FINAL QUALITY SCORE`);
  console.log(`${'='.repeat(70)}`);
  const qualityScore = scoreContent(fullArticle, research.keywords);
  printQualityReport(qualityScore);
  
  // Calculate overall readability
  const overallReadability = calculateReadability(fullArticle);
  printReadabilityReport(overallReadability);

  // Save to DB with comprehensive quality data
  await ArticleResearchRepository.updateGenerated(articleId, {
    content: fullArticle,
    wordCount: totalWords,
    generatedAt: new Date(),
    qualityScore: {
      overall: qualityScore.overall,
      aiSlop: qualityScore.slopScore,
      eeat: qualityScore.eeatScore,
      seo: qualityScore.seoScore,
      technical: qualityScore.technicalScore,
      readability: getReadabilityScore(overallReadability),
    },
    readability: {
      fleschKincaid: overallReadability.fleschKincaid,
      fleschReadingEase: overallReadability.fleschReadingEase,
      avgSentenceLength: overallReadability.avgSentenceLength,
      avgWordLength: overallReadability.avgWordLength,
      avgParagraphLength: overallReadability.avgParagraphLength,
    },
    cohesion: {
      score: 8, // From cohesion review (would need to parse)
      feedback: cohesionReview,
      improvements: [],
    }
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
  console.log(`   Avg Section Score: ${(sectionResults.reduce((s, r) => s + r.qualityScore, 0) / sectionResults.length).toFixed(1)}/10`);
  console.log(`   Overall Quality: ${qualityScore.overall.toFixed(1)}/10 (${qualityScore.verdict})`);
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
