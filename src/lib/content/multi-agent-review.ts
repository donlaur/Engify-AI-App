/**
 * Multi-Agent Content Review System
 * 
 * Sophisticated content review pipeline using different AI personas
 * for multi-step verification before publishing.
 * 
 * Flow: Draft → Tech Genius → Cutting Edge Dev → Tech Writer → 
 *       Editor → SME → Final Approval
 */

import { AIProviderFactory } from '@/lib/ai/providers/factory';

export interface ContentReviewAgent {
  role: string;
  persona: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'google';
  systemPrompt: string;
  focus: string[];
  temperature: number;
}

export interface ReviewResult {
  agentRole: string;
  pass: boolean;
  score: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  revisedContent?: string;
  reasoning: string;
  timestamp: Date;
}

export interface ContentReviewPipeline {
  originalContent: string;
  currentContent: string;
  reviews: ReviewResult[];
  finalScore: number;
  approved: boolean;
  iterations: number;
}

// Define the review agents with specific personas
export const REVIEW_AGENTS: ContentReviewAgent[] = [
  {
    role: 'tech_genius',
    persona: 'Technical Genius / Systems Thinker',
    model: 'gpt-4-turbo-preview',
    provider: 'openai',
    temperature: 0.3,
    focus: [
      'Technical accuracy',
      'Deep system understanding',
      'Architectural implications',
      'Performance considerations',
      'Scalability',
    ],
    systemPrompt: `You are a Technical Genius with deep expertise in software engineering, system design, and computer science fundamentals.

Your personality:
- Highly analytical and detail-oriented
- Can see connections between concepts others miss
- Passionate about correctness and precision
- Respectful but uncompromising on technical accuracy
- Known for catching subtle technical errors

Your review focus:
1. TECHNICAL ACCURACY: Are all technical claims correct?
2. DEPTH: Does the content show deep understanding or surface-level knowledge?
3. SYSTEM THINKING: Are architectural implications properly explained?
4. PERFORMANCE: Are performance claims realistic and well-founded?
5. EDGE CASES: Are important caveats or edge cases mentioned?

Review format:
{
  "pass": boolean,
  "score": 1-10,
  "strengths": ["specific strength 1", "strength 2"],
  "weaknesses": ["specific issue 1", "issue 2"],
  "improvements": ["actionable fix 1", "fix 2"],
  "reasoning": "detailed explanation of your assessment"
}

Be thorough but constructive. If technical claims are wrong, explain why and provide corrections.`,
  },

  {
    role: 'cutting_edge_developer',
    persona: 'Cutting Edge Developer / Early Adopter',
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    temperature: 0.4,
    focus: [
      'Modern best practices',
      'Latest tools and frameworks',
      'Developer experience',
      'Industry trends',
      'Practical implementation',
    ],
    systemPrompt: `You are a Cutting Edge Developer who stays on top of the latest tools, frameworks, and best practices.

Your personality:
- Always aware of the newest technologies
- Pragmatic about what's actually useful vs hype
- Strong opinions on developer experience
- Values modern, clean code
- Active in dev communities (GitHub, Twitter, conferences)

Your review focus:
1. MODERNITY: Is this using current best practices or outdated approaches?
2. DX (Developer Experience): Is this code/approach developer-friendly?
3. TOOLING: Are the right modern tools being recommended?
4. TRENDS: Does this align with where the industry is heading?
5. PRACTICALITY: Will developers actually use this in 2025?

Review format:
{
  "pass": boolean,
  "score": 1-10,
  "strengths": ["what's modern and good"],
  "weaknesses": ["what's outdated or awkward"],
  "improvements": ["how to modernize this"],
  "reasoning": "why this matters for developers"
}

Call out anything that feels dated. Suggest modern alternatives. Balance innovation with stability.`,
  },

  {
    role: 'tech_writer',
    persona: 'Technical Writer / Content Strategist',
    model: 'gpt-4-turbo-preview',
    provider: 'openai',
    temperature: 0.5,
    focus: [
      'Clarity and readability',
      'Structure and flow',
      'Target audience alignment',
      'Examples and code snippets',
      'SEO and discoverability',
    ],
    systemPrompt: `You are an expert Technical Writer who makes complex topics accessible and engaging.

Your personality:
- Obsessed with clarity
- Strong sense of narrative structure
- Empathetic to reader confusion
- Skilled at analogies and examples
- Understands SEO and content strategy

Your review focus:
1. CLARITY: Is this easy to understand for the target audience?
2. STRUCTURE: Does information flow logically?
3. EXAMPLES: Are there enough concrete examples?
4. ENGAGEMENT: Will readers stay interested?
5. SEO: Does this have good keywords, headings, and meta?

Review format:
{
  "pass": boolean,
  "score": 1-10,
  "strengths": ["what's clear and well-written"],
  "weaknesses": ["what's confusing or poorly structured"],
  "improvements": ["specific writing improvements"],
  "reasoning": "how to make this more readable and engaging"
}

Focus on the reader experience. Suggest better headlines, clearer explanations, and more engaging examples.`,
  },

  {
    role: 'tech_editor',
    persona: 'Tech Editor / Editorial Standards',
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    temperature: 0.2,
    focus: [
      'Editorial quality',
      'Consistency',
      'Grammar and style',
      'Fact-checking',
      'Brand voice',
    ],
    systemPrompt: `You are a Tech Editor responsible for maintaining editorial standards and brand consistency.

Your personality:
- Meticulous attention to detail
- Guardian of style guide and brand voice
- Balanced: technical accuracy + readability
- Experienced in publishing workflows
- High standards but pragmatic

Your review focus:
1. EDITORIAL QUALITY: Grammar, spelling, punctuation, style
2. CONSISTENCY: Terminology, formatting, tone
3. FACT-CHECK: Are claims verifiable? Sources cited?
4. BRAND VOICE: Does this match our voice (professional, helpful, authentic)?
5. COMPLETENESS: Are there gaps or missing context?

Review format:
{
  "pass": boolean,
  "score": 1-10,
  "strengths": ["what's polished and professional"],
  "weaknesses": ["editorial issues to fix"],
  "improvements": ["specific editorial changes"],
  "reasoning": "why these changes improve the piece"
}

Be the final polish. Catch typos, inconsistencies, and ensure publication-ready quality.`,
  },

  {
    role: 'sme_expert',
    persona: 'Subject Matter Expert / Domain Specialist',
    model: 'gpt-4-turbo-preview',
    provider: 'openai',
    temperature: 0.3,
    focus: [
      'Domain expertise',
      'Real-world applicability',
      'Missing context',
      'Common pitfalls',
      'Advanced considerations',
    ],
    systemPrompt: `You are a Subject Matter Expert with deep, practical experience in the topic being discussed.

Your personality:
- 10+ years hands-on experience
- Seen things go wrong in production
- Knows the gotchas and edge cases
- Practical, not just theoretical
- Humble but authoritative

Your review focus:
1. ACCURACY: From a practitioner's view, is this correct?
2. COMPLETENESS: What important details are missing?
3. REAL-WORLD: Will this actually work in production?
4. PITFALLS: What common mistakes should be warned about?
5. NUANCE: Are there important caveats or context needed?

Review format:
{
  "pass": boolean,
  "score": 1-10,
  "strengths": ["what's accurate and useful"],
  "weaknesses": ["what's missing or misleading"],
  "improvements": ["what to add from real experience"],
  "reasoning": "insights from years of hands-on work"
}

Add the wisdom that only comes from experience. What would you want readers to know that textbooks don't teach?`,
  },
];

/**
 * Run content through multi-agent review pipeline
 */
export class ContentReviewService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Review content through all agents sequentially
   */
  async reviewContent(
    content: string,
    options: {
      autoRevise?: boolean; // Automatically apply improvements
      maxIterations?: number; // Maximum revision cycles
      minScore?: number; // Minimum passing score (1-10)
    } = {}
  ): Promise<ContentReviewPipeline> {
    const {
      autoRevise = false,
      maxIterations = 2,
      minScore = 7.0,
    } = options;

    const pipeline: ContentReviewPipeline = {
      originalContent: content,
      currentContent: content,
      reviews: [],
      finalScore: 0,
      approved: false,
      iterations: 0,
    };

    let currentIteration = 0;

    while (currentIteration < maxIterations) {
      currentIteration++;
      pipeline.iterations = currentIteration;

      console.log(`\n🔄 Review Iteration ${currentIteration}/${maxIterations}`);

      // Run through all agents
      for (const agent of REVIEW_AGENTS) {
        console.log(`   🤖 ${agent.persona}...`);

        const review = await this.runAgentReview(
          agent,
          pipeline.currentContent
        );

        pipeline.reviews.push(review);

        // If agent failed and provided revised content, use it
        if (!review.pass && review.revisedContent && autoRevise) {
          pipeline.currentContent = review.revisedContent;
          console.log(`      ✏️  Applied revisions from ${agent.role}`);
        }
      }

      // Calculate average score from this iteration's reviews
      const iterationReviews = pipeline.reviews.slice(-REVIEW_AGENTS.length);
      const avgScore =
        iterationReviews.reduce((sum, r) => sum + r.score, 0) /
        REVIEW_AGENTS.length;

      pipeline.finalScore = avgScore;

      console.log(`   📊 Iteration ${currentIteration} Score: ${avgScore.toFixed(1)}/10`);

      // Check if we've met the threshold
      if (avgScore >= minScore) {
        const allPassed = iterationReviews.every((r) => r.pass);
        if (allPassed) {
          pipeline.approved = true;
          console.log(`   ✅ Content approved! (Score: ${avgScore.toFixed(1)}/10)`);
          break;
        }
      }

      // If not auto-revising, stop after first iteration
      if (!autoRevise) {
        break;
      }

      console.log(`   ⚠️  Score ${avgScore.toFixed(1)}/10 - needs improvement`);
    }

    return pipeline;
  }

  /**
   * Run a single agent's review
   */
  private async runAgentReview(
    agent: ContentReviewAgent,
    content: string
  ): Promise<ReviewResult> {
    try {
      const provider = await AIProviderFactory.create(
        agent.provider,
        this.organizationId
      );

      const userPrompt = `
Review the following content:

---
${content}
---

Focus areas for your review: ${agent.focus.join(', ')}

Provide your review in the specified JSON format.
`;

      const response = await provider.execute({
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        userPrompt,
        temperature: agent.temperature,
        maxTokens: 2000,
        responseFormat: { type: 'json_object' },
      });

      // Parse the JSON response
      const parsed = JSON.parse(response.content);

      return {
        agentRole: agent.role,
        pass: parsed.pass || false,
        score: parsed.score || 5,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        improvements: parsed.improvements || [],
        revisedContent: parsed.revisedContent,
        reasoning: parsed.reasoning || '',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error in ${agent.role} review:`, error);

      // Return a failure result
      return {
        agentRole: agent.role,
        pass: false,
        score: 0,
        strengths: [],
        weaknesses: [`Review failed: ${error}`],
        improvements: ['Please retry the review'],
        reasoning: 'Agent review encountered an error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate a summary report of all reviews
   */
  generateReport(pipeline: ContentReviewPipeline): string {
    const report = [];

    report.push('# Multi-Agent Content Review Report');
    report.push('');
    report.push(`**Date:** ${new Date().toISOString()}`);
    report.push(`**Iterations:** ${pipeline.iterations}`);
    report.push(`**Final Score:** ${pipeline.finalScore.toFixed(1)}/10`);
    report.push(`**Status:** ${pipeline.approved ? '✅ APPROVED' : '⚠️ NEEDS REVISION'}`);
    report.push('');
    report.push('---');
    report.push('');

    // Group reviews by iteration
    const reviewsPerIteration = REVIEW_AGENTS.length;
    for (let i = 0; i < pipeline.iterations; i++) {
      const startIdx = i * reviewsPerIteration;
      const iterationReviews = pipeline.reviews.slice(
        startIdx,
        startIdx + reviewsPerIteration
      );

      report.push(`## Iteration ${i + 1}`);
      report.push('');

      for (const review of iterationReviews) {
        const agent = REVIEW_AGENTS.find((a) => a.role === review.agentRole);
        report.push(`### ${agent?.persona || review.agentRole}`);
        report.push('');
        report.push(`**Score:** ${review.score}/10 ${review.pass ? '✅' : '❌'}`);
        report.push('');

        if (review.strengths.length > 0) {
          report.push('**Strengths:**');
          review.strengths.forEach((s) => report.push(`- ✅ ${s}`));
          report.push('');
        }

        if (review.weaknesses.length > 0) {
          report.push('**Weaknesses:**');
          review.weaknesses.forEach((w) => report.push(`- ⚠️ ${w}`));
          report.push('');
        }

        if (review.improvements.length > 0) {
          report.push('**Improvements:**');
          review.improvements.forEach((i) => report.push(`- 💡 ${i}`));
          report.push('');
        }

        if (review.reasoning) {
          report.push('**Reasoning:**');
          report.push(review.reasoning);
          report.push('');
        }

        report.push('---');
        report.push('');
      }
    }

    // Summary of action items
    report.push('## Action Items');
    report.push('');

    const allImprovements = pipeline.reviews.flatMap((r) => r.improvements);
    const uniqueImprovements = [...new Set(allImprovements)];

    uniqueImprovements.forEach((improvement, idx) => {
      report.push(`${idx + 1}. ${improvement}`);
    });

    report.push('');
    report.push('---');
    report.push('');
    report.push('## Final Content');
    report.push('');
    report.push('```markdown');
    report.push(pipeline.currentContent);
    report.push('```');

    return report.join('\n');
  }
}

/**
 * Helper function to review content with default settings
 */
export async function reviewArticle(
  content: string,
  organizationId: string
): Promise<ContentReviewPipeline> {
  const service = new ContentReviewService(organizationId);

  return service.reviewContent(content, {
    autoRevise: false, // Manual review first
    maxIterations: 1,
    minScore: 7.0,
  });
}

/**
 * Helper function to generate and review new content
 */
export async function generateAndReviewArticle(
  topic: string,
  organizationId: string
): Promise<{
  draft: string;
  review: ContentReviewPipeline;
  report: string;
}> {
  // Step 1: Generate initial draft
  console.log('📝 Generating initial draft...');

  const provider = await AIProviderFactory.create('openai', organizationId);

  const draftResponse = await provider.execute({
    model: 'gpt-4-turbo-preview',
    systemPrompt: `You are an expert technical writer creating content for Engify.ai, 
an AI-enabled development platform. Write clear, engaging, technically accurate articles 
that help developers master AI-assisted development.`,
    userPrompt: `Write a comprehensive technical article about: ${topic}

Requirements:
- 800-1200 words
- Include code examples where relevant
- Target audience: Professional developers
- Tone: Professional but approachable
- Include practical, actionable insights
- Structure: Intro, Problem, Solution, Implementation, Conclusion`,
    temperature: 0.7,
    maxTokens: 3000,
  });

  const draft = draftResponse.content;

  // Step 2: Review the draft
  console.log('\n🔍 Starting multi-agent review...');

  const service = new ContentReviewService(organizationId);
  const review = await service.reviewContent(draft, {
    autoRevise: false,
    maxIterations: 1,
    minScore: 7.0,
  });

  // Step 3: Generate report
  const report = service.generateReport(review);

  return { draft, review, report };
}

