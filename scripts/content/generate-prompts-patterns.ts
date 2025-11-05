/**
 * Multi-Agent Prompt & Pattern Generator
 * 
 * Generates high-quality prompts and patterns using multiple AI agents
 * with specialized expertise (ML Experts, AI PhD, Prompt Engineers, etc.)
 * 
 * Usage:
 *   tsx scripts/content/generate-prompts-patterns.ts --type=prompts --count=10
 *   tsx scripts/content/generate-prompts-patterns.ts --type=patterns --count=5
 *   tsx scripts/content/generate-prompts-patterns.ts --type=both --count=20
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { AIProviderFactoryWithRegistry } from '@/lib/ai/v2/factory/AIProviderFactoryWithRegistry';
import { getMongoDb } from '@/lib/db/mongodb';
import { generateSlug } from '@/lib/utils/slug';

interface PromptPatternAgent {
  role: string;
  name: string;
  model: string;
  provider: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface GeneratedPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  role: string;
  pattern: string;
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  qualityScore: number;
  agentReviews: string[];
}

interface GeneratedPattern {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  shortDescription: string;
  fullDescription: string;
  howItWorks: string;
  whenToUse: string[];
  example: {
    before: string;
    after: string;
    explanation: string;
  };
  bestPractices: string[];
  commonMistakes: string[];
  relatedPatterns: string[];
  qualityScore: number;
  agentReviews: string[];
}

// Multi-Agent System for Prompt & Pattern Generation
// OPTIMIZED: Uses affordable models for first passes, premium for final passes
export const PROMPT_PATTERN_AGENTS: PromptPatternAgent[] = [
  {
    role: 'ml_researcher',
    name: 'ML Research Expert',
    model: 'gpt-4o-mini', // OPTIMIZED: Was gpt-4o, now 17x cheaper
    provider: 'openai',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: `You are a Machine Learning Research Expert with a PhD in AI/ML and 10+ years of research experience.

Your expertise:
- Deep understanding of neural networks, transformers, LLMs, and model architectures
- Research background in NLP, computer vision, reinforcement learning, and multimodal AI
- Published papers in top-tier conferences (NeurIPS, ICML, ACL, etc.)
- Experience with cutting-edge techniques: attention mechanisms, few-shot learning, prompt engineering, RAG, fine-tuning

Your role in prompt/pattern generation:
1. **Technical Accuracy**: Ensure prompts align with how LLMs actually work (attention, context windows, tokenization, etc.)
2. **Research-Backed**: Reference proven techniques from academic literature
3. **Pattern Recognition**: Identify which prompt patterns work best for different model architectures
4. **Advanced Techniques**: Suggest state-of-the-art approaches (chain-of-thought variants, self-consistency, etc.)
5. **Model-Specific**: Consider differences between GPT-4, Claude, Gemini, Llama, etc.

When generating prompts or patterns:
- Use correct technical terminology
- Reference research papers or techniques when relevant
- Explain WHY a pattern works (e.g., "Chain-of-thought helps because it forces sequential reasoning, reducing the chance of skipping steps")
- Consider token efficiency and context window limitations
- Suggest alternatives for different model families

Quality standards:
- Technically accurate and research-backed
- Explains underlying mechanisms
- Considers model-specific nuances
- Balances innovation with proven techniques`,
  },
  {
    role: 'ai_phd',
    name: 'AI PhD Researcher',
    model: 'claude-3-5-sonnet-20241022', // Use working version instead of 20250219
    provider: 'claude-sonnet',
    temperature: 0.6,
    maxTokens: 2000,
    systemPrompt: `You are a PhD in Artificial Intelligence with deep expertise in prompt engineering, AI safety, and human-AI interaction.

Your expertise:
- PhD-level understanding of AI systems, their capabilities, and limitations
- Research in prompt engineering, in-context learning, and few-shot learning
- Publications on AI safety, alignment, and evaluation methodologies
- Experience designing prompts that are robust, reliable, and safe

Your role in prompt/pattern generation:
1. **Theoretical Foundation**: Ground prompts/patterns in AI theory (how LLMs process information, what they can/can't do)
2. **Robustness**: Design prompts that work across different models and contexts
3. **Safety**: Ensure prompts don't lead to harmful outputs or biases
4. **Evaluation**: Provide ways to measure prompt effectiveness
5. **Pedagogy**: Explain concepts clearly for both beginners and experts

When generating prompts or patterns:
- Ground everything in theory (explain WHY, not just WHAT)
- Consider edge cases and failure modes
- Provide evaluation criteria
- Discuss trade-offs and limitations
- Make it educational and transferable

Quality standards:
- Theoretically sound
- Robust and reliable
- Safe and ethical
- Well-documented with reasoning
- Teaches understanding, not just recipes`,
  },
  {
    role: 'prompt_engineer',
    name: 'Senior Prompt Engineer',
    model: 'gpt-4o-mini', // OPTIMIZED: Was gpt-4o, now 17x cheaper
    provider: 'openai',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: `You are a Senior Prompt Engineer with 5+ years of production experience building AI applications.

Your expertise:
- Production prompt engineering for real-world applications
- Optimization for cost, latency, and quality
- A/B testing and prompt versioning
- Working with diverse use cases (code generation, writing, analysis, etc.)
- Understanding of prompt patterns and when to use each

Your role in prompt/pattern generation:
1. **Practical Usability**: Create prompts that work in production environments
2. **Best Practices**: Apply proven patterns and techniques
3. **Optimization**: Consider token efficiency and cost
4. **Variety**: Cover different use cases and scenarios
5. **Quality**: Ensure prompts are clear, actionable, and effective

When generating prompts or patterns:
- Make them production-ready and practical
- Include clear instructions and examples
- Consider different contexts and edge cases
- Provide variations for different scenarios
- Focus on actionable, copy-paste-ready prompts

Quality standards:
- Production-ready
- Clear and actionable
- Well-structured with examples
- Optimized for real-world use
- Covers diverse use cases`,
  },
  {
    role: 'domain_expert',
    name: 'Domain Expert',
    model: 'claude-3-haiku-20240307', // OPTIMIZED: Was claude-3-5-sonnet, now 12x cheaper
    provider: 'claude-haiku',
    temperature: 0.6,
    maxTokens: 2000,
    systemPrompt: `You are a Domain Expert who understands the specific needs of different roles and industries.

Your expertise:
- Understanding of what different roles need (engineers, managers, PMs, designers, etc.)
- Industry-specific knowledge and use cases
- Real-world scenarios and pain points
- How AI can solve specific problems for each role

Your role in prompt/pattern generation:
1. **Role-Specific**: Tailor prompts to specific roles and their needs
2. **Use Cases**: Provide realistic, relevant use cases
3. **Context**: Add domain-specific context and examples
4. **Practicality**: Ensure prompts solve real problems
5. **Accessibility**: Make prompts accessible to non-technical users when needed

When generating prompts or patterns:
- Focus on specific roles and their needs
- Include realistic use cases and examples
- Add domain-specific context
- Make them immediately applicable
- Consider different skill levels

Quality standards:
- Role-specific and relevant
- Realistic use cases
- Domain-appropriate context
- Immediately applicable
- Accessible to target audience`,
  },
  {
    role: 'seo_specialist',
    name: 'SEO & Editor Specialist',
    model: 'gpt-4o-mini', // OPTIMIZED: Was claude-3-5-sonnet, now 20x cheaper
    provider: 'openai',
    temperature: 0.3,
    maxTokens: 2000,
    systemPrompt: `You are an SEO & Editor Specialist combining both editorial and SEO expertise.

Your expertise:
- Copy editing and proofreading for technical content
- SEO best practices for technical content
- Keyword research and optimization
- Content structure for search engines
- Meta descriptions, titles, and slugs
- Grammar, punctuation, and style guide compliance
- Technical writing best practices

Your role in prompt/pattern review:
1. **Editing**: Ensure prompts are clear, unambiguous, and professionally written
2. **SEO Optimization**: Optimize titles, descriptions, slugs, and keywords
3. **Structure**: Ensure logical flow and SEO-friendly structure
4. **Keyword Optimization**: Ensure relevant keywords are naturally included
5. **Consistency**: Check for consistent terminology, formatting, and style

Review checklist:
- Clear, concise language (no jargon without explanation)
- Consistent formatting and structure
- Proper grammar and punctuation
- Logical flow from beginning to end
- Professional tone appropriate for engineering/product audience
- SEO-optimized title (50-60 chars, keyword-rich)
- Meta description optimized (150-160 chars, compelling, keyword-rich)
- SEO-friendly slug (short, descriptive, keyword-rich, lowercase, hyphens)
- Proper heading structure (H1, H2, H3) with keywords
- Tags include relevant keywords
- Content is structured for search engines

Provide SEO scores and specific optimization recommendations.`,
  },
  {
    role: 'enterprise_expert',
    name: 'Enterprise SaaS Expert',
    model: 'gpt-4o',
    provider: 'openai',
    temperature: 0.4,
    maxTokens: 2000,
    systemPrompt: `You are an Enterprise SaaS Expert specializing in B2B SaaS products, enterprise sales, and SaaS best practices.

Your expertise:
- Enterprise SaaS architecture and patterns
- B2B sales and enterprise customer needs
- SaaS metrics and KPIs (MRR, ARR, CAC, LTV, churn)
- Enterprise feature requirements
- Multi-tenant SaaS architectures
- Enterprise onboarding and adoption
- SaaS pricing models and packaging
- Enterprise integration requirements (SSO, APIs, webhooks)
- SOC 2, FedRAMP, GDPR, HIPAA compliance requirements
- Enterprise security standards and best practices
- Scalability, reliability, and maintainability for enterprise environments

Your role in prompt/pattern review:
1. **Enterprise SaaS Fit**: Ensure prompts/patterns address enterprise SaaS needs
2. **Use Cases**: Validate use cases are relevant to SaaS companies
3. **Enterprise Features**: Check for enterprise-grade features (SSO, RBAC, audit logs, etc.)
4. **Integration**: Consider SaaS integration requirements
5. **Adoption**: Ensure content supports enterprise adoption
6. **Security & Compliance**: Verify enterprise security and compliance standards
7. **Scalability**: Ensure solutions scale to enterprise needs
8. **Value Proposition**: Verify clear value proposition for enterprise customers

Review checklist:
- Addresses enterprise SaaS needs
- Use cases relevant to SaaS companies
- Enterprise-grade features considered
- SaaS integration requirements addressed
- Supports enterprise adoption
- Clear value proposition for enterprise customers
- Security and compliance considerations
- Scalable and maintainable

Provide enterprise SaaS readiness scores and recommendations.`,
  },
  {
    role: 'quality_reviewer',
    name: 'Quality Reviewer',
    model: 'claude-3-5-sonnet-20241022', // Use working version instead of 20250219
    provider: 'claude-sonnet',
    temperature: 0.3,
    maxTokens: 1500,
    systemPrompt: `You are a Quality Reviewer who ensures all generated prompts and patterns meet high standards.

Your role:
- Review generated content for completeness, accuracy, and quality
- Check that all required fields are present
- Verify technical accuracy and correctness
- Ensure consistency and coherence
- Provide quality scores (1-10) and feedback

Review checklist:
1. **Completeness**: All required fields present and filled
2. **Accuracy**: Technically correct and factually accurate
3. **Clarity**: Clear, well-written, easy to understand
4. **Usefulness**: Practical and actionable
5. **Quality**: Professional, polished, production-ready

Provide scores and specific feedback for improvement.`,
  },
];

class PromptPatternGenerator {
  private organizationId: string;
  private tokenUsage: TokenUsage[] = [];

  constructor(organizationId: string = 'system') {
    this.organizationId = organizationId;
  }

  /**
   * Run a single agent with error handling and token tracking
   */
  private async runAgent(
    agent: PromptPatternAgent,
    prompt: string
  ): Promise<string> {
    try {
      // Use AIProviderFactoryWithRegistry which handles model lookup from DB
      const provider = await AIProviderFactoryWithRegistry.create(
        agent.provider,
        this.organizationId
      );

      const response = await provider.execute({
        prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
      });

      // Track token usage
      this.tokenUsage.push({
        agent: agent.name,
        model: agent.model,
        inputTokens: response.usage.promptTokens,
        outputTokens: response.usage.completionTokens,
        cost: response.cost.total,
      });

      console.log(`   ✓ ${agent.name} (${agent.model}): ${response.usage.totalTokens} tokens, $${response.cost.total.toFixed(4)}`);

      return response.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for API key errors
      if (errorMessage.includes('API key') || errorMessage.includes('api_key') || errorMessage.includes('authentication') || errorMessage.includes('401')) {
        const providerName = agent.provider.includes('openai') ? 'OPENAI' :
                           agent.provider.includes('claude') ? 'ANTHROPIC' :
                           agent.provider.includes('gemini') ? 'GOOGLE' :
                           agent.provider.includes('groq') ? 'GROQ' : 'AI';
        throw new Error(
          `❌ API key error for ${agent.name} (${agent.provider}): ${errorMessage}\n` +
          `Please check your .env.local file for ${providerName}_API_KEY`
        );
      }

      // Check for model availability errors - try fallback
      if (errorMessage.includes('model') || errorMessage.includes('not found') || errorMessage.includes('404')) {
        console.warn(`⚠️  Model "${agent.model}" not available for ${agent.name}, trying fallback...`);
        // Try using AIProviderFactory directly (uses static config fallback)
        try {
          const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
          const fallbackProvider = AIProviderFactory.create(agent.provider);
          const response = await fallbackProvider.execute({
            prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
            temperature: agent.temperature,
            maxTokens: agent.maxTokens,
          });
          return response.content;
        } catch (fallbackError) {
          throw new Error(
            `❌ Model error for ${agent.name} (${agent.provider}): ${errorMessage}\n` +
            `Fallback also failed. Please check if the model "${agent.model}" is available in the database registry or static config.`
          );
        }
      }

      // Generic error
      throw new Error(
        `❌ Error running ${agent.name} (${agent.provider}): ${errorMessage}`
      );
    }
  }

  /**
   * Get total token usage and cost
   */
  getTokenUsage(): {
    total: TokenUsage[];
    summary: {
      totalInputTokens: number;
      totalOutputTokens: number;
      totalTokens: number;
      totalCost: number;
      costByAgent: Record<string, number>;
    };
  } {
    const totalInputTokens = this.tokenUsage.reduce((sum, u) => sum + u.inputTokens, 0);
    const totalOutputTokens = this.tokenUsage.reduce((sum, u) => sum + u.outputTokens, 0);
    const totalCost = this.tokenUsage.reduce((sum, u) => sum + u.cost, 0);
    const costByAgent = this.tokenUsage.reduce((acc, u) => {
      acc[u.agent] = (acc[u.agent] || 0) + u.cost;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.tokenUsage,
      summary: {
        totalInputTokens,
        totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        totalCost,
        costByAgent,
      },
    };
  }

  /**
   * Reset token usage tracking
   */
  resetTokenUsage(): void {
    this.tokenUsage = [];
  }

  /**
   * Generate a prompt using multi-agent system
   */
  async generatePrompt(
    topic: string,
    category: string,
    role: string,
    pattern: string
  ): Promise<GeneratedPrompt> {
    // Reset token usage for this generation
    this.resetTokenUsage();
    
    console.log(`\n🤖 Generating prompt: "${topic}"`);
    console.log(`   Category: ${category} | Role: ${role} | Pattern: ${pattern}`);

    // Step 1: ML Researcher creates initial prompt structure
    const mlPrompt = `Create a high-quality prompt for:
Topic: ${topic}
Category: ${category}
Role: ${role}
Pattern: ${pattern}

Requirements:
- Clear, actionable prompt content
- Includes context and instructions
- Uses the ${pattern} pattern effectively
- Tailored for ${role} role
- Professional and production-ready

Generate the prompt content (500-800 words).`;
    const mlContent = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'ml_researcher')!,
      mlPrompt
    );

    // Step 2: Prompt Engineer optimizes for production (replaces AI PhD + Prompt Engineer)
    const engineerPrompt = `Optimize this prompt for production use and add theoretical foundation:

${mlContent}

Make it:
- Production-ready and practical
- Clear and actionable
- Token-efficient
- Include theoretical foundation explaining why this pattern works
- Include examples if needed`;
    const engineerContent = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'prompt_engineer')!,
      engineerPrompt
    );

    // Step 3: Domain Expert adds role-specific context
    const domainPrompt = `Add domain-specific context and examples for ${role} role:

${engineerContent}

Add:
- Role-specific examples
- Real-world use cases
- Practical scenarios
- Domain context`;
    const domainContent = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'domain_expert')!,
      domainPrompt
    );

    // Step 4: Editor + SEO Specialist (combined) improves clarity and SEO
    const editorSeoPrompt = `Edit this prompt for clarity, consistency, professional tone, AND optimize for SEO:

${domainContent}

Ensure:
- Clear, concise language
- Consistent formatting
- Professional tone
- Proper grammar and structure
- Logical flow
- SEO-optimized title (50-60 chars, keyword-rich)
- Meta description (150-160 chars, compelling)
- SEO-friendly slug (short, descriptive, keyword-rich)
- Keyword suggestions`;
    const editorSeoContent = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'seo_specialist')!,
      editorSeoPrompt
    );

    // Step 5: Enterprise SaaS Expert reviews for enterprise readiness
    const enterprisePrompt = `Review this prompt for enterprise SaaS readiness:

${editorSeoContent}

Check:
- Enterprise SaaS suitability and compliance considerations
- Security standards and best practices
- Scalability and maintainability
- Integration considerations
- Enterprise documentation requirements`;
    const enterpriseContent = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'enterprise_expert')!,
      enterprisePrompt
    );

    // Step 6: Quality Reviewer scores and provides final feedback
    const reviewPrompt = `Review this generated prompt and provide:
1. Quality score (1-10)
2. Specific feedback
3. Suggestions for improvement
4. Approval status

Prompt:
${enterpriseContent}`;
    const review = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'quality_reviewer')!,
      reviewPrompt
    );

    // Extract quality score from review
    const scoreMatch = review.match(/score[:\s]+(\d+(?:\.\d+)?)/i);
    const qualityScore = scoreMatch ? parseFloat(scoreMatch[1]) : 7.0;

    // Extract SEO metadata
    const seoTitleMatch = editorSeoContent.match(/title[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const seoDescMatch = editorSeoContent.match(/description[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const seoSlugMatch = editorSeoContent.match(/slug[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const seoKeywordsMatch = editorSeoContent.match(/keywords[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);

    // Parse the final prompt content
    const finalContent = this.extractPromptContent(editorSeoContent);

    // Generate ID and metadata
    const id = this.generatePromptId(topic, category);
    const slug = seoSlugMatch?.[1]?.trim() || generateSlug(topic);

    // Get token usage summary
    const usage = this.getTokenUsage();
    console.log(`\n✅ Prompt generated successfully!`);
    console.log(`   Quality Score: ${qualityScore}/10`);
    console.log(`💰 Token Usage: ${usage.summary.totalTokens.toLocaleString()} tokens, $${usage.summary.totalCost.toFixed(4)}`);

    return {
      id,
      title: seoTitleMatch?.[1]?.trim() || topic,
      description: seoDescMatch?.[1]?.trim() || this.extractDescription(editorSeoContent, topic),
      content: finalContent,
      category,
      role,
      pattern,
      tags: seoKeywordsMatch?.[1]?.split(',').map(k => k.trim()).filter(k => k) || this.extractTags(topic, category, role, pattern),
      isPublic: true,
      isFeatured: qualityScore >= 8.0,
      qualityScore,
      agentReviews: [
        `ML Researcher: ${mlContent.substring(0, 200)}...`,
        `Prompt Engineer: ${engineerContent.substring(0, 200)}...`,
        `Domain Expert: ${domainContent.substring(0, 200)}...`,
        `Editor + SEO: ${editorSeoContent.substring(0, 200)}...`,
        `Enterprise SaaS Expert: ${enterpriseContent.substring(0, 200)}...`,
        `Quality Reviewer: ${review}`,
      ],
      tokenUsage: usage.summary, // Include token usage in output
    };
  }

  /**
   * Generate a pattern using multi-agent system
   */
  async generatePattern(
    patternName: string,
    category: string,
    level: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<GeneratedPattern> {
    // Reset token usage for this generation
    this.resetTokenUsage();
    
    console.log(`\n🤖 Generating pattern: "${patternName}"`);
    console.log(`   Category: ${category} | Level: ${level}`);

    // Similar multi-agent process for patterns
    const mlPrompt = `Create a comprehensive prompt engineering pattern:

Name: ${patternName}
Category: ${category}
Level: ${level}

Include:
- Short description (1-2 sentences)
- Full description (detailed explanation)
- How it works (step-by-step)
- When to use (use cases)
- Example (before/after with explanation)
- Best practices
- Common mistakes
- Related patterns`;
    const mlContent = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'ml_researcher')!,
      mlPrompt
    );

    const phdPrompt = `Enhance with theoretical foundation:

${mlContent}

Add:
- Theoretical explanation of why it works
- Research backing
- Underlying mechanisms
- Academic context`;
    const phdContent = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'ai_phd')!,
      phdPrompt
    );

    const reviewPrompt = `Review this pattern and provide quality score (1-10) and feedback:

${phdContent}`;
    const review = await this.runAgent(
      PROMPT_PATTERN_AGENTS.find((a) => a.role === 'quality_reviewer')!,
      reviewPrompt
    );

    const scoreMatch = review.match(/score[:\s]+(\d+(?:\.\d+)?)/i);
    const qualityScore = scoreMatch ? parseFloat(scoreMatch[1]) : 7.0;

    return this.parsePatternContent(phdContent, patternName, category, level, qualityScore, [
      `ML Researcher: ${mlContent.substring(0, 200)}...`,
      `AI PhD: ${phdContent.substring(0, 200)}...`,
      `Quality Reviewer: ${review}`,
    ]);
  }

  /**
   * Helper methods
   */
  private extractPromptContent(content: string): string {
    // Try to extract the actual prompt content from agent responses
    // Look for sections like "Prompt:" or code blocks
    const promptMatch = content.match(/prompt[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    if (promptMatch) return promptMatch[1].trim();

    const codeBlockMatch = content.match(/```[\s\S]*?\n([\s\S]+?)```/);
    if (codeBlockMatch) return codeBlockMatch[1].trim();

    // Fallback: use the content as-is, but clean it up
    return content
      .split('\n')
      .filter((line) => !line.startsWith('Review') && !line.startsWith('Agent'))
      .join('\n')
      .trim();
  }

  private extractDescription(content: string, title: string): string {
    const descMatch = content.match(/description[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    if (descMatch) return descMatch[1].trim().substring(0, 200);

    // Fallback: generate from title
    return `High-quality prompt for ${title.toLowerCase()}`;
  }

  private extractTags(
    topic: string,
    category: string,
    role: string,
    pattern: string
  ): string[] {
    const tags = [category, role, pattern];
    const topicWords = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    tags.push(...topicWords.slice(0, 3));
    return [...new Set(tags)];
  }

  private generatePromptId(topic: string, category: string): string {
    const prefix = category.substring(0, 2).toLowerCase();
    const topicWords = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 20);
    const random = Math.random().toString(36).substring(2, 5);
    return `${prefix}-${topicWords}-${random}`;
  }

  private parsePatternContent(
    content: string,
    name: string,
    category: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    qualityScore: number,
    agentReviews: string[]
  ): GeneratedPattern {
    // Parse structured content from agent responses
    // This is a simplified parser - in production, you'd want more robust parsing
    const shortDescMatch = content.match(/short description[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const fullDescMatch = content.match(/full description[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const howItWorksMatch = content.match(/how it works[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const useCasesMatch = content.match(/when to use[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const bestPracticesMatch = content.match(/best practices[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const mistakesMatch = content.match(/common mistakes[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);
    const exampleMatch = content.match(/example[:\s]*\n\n([\s\S]+?)(?:\n\n|$)/i);

    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      category: category.toUpperCase(),
      level,
      description: shortDescMatch?.[1]?.trim() || `The ${name} pattern`,
      shortDescription: shortDescMatch?.[1]?.trim() || `The ${name} pattern`,
      fullDescription: fullDescMatch?.[1]?.trim() || `Detailed explanation of ${name}`,
      howItWorks: howItWorksMatch?.[1]?.trim() || `How ${name} works`,
      whenToUse: useCasesMatch?.[1]?.split('\n').filter((l) => l.trim()).slice(0, 6) || [],
      example: {
        before: exampleMatch?.[1]?.split('Before:')[1]?.split('After:')[0]?.trim() || 'Original prompt',
        after: exampleMatch?.[1]?.split('After:')[1]?.split('Explanation:')[0]?.trim() || 'Enhanced prompt',
        explanation: exampleMatch?.[1]?.split('Explanation:')[1]?.trim() || 'Why this works',
      },
      bestPractices: bestPracticesMatch?.[1]?.split('\n').filter((l) => l.trim()).slice(0, 6) || [],
      commonMistakes: mistakesMatch?.[1]?.split('\n').filter((l) => l.trim()).slice(0, 6) || [],
      relatedPatterns: [],
      qualityScore,
      agentReviews,
      tokenUsage: usage.summary, // Include token usage in output
    };
  }
}

/**
 * Main generation function
 */
async function generatePromptsAndPatterns(options: {
  type: 'prompts' | 'patterns' | 'both';
  count: number;
  outputDir?: string;
}) {
  const { type, count, outputDir = 'content/generated' } = options;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Multi-Agent Prompt & Pattern Generator                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Type: ${type}`);
  console.log(`🔢 Count: ${count}`);
  console.log('');

  const generator = new PromptPatternGenerator('system');
  const outputPath = path.join(process.cwd(), outputDir);

  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const prompts: GeneratedPrompt[] = [];
  const patterns: GeneratedPattern[] = [];

  // Prompt topics and categories
  const promptTopics = [
    { topic: 'Code Review with AI', category: 'code-review', role: 'engineer', pattern: 'cognitive-verifier' },
    { topic: 'SQL Query Optimization', category: 'database', role: 'engineer', pattern: 'chain-of-thought' },
    { topic: 'API Documentation Generation', category: 'documentation', role: 'engineer', pattern: 'template' },
    { topic: 'Test Case Generation', category: 'testing', role: 'qa', pattern: 'few-shot' },
    { topic: 'Architecture Decision Analysis', category: 'architecture', role: 'architect', pattern: 'hypothesis-testing' },
    { topic: 'Performance Analysis', category: 'performance', role: 'engineer', pattern: 'chain-of-thought' },
    { topic: 'Security Audit', category: 'security', role: 'engineer', pattern: 'cognitive-verifier' },
    { topic: 'Technical Writing', category: 'documentation', role: 'engineer', pattern: 'persona' },
    { topic: 'Data Analysis', category: 'data', role: 'engineer', pattern: 'rag' },
    { topic: 'Error Debugging', category: 'debugging', role: 'engineer', pattern: 'reverse-engineering' },
    { topic: 'Refactoring Guide', category: 'refactoring', role: 'engineer', pattern: 'critique-improve' },
    { topic: 'Feature Planning', category: 'planning', role: 'product-manager', pattern: 'question-refinement' },
    { topic: 'User Research Analysis', category: 'research', role: 'designer', pattern: 'hypothesis-testing' },
    { topic: 'Code Explanation', category: 'learning', role: 'engineer', pattern: 'persona' },
    { topic: 'Database Schema Design', category: 'database', role: 'architect', pattern: 'chain-of-thought' },
  ];

  // Pattern topics
  const patternTopics = [
    { name: 'Few-Shot Learning', category: 'FOUNDATIONAL', level: 'beginner' as const },
    { name: 'Zero-Shot Prompting', category: 'FOUNDATIONAL', level: 'beginner' as const },
    { name: 'Meta-Prompting', category: 'ADVANCED', level: 'advanced' as const },
    { name: 'Constitutional AI', category: 'ADVANCED', level: 'advanced' as const },
    { name: 'Iterative Refinement', category: 'ITERATIVE', level: 'intermediate' as const },
    { name: 'Context Stuffing', category: 'ADVANCED', level: 'advanced' as const },
    { name: 'Function Calling', category: 'ADVANCED', level: 'advanced' as const },
    { name: 'Multi-Agent Collaboration', category: 'ADVANCED', level: 'advanced' as const },
  ];

  if (type === 'prompts' || type === 'both') {
    console.log('📝 Generating prompts...\n');
    const promptsToGenerate = promptTopics.slice(0, Math.min(count, promptTopics.length));

    for (let i = 0; i < promptsToGenerate.length; i++) {
      const { topic, category, role, pattern } = promptsToGenerate[i];
      try {
        const prompt = await generator.generatePrompt(topic, category, role, pattern);
        prompts.push(prompt);
        console.log(`   ✅ ${i + 1}/${promptsToGenerate.length}: ${prompt.title} (Score: ${prompt.qualityScore.toFixed(1)})`);
      } catch (error) {
        console.error(`   ❌ Error generating prompt ${i + 1}:`, error);
      }
    }
  }

  if (type === 'patterns' || type === 'both') {
    console.log('\n🔷 Generating patterns...\n');
    const patternsToGenerate = patternTopics.slice(0, Math.min(count, patternTopics.length));

    for (let i = 0; i < patternsToGenerate.length; i++) {
      const { name, category, level } = patternsToGenerate[i];
      try {
        const pattern = await generator.generatePattern(name, category, level);
        patterns.push(pattern);
        console.log(`   ✅ ${i + 1}/${patternsToGenerate.length}: ${pattern.name} (Score: ${pattern.qualityScore.toFixed(1)})`);
      } catch (error) {
        console.error(`   ❌ Error generating pattern ${i + 1}:`, error);
      }
    }
  }

  // Save to files
  const timestamp = new Date().toISOString().split('T')[0];

  if (prompts.length > 0) {
    const promptsPath = path.join(outputPath, `${timestamp}-generated-prompts.json`);
    fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));
    console.log(`\n💾 Saved ${prompts.length} prompts to: ${promptsPath}`);
  }

  if (patterns.length > 0) {
    const patternsPath = path.join(outputPath, `${timestamp}-generated-patterns.json`);
    fs.writeFileSync(patternsPath, JSON.stringify(patterns, null, 2));
    console.log(`💾 Saved ${patterns.length} patterns to: ${patternsPath}`);
  }

  // Optionally save to database
  if (prompts.length > 0 || patterns.length > 0) {
    console.log('\n💾 Saving to database...');
    const db = await getMongoDb();

    if (prompts.length > 0) {
      const promptsCollection = db.collection('prompts');
      for (const prompt of prompts) {
        await promptsCollection.updateOne(
          { id: prompt.id },
          { $set: { ...prompt, createdAt: new Date(), updatedAt: new Date() } },
          { upsert: true }
        );
      }
      console.log(`   ✅ Saved ${prompts.length} prompts to database`);
    }

    if (patterns.length > 0) {
      const patternsCollection = db.collection('patterns');
      for (const pattern of patterns) {
        await patternsCollection.updateOne(
          { id: pattern.id },
          { $set: { ...pattern, createdAt: new Date(), updatedAt: new Date() } },
          { upsert: true }
        );
      }
      console.log(`   ✅ Saved ${patterns.length} patterns to database`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✨ Generation complete!');
  console.log(`   📝 Prompts: ${prompts.length}`);
  console.log(`   🔷 Patterns: ${patterns.length}`);
  console.log(`   📊 Average Quality Score: ${((prompts.concat(patterns as any[]).reduce((sum, p) => sum + p.qualityScore, 0) / (prompts.length + patterns.length)) || 0).toFixed(1)}`);
  console.log('═══════════════════════════════════════════════════════════');
}

// Parse CLI arguments
function parseArgs(): { type: 'prompts' | 'patterns' | 'both'; count: number; outputDir?: string } {
  const args = process.argv.slice(2);

  let type: 'prompts' | 'patterns' | 'both' = 'both';
  let count = 10;
  let outputDir: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--type=')) {
      const typeValue = arg.split('=')[1];
      if (['prompts', 'patterns', 'both'].includes(typeValue)) {
        type = typeValue as 'prompts' | 'patterns' | 'both';
      }
    } else if (arg.startsWith('--count=')) {
      count = parseInt(arg.split('=')[1]) || 10;
    } else if (arg.startsWith('--output=')) {
      outputDir = arg.split('=')[1];
    }
  }

  return { type, count, outputDir };
}

// Main execution
async function main() {
  const options = parseArgs();
  await generatePromptsAndPatterns(options);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
