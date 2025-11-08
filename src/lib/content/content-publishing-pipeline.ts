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
import { getModelsByProvider, getModel } from '@/lib/services/AIModelRegistry';
import { detectAISlop, printDetectionReport, type SlopDetectionResult } from './ai-slop-detector';
import { getMongoDb } from '@/lib/db/mongodb';

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
    model: 'gpt-4o',
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

Write content that gets developers excited to try something new.`,
  },

  {
    role: 'seo_specialist',
    name: 'SEO Specialist',
    model: 'claude-3-5-sonnet-20250219',
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
    model: 'claude-3-5-sonnet-20250219',
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
    model: 'gpt-4o',
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
    model: 'claude-3-5-sonnet-20250219',
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
    model: 'claude-3-5-sonnet-20250219',
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
   * Uses models from database registry, falls back to provider defaults
   */
  private async runAgent(agent: ContentPublishingAgent, prompt: string): Promise<string> {
    // Try to get model from DB registry first
    let providerInstance;
    
    try {
      // Query DB for available models by provider
      const providerType = agent.provider.includes('openai') ? 'openai' :
                           agent.provider.includes('claude') ? 'anthropic' :
                           agent.provider.includes('gemini') ? 'google' :
                           agent.provider.includes('groq') ? 'groq' :
                           'openai';

      const availableModels = await getModelsByProvider(providerType);
      
      // Use preferred model ID if specified, otherwise use agent.model, otherwise find best match
      const modelId = agent.preferredModelId || agent.model;
      
      // First, try to find exact match, but filter out deprecated models
      let dbModel = availableModels.find(m => {
        // Skip deprecated models
        const status = ('status' in m ? m.status : 'active');
        if (status !== 'active' || m.deprecated) return false;
        if ('isAllowed' in m && m.isAllowed === false) return false;
        
        return m.id === modelId || 
               m.name === modelId ||
               (agent.preferredModelId && m.id.includes(agent.preferredModelId));
      });

      // If exact match not found, try to find best available model for this provider
      if (!dbModel || dbModel.deprecated) {
        // Find first available, ACTIVE, ALLOWED model for this provider
        // CRITICAL: Must explicitly check status === 'active' and isAllowed === true
        dbModel = availableModels.find(m => {
          // MUST be active (explicit check, not just "not deprecated")
          const status = ('status' in m ? m.status : 'active');
          if (status !== 'active') {
            return false; // Reject if not explicitly active
          }
          
          // MUST be allowed for use
          if ('isAllowed' in m && m.isAllowed === false) {
            return false; // Reject if explicitly not allowed
          }
          
          // Skip deprecated or sunset models (safety check)
          if (m.deprecated || status === 'deprecated' || status === 'sunset') {
            return false;
          }
          
          const modelId = (m.id || '').toLowerCase();
          
          // Skip models with invalid suffixes
          if (modelId.includes(':thinking') || 
              modelId.includes(':expanded') || 
              modelId.includes(':beta') ||
              modelId.includes(':preview') ||
              modelId.includes('transcribe') ||
              modelId.includes('realtime')) {
            return false;
          }
          
          // Skip audio/video/image models (they require different API endpoints)
          const capabilities = (m as any).capabilities || [];
          const tags = (m as any).tags || [];
          if (capabilities.includes('audio-generation') ||
              capabilities.includes('video-generation') ||
              capabilities.includes('image-generation') ||
              tags.includes('audio-only') ||
              tags.includes('realtime-only') ||
              tags.includes('unsuitable-for-text') ||
              modelId.includes('audio') ||
              modelId.includes('video') ||
              modelId.includes('image') ||
              modelId.includes('flux') ||
              modelId.includes('sora') ||
              modelId.includes('dalle') ||
              modelId.includes('midjourney')) {
            return false;
          }
          
          // Must have 'text' capability for text-to-text chat
          if (capabilities.length > 0 && !capabilities.includes('text')) {
            return false;
          }
          
          return true;
        });
        
        if (dbModel) {
          console.log(`   ⚠️  Model ${modelId} not available, using ${dbModel.id} instead`);
        }
      }

      if (dbModel && !dbModel.deprecated) {
        // Use model from DB - create provider with specific model ID
        // Normalize model ID by stripping provider prefix and invalid suffixes
        // Example: "openai/gpt-4o" -> "gpt-4o"
        // Example: "anthropic/claude-3.7-sonnet:thinking" -> "claude-3.7-sonnet"
        let modelIdToUse = dbModel.id;
        
        // Remove provider prefix if present
        const prefix = `${providerType}/`;
        if (modelIdToUse.startsWith(prefix)) {
          modelIdToUse = modelIdToUse.substring(prefix.length);
        }
        
        // Remove invalid suffixes (like :thinking, :expanded, etc.)
        // These are not valid model IDs for API calls
        const invalidSuffixes = [':thinking', ':expanded', ':beta', ':preview'];
        for (const suffix of invalidSuffixes) {
          if (modelIdToUse.includes(suffix)) {
            modelIdToUse = modelIdToUse.split(suffix)[0];
          }
        }
        
        console.log(`   📌 Using DB model: ${modelIdToUse} for ${agent.name}`);
        
        // Create provider with specific model ID
        if (providerType === 'openai') {
          const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
          providerInstance = new OpenAIAdapter(modelIdToUse);
        } else if (providerType === 'anthropic') {
          const { ClaudeAdapter } = await import('@/lib/ai/v2/adapters/ClaudeAdapter');
          providerInstance = new ClaudeAdapter(modelIdToUse);
        } else if (providerType === 'google') {
          const { GeminiAdapter } = await import('@/lib/ai/v2/adapters/GeminiAdapter');
          providerInstance = new GeminiAdapter(modelIdToUse);
        } else if (providerType === 'groq') {
          const { GroqAdapter } = await import('@/lib/ai/v2/adapters/GroqAdapter');
          providerInstance = new GroqAdapter(modelIdToUse);
        } else {
          // Fallback to factory
          providerInstance = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
        }
      } else {
        // Fallback to factory method (uses DB registry or hardcoded defaults)
        providerInstance = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to query DB for models, using factory fallback:`, error);
      // Fallback to factory method
      providerInstance = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
    }

    // Execute with retry logic for model-specific errors
    try {
      const response = await providerInstance.execute({
        prompt: prompt,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
      });
      return response.content;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      
      // If it's a model-specific error (404, invalid model), try fallback models
      if (errorMsg.includes('invalid model') || 
          errorMsg.includes('not a chat model') ||
          errorMsg.includes('404') ||
          errorMsg.includes('not_found_error')) {
        console.warn(`   ⚠️  Model failed with ${errorMsg.substring(0, 100)}..., trying fallback models...`);
        
        // Try fallback models based on provider
        const providerType = agent.provider.includes('openai') ? 'openai' :
                             agent.provider.includes('claude') ? 'anthropic' :
                             agent.provider.includes('gemini') ? 'google' :
                             agent.provider.includes('groq') ? 'groq' :
                             'openai';
        
        // Current, non-deprecated fallback models (as of Nov 2025)
        const fallbackModels = providerType === 'openai' 
          ? ['gpt-4o-mini', 'gpt-4o', 'gpt-4'] // gpt-4o-mini is cheapest, gpt-4o is best balance
          : providerType === 'anthropic'
          ? ['claude-3-5-sonnet-20250219', 'claude-3-haiku-20240307'] // Latest Sonnet, then Haiku (fast/cheap)
          : providerType === 'google'
          ? ['gemini-2.0-flash-exp', 'gemini-1.5-flash'] // 2.0 Flash is free, 1.5 Flash is stable
          : ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant']; // Groq models
        
        // Try each fallback model
        for (const fallbackModel of fallbackModels) {
          try {
            const availableModels = await getModelsByProvider(providerType);
            
            // Find model, filtering out deprecated ones
            const dbModel = availableModels.find(m => {
              const status = ('status' in m ? m.status : 'active');
              const isAllowed = ('isAllowed' in m ? m.isAllowed : true);
              if (status !== 'active' || isAllowed === false) return false;
              if (m.deprecated) return false;
              
              const modelIdLower = (m.id || '').toLowerCase();
              const fallbackLower = fallbackModel.toLowerCase();
              
              return modelIdLower === fallbackLower || 
                     modelIdLower.includes(fallbackLower) ||
                     m.name?.toLowerCase() === fallbackLower;
            });
            
            if (dbModel) {
              let modelIdToUse = dbModel.id;
              const prefix = `${providerType}/`;
              if (modelIdToUse.startsWith(prefix)) {
                modelIdToUse = modelIdToUse.substring(prefix.length);
              }
              
              const invalidSuffixes = [':thinking', ':expanded', ':beta', ':preview'];
              for (const suffix of invalidSuffixes) {
                if (modelIdToUse.includes(suffix)) {
                  modelIdToUse = modelIdToUse.split(suffix)[0];
                }
              }
              
              console.log(`   🔄 Retrying with fallback model: ${modelIdToUse}`);
              
              // Create new provider instance with fallback model
              if (providerType === 'openai') {
                const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
                providerInstance = new OpenAIAdapter(modelIdToUse);
              } else if (providerType === 'anthropic') {
                const { ClaudeAdapter } = await import('@/lib/ai/v2/adapters/ClaudeAdapter');
                providerInstance = new ClaudeAdapter(modelIdToUse);
              } else if (providerType === 'google') {
                const { GeminiAdapter } = await import('@/lib/ai/v2/adapters/GeminiAdapter');
                providerInstance = new GeminiAdapter(modelIdToUse);
              } else if (providerType === 'groq') {
                const { GroqAdapter } = await import('@/lib/ai/v2/adapters/GroqAdapter');
                providerInstance = new GroqAdapter(modelIdToUse);
              }
              
              const response = await providerInstance.execute({
                prompt: prompt,
                systemPrompt: agent.systemPrompt,
                temperature: agent.temperature,
                maxTokens: agent.maxTokens,
              });
              
              console.log(`   ✅ Fallback model ${modelIdToUse} succeeded`);
              return response.content;
            }
          } catch (fallbackError: any) {
            const fallbackMsg = fallbackError?.message || String(fallbackError);
            console.warn(`   ⚠️  Fallback model ${fallbackModel} also failed: ${fallbackMsg.substring(0, 100)}...`);
            continue; // Try next fallback
          }
        }
        
        // If all fallbacks failed, throw original error
        throw error;
      }
      
      // For other errors (rate limits, network), throw immediately
      throw error;
    }
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
      // Use same DB-aware provider creation as runAgent
      let providerInstance;
      
      try {
        const providerType = agent.provider.includes('openai') ? 'openai' :
                             agent.provider.includes('claude') ? 'anthropic' :
                             agent.provider.includes('gemini') ? 'google' :
                             agent.provider.includes('groq') ? 'groq' :
                             'openai';

        const availableModels = await getModelsByProvider(providerType);
        const modelId = agent.preferredModelId || agent.model;
        let dbModel = availableModels.find(m => 
          m.id === modelId || 
          m.name === modelId ||
          (agent.preferredModelId && m.id.includes(agent.preferredModelId))
        );

        // If exact match not found, try to find best available model for this provider
        if (!dbModel || dbModel.deprecated) {
          // Find first available, ACTIVE, ALLOWED model for this provider
          // CRITICAL: Must explicitly check status === 'active' and isAllowed === true
          dbModel = availableModels.find(m => {
            // MUST be active (explicit check, not just "not deprecated")
            const status = ('status' in m ? m.status : 'active');
            if (status !== 'active') {
              return false; // Reject if not explicitly active
            }
            
            // MUST be allowed for use
            if ('isAllowed' in m && m.isAllowed === false) {
              return false; // Reject if explicitly not allowed
            }
            
            // Skip deprecated or sunset models (safety check)
            if (m.deprecated || status === 'deprecated' || status === 'sunset') {
              return false;
            }
            
            const modelId = (m.id || '').toLowerCase();
            
            // Skip models with invalid suffixes
            if (modelId.includes(':thinking') || 
                modelId.includes(':expanded') || 
                modelId.includes(':beta') ||
                modelId.includes(':preview') ||
                modelId.includes('transcribe') ||
                modelId.includes('realtime')) {
              return false;
            }
            
            // Skip audio/video/image models (they require different API endpoints)
            const capabilities = (m as any).capabilities || [];
            const tags = (m as any).tags || [];
            if (capabilities.includes('audio-generation') ||
                capabilities.includes('video-generation') ||
                capabilities.includes('image-generation') ||
                tags.includes('audio-only') ||
                tags.includes('realtime-only') ||
                tags.includes('unsuitable-for-text') ||
                modelId.includes('audio') ||
                modelId.includes('video') ||
                modelId.includes('image') ||
                modelId.includes('flux') ||
                modelId.includes('sora') ||
                modelId.includes('dalle') ||
                modelId.includes('midjourney')) {
              return false;
            }
            
            // Must have 'text' capability for text-to-text chat
            if (capabilities.length > 0 && !capabilities.includes('text')) {
              return false;
            }
            
            return true;
          });
          if (dbModel) {
            console.log(`   ⚠️  Model ${modelId} not available, using ${dbModel.id} instead`);
          }
        }

        if (dbModel && !dbModel.deprecated) {
          // Normalize model ID by stripping provider prefix and invalid suffixes
          // Example: "openai/gpt-4o" -> "gpt-4o"
          // Example: "anthropic/claude-3.7-sonnet:thinking" -> "claude-3.7-sonnet"
          let modelIdToUse = dbModel.id;
          
          // Remove provider prefix if present
          const prefix = `${providerType}/`;
          if (modelIdToUse.startsWith(prefix)) {
            modelIdToUse = modelIdToUse.substring(prefix.length);
          }
          
          // Remove invalid suffixes (like :thinking, :expanded, etc.)
          // These are not valid model IDs for API calls
          const invalidSuffixes = [':thinking', ':expanded', ':beta', ':preview'];
          for (const suffix of invalidSuffixes) {
            if (modelIdToUse.includes(suffix)) {
              modelIdToUse = modelIdToUse.split(suffix)[0];
            }
          }
          
          if (providerType === 'openai') {
            const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
            providerInstance = new OpenAIAdapter(modelIdToUse);
          } else if (providerType === 'anthropic') {
            const { ClaudeAdapter } = await import('@/lib/ai/v2/adapters/ClaudeAdapter');
            providerInstance = new ClaudeAdapter(modelIdToUse);
          } else if (providerType === 'google') {
            const { GeminiAdapter } = await import('@/lib/ai/v2/adapters/GeminiAdapter');
            providerInstance = new GeminiAdapter(modelIdToUse);
          } else if (providerType === 'groq') {
            const { GroqAdapter } = await import('@/lib/ai/v2/adapters/GroqAdapter');
            providerInstance = new GroqAdapter(modelIdToUse);
          } else {
            providerInstance = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
          }
        } else {
          providerInstance = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
        }
      } catch (error) {
        providerInstance = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
      }

      const provider = providerInstance;

      // Execute with retry logic for model-specific errors
      let response;
      try {
        // Note: JSON mode handled by adapter, not in request interface
        response = await provider.execute({
          prompt: reviewPrompt + '\n\nRespond in valid JSON format only.',
          systemPrompt: agent.systemPrompt + '\n\nYou must respond with valid JSON only. No markdown, no code blocks, just raw JSON.',
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        });
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        
        // If it's a model-specific error (404, invalid model), try fallback models
        if (errorMsg.includes('invalid model') || 
            errorMsg.includes('not a chat model') ||
            errorMsg.includes('404') ||
            errorMsg.includes('not_found_error')) {
          console.warn(`   ⚠️  Model failed with ${errorMsg.substring(0, 100)}..., trying fallback models...`);
          
          // Try fallback models based on provider
          const providerType = agent.provider.includes('openai') ? 'openai' :
                               agent.provider.includes('claude') ? 'anthropic' :
                               agent.provider.includes('gemini') ? 'google' :
                               agent.provider.includes('groq') ? 'groq' :
                               'openai';
          
          // Current, non-deprecated fallback models (as of Nov 2025)
          const fallbackModels = providerType === 'openai' 
            ? ['gpt-4o-mini', 'gpt-4o', 'gpt-4'] // gpt-4o-mini is cheapest, gpt-4o is best balance
            : providerType === 'anthropic'
            ? ['claude-3-5-sonnet-20250219', 'claude-3-haiku-20240307'] // Latest Sonnet, then Haiku (fast/cheap)
            : providerType === 'google'
            ? ['gemini-2.0-flash-exp', 'gemini-1.5-flash'] // 2.0 Flash is free, 1.5 Flash is stable
            : ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant']; // Groq models
          
          // Try each fallback model
          for (const fallbackModel of fallbackModels) {
            try {
              const availableModels = await getModelsByProvider(providerType);
              const modelId = agent.preferredModelId || agent.model;
              
              // Find model, filtering out deprecated ones
              let dbModel = availableModels.find(m => {
                const status = ('status' in m ? m.status : 'active');
                const isAllowed = ('isAllowed' in m ? m.isAllowed : true);
                if (status !== 'active' || isAllowed === false) return false;
                if (m.deprecated) return false;
                
                const modelIdLower = (m.id || '').toLowerCase();
                const fallbackLower = fallbackModel.toLowerCase();
                
                return modelIdLower === fallbackLower || 
                       modelIdLower.includes(fallbackLower) ||
                       m.name?.toLowerCase() === fallbackLower;
              });
              
              if (dbModel) {
                let modelIdToUse = dbModel.id;
                const prefix = `${providerType}/`;
                if (modelIdToUse.startsWith(prefix)) {
                  modelIdToUse = modelIdToUse.substring(prefix.length);
                }
                
                const invalidSuffixes = [':thinking', ':expanded', ':beta', ':preview'];
                for (const suffix of invalidSuffixes) {
                  if (modelIdToUse.includes(suffix)) {
                    modelIdToUse = modelIdToUse.split(suffix)[0];
                  }
                }
                
                console.log(`   🔄 Retrying with fallback model: ${modelIdToUse}`);
                
                // Create new provider instance with fallback model
                let fallbackProvider;
                if (providerType === 'openai') {
                  const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
                  fallbackProvider = new OpenAIAdapter(modelIdToUse);
                } else if (providerType === 'anthropic') {
                  const { ClaudeAdapter } = await import('@/lib/ai/v2/adapters/ClaudeAdapter');
                  fallbackProvider = new ClaudeAdapter(modelIdToUse);
                } else if (providerType === 'google') {
                  const { GeminiAdapter } = await import('@/lib/ai/v2/adapters/GeminiAdapter');
                  fallbackProvider = new GeminiAdapter(modelIdToUse);
                } else if (providerType === 'groq') {
                  const { GroqAdapter } = await import('@/lib/ai/v2/adapters/GroqAdapter');
                  fallbackProvider = new GroqAdapter(modelIdToUse);
                }
                
                if (fallbackProvider) {
                  response = await fallbackProvider.execute({
                    prompt: reviewPrompt + '\n\nRespond in valid JSON format only.',
                    systemPrompt: agent.systemPrompt + '\n\nYou must respond with valid JSON only. No markdown, no code blocks, just raw JSON.',
                    temperature: agent.temperature,
                    maxTokens: agent.maxTokens,
                  });
                  
                  console.log(`   ✅ Fallback model ${modelIdToUse} succeeded`);
                  break; // Success, exit loop
                }
              }
            } catch (fallbackError: any) {
              const fallbackMsg = fallbackError?.message || String(fallbackError);
              console.warn(`   ⚠️  Fallback model ${fallbackModel} also failed: ${fallbackMsg.substring(0, 100)}...`);
              continue; // Try next fallback
            }
          }
          
          // If all fallbacks failed, throw original error
          if (!response) {
            throw error;
          }
        } else {
          // For other errors (rate limits, network), throw immediately
          throw error;
        }
      }

      // Sanitize JSON: remove control characters that break JSON parsing
      let jsonContent = response.content;
      
      try {
        // Remove control characters (except newlines and tabs which are valid in JSON strings)
        jsonContent = jsonContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // Try to extract JSON from markdown code blocks if present
        const codeBlockMatch = jsonContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (codeBlockMatch) {
          jsonContent = codeBlockMatch[1];
        } else {
          // Try to extract JSON object directly
          const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonContent = jsonMatch[0];
          }
        }
        
        // Repair common JSON issues
        jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
        jsonContent = jsonContent.replace(/,(\s*$)/gm, ''); // Remove trailing commas at end of lines
        
        // Handle truncated strings - find incomplete string values and close them
        // This handles strings that are cut off mid-value, especially in nested objects
        // Pattern: "key": "value that might be truncated...
        const stringPattern = /"([^"]+)"\s*:\s*"([^"]*?)(?:"|$)/g;
        let match;
        const replacements: Array<{ start: number; end: number; replacement: string }> = [];
        
        while ((match = stringPattern.exec(jsonContent)) !== null) {
          const fullMatch = match[0];
          const key = match[1];
          const value = match[2];
          const matchStart = match.index;
          const matchEnd = matchStart + fullMatch.length;
          
          // Check if this string value is incomplete (doesn't end with quote)
          // and we're near the end of the content (likely truncated)
          if (!fullMatch.endsWith('"')) {
            const distanceFromEnd = jsonContent.length - matchEnd;
            if (distanceFromEnd < 100) {
              // This string is likely truncated - close it
              const safeValue = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
              replacements.push({
                start: matchStart,
                end: matchEnd,
                replacement: `"${key}": "${safeValue}"`,
              });
            }
          }
        }
        
        // Apply replacements in reverse order to preserve indices
        for (let i = replacements.length - 1; i >= 0; i--) {
          const r = replacements[i];
          jsonContent = jsonContent.substring(0, r.start) + r.replacement + jsonContent.substring(r.end);
        }
        
        // Also handle cases where string is cut off mid-value (no quote at all)
        // Pattern: "key": "value that ends abruptly
        jsonContent = jsonContent.replace(/"([^"]+)"\s*:\s*"([^"]+)$/gm, (match, key, value) => {
          // If we're at the end of content and string isn't closed, close it
          if (jsonContent.indexOf(match) + match.length >= jsonContent.length - 10) {
            const safeValue = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
            return `"${key}": "${safeValue}"`;
          }
          return match;
        });
        
        // Close incomplete arrays (if improvements array is truncated)
        const improvementsMatch = jsonContent.match(/"improvements"\s*:\s*\[([^\]]*)/);
        if (improvementsMatch && !jsonContent.includes('"improvements"') || jsonContent.match(/"improvements"\s*:\s*\[[^\]]*$/)) {
          // Find where improvements array should end
          const improvementsStart = jsonContent.indexOf('"improvements"');
          if (improvementsStart !== -1) {
            const afterImprovements = jsonContent.substring(improvementsStart);
            const arrayStart = afterImprovements.indexOf('[');
            if (arrayStart !== -1) {
              const arrayContent = afterImprovements.substring(arrayStart + 1);
              // Count open brackets
              let openCount = 1;
              let pos = 0;
              while (pos < arrayContent.length && openCount > 0) {
                if (arrayContent[pos] === '[') openCount++;
                if (arrayContent[pos] === ']') openCount--;
                pos++;
              }
              // If we didn't find closing bracket, add it
              if (openCount > 0) {
                const beforeArray = jsonContent.substring(0, improvementsStart + arrayStart + 1);
                const arrayPart = arrayContent.substring(0, pos);
                // Close any incomplete strings in array
                const closedArray = arrayPart.replace(/"([^"]*)$/, '"$1"');
                jsonContent = beforeArray + closedArray + ']';
              }
            }
          }
        }
        
        // Close incomplete objects (if JSON is truncated)
        // This handles nested objects like seoMetadata that might be incomplete
        const openBraces = (jsonContent.match(/\{/g) || []).length;
        const closeBraces = (jsonContent.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          // Check if we're near the end (likely truncated)
          const last200 = jsonContent.slice(-200);
          // If we have incomplete strings or objects near the end, close them
          if (last200.includes('"') || last200.includes('{')) {
            // Close incomplete nested objects first
            // Find the last incomplete object (one that doesn't have a closing brace)
            let braceCount = 0;
            let lastOpenBrace = -1;
            for (let i = jsonContent.length - 1; i >= 0; i--) {
              if (jsonContent[i] === '}') braceCount++;
              if (jsonContent[i] === '{') {
                braceCount--;
                if (braceCount < 0) {
                  lastOpenBrace = i;
                  break;
                }
              }
            }
            
            // If we found an incomplete object, close any incomplete strings first, then close the object
            if (lastOpenBrace !== -1) {
              const afterLastOpen = jsonContent.substring(lastOpenBrace);
              // Check if there's an incomplete string before we close
              const incompleteStringMatch = afterLastOpen.match(/"([^"]+)"\s*:\s*"([^"]*)$/);
              if (incompleteStringMatch) {
                // Close the incomplete string first
                const key = incompleteStringMatch[1];
                const value = incompleteStringMatch[2];
                const safeValue = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
                const beforeIncomplete = jsonContent.substring(0, lastOpenBrace + incompleteStringMatch.index);
                jsonContent = beforeIncomplete + `"${key}": "${safeValue}"`;
              }
            }
            
            // Now close all incomplete braces
            jsonContent += '}'.repeat(openBraces - closeBraces);
          }
        }
        
        const parsed = JSON.parse(jsonContent);
        
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
      } catch (parseError: any) {
        // Only log if we can't extract partial data (reduces noise)
        const canExtractPartial = response.content.includes('"score"') || response.content.includes('"approved"');
        
        if (!canExtractPartial) {
          console.error(`   ⚠️  JSON parse error: ${parseError.message}`);
          console.error(`   Raw response (first 500 chars): ${response.content.substring(0, 500)}`);
        } else {
          // Silent recovery - we can extract partial data, so just log a brief note
          console.log(`   ⚠️  JSON truncated but recoverable`);
        }
        
        // Try to extract partial data from malformed JSON
        try {
          // Try to extract just the score and feedback if possible
          const scoreMatch = response.content.match(/"score"\s*:\s*(\d+)/);
          const approvedMatch = response.content.match(/"approved"\s*:\s*(true|false)/);
          
          // Extract feedback - handle truncated strings
          let feedback = '';
          const feedbackMatch = response.content.match(/"feedback"\s*:\s*"([^"]*(?:\\.[^"]*)*)"|"feedback"\s*:\s*"([^"]+)/);
          if (feedbackMatch) {
            feedback = feedbackMatch[1] || feedbackMatch[2] || '';
            // If feedback seems truncated (ends mid-sentence), try to find last complete sentence
            if (feedback && !feedback.match(/[.!?]\s*$/)) {
              const sentences = feedback.match(/[^.!?]*[.!?]/g);
              if (sentences && sentences.length > 0) {
                feedback = sentences.slice(0, -1).join(' '); // Take all but last incomplete sentence
              }
            }
            // If still no complete sentences, take what we have but add ellipsis
            if (!feedback.match(/[.!?]\s*$/)) {
              feedback = feedback.trim() + '...';
            }
          }
          
          // Extract improvements array (handle truncated)
          const improvements: string[] = [];
          const improvementsMatch = response.content.match(/"improvements"\s*:\s*\[([^\]]*)/);
          if (improvementsMatch) {
            const improvementsContent = improvementsMatch[1];
            // Extract complete string items
            const itemMatches = improvementsContent.match(/"([^"]+)"/g);
            if (itemMatches) {
              improvements.push(...itemMatches.map(m => m.replace(/"/g, '')));
            }
          }
          
          return {
            agentName: agent.name,
            approved: approvedMatch ? approvedMatch[1] === 'true' : false,
            score: scoreMatch ? parseInt(scoreMatch[1]) : 5,
            feedback: feedback || `JSON parse error: ${parseError.message}`,
            improvements: improvements.length > 0 ? improvements : [],
            revisedContent: undefined,
            seoMetadata: undefined,
            timestamp: new Date(),
          };
        } catch (fallbackError) {
          // Last resort: return error result
          return {
            agentName: agent.name,
            approved: false,
            score: 0,
            feedback: `Review failed: JSON parse error - ${parseError.message}`,
            improvements: ['Retry the review - JSON parsing failed'],
            timestamp: new Date(),
          };
        }
      }
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

