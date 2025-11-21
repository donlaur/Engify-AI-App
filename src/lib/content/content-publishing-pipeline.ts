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
 * 6. Web Designer (Claude) → Optimize for web formatting & visual hierarchy
 * 7. Final Publisher (Claude) → Polish & approve
 * 
 * Different from engineering review - this is for PUBLISHING content to the site.
 */

import { AIProviderFactoryWithRegistry } from '@/lib/ai/v2/factory/AIProviderFactoryWithRegistry';
import { getModelsByProvider } from '@/lib/services/AIModelRegistry';
import { detectAISlop, printDetectionReport, type SlopDetectionResult } from './ai-slop-detector';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';
import { ClaudeAdapter } from '@/lib/ai/v2/adapters/ClaudeAdapter';
import { GeminiAdapter } from '@/lib/ai/v2/adapters/GeminiAdapter';
import { GroqAdapter } from '@/lib/ai/v2/adapters/GroqAdapter';

// Recommended models for content publishing (centralized configuration)
const RECOMMENDED_MODELS = {
  GPT_4O: 'gpt-4o',                          // Best balance cost/performance
  CLAUDE_SONNET: 'claude-3-5-sonnet-20250219', // Latest Sonnet for quality
} as const;

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
  model: string; // Model ID from DB (e.g., 'gpt-4o', 'claude-3-5-sonnet-20241022')
  provider: string; // Provider name (e.g., 'openai', 'claude-sonnet')
  preferredModelId?: string; // Optional: specific model ID preference (falls back to DB query)
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
  slopDetection?: SlopDetectionResult;
}

// Content Publishing Agents - Focused on creating publishable articles
export const CONTENT_AGENTS: ContentPublishingAgent[] = [
  {
    role: 'content_generator',
    name: 'Content Generator',
    model: RECOMMENDED_MODELS.GPT_4O,
    provider: 'openai',
    temperature: 0.7,
    maxTokens: 4000, // Increased for longer sections (pillar pages need 1000+ words per section)
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
- 800-1500 words (or as specified in the prompt)
- Include code examples (properly formatted)
- Use headings and subheadings
- Add bullet points and lists
- Include at least one diagram concept (describe it)
- End with clear action items

IMPORTANT: If the prompt specifies a target word count, you MUST write at least that many words. Expand with examples, case studies, and detailed explanations.

**E-E-A-T REQUIREMENTS (Google Quality Signals):**

EXPERIENCE (First-Hand Testing):
- Include "I tested...", "We found...", "After trying..."
- Share specific results: "reduced build time by 40%", "saved 2 hours/week"
- Mention failures/challenges: "This didn't work when...", "Watch out for..."
- Add timestamps: "As of November 2025...", "Updated for version 2.0"

EXPERTISE (Technical Depth):
- Use specific tool names and versions: "Cursor 0.42", "GPT-4o", not "AI tools"
- Include code examples with real file paths and commands
- Explain WHY, not just HOW: "This works because..."
- Reference official docs with links

AUTHORITATIVENESS (Credibility):
- Cite authoritative sources: official docs, GitHub repos, Reddit discussions
- Link to related articles on Engify.ai
- Use data/metrics when available
- Mention community consensus: "Most developers prefer..."

TRUSTWORTHINESS (Transparency):
- Be honest about limitations: "This approach has trade-offs..."
- Include "Last updated" date
- Admit when something is opinion vs fact
- No exaggeration: avoid "revolutionary", "game-changing", "best ever"

**AI SLOP DETECTION - FORBIDDEN:**
- ❌ "delve", "leverage", "utilize", "robust", "seamless"
- ❌ Em dashes (—) - use periods or colons instead
- ❌ Uniform sentence length - vary short and long
- ❌ Excessive hedging: "may", "might", "could" everywhere
- ❌ Vague claims: "studies show", "experts say" (cite specific sources)
- ❌ Generic intros: "In today's fast-paced world..."

Write content that gets developers excited to try something new.`,
  },

  {
    role: 'seo_specialist',
    name: 'SEO Specialist',
    model: RECOMMENDED_MODELS.CLAUDE_SONNET,
    provider: 'claude-sonnet',
    temperature: 0.3,
    maxTokens: 3000, // Increased to prevent JSON truncation
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

**E-E-A-T SEO SIGNALS (Critical for Google):**
- Verify author byline exists with credentials
- Check for "Last updated" date (freshness signal)
- Ensure citations to authoritative sources (official docs, GitHub, Reddit)
- Look for personal experience markers ("I tested", "We found")
- Confirm specific data/metrics (not vague claims)
- Check for honest limitations/trade-offs (trustworthiness)
- Verify no AI slop phrases (delve, leverage, utilize, robust)

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
    model: RECOMMENDED_MODELS.GPT_4O,
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
    model: RECOMMENDED_MODELS.CLAUDE_SONNET,
    provider: 'claude-sonnet',
    temperature: 0.4,
    maxTokens: 3000, // Increased to prevent JSON truncation
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
    model: RECOMMENDED_MODELS.GPT_4O,
    provider: 'openai',
    temperature: 0.2,
    maxTokens: 3000, // Increased to prevent JSON truncation
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
    role: 'web_designer',
    name: 'Web Designer',
    model: RECOMMENDED_MODELS.CLAUDE_SONNET,
    provider: 'claude-sonnet',
    temperature: 0.4,
    maxTokens: 3000, // Increased to prevent JSON truncation
    systemPrompt: `You are a Web Designer focused on optimizing content for web display and user experience.

Your job: Ensure content is beautifully formatted, scannable, and optimized for web reading.

Web Formatting Checklist:

1. **Visual Hierarchy**:
   - Use proper heading levels (H1 → H2 → H3)
   - Maximum 3-4 headings per section
   - Clear section breaks with consistent spacing
   - Use horizontal rules (---) to separate major sections

2. **Readability**:
   - Paragraphs: 2-4 sentences max (50-80 words)
   - Line breaks between paragraphs for breathing room
   - Use lists instead of long paragraphs when possible
   - Break up dense text with formatting (bold, italic, code)

3. **Scannability**:
   - Use bullet points for 3+ items
   - Numbered lists for step-by-step instructions
   - Bold key terms and concepts
   - Use callouts/blockquotes for important info
   - Add visual breaks (---) between major sections

4. **Markdown Syntax** (for ReactMarkdown):
   - ✅ Proper code blocks: three backticks with language
   - ✅ Inline code: single backticks
   - ✅ Lists: Use dash for bullets, numbers for numbered lists
   - ✅ Links: bracket and parenthesis format
   - ✅ Images: exclamation bracket with alt text
   - ✅ Tables: Use pipe syntax for complex data
   - ✅ Blockquotes: greater than symbol for callouts

5. **Mobile-Friendly**:
   - Short paragraphs (easier to read on mobile)
   - Avoid wide tables (use lists or break into sections)
   - Break long code blocks into smaller examples
   - Use clear, descriptive link text

6. **Visual Elements**:
   - Use tables for comparison data
   - Use blockquotes for tips, warnings, key takeaways
   - Use code blocks for ALL code examples (even short ones)
   - Add visual separators between major sections

7. **Content Structure**:
   - Start sections with clear H2 headings
   - Use H3 for subsections within H2
   - Add a table of contents for long articles (H2 links)
   - Use consistent formatting throughout

Common Web Formatting Issues to Fix:
- ❌ Walls of text (no breaks, no formatting)
- ❌ Inconsistent heading hierarchy
- ❌ Code in paragraphs instead of code blocks
- ❌ Long paragraphs (80+ words)
- ❌ Missing visual breaks between sections
- ❌ Poor use of lists (buried in paragraphs)
- ❌ Weak visual hierarchy (everything looks same)
- ❌ Missing formatting (no bold, no emphasis)

Web Design Best Practices:
- ✅ Use whitespace generously
- ✅ Create visual rhythm with consistent spacing
- ✅ Make important info stand out (bold, callouts)
- ✅ Break complex concepts into digestible chunks
- ✅ Use formatting to guide the eye
- ✅ Ensure content is scannable in 30 seconds

Review format:
{
  "approved": true/false,
  "score": 1-10,
  "feedback": "web formatting assessment",
  "improvements": ["improve visual hierarchy", "add spacing", "format code properly"],
  "revisedContent": "formatted version with proper markdown syntax"
}

Remember: Content should be beautiful AND functional. Formatting should enhance readability, not distract.`,
  },

  {
    role: 'final_publisher',
    name: 'Final Publisher',
    model: RECOMMENDED_MODELS.CLAUDE_SONNET,
    provider: 'claude-sonnet',
    temperature: 0.2,
    maxTokens: 2500, // Increased to prevent JSON truncation
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

  // Fallback models by provider (as of Nov 2025)
  private static readonly FALLBACK_MODELS = {
    openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4'],
    anthropic: ['claude-3-5-sonnet-20250219', 'claude-3-haiku-20240307'],
    google: ['gemini-2.0-flash-exp', 'gemini-1.5-flash'],
    groq: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
  } as const;

  private static readonly INVALID_SUFFIXES = [':thinking', ':expanded', ':beta', ':preview'];
  private static readonly INVALID_CAPABILITIES = ['audio-generation', 'video-generation', 'image-generation'];
  private static readonly INVALID_TAGS = ['audio-only', 'realtime-only', 'unsuitable-for-text'];
  private static readonly INVALID_MODEL_NAMES = ['audio', 'video', 'image', 'flux', 'sora', 'dalle', 'midjourney', 'transcribe', 'realtime'];

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Get provider type from agent provider string
   */
  private getProviderType(provider: string): 'openai' | 'anthropic' | 'google' | 'groq' {
    if (provider.includes('openai')) return 'openai';
    if (provider.includes('claude')) return 'anthropic';
    if (provider.includes('gemini')) return 'google';
    if (provider.includes('groq')) return 'groq';
    return 'openai';
  }

  /**
   * Check if a model is valid for text generation
   */
  private isModelValid(model: any): boolean {
    const status = ('status' in model ? model.status : 'active');
    if (status !== 'active') return false;
    
    if ('isAllowed' in model && model.isAllowed === false) return false;
    
    const modelId = (model.id || '').toLowerCase();
    
    // Check for invalid suffixes
    if (ContentPublishingService.INVALID_SUFFIXES.some(suffix => modelId.includes(suffix))) {
      return false;
    }
    
    // Check for invalid model names
    if (ContentPublishingService.INVALID_MODEL_NAMES.some(name => modelId.includes(name))) {
      return false;
    }
    
    const capabilities = (model as any).capabilities || [];
    const tags = (model as any).tags || [];
    
    // Check for invalid capabilities
    if (ContentPublishingService.INVALID_CAPABILITIES.some(cap => capabilities.includes(cap))) {
      return false;
    }
    
    // Check for invalid tags
    if (ContentPublishingService.INVALID_TAGS.some(tag => tags.includes(tag))) {
      return false;
    }
    
    // Must have 'text' capability if capabilities are specified
    if (capabilities.length > 0 && !capabilities.includes('text')) {
      return false;
    }
    
    return true;
  }

  /**
   * Find a valid model from available models
   */
  private findValidModel(
    availableModels: any[],
    preferredModelId?: string
  ): any | null {
    // First try exact match
    if (preferredModelId) {
      const exactMatch = availableModels.find(m => 
        this.isModelValid(m) && 
        (m.id === preferredModelId || 
         m.name === preferredModelId ||
         m.id.includes(preferredModelId))
      );
      if (exactMatch) return exactMatch;
    }
    
    // Fall back to first valid model
    return availableModels.find(m => this.isModelValid(m)) || null;
  }

  /**
   * Normalize model ID by removing provider prefix and invalid suffixes
   */
  private normalizeModelId(modelId: string, providerType: string): string {
    let normalized = modelId;
    
    // Remove provider prefix
    const prefix = `${providerType}/`;
    if (normalized.startsWith(prefix)) {
      normalized = normalized.substring(prefix.length);
    }
    
    // Remove invalid suffixes
    for (const suffix of ContentPublishingService.INVALID_SUFFIXES) {
      if (normalized.includes(suffix)) {
        normalized = normalized.split(suffix)[0];
      }
    }
    
    return normalized;
  }

  /**
   * Create provider instance from model ID and provider type
   */
  private createProviderInstance(
    modelId: string,
    providerType: string,
    agent: ContentPublishingAgent
  ): OpenAIAdapter | ClaudeAdapter | GeminiAdapter | GroqAdapter | Promise<any> {
    const normalizedId = this.normalizeModelId(modelId, providerType);
    
    switch (providerType) {
      case 'openai':
        return new OpenAIAdapter(normalizedId);
      case 'anthropic':
        return new ClaudeAdapter(normalizedId);
      case 'google':
        return new GeminiAdapter(normalizedId);
      case 'groq':
        return new GroqAdapter(normalizedId);
      default:
        return AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
    }
  }

  /**
   * Get or create provider instance for an agent
   */
  private async getProviderInstance(agent: ContentPublishingAgent): Promise<any> {
    const providerType = this.getProviderType(agent.provider);
    
    try {
      const availableModels = await getModelsByProvider(providerType);
      const modelId = agent.preferredModelId || agent.model;
      
      const dbModel = this.findValidModel(availableModels, modelId);
      
      if (dbModel && !('deprecated' in dbModel && dbModel.deprecated)) {
        console.log(`   📌 Using DB model: ${this.normalizeModelId(dbModel.id, providerType)} for ${agent.name}`);
        return this.createProviderInstance(dbModel.id, providerType, agent);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to query DB for models, using factory fallback:`, error);
    }
    
    // Fallback to factory
    return AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
  }

  /**
   * Try fallback models if primary model fails
   */
  private async tryFallbackModels(
    agent: ContentPublishingAgent,
    prompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<string | null> {
    const providerType = this.getProviderType(agent.provider);
    const fallbackModels = ContentPublishingService.FALLBACK_MODELS[providerType] || [];
    
    for (const fallbackModel of fallbackModels) {
      try {
        const availableModels = await getModelsByProvider(providerType);
        const dbModel = this.findValidModel(availableModels, fallbackModel);
        
        if (dbModel) {
          const providerInstance = this.createProviderInstance(dbModel.id, providerType, agent);
          
          if (providerInstance instanceof Promise) {
            const resolved = await providerInstance;
            const response = await resolved.execute({
              prompt,
              systemPrompt,
              temperature,
              maxTokens,
            });
            console.log(`   ✅ Fallback model ${this.normalizeModelId(dbModel.id, providerType)} succeeded`);
            return response.content;
          } else {
            const response = await providerInstance.execute({
              prompt,
              systemPrompt,
              temperature,
              maxTokens,
            });
            console.log(`   ✅ Fallback model ${this.normalizeModelId(dbModel.id, providerType)} succeeded`);
            return response.content;
          }
        }
      } catch (fallbackError: any) {
        const fallbackMsg = fallbackError?.message || String(fallbackError);
        console.warn(`   ⚠️  Fallback model ${fallbackModel} also failed: ${fallbackMsg.substring(0, 100)}...`);
        continue;
      }
    }
    
    return null;
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

    // Run AI slop detection
    console.log(`\n🔍 Running AI Slop Detection...`);
    const slopDetection = detectAISlop(result.finalContent);
    result.slopDetection = slopDetection;
    
    // Print detailed slop report
    printDetectionReport(slopDetection);
    
    // Adjust publish ready status based on slop detection
    if (slopDetection.qualityScore < 6.0) {
      result.publishReady = false;
      console.log(`   ❌ Quality score too low (${slopDetection.qualityScore}/10) - NOT ready to publish`);
    } else if (slopDetection.qualityScore < 8.0) {
      console.log(`   ⚠️  Quality score needs improvement (${slopDetection.qualityScore}/10)`);
    }

    console.log(`\n📊 Final Score: ${avgScore.toFixed(1)}/10`);
    console.log(`   Status: ${result.publishReady ? '✅ READY TO PUBLISH' : '⚠️ NEEDS REVISION'}`);

    return result;
  }

  /**
   * Run a single agent to generate or review content
   * Uses models from database registry, falls back to provider defaults
   */
  private async runAgent(agent: ContentPublishingAgent, prompt: string): Promise<string> {
    const providerInstance = await this.getProviderInstance(agent);

    try {
      const resolvedInstance = providerInstance instanceof Promise 
        ? await providerInstance 
        : providerInstance;
      
      const response = await resolvedInstance.execute({
        prompt,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
      });
      return response.content;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      
      // If it's a model-specific error, try fallback models
      if (this.isModelError(errorMsg)) {
        console.warn(`   ⚠️  Model failed with ${errorMsg.substring(0, 100)}..., trying fallback models...`);
        
        const fallbackResult = await this.tryFallbackModels(
          agent,
          prompt,
          agent.systemPrompt,
          agent.temperature,
          agent.maxTokens
        );
        
        if (fallbackResult) {
          return fallbackResult;
        }
      }
      
      throw error;
    }
  }

  /**
   * Check if error is model-specific (should trigger fallback)
   */
  private isModelError(errorMsg: string): boolean {
    return errorMsg.includes('invalid model') || 
           errorMsg.includes('not a chat model') ||
           errorMsg.includes('404') ||
           errorMsg.includes('not_found_error');
  }

  /**
   * Parse and repair JSON response from review agent
   */
  private parseReviewResponse(
    jsonContent: string,
    agentName: string
  ): PublishingReview {
    try {
      // Remove control characters
      let cleaned = jsonContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
      // Extract JSON from markdown code blocks if present
      const codeBlockMatch = cleaned.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (codeBlockMatch) {
        cleaned = codeBlockMatch[1];
      } else {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleaned = jsonMatch[0];
        }
      }
      
      // Repair common JSON issues
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      cleaned = cleaned.replace(/,(\s*$)/gm, ''); // Remove trailing commas at end of lines
      
      // Close incomplete structures
      cleaned = this.repairTruncatedJson(cleaned);
      
      const parsed = JSON.parse(cleaned);
      
      return {
        agentName,
        approved: parsed.approved || false,
        score: parsed.score || 5,
        feedback: parsed.feedback || '',
        improvements: parsed.improvements || [],
        revisedContent: parsed.revisedContent,
        seoMetadata: parsed.seoMetadata,
        timestamp: new Date(),
      };
    } catch (parseError: any) {
      return this.extractPartialReviewData(jsonContent, agentName, parseError);
    }
  }

  /**
   * Repair truncated JSON by closing incomplete strings, arrays, and objects
   */
  private repairTruncatedJson(jsonContent: string): string {
    let repaired = jsonContent;
    
    // Close incomplete strings near the end
    const last200 = repaired.slice(-200);
    if (last200.includes('"') && !last200.match(/"\s*[}\],]/)) {
      repaired = repaired.replace(/"([^"]+)"\s*:\s*"([^"]+)$/gm, (match, key, value) => {
        if (repaired.indexOf(match) + match.length >= repaired.length - 10) {
          const safeValue = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
          return `"${key}": "${safeValue}"`;
        }
        return match;
      });
    }
    
    // Close incomplete arrays
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      repaired += ']'.repeat(openBrackets - closeBrackets);
    }
    
    // Close incomplete objects
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      repaired += '}'.repeat(openBraces - closeBraces);
    }
    
    return repaired;
  }

  /**
   * Extract partial review data from malformed JSON
   */
  private extractPartialReviewData(
    jsonContent: string,
    agentName: string,
    parseError: any
  ): PublishingReview {
    const scoreMatch = jsonContent.match(/"score"\s*:\s*(\d+)/);
    const approvedMatch = jsonContent.match(/"approved"\s*:\s*(true|false)/);
    
    // Extract feedback with truncation handling
    let feedback = '';
    const feedbackMatch = jsonContent.match(/"feedback"\s*:\s*"([^"]*(?:\\.[^"]*)*)"|"feedback"\s*:\s*"([^"]+)/);
    if (feedbackMatch) {
      feedback = feedbackMatch[1] || feedbackMatch[2] || '';
      const sentences = feedback.match(/[^.!?]*[.!?]/g);
      if (sentences && sentences.length > 0) {
        feedback = sentences.slice(0, -1).join(' ');
      }
      if (!feedback.match(/[.!?]\s*$/)) {
        feedback = feedback.trim() + '...';
      }
    }
    
    // Extract improvements array
    const improvements: string[] = [];
    const improvementsMatch = jsonContent.match(/"improvements"\s*:\s*\[([^\]]*)/);
    if (improvementsMatch) {
      const itemMatches = improvementsMatch[1].match(/"([^"]+)"/g);
      if (itemMatches) {
        improvements.push(...itemMatches.map(m => m.replace(/"/g, '')));
      }
    }
    
    return {
      agentName,
      approved: approvedMatch ? approvedMatch[1] === 'true' : false,
      score: scoreMatch ? parseInt(scoreMatch[1]) : 5,
      feedback: feedback || `JSON parse error: ${parseError.message}`,
      improvements: improvements.length > 0 ? improvements : ['Retry the review - JSON parsing failed'],
      timestamp: new Date(),
    };
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
      const providerInstance = await this.getProviderInstance(agent);
      const resolvedInstance = providerInstance instanceof Promise 
        ? await providerInstance 
        : providerInstance;

      let response;
      try {
        response = await resolvedInstance.execute({
          prompt: reviewPrompt + '\n\nRespond in valid JSON format only.',
          systemPrompt: agent.systemPrompt + '\n\nYou must respond with valid JSON only. No markdown, no code blocks, just raw JSON.',
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        });
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        
        if (this.isModelError(errorMsg)) {
          console.warn(`   ⚠️  Model failed with ${errorMsg.substring(0, 100)}..., trying fallback models...`);
          
          const fallbackResult = await this.tryFallbackModels(
            agent,
            reviewPrompt + '\n\nRespond in valid JSON format only.',
            agent.systemPrompt + '\n\nYou must respond with valid JSON only. No markdown, no code blocks, just raw JSON.',
            agent.temperature,
            agent.maxTokens
          );
          
          if (fallbackResult) {
            return this.parseReviewResponse(fallbackResult, agent.name);
          }
        }
        
        throw error;
      }

      return this.parseReviewResponse(response.content, agent.name);
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

