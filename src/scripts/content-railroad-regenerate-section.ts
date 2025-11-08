#!/usr/bin/env tsx
/**
 * CONTENT RAILROAD - Regenerate Single Section
 * 
 * Regenerates a specific section that scored poorly
 * 
 * Usage:
 *   pnpm tsx src/scripts/content-railroad-regenerate-section.ts <article-id> <section-index>
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { ArticleResearchRepository } from '@/lib/db/repositories/article-research.repository';
import { ContentPublishingService, CONTENT_AGENTS } from '@/lib/content/content-publishing-pipeline';
import { calculateReadability, getReadabilityScore } from '@/lib/content/readability-calculator';
import type { ArticleResearch, ArticleSection } from '@/lib/db/schemas/article-research.schema';

async function generateSection(
  service: ContentPublishingService,
  section: ArticleSection, 
  research: ArticleResearch,
  previousScore: number,
  previousReadability: number
): Promise<string> {
  const isExpertise = section.purpose.includes('EXPERTISE');
  const agent = isExpertise ? CONTENT_AGENTS[4] : CONTENT_AGENTS[0];
  
  const prompt = `
Write the "${section.title}" section for the article: "${research.workingTitle}"

**Section Purpose:** ${section.purpose}
**Target Word Count:** ${section.targetWords} words

**PREVIOUS ATTEMPT ISSUES:**
- Quality Score: ${previousScore}/10 (needs improvement)
- Readability: ${previousReadability}/10 (too complex)
- Target: 8-10 grade level (Plain English)

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
` : ''}

**CRITICAL REQUIREMENTS:**
1. Write ONLY this section (don't write other sections)
2. Use SIMPLE language - 8th-9th grade reading level
3. SHORT sentences (10-15 words average)
4. SHORT paragraphs (3-4 sentences max)
5. Use concrete examples, not abstract concepts
6. Replace complex words with simple alternatives:
   - "utilize" → "use"
   - "implement" → "add" or "set up"
   - "facilitate" → "help"
   - "subsequent" → "next"
7. Include personal testing: "I tested...", "We found..."
8. Add specific metrics and version numbers
9. NO AI slop: delve, leverage, utilize, em dashes
10. Include ALL external and internal links naturally
${isExpertise ? '11. TECHNICAL DEPTH: Include code examples, but explain them simply' : ''}

**READABILITY TARGET:**
- Flesch-Kincaid: 8-10 grade level
- Flesch Reading Ease: 60-70 (Plain English)
- Avg sentence: 10-15 words
- Use active voice, not passive

Write the section now in markdown:
`;

  return service['runAgent'](agent, prompt);
}

async function main() {
  const [, , articleId, sectionIndexStr] = process.argv;
  
  if (!articleId || !sectionIndexStr) {
    console.error('❌ Usage: pnpm tsx src/scripts/content-railroad-regenerate-section.ts <article-id> <section-index>');
    process.exit(1);
  }
  
  const sectionIndex = parseInt(sectionIndexStr, 10);
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Regenerate Section with Improved Readability          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Load research
  const research = await ArticleResearchRepository.findById(articleId);
  if (!research) {
    console.error(`❌ Article not found: ${articleId}`);
    process.exit(1);
  }
  
  if (sectionIndex < 0 || sectionIndex >= research.sections.length) {
    console.error(`❌ Invalid section index: ${sectionIndex} (must be 0-${research.sections.length - 1})`);
    process.exit(1);
  }
  
  const section = research.sections[sectionIndex];
  const previousGenerated = section.generated;
  
  console.log(`📝 Article: "${research.workingTitle}"`);
  console.log(`📄 Section ${sectionIndex + 1}/${research.sections.length}: ${section.title}`);
  console.log(`   Purpose: ${section.purpose}`);
  console.log(`   Target: ${section.targetWords} words\n`);
  
  if (previousGenerated) {
    console.log(`📊 Previous Attempt:`);
    console.log(`   Quality: ${previousGenerated.qualityScore || 'N/A'}/10`);
    console.log(`   Readability: ${previousGenerated.readability?.fleschKincaid || 'N/A'} grade`);
    console.log(`   Flags: ${previousGenerated.flags?.join(', ') || 'none'}\n`);
  }
  
  console.log(`🔄 Regenerating with improved readability requirements...\n`);
  
  // Generate
  const service = new ContentPublishingService('section-regenerate');
  const content = await generateSection(
    service,
    section,
    research,
    previousGenerated?.qualityScore || 0,
    previousGenerated?.readability?.fleschKincaid ? 
      (previousGenerated.readability.fleschKincaid > 12 ? 4 : 6) : 0
  );
  
  const wordCount = content.split(/\s+/).length;
  const readability = calculateReadability(content);
  const readabilityScore = getReadabilityScore(readability);
  
  // Quick score
  const flags: string[] = [];
  if (wordCount < section.targetWords * 0.7) flags.push('too-short');
  if (wordCount > section.targetWords * 1.5) flags.push('too-long');
  if (!content.includes('```')) flags.push('no-code');
  if (!/\d+/.test(content)) flags.push('no-numbers');
  if (readability.fleschKincaid > 12) flags.push('too-complex');
  if (readability.fleschKincaid < 6) flags.push('too-simple');
  
  const qualityScore = 10 - flags.length * 2;
  
  console.log(`✅ NEW VERSION GENERATED:\n`);
  console.log(`   Words: ${wordCount} (target: ${section.targetWords})`);
  console.log(`   Quality Score: ${qualityScore}/10`);
  console.log(`   Readability: ${readability.fleschKincaid} grade, ${readability.fleschReadingEase}/100 ease (${readabilityScore}/10)`);
  console.log(`   Flags: ${flags.length > 0 ? flags.join(', ') : 'none'}\n`);
  
  // Show improvement
  if (previousGenerated?.readability?.fleschKincaid) {
    const improvement = previousGenerated.readability.fleschKincaid - readability.fleschKincaid;
    console.log(`📈 IMPROVEMENT:`);
    console.log(`   Grade Level: ${previousGenerated.readability.fleschKincaid} → ${readability.fleschKincaid} (${improvement > 0 ? '-' : '+'}${Math.abs(improvement).toFixed(1)} grades)`);
    console.log(`   Reading Ease: ${previousGenerated.readability.fleschReadingEase || 0} → ${readability.fleschReadingEase} (+${(readability.fleschReadingEase - (previousGenerated.readability.fleschReadingEase || 0)).toFixed(1)})\n`);
  }
  
  console.log(`📝 NEW CONTENT:\n`);
  console.log(content);
  console.log(`\n${'='.repeat(70)}\n`);
  console.log(`💾 To save this version, update the article in MongoDB manually or regenerate the full article.`);
}

main();
