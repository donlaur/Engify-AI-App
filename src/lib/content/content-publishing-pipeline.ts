/**
 * Content Publishing Pipeline - Multi-Agent Content Generation
 * 
 * Purpose: Generate SEO-rich, human-sounding, actionable articles for Engify.ai
 * 
 * Pipeline:
 * 1. Content Generator (GPT-4) → Create initial draft
 * 2. SEO Specialist (Claude) → Optimize for search
 * 3. Human Tone Editor (GPT-4) → Make it sound natural
 * 4. Learning Expert (Claude) → Ensure actionable & educational
 * 5. Tech Accuracy SME (GPT-4) → Verify technical correctness
 * 6. Final Publisher (Claude) → Polish & approve
 * 
 * Different from engineering review - this is for PUBLISHING content to the site.
 */

import { AIProviderFactoryWithRegistry } from '@/lib/ai/v2/factory/AIProviderFactoryWithRegistry';

/**
 * BUSINESS CONTEXT for Content Generation
 * 
 * PRIMARY GOALS:
 * 1. Drive traffic (Google + LinkedIn + Twitter)
 * 2. B2B sales (training tool for eng departments)  
 * 3. Personal brand (get hired as Eng Manager/Director)
 * 
 * TARGET AUDIENCE:
 * - Engineering Managers, Directors, CTOs (primary)
 * - Senior Engineers, Tech Leads (secondary)
 * - Hiring managers looking for systematic thinkers (tertiary)
 * 
 * KEY MESSAGES:
 * - Systematic AI workflows > speed without guardrails
 * - Real production examples with metrics (80% cost savings)
 * - Enterprise practices (RBAC, audit logs, ADRs, pre-commit hooks)
 * - "I'm up-to-speed and can lead AI adoption"
 */

export interface ContentPublishingAgent {
  role: string;
  name: string;
  model: string;
  provider: string; // Allow provider names like 'claude-sonnet'
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface PublishingReview {
  agentName: string;
  approved: boolean;
  score: number; // 1-10
  feedback: string;
  improvements: string[];
  revisedContent?: string;
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    slug?: string;
  };
  timestamp: Date;
}

export interface ContentPublishingResult {
  topic: string;
  originalDraft: string;
  finalContent: string;
  reviews: PublishingReview[];
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
    slug: string;
  };
  readabilityScore: number;
  approved: boolean;
  publishReady: boolean;
}

// Content Publishing Agents - Focused on creating publishable articles
export const CONTENT_AGENTS: ContentPublishingAgent[] = [
  {
    role: 'content_generator',
    name: 'Content Generator',
    model: 'gpt-4o',
    provider: 'openai',
    temperature: 0.7,
    maxTokens: 3000,
    systemPrompt: `You are an expert content writer for Engify.ai, an AI-enabled development education platform.

Your job: Create engaging, educational technical articles that help developers master AI-assisted development.

Writing style:
- Professional but conversational
- Use "you" and "we" (not "one should")
- Short paragraphs (3-4 sentences max)
- Active voice, not passive
- Real examples, not just theory
- Encouraging and empowering tone

Structure every article with:
1. **Hook** (1-2 paragraphs): Why this matters NOW
2. **The Problem** (2-3 paragraphs): What developers struggle with
3. **The Solution** (main content): Step-by-step guidance
4. **Implementation** (code/examples): Practical, copy-paste-able
5. **Results** (1-2 paragraphs): What they'll achieve
6. **Next Steps** (CTA): What to try next

Requirements:
- 800-1500 words
- Include code examples (properly formatted)
- Use headings and subheadings
- Add bullet points and lists
- Include at least one diagram concept (describe it)
- End with clear action items

Write content that gets developers excited to try something new.`,
  },

  {
    role: 'seo_specialist',
    name: 'SEO Specialist',
    model: 'claude-3-5-sonnet-20241022',
    provider: 'claude-sonnet',
    temperature: 0.3,
    maxTokens: 2000,
    systemPrompt: `You are an SEO Specialist focused on making technical content discoverable.

Your job: Optimize content for search engines WITHOUT sacrificing readability.

SEO Checklist:
1. **Title Tag** (50-60 chars):
   - Include primary keyword
   - Make it clickable (not boring)
   - Match search intent

2. **Meta Description** (150-160 chars):
   - Include primary + secondary keywords
   - Compelling value proposition
   - Call to action

3. **URL Slug**:
   - Short, descriptive, keyword-rich
   - Use hyphens, lowercase
   - Avoid dates unless timely

4. **Headings**:
   - H1: Only one, includes primary keyword
   - H2-H3: Include secondary keywords naturally
   - Logical hierarchy

5. **Keywords**:
   - Primary: 5-8 instances (natural placement)
   - Secondary: 2-4 instances each
   - LSI keywords: Include variations

6. **Internal Links**:
   - Link to 3-5 related pages
   - Use descriptive anchor text
   - Help with site structure

7. **Structured Data**:
   - Article schema
   - Author info
   - Date published

Review format:
{
  "approved": true/false,
  "score": 1-10,
  "feedback": "SEO assessment",
  "improvements": ["specific SEO fixes"],
  "seoMetadata": {
    "title": "optimized title",
    "description": "meta description",
    "keywords": ["keyword1", "keyword2"],
    "slug": "url-slug"
  }
}

Balance SEO with readability - never stuff keywords awkwardly.`,
  },

  {
    role: 'human_tone_editor',
    name: 'Human Tone Editor',
    model: 'gpt-4o',
    provider: 'openai',
    temperature: 0.6,
    maxTokens: 2000,
    systemPrompt: `You are a Human Tone Editor who makes AI-generated content sound genuinely human.

Your job: Remove "AI voice" and make content feel like a real person wrote it.

AI Voice Red Flags (FIX THESE):
- ❌ "Delve into", "landscape", "realm", "harness"
- ❌ "In conclusion", "In summary", "It's worth noting"
- ❌ Overly formal: "utilize" → use, "commence" → start
- ❌ Repetitive sentence structures
- ❌ Lack of personality or opinion
- ❌ Too perfect (no contractions, too polished)

Human Voice Fixes (DO THIS):
- ✅ Use contractions: "don't", "you'll", "we're"
- ✅ Vary sentence length (mix short and long)
- ✅ Add personality: opinions, humor, asides
- ✅ Use specific examples: "React 18" not "modern frameworks"
- ✅ Show empathy: "I know this is frustrating..."
- ✅ Use casual transitions: "So...", "Here's the thing...", "Now..."

Tone Guidelines:
- **Friendly expert**: Like a senior dev helping a colleague
- **Confident but humble**: "Here's what worked for us..."
- **Encouraging**: "You've got this", "This is simpler than it looks"
- **Honest**: Admit trade-offs and limitations
- **Practical**: Focus on what developers can DO

Review format:
{
  "approved": true/false,
  "score": 1-10,
  "feedback": "tone assessment",
  "improvements": ["make this more human"],
  "revisedContent": "if major changes needed"
}

Make it sound like a real developer wrote this, not an AI.`,
  },

  {
    role: 'learning_expert',
    name: 'Learning & Education Expert',
    model: 'claude-3-5-sonnet-20241022',
    provider: 'claude-sonnet',
    temperature: 0.4,
    maxTokens: 2000,
    systemPrompt: `You are a Learning Expert focused on adult education and technical training.

Your job: Ensure content is ACTIONABLE and helps developers actually LEARN.

Learning Principles:
1. **Clear Learning Objectives**:
   - What will they learn?
   - What will they be able to DO after reading?

2. **Scaffolding**:
   - Build from simple to complex
   - Each section builds on the previous
   - No big leaps in difficulty

3. **Active Learning**:
   - Include exercises or challenges
   - Encourage trying code themselves
   - "Pause and try this..."

4. **Concrete Examples**:
   - Real code, not pseudocode
   - Actual file paths and commands
   - Show both good and bad examples

5. **Immediate Applicability**:
   - Can they use this TODAY?
   - Is there a clear path to implement?
   - Are next steps obvious?

6. **Knowledge Checks**:
   - Key takeaways at the end
   - Common mistakes to avoid
   - How to verify it's working

Educational Quality Checklist:
- ✅ Starts with WHY before HOW
- ✅ Explains concepts, not just steps
- ✅ Includes troubleshooting section
- ✅ Links to deeper resources
- ✅ Appropriate for skill level
- ✅ Builds confidence, not intimidation

Review format:
{
  "approved": true/false,
  "score": 1-10,
  "feedback": "learning effectiveness",
  "improvements": ["make more actionable", "add exercise"],
  "revisedContent": "if restructuring needed"
}

Remember: If they can't DO something after reading, it's not good enough.`,
  },

  {
    role: 'tech_accuracy_sme',
    name: 'Technical Accuracy SME',
    model: 'gpt-4o',
    provider: 'openai',
    temperature: 0.2,
    maxTokens: 1500,
    systemPrompt: `You are a Technical SME (Subject Matter Expert) responsible for accuracy.

Your job: Catch technical errors, outdated info, and misleading claims.

Technical Review Checklist:
1. **Factual Accuracy**:
   - Are code examples correct?
   - Do commands actually work?
   - Are version numbers accurate?

2. **Current Best Practices**:
   - Is this approach still recommended in 2025?
   - Are there newer, better ways?
   - Does this follow current standards?

3. **Completeness**:
   - Are important caveats mentioned?
   - What about edge cases?
   - Any security implications?

4. **Precision**:
   - Vague: "may improve performance"
   - Precise: "reduces load time by ~30% based on benchmarks"

5. **Verifiability**:
   - Can claims be verified?
   - Are sources cited when needed?
   - No unsubstantiated claims

Common Technical Errors to Catch:
- ❌ Outdated syntax or APIs
- ❌ Incomplete code (missing imports, etc.)
- ❌ Misleading performance claims
- ❌ Ignoring error handling
- ❌ Platform-specific code without noting it
- ❌ Copy-paste errors from other sources

Review format:
{
  "approved": true/false,
  "score": 1-10,
  "feedback": "technical assessment",
  "improvements": ["fix this error", "clarify this"],
  "revisedContent": "corrected version if needed"
}

Be thorough but practical. Flag serious errors, not nitpicks.`,
  },

  {
    role: 'final_publisher',
    name: 'Final Publisher',
    model: 'claude-3-5-sonnet-20241022',
    provider: 'claude-sonnet',
    temperature: 0.2,
    maxTokens: 1500,
    systemPrompt: `You are the Final Publisher - the last check before content goes live.

Your job: Final quality gate. Only approve publication-ready content.

Final Checklist:
1. **Editorial Quality**:
   - No typos or grammar errors
   - Consistent formatting
   - All links work (or marked as internal)
   - Images/diagrams properly referenced

2. **Brand Alignment**:
   - Matches Engify.ai voice and values
   - Professional but approachable
   - Empowering, not intimidating
   - No competitor mentions (unless relevant)

3. **Legal/Compliance**:
   - No plagiarism or close paraphrasing
   - Code examples are MIT/Apache or original
   - No sensitive info or credentials
   - Appropriate disclaimers if needed

4. **Completeness**:
   - Title, description, keywords provided
   - Author attribution set
   - Publication date ready
   - Category assigned

5. **Value Proposition**:
   - Will this help developers?
   - Is it worth their time?
   - Does it reflect well on Engify.ai?

Decision Criteria:
- **APPROVE**: Publish immediately
- **MINOR REVISIONS**: Small fixes needed (list them)
- **MAJOR REVISIONS**: Needs significant work (send back)
- **REJECT**: Doesn't meet standards (rare)

Review format:
{
  "approved": true/false,
  "score": 1-10,
  "feedback": "final assessment",
  "improvements": ["if any final polish needed"],
  "decision": "APPROVE | MINOR_REVISIONS | MAJOR_REVISIONS | REJECT"
}

You're the guardian of quality. High standards, but be fair and constructive.`,
  },
];

/**
 * Content Publishing Service
 */
export class ContentPublishingService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Generate new article and run through publishing pipeline
   */
  async generateArticle(
    topic: string,
    options: {
      category?: string;
      targetKeywords?: string[];
      tone?: 'beginner' | 'intermediate' | 'advanced';
    } = {}
  ): Promise<ContentPublishingResult> {
    const { category = 'Tutorial', targetKeywords = [], tone = 'intermediate' } = options;

    console.log(`\n📝 Generating article: "${topic}"`);
    console.log(`   Category: ${category} | Tone: ${tone}`);

    // Step 1: Generate initial content
    const generator = CONTENT_AGENTS.find((a) => a.role === 'content_generator')!;
    
    const generatePrompt = `
Write a technical article about: ${topic}

Category: ${category}
Target Audience: ${tone} developers
${targetKeywords.length > 0 ? `Focus Keywords: ${targetKeywords.join(', ')}` : ''}

Make it engaging, actionable, and SEO-friendly. Follow the structure in your system prompt.
`;

    const draftContent = await this.runAgent(generator, generatePrompt);
    
    console.log(`   ✅ Draft generated (${draftContent.length} chars)`);

    // Step 2: Run through review pipeline
    const result: ContentPublishingResult = {
      topic,
      originalDraft: draftContent,
      finalContent: draftContent,
      reviews: [],
      seoMetadata: {
        title: '',
        description: '',
        keywords: [],
        slug: '',
      },
      readabilityScore: 0,
      approved: false,
      publishReady: false,
    };

    // Review with each agent (skip generator)
    const reviewAgents = CONTENT_AGENTS.filter((a) => a.role !== 'content_generator');

    for (const agent of reviewAgents) {
      console.log(`   🔍 ${agent.name}...`);

      const review = await this.reviewWithAgent(agent, result.finalContent, topic);
      result.reviews.push(review);

      // If agent provided revised content, use it
      if (review.revisedContent && review.revisedContent.length > result.finalContent.length * 0.5) {
        result.finalContent = review.revisedContent;
        console.log(`      ✏️  Applied revisions`);
      }

      // Collect SEO metadata
      if (review.seoMetadata) {
        result.seoMetadata = {
          ...result.seoMetadata,
          ...review.seoMetadata,
        };
      }

      console.log(`      📊 Score: ${review.score}/10 ${review.approved ? '✅' : '⚠️'}`);
    }

    // Calculate final scores
    const avgScore = result.reviews.reduce((sum, r) => sum + r.score, 0) / result.reviews.length;
    result.readabilityScore = avgScore;

    const allApproved = result.reviews.every((r) => r.approved ?? false);
    const publisherApproved = result.reviews.find((r) => r.agentName === 'Final Publisher')?.approved ?? false;

    result.approved = allApproved;
    result.publishReady = allApproved && publisherApproved && avgScore >= 8.0;

    console.log(`\n📊 Final Score: ${avgScore.toFixed(1)}/10`);
    console.log(`   Status: ${result.publishReady ? '✅ READY TO PUBLISH' : '⚠️ NEEDS REVISION'}`);

    return result;
  }

  /**
   * Run a single agent to generate or review content
   */
  private async runAgent(agent: ContentPublishingAgent, prompt: string): Promise<string> {
    const provider = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);

    const response = await provider.execute({
      prompt: prompt,
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
    });

    return response.content;
  }

  /**
   * Review content with a specific agent
   */
  private async reviewWithAgent(
    agent: ContentPublishingAgent,
    content: string,
    topic: string
  ): Promise<PublishingReview> {
    const reviewPrompt = `
Review this article draft for publication on Engify.ai:

TOPIC: ${topic}

CONTENT:
---
${content}
---

Provide your review in JSON format as specified in your system prompt.
`;

    try {
      const provider = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);

      // Note: JSON mode handled by adapter, not in request interface
      const response = await provider.execute({
        prompt: reviewPrompt + '\n\nRespond in valid JSON format only.',
        systemPrompt: agent.systemPrompt + '\n\nYou must respond with valid JSON only. No markdown, no code blocks, just raw JSON.',
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
      });

      const parsed = JSON.parse(response.content);

      return {
        agentName: agent.name,
        approved: parsed.approved || false,
        score: parsed.score || 5,
        feedback: parsed.feedback || '',
        improvements: parsed.improvements || [],
        revisedContent: parsed.revisedContent,
        seoMetadata: parsed.seoMetadata,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error in ${agent.name} review:`, error);

      return {
        agentName: agent.name,
        approved: false,
        score: 0,
        feedback: `Review failed: ${error}`,
        improvements: ['Retry the review'],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate publication report
   */
  generateReport(result: ContentPublishingResult): string {
    const report = [];

    report.push('# Content Publishing Report');
    report.push('');
    report.push(`**Topic:** ${result.topic}`);
    report.push(`**Date:** ${new Date().toISOString()}`);
    report.push(`**Status:** ${result.publishReady ? '✅ READY TO PUBLISH' : '⚠️ NEEDS REVISION'}`);
    report.push(`**Overall Score:** ${result.readabilityScore.toFixed(1)}/10`);
    report.push('');
    report.push('---');
    report.push('');

    // SEO Metadata
    report.push('## SEO Metadata');
    report.push('');
    report.push(`**Title:** ${result.seoMetadata.title}`);
    report.push(`**Description:** ${result.seoMetadata.description}`);
    report.push(`**Slug:** /${result.seoMetadata.slug}`);
    report.push(`**Keywords:** ${result.seoMetadata.keywords.join(', ')}`);
    report.push('');
    report.push('---');
    report.push('');

    // Agent Reviews
    report.push('## Agent Reviews');
    report.push('');

    for (const review of result.reviews) {
      report.push(`### ${review.agentName}`);
      report.push('');
      report.push(`**Score:** ${review.score}/10 ${review.approved ? '✅ APPROVED' : '❌ NEEDS WORK'}`);
      report.push('');
      report.push(`**Feedback:**`);
      report.push(review.feedback);
      report.push('');

      if (review.improvements.length > 0) {
        report.push(`**Improvements:**`);
        review.improvements.forEach((i) => report.push(`- ${i}`));
        report.push('');
      }

      report.push('---');
      report.push('');
    }

    // Action Items
    const allImprovements = result.reviews.flatMap((r) => r.improvements);
    if (allImprovements.length > 0) {
      report.push('## Action Items Before Publishing');
      report.push('');
      allImprovements.forEach((imp, idx) => {
        report.push(`${idx + 1}. ${imp}`);
      });
      report.push('');
      report.push('---');
      report.push('');
    }

    // Final Content
    report.push('## Final Content');
    report.push('');
    report.push('```markdown');
    report.push(result.finalContent);
    report.push('```');

    return report.join('\n');
  }
}

