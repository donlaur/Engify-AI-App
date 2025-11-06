#!/usr/bin/env tsx
/**
 * Export Pillar Pages to Markdown Files
 * 
 * Exports pillar pages from MongoDB to markdown files for analysis
 * and generates Gemini Deep Research prompts for SEO analysis.
 * 
 * Usage:
 *   tsx scripts/content/export-pillar-pages-for-research.ts
 *   tsx scripts/content/export-pillar-pages-for-research.ts --id=ai-first-engineering-organization
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { getMongoDb } from '@/lib/db/mongodb';
import { PILLAR_PAGES, getPillarPage, type PillarPageConfig } from '@/lib/data/pillar-pages';

const OUTPUT_DIR = path.join(process.cwd(), 'docs', 'pillar-pages', 'exports');
const PROMPTS_DIR = path.join(process.cwd(), 'docs', 'pillar-pages', 'gemini-research-prompts');

/**
 * Convert HTML to Markdown (basic conversion)
 */
function htmlToMarkdown(html: string): string {
  if (!html) return '';
  
  let md = html;
  
  // Remove HTML tags but preserve content
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
  md = md.replace(/<ul[^>]*>/gi, '');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n');
  
  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');
  
  // Clean up multiple newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  
  return md.trim();
}

/**
 * Export a single pillar page to markdown
 */
async function exportPillarPage(config: PillarPageConfig): Promise<void> {
  const db = await getMongoDb();
  const collection = db.collection('learning_resources');
  
  // Try to find in MongoDB first
  let pillarPage = await collection.findOne({
    id: config.slug,
    type: 'pillar',
  });
  
  // If not in MongoDB, check if it's a static file
  if (!pillarPage && config.structure === 'static' && config.filePath) {
    console.log(`⚠️  ${config.title} is a static file, skipping MongoDB export`);
    return;
  }
  
  if (!pillarPage) {
    console.log(`⚠️  ${config.title} not found in MongoDB`);
    return;
  }
  
  // Convert HTML content to markdown
  const contentHtml = pillarPage.contentHtml || '';
  const contentMarkdown = htmlToMarkdown(contentHtml);
  
  // Build markdown document
  const markdown = `# ${pillarPage.title}

**Description:** ${pillarPage.description || config.description}

**Category:** ${pillarPage.category || config.category}
**Level:** ${pillarPage.level || config.level}
**Audience:** ${config.audience}
**Target Word Count:** ${config.targetWordCount}
**Current Word Count:** ${pillarPage.wordCount || 0}

**Target Keywords:**
${config.targetKeywords.map(k => `- ${k}`).join('\n')}

**Related Roles:**
${(config.relatedRoles || []).map(r => `- ${r}`).join('\n')}

**Related Tags:**
${(config.relatedTags || []).map(t => `- ${t}`).join('\n')}

---

## Content

${contentMarkdown}

---

## FAQ

${(pillarPage.faq || []).map((faq: any) => `### ${faq.question}\n\n${faq.answer}\n`).join('\n')}

---

**Last Updated:** ${pillarPage.updatedAt || new Date().toISOString()}
**Status:** ${pillarPage.status || 'unknown'}
`;

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Write markdown file
  const filename = `${config.slug}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, markdown, 'utf-8');
  
  console.log(`✅ Exported: ${filename}`);
  console.log(`   Word count: ${pillarPage.wordCount || 0} / ${config.targetWordCount}`);
}

/**
 * Generate Gemini Deep Research prompt for a pillar page
 */
function generateGeminiResearchPrompt(config: PillarPageConfig): string {
  const prompt = `# Gemini Deep Research Prompt: ${config.title}

## Research Objective

Conduct a comprehensive SEO and content analysis of this pillar page to:
1. Identify missing SEO-rich keywords and phrases
2. Assess content depth and comprehensiveness
3. Evaluate alignment with pillar page goals
4. Recommend improvements for search visibility and user value

## Pillar Page Context

**Title:** ${config.title}
**Description:** ${config.description}
**Category:** ${config.category}
**Level:** ${config.level}
**Target Audience:** ${config.audience}
**Target Word Count:** ${config.targetWordCount} words

**Primary Keywords:**
${config.targetKeywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}

**Target Roles:**
${(config.relatedRoles || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}

**Related Topics/Tags:**
${(config.relatedTags || []).map((t, i) => `${i + 1}. ${t}`).join('\n')}

## Research Tasks

### 1. Keyword Gap Analysis
- Identify high-value keywords related to "${config.title}" that are missing from the current keyword list
- Focus on:
  - Long-tail keywords (3-5 words)
  - Question-based queries (how, what, why, when)
  - Comparison queries (vs, alternatives, best)
  - Intent-based keywords (buyer intent, informational, navigational)
- Prioritize keywords by:
  - Search volume (if available)
  - Relevance to target audience
  - Competition level
  - Commercial intent

### 2. Content Depth Assessment
- Evaluate if the content meets the ${config.targetWordCount}-word target
- Assess coverage of:
  - Core concepts and fundamentals
  - Advanced topics and edge cases
  - Practical examples and case studies
  - Step-by-step guides and tutorials
  - Common questions and concerns
- Identify content gaps:
  - Missing subtopics
  - Underdeveloped sections
  - Areas needing more detail or examples

### 3. SEO Content Richness Analysis
- Analyze semantic keyword coverage:
  - Related terms and synonyms
  - LSI (Latent Semantic Indexing) keywords
  - Topic clusters and related concepts
  - Industry-specific terminology
- Evaluate keyword density and natural integration
- Assess internal linking opportunities
- Review heading structure (H1-H6) for SEO optimization

### 4. Pillar Page Goal Alignment
- Verify alignment with pillar page objectives:
  - **Hub Content:** Does it comprehensively cover the main topic?
  - **Authority:** Does it establish expertise and trust?
  - **Comprehensiveness:** Does it cover all major subtopics?
  - **User Value:** Does it provide actionable, valuable information?
  - **Search Intent:** Does it match what users are searching for?

### 5. Competitive Content Analysis
- Research top-ranking content for target keywords
- Identify:
  - Topics covered by competitors but missing here
  - Content formats that perform well (guides, lists, comparisons)
  - Unique angles or perspectives competitors use
  - Content length and depth of top performers

### 6. User Intent Mapping
- Map content to search intents:
  - **Informational:** "What is...", "How to...", "Guide to..."
  - **Navigational:** "Best...", "Top...", "List of..."
  - **Commercial:** "Compare...", "Review...", "Pricing..."
  - **Transactional:** "Buy...", "Get...", "Download..."
- Ensure content addresses primary user intents

### 7. Content Enhancement Recommendations
- Provide specific recommendations for:
  - Additional sections to add
  - Keywords to naturally integrate
  - Content depth improvements
  - Examples and case studies to include
  - Visual content opportunities (diagrams, charts, infographics)
  - FAQ expansion
  - Internal linking opportunities

## Expected Output Format

Please provide your analysis in the following structure:

\`\`\`markdown
# SEO & Content Analysis: ${config.title}

## Executive Summary
[2-3 paragraph overview of findings]

## Keyword Gap Analysis
### High-Priority Missing Keywords
1. [keyword] - [reason/justification]
2. [keyword] - [reason/justification]
...

### Long-Tail Opportunities
1. [long-tail keyword] - [search intent]
2. [long-tail keyword] - [search intent]
...

### Question-Based Queries
1. [question] - [answer location recommendation]
2. [question] - [answer location recommendation]
...

## Content Depth Assessment
### Current Coverage
- Word count: [actual] / [target]
- Sections: [count]
- Depth score: [1-10]

### Content Gaps
1. [Missing topic] - [recommended word count/approach]
2. [Missing topic] - [recommended word count/approach]
...

### Underdeveloped Sections
1. [Section name] - [current depth] / [recommended depth]
2. [Section name] - [current depth] / [recommended depth]
...

## SEO Content Richness
### Semantic Keywords to Add
- [keyword] (appears [X] times, should appear [Y] times)
- [keyword] (appears [X] times, should appear [Y] times)
...

### LSI Keywords Identified
- [LSI keyword 1]
- [LSI keyword 2]
...

### Internal Linking Opportunities
- Link to: [internal page] from section: [section name]
- Link to: [internal page] from section: [section name]
...

## Pillar Page Goal Alignment
### Hub Content Score: [1-10]
[Explanation]

### Authority Score: [1-10]
[Explanation]

### Comprehensiveness Score: [1-10]
[Explanation]

### User Value Score: [1-10]
[Explanation]

### Overall Alignment: [1-10]
[Summary]

## Competitive Analysis
### Top Competitors
1. [Competitor URL] - [What they cover that we don't]
2. [Competitor URL] - [What they cover that we don't]
...

### Content Format Opportunities
- [Format type] - [Why it works]
- [Format type] - [Why it works]
...

## User Intent Coverage
### Informational Intent: [Coverage %]
[Details]

### Navigational Intent: [Coverage %]
[Details]

### Commercial Intent: [Coverage %]
[Details]

## Content Enhancement Recommendations
### Priority 1 (High Impact)
1. [Recommendation] - [Expected impact]
2. [Recommendation] - [Expected impact]
...

### Priority 2 (Medium Impact)
1. [Recommendation] - [Expected impact]
2. [Recommendation] - [Expected impact]
...

### Priority 3 (Nice to Have)
1. [Recommendation] - [Expected impact]
2. [Recommendation] - [Expected impact]
...

## Action Plan
### Immediate Actions (This Week)
- [ ] [Action item]
- [ ] [Action item]
...

### Short-Term (This Month)
- [ ] [Action item]
- [ ] [Action item]
...

### Long-Term (Next Quarter)
- [ ] [Action item]
- [ ] [Action item]
...
\`\`\`

## Research Guidelines

1. **Be Specific:** Provide concrete examples, not vague suggestions
2. **Prioritize:** Focus on high-impact improvements first
3. **Data-Driven:** Reference search trends, competitor analysis, and user behavior where possible
4. **Actionable:** Every recommendation should be implementable
5. **User-Focused:** Prioritize user value over keyword stuffing
6. **Comprehensive:** Cover all aspects of SEO and content quality

## Notes

- Target audience: ${config.audience}
- Content level: ${config.level}
- Primary goal: Establish authority and drive organic traffic
- Secondary goal: Support internal linking strategy (hub-and-spoke model)
- Content should be ${config.targetWordCount}+ words for comprehensive coverage

---

**Research Date:** [Date]
**Researcher:** Gemini Deep Research
**Pillar Page:** ${config.slug}
`;

  return prompt;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find(arg => arg.startsWith('--id='));
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Export Pillar Pages for Gemini Deep Research          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Determine which pages to export
  let pagesToExport: PillarPageConfig[] = [];
  
  if (idArg) {
    const id = idArg.split('=')[1];
    const page = getPillarPage(id);
    if (!page) {
      console.error(`❌ Pillar page not found: ${id}`);
      process.exit(1);
    }
    pagesToExport = [page];
  } else {
    // Export all MongoDB-stored pages
    pagesToExport = PILLAR_PAGES.filter(p => p.structure === 'mongodb');
  }
  
  console.log(`📊 Found ${pagesToExport.length} pages to export\n`);
  
  // Ensure directories exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROMPTS_DIR)) {
    fs.mkdirSync(PROMPTS_DIR, { recursive: true });
  }
  
  // Export each page
  for (const page of pagesToExport) {
    console.log(`📄 Processing: ${page.title}`);
    
    try {
      // Export markdown
      await exportPillarPage(page);
      
      // Generate research prompt
      const prompt = generateGeminiResearchPrompt(page);
      const promptFilename = `${page.slug}-gemini-research-prompt.md`;
      const promptFilepath = path.join(PROMPTS_DIR, promptFilename);
      fs.writeFileSync(promptFilepath, prompt, 'utf-8');
      
      console.log(`✅ Generated research prompt: ${promptFilename}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error processing ${page.title}:`, error);
      console.log('');
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Export Complete!');
  console.log('');
  console.log(`📁 Markdown files: ${OUTPUT_DIR}`);
  console.log(`📁 Research prompts: ${PROMPTS_DIR}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review exported markdown files');
  console.log('2. Copy research prompts to Gemini Deep Research');
  console.log('3. Paste the corresponding markdown content');
  console.log('4. Review analysis and implement recommendations');
  console.log('');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { exportPillarPage, generateGeminiResearchPrompt };

