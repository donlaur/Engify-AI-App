/**
 * Chunked Content Generator
 * 
 * Generates content in predefined sections to avoid timeouts.
 * Each section is generated separately with streaming support.
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export interface ContentSection {
  title: string;
  prompt: string;
  minWords: number;
  maxWords: number;
}

export interface ChunkedGenerationParams {
  topic: string;
  contentType: string;
  targetWordCount: number;
  keywords?: string[];
  sections?: ContentSection[];
}

export interface ChunkedGenerationResult {
  sections: Array<{
    title: string;
    content: string;
    wordCount: number;
  }>;
  fullContent: string;
  metadata: {
    totalWordCount: number;
    sectionCount: number;
    costUSD: number;
    generationTimeMs: number;
  };
}

/**
 * Default article sections based on content type
 */
const DEFAULT_SECTIONS: Record<string, ContentSection[]> = {
  tutorial: [
    { title: 'Introduction', prompt: 'Write an engaging introduction that explains what readers will learn and why it matters.', minWords: 150, maxWords: 250 },
    { title: 'Prerequisites', prompt: 'List and explain the prerequisites needed before starting this tutorial.', minWords: 100, maxWords: 200 },
    { title: 'Step-by-Step Guide', prompt: 'Provide detailed, actionable steps with code examples and explanations.', minWords: 800, maxWords: 1200 },
    { title: 'Common Issues', prompt: 'Describe common problems and their solutions.', minWords: 200, maxWords: 300 },
    { title: 'Conclusion', prompt: 'Summarize key takeaways and suggest next steps.', minWords: 150, maxWords: 250 },
  ],
  guide: [
    { title: 'Overview', prompt: 'Provide a comprehensive overview of the topic.', minWords: 200, maxWords: 300 },
    { title: 'Key Concepts', prompt: 'Explain the fundamental concepts readers need to understand.', minWords: 300, maxWords: 500 },
    { title: 'Best Practices', prompt: 'Share industry best practices and recommendations.', minWords: 400, maxWords: 600 },
    { title: 'Real-World Examples', prompt: 'Provide practical examples and use cases.', minWords: 300, maxWords: 500 },
    { title: 'Summary', prompt: 'Summarize the key points and provide actionable takeaways.', minWords: 150, maxWords: 250 },
  ],
  article: [
    { title: 'Introduction', prompt: 'Write a compelling introduction that hooks the reader.', minWords: 150, maxWords: 250 },
    { title: 'Background', prompt: 'Provide context and background information.', minWords: 200, maxWords: 350 },
    { title: 'Main Content', prompt: 'Deliver the core content with detailed analysis and insights.', minWords: 600, maxWords: 1000 },
    { title: 'Implications', prompt: 'Discuss the implications and significance.', minWords: 200, maxWords: 350 },
    { title: 'Conclusion', prompt: 'Wrap up with key takeaways and final thoughts.', minWords: 150, maxWords: 250 },
  ],
  'case-study': [
    { title: 'Executive Summary', prompt: 'Provide a brief overview of the case study.', minWords: 150, maxWords: 250 },
    { title: 'Challenge', prompt: 'Describe the problem or challenge faced.', minWords: 200, maxWords: 350 },
    { title: 'Solution', prompt: 'Explain the solution that was implemented.', minWords: 400, maxWords: 600 },
    { title: 'Results', prompt: 'Present the results and outcomes with data.', minWords: 300, maxWords: 500 },
    { title: 'Lessons Learned', prompt: 'Share key lessons and takeaways.', minWords: 200, maxWords: 350 },
  ],
};

export class ChunkedContentGenerator {
  private model: ChatOpenAI | ChatAnthropic | ChatGoogleGenerativeAI;
  private costPerToken = 0.000002; // Approximate cost

  constructor(modelConfig?: { provider?: string; model?: string }) {
    // Use OpenAI by default with latest model (gpt-4o-mini deprecated Dec 2024)
    const provider = modelConfig?.provider || 'openai';
    const model = modelConfig?.model || 'gpt-4o-2024-11-20';

    switch (provider) {
      case 'anthropic':
        this.model = new ChatAnthropic({
          modelName: model,
          temperature: 0.7,
        });
        break;
      case 'google':
        this.model = new ChatGoogleGenerativeAI({
          model: model,
          temperature: 0.7,
        });
        break;
      default:
        this.model = new ChatOpenAI({
          modelName: model,
          temperature: 0.7,
          timeout: 120000, // 2 minutes per section (was timing out at 45s)
          maxRetries: 2,
        });
    }
  }

  /**
   * Generate content in chunks (sections)
   */
  async generate(params: ChunkedGenerationParams): Promise<ChunkedGenerationResult> {
    const startTime = Date.now();
    
    // Get sections for content type
    const sections = params.sections || 
      DEFAULT_SECTIONS[params.contentType] || 
      DEFAULT_SECTIONS.article;

    const generatedSections: Array<{
      title: string;
      content: string;
      wordCount: number;
    }> = [];

    let totalTokens = 0;

    // Generate each section
    for (const section of sections) {
      console.log(`Generating section: ${section.title}`);
      
      const sectionPrompt = this.buildSectionPrompt(
        params.topic,
        section,
        params.keywords
      );

      const response = await this.model.invoke(sectionPrompt);
      const content = response.content.toString();
      const wordCount = content.split(/\s+/).length;

      // Estimate tokens (rough: 1 token ≈ 0.75 words)
      totalTokens += Math.ceil(wordCount / 0.75);

      generatedSections.push({
        title: section.title,
        content,
        wordCount,
      });

      console.log(`✓ ${section.title}: ${wordCount} words`);
    }

    // Combine sections into full content
    const fullContent = this.formatFullContent(params.topic, generatedSections);
    const totalWordCount = generatedSections.reduce((sum, s) => sum + s.wordCount, 0);
    const generationTimeMs = Date.now() - startTime;
    const costUSD = totalTokens * this.costPerToken;

    return {
      sections: generatedSections,
      fullContent,
      metadata: {
        totalWordCount,
        sectionCount: generatedSections.length,
        costUSD,
        generationTimeMs,
      },
    };
  }

  /**
   * Build prompt for a specific section
   */
  private buildSectionPrompt(
    topic: string,
    section: ContentSection,
    keywords?: string[]
  ): string {
    const keywordText = keywords && keywords.length > 0
      ? `\n\nIncorporate these keywords naturally: ${keywords.join(', ')}`
      : '';

    return `You are writing the "${section.title}" section for an article about: ${topic}

${section.prompt}

Target word count: ${section.minWords}-${section.maxWords} words${keywordText}

Write in a clear, professional, and engaging style. Use markdown formatting where appropriate (headings, lists, code blocks, etc.).

Do not include the section title in your response - just write the content.`;
  }

  /**
   * Format sections into complete article
   */
  private formatFullContent(
    topic: string,
    sections: Array<{ title: string; content: string; wordCount: number }>
  ): string {
    let content = `# ${topic}\n\n`;

    for (const section of sections) {
      content += `## ${section.title}\n\n${section.content}\n\n`;
    }

    return content.trim();
  }

  /**
   * Generate with streaming (for real-time updates)
   */
  async *generateStream(params: ChunkedGenerationParams): AsyncGenerator<{
    type: 'section_start' | 'section_content' | 'section_complete' | 'complete';
    sectionTitle?: string;
    content?: string;
    wordCount?: number;
    metadata?: any;
  }> {
    const startTime = Date.now();
    const sections = params.sections || 
      DEFAULT_SECTIONS[params.contentType] || 
      DEFAULT_SECTIONS.article;

    const generatedSections: Array<{
      title: string;
      content: string;
      wordCount: number;
    }> = [];

    let totalTokens = 0;

    for (const section of sections) {
      yield {
        type: 'section_start',
        sectionTitle: section.title,
      };

      const sectionPrompt = this.buildSectionPrompt(
        params.topic,
        section,
        params.keywords
      );

      const response = await this.model.invoke(sectionPrompt);
      const content = response.content.toString();
      const wordCount = content.split(/\s+/).length;
      totalTokens += Math.ceil(wordCount / 0.75);

      generatedSections.push({
        title: section.title,
        content,
        wordCount,
      });

      yield {
        type: 'section_content',
        sectionTitle: section.title,
        content,
        wordCount,
      };

      yield {
        type: 'section_complete',
        sectionTitle: section.title,
        wordCount,
      };
    }

    const fullContent = this.formatFullContent(params.topic, generatedSections);
    const totalWordCount = generatedSections.reduce((sum, s) => sum + s.wordCount, 0);
    const generationTimeMs = Date.now() - startTime;
    const costUSD = totalTokens * this.costPerToken;

    yield {
      type: 'complete',
      metadata: {
        totalWordCount,
        sectionCount: generatedSections.length,
        costUSD,
        generationTimeMs,
        fullContent,
      },
    };
  }
}
