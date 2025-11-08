/**
 * Section-Based Article Generator
 * Generates articles section-by-section with research data integration
 */

import { ContentPublishingService, CONTENT_AGENTS } from './content-publishing-pipeline';
import { getArticleResearch, type ArticleResearch, type ArticleSection } from './article-research-loader';
import { detectAISlop, printDetectionReport } from './ai-slop-detector';

export interface SectionResult {
  section: ArticleSection;
  content: string;
  wordCount: number;
  slopScore: number;
}

export interface ArticleGenerationResult {
  title: string;
  sections: SectionResult[];
  fullArticle: string;
  totalWords: number;
  avgSlopScore: number;
  finalReview: string;
}

export class SectionBasedArticleGenerator {
  private service: ContentPublishingService;

  constructor(requestId: string = 'section-generator') {
    this.service = new ContentPublishingService(requestId);
  }

  /**
   * Generate article section by section
   */
  async generateArticle(articleTitle: string): Promise<ArticleGenerationResult> {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📝 SECTION-BASED ARTICLE GENERATOR`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Article: "${articleTitle}"`);
    console.log(`Strategy: Generate each section separately with research data\n`);

    // Load research data for this specific article
    const research = getArticleResearch(articleTitle);
    if (!research) {
      throw new Error(`No research data found for article: ${articleTitle}`);
    }

    console.log(`✅ Loaded research data:`);
    console.log(`   - ${research.keywords.length} target keywords`);
    console.log(`   - ${research.structure.length} sections planned`);
    if (research.userQuotes) {
      const quoteCount = (research.userQuotes.proCursor?.length || 0) + 
                        (research.userQuotes.proWindsurf?.length || 0);
      console.log(`   - ${quoteCount} user quotes`);
    }
    if (research.pricing) {
      console.log(`   - Pricing comparison table`);
    }
    console.log('');

    const sectionResults: SectionResult[] = [];
    let totalWords = 0;

    // Generate each section
    for (let i = 0; i < research.structure.length; i++) {
      const section = research.structure[i];
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`📄 Section ${i + 1}/${research.structure.length}: ${section.title}`);
      console.log(`   Purpose: ${section.purpose}`);
      console.log(`   Target: ${section.targetWords} words`);
      console.log(`${'─'.repeat(70)}\n`);

      const sectionContent = await this.generateSection(section, research);
      const wordCount = sectionContent.split(/\s+/).length;
      
      // Run slop detection on this section
      const slopDetection = detectAISlop(sectionContent);
      
      console.log(`\n   ✅ Section generated: ${wordCount} words`);
      console.log(`   📊 Slop score: ${slopDetection.qualityScore}/10`);
      console.log(`   🚩 Flags: ${slopDetection.flags.length}`);

      sectionResults.push({
        section,
        content: sectionContent,
        wordCount,
        slopScore: slopDetection.qualityScore
      });

      totalWords += wordCount;
    }

    // Combine all sections
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔗 COMBINING SECTIONS`);
    console.log(`${'='.repeat(70)}\n`);

    const fullArticle = this.combineSections(research, sectionResults);
    
    console.log(`✅ Full article assembled: ${totalWords} words\n`);

    // Run final review on complete article
    console.log(`${'='.repeat(70)}`);
    console.log(`🔍 FINAL REVIEW - CHECKING FLOW & COHESION`);
    console.log(`${'='.repeat(70)}\n`);

    const finalReview = await this.reviewFullArticle(fullArticle, research);
    
    // Run slop detection on full article
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 FINAL SLOP DETECTION`);
    console.log(`${'='.repeat(70)}`);
    
    const finalSlopDetection = detectAISlop(fullArticle);
    printDetectionReport(finalSlopDetection);

    const avgSlopScore = sectionResults.reduce((sum, r) => sum + r.slopScore, 0) / sectionResults.length;

    return {
      title: research.title,
      sections: sectionResults,
      fullArticle,
      totalWords,
      avgSlopScore,
      finalReview
    };
  }

  /**
   * Generate a single section with research context
   */
  private async generateSection(section: ArticleSection, research: ArticleResearch): Promise<string> {
    const prompt = `
Write the "${section.title}" section for the article: "${research.title}"

**Section Purpose:** ${section.purpose}

**Target Word Count:** ${section.targetWords} words

**Research Context:**
${section.context}

**Target Keywords for Article:**
${research.keywords.slice(0, 3).join(', ')}

**Additional Context:**
${research.additionalContext || ''}

**CRITICAL REQUIREMENTS:**
1. Write EXACTLY for this section only (don't write other sections)
2. Use the research data provided (quotes, pricing, philosophy)
3. Include personal testing: "I tested...", "We found..."
4. Add specific metrics and version numbers
5. NO AI slop: delve, leverage, utilize, em dashes
6. Vary sentence length (mix short punchy + long detailed)
7. Be honest about limitations and trade-offs

Write the section now in markdown format:
`;

    const content = await this.service['runAgent'](
      CONTENT_AGENTS[0], // Content Generator
      prompt
    );

    return content;
  }

  /**
   * Combine sections into full article
   */
  private combineSections(research: ArticleResearch, sections: SectionResult[]): string {
    const parts: string[] = [];

    // Add title
    parts.push(`# ${research.title}\n`);

    // Add sections
    for (const section of sections) {
      parts.push(section.content);
      parts.push('\n'); // Spacing between sections
    }

    // Add metadata footer
    parts.push(`\n---\n`);
    parts.push(`**Last Updated:** November 2025`);
    parts.push(`**Keywords:** ${research.keywords.join(', ')}`);

    return parts.join('\n');
  }

  /**
   * Review full article for flow and cohesion
   */
  private async reviewFullArticle(fullArticle: string, research: ArticleResearch): Promise<string> {
    const prompt = `
Review this complete article for flow, cohesion, and quality.

**Article Title:** ${research.title}

**Full Article:**
${fullArticle}

**Review Criteria:**
1. **Flow:** Do sections transition smoothly?
2. **Cohesion:** Does the article feel unified or disjointed?
3. **Repetition:** Are ideas or phrases repeated across sections?
4. **Completeness:** Does it answer the reader's question?
5. **E-E-A-T:** Are experience, expertise, authority, trust signals present?
6. **AI Slop:** Any forbidden phrases or patterns?

Provide:
- Overall score (1-10)
- What works well
- What needs improvement
- Specific fixes for flow/cohesion issues

Keep feedback concise and actionable.
`;

    const review = await this.service['runAgent'](
      CONTENT_AGENTS.find(a => a.role === 'final_publisher')!,
      prompt
    );

    return review;
  }
}
