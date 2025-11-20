/**
 * Editorial Recap Generation API (Multi-Agent)
 * 
 * Generates tech editorial-style recaps using a 3-agent sequential workflow:
 * 1. Editor - Analyzes how article relates to existing site content
 * 2. SEO/EEAT Expert - Ensures SEO optimization and E-E-A-T compliance
 * 3. SME Tech Writer - Creates final editorial recap with technical accuracy
 * 
 * Uses user's API keys via existing AI provider infrastructure
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { ApiKeyService } from '@/lib/services/ApiKeyService';
import { logger } from '@/lib/logging/logger';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';
import { ClaudeAdapter } from '@/lib/ai/v2/adapters/ClaudeAdapter';
import { GeminiAdapter } from '@/lib/ai/v2/adapters/GeminiAdapter';
import type { AIRequest } from '@/lib/ai/v2/interfaces/AIProvider';
import { getDb } from '@/lib/mongodb';

const RecapRequestSchema = z.object({
  articleId: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(10),
  sourceUrl: z.string().url().optional(),
  provider: z.enum(['openai', 'anthropic', 'google']).default('openai'),
  model: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Only admins can generate recaps
    const role = session.user.role as string | undefined;
    if (!['admin', 'super_admin', 'org_admin'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `content-recap-${session.user.id}`,
      'authenticated'
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = RecapRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, content, sourceUrl, provider, model } = validationResult.data;
    const userId = session.user.id;

    // Try to get user's API key first (BYOK - Bring Your Own Key)
    const apiKeyService = new ApiKeyService();
    let apiKey: string | null = await apiKeyService.getActiveKey(
      userId,
      provider === 'google' ? 'google' : provider,
      model
    );

    // Fall back to Vercel environment variables if no user key (like multi-agent workbench)
    if (!apiKey) {
      if (provider === 'openai') {
        apiKey = process.env.OPENAI_API_KEY || null;
      } else if (provider === 'anthropic') {
        apiKey = process.env.ANTHROPIC_API_KEY || null;
      } else if (provider === 'google') {
        apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY || null;
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'No API key found',
          message: `No API key found for ${provider}. Please add a ${provider} API key in your settings, or ensure ${provider.toUpperCase()}_API_KEY is set in Vercel environment variables.`,
        },
        { status: 400 }
      );
    }

    // Get site content context for editor agent
    const siteContentContext = await getSiteContentContext();

    // Multi-agent sequential workflow
    const selectedModel = model || getDefaultModel(provider);
    let totalTokens = 0;
    let totalCost = 0;
    const agentResults: Array<{ role: string; output: string }> = [];

    try {
      // Create provider with user's API key
      const aiProvider = createProviderWithUserKey(provider, selectedModel, apiKey);

      // AGENT 1: Editor - Analyze content relevance
      const editorPrompt = buildEditorPrompt(title, content, sourceUrl, siteContentContext);
      const editorRequest: AIRequest = {
        prompt: editorPrompt,
        systemPrompt: `You are a Senior Content Editor for Engify.ai, an AI training platform for engineering teams. Your role is to analyze how news articles relate to our existing content and audience.`,
        temperature: 0.7,
        maxTokens: 1000,
      };

      if (!aiProvider.validateRequest(editorRequest)) {
        return NextResponse.json(
          { error: 'Invalid request for editor agent' },
          { status: 400 }
        );
      }

      const editorResponse = await aiProvider.execute(editorRequest);
      const editorAnalysis = editorResponse.content?.trim() || '';
      totalTokens += editorResponse.usage?.totalTokens || 0;
      totalCost += editorResponse.cost?.total || 0;
      agentResults.push({ role: 'editor', output: editorAnalysis });

      // AGENT 2: SEO/EEAT Expert - Optimize for search and E-E-A-T
      const seoPrompt = buildSEOPrompt(title, content, editorAnalysis);
      const seoRequest: AIRequest = {
        prompt: seoPrompt,
        systemPrompt: `You are an SEO and E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) expert. You optimize content for search engines while ensuring it demonstrates expertise and builds trust with engineering professionals.`,
        temperature: 0.6,
        maxTokens: 1000,
      };

      if (!aiProvider.validateRequest(seoRequest)) {
        return NextResponse.json(
          { error: 'Invalid request for SEO agent' },
          { status: 400 }
        );
      }

      const seoResponse = await aiProvider.execute(seoRequest);
      const seoAnalysis = seoResponse.content?.trim() || '';
      totalTokens += seoResponse.usage?.totalTokens || 0;
      totalCost += seoResponse.cost?.total || 0;
      agentResults.push({ role: 'seo_eeat', output: seoAnalysis });

      // AGENT 3: SME Tech Writer - Create final editorial recap
      const writerPrompt = buildWriterPrompt(title, content, editorAnalysis, seoAnalysis, sourceUrl);
      const writerRequest: AIRequest = {
        prompt: writerPrompt,
        systemPrompt: `You are a Senior Technical Writer and Subject Matter Expert (SME) specializing in AI tools, engineering workflows, and developer productivity. You write editorial recaps that are technically accurate, accessible, and valuable to engineering teams.`,
        temperature: 0.7,
        maxTokens: 1500,
      };

      if (!aiProvider.validateRequest(writerRequest)) {
        return NextResponse.json(
          { error: 'Invalid request for tech writer agent' },
          { status: 400 }
        );
      }

      const writerResponse = await aiProvider.execute(writerRequest);
      const finalRecap = writerResponse.content?.trim() || '';
      totalTokens += writerResponse.usage?.totalTokens || 0;
      totalCost += writerResponse.cost?.total || 0;
      agentResults.push({ role: 'tech_writer', output: finalRecap });

      if (!finalRecap || finalRecap.trim().length === 0) {
        return NextResponse.json(
          { error: 'Failed to generate recap' },
          { status: 500 }
        );
      }

      logger.info('Multi-agent editorial recap generated', {
        userId,
        provider,
        model: selectedModel,
        totalTokens,
        totalCostUSD: totalCost,
        recapLength: finalRecap.length,
        agentResults: agentResults.map(r => r.role),
      });

      return NextResponse.json({
        success: true,
        recap: finalRecap,
        agentAnalyses: {
          editor: editorAnalysis,
          seoEeat: seoAnalysis,
        },
        metadata: {
          provider,
          model: selectedModel,
          tokensUsed: totalTokens,
          length: finalRecap.length,
          costUSD: totalCost,
          workflow: 'multi-agent',
        },
      });
    } catch (error) {
      logger.error('Failed to generate multi-agent recap', {
        userId,
        provider,
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json(
        {
          error: 'Failed to generate recap',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('[API] Recap generation error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create AI provider with user's API key
 */
function createProviderWithUserKey(
  provider: 'openai' | 'anthropic' | 'google',
  model: string,
  apiKey: string
) {
  // Temporarily set env var for adapter initialization
  // Note: This is a workaround - ideally adapters would accept API key in constructor
  if (provider === 'openai') {
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = apiKey;
    try {
      return new OpenAIAdapter(model);
    } finally {
      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
    }
  } else if (provider === 'anthropic') {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = apiKey;
    try {
      return new ClaudeAdapter(model);
    } finally {
      if (originalKey !== undefined) {
        process.env.ANTHROPIC_API_KEY = originalKey;
      } else {
        delete process.env.ANTHROPIC_API_KEY;
      }
    }
  } else if (provider === 'google') {
    const originalKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;
    process.env.GOOGLE_API_KEY = apiKey;
    process.env.GOOGLE_AI_API_KEY = apiKey;
    try {
      return new GeminiAdapter(model);
    } finally {
      if (originalKey !== undefined) {
        process.env.GOOGLE_API_KEY = originalKey;
        process.env.GOOGLE_AI_API_KEY = originalKey;
      } else {
        delete process.env.GOOGLE_API_KEY;
        delete process.env.GOOGLE_AI_API_KEY;
      }
    }
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

/**
 * Get default model for provider
 */
function getDefaultModel(provider: 'openai' | 'anthropic' | 'google'): string {
  const defaults = {
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-20250219',
    google: 'gemini-2.0-flash-exp',
  };
  return defaults[provider];
}

/**
 * Get site content context for editor agent
 */
async function getSiteContentContext(): Promise<string> {
  try {
    const db = await getDb();
    const collection = db.collection('learning_content');
    
    // Get recent content to understand site themes
    const recentContent = await collection
      .find({ status: 'active' })
      .sort({ updatedAt: -1 })
      .limit(10)
      .project({ title: 1, category: 1, tags: 1, type: 1 })
      .toArray();

    if (recentContent.length === 0) {
      return 'Engify.ai is an AI training platform for engineering teams, focusing on prompt engineering, AI best practices, and engineering workflows.';
    }

    const categories = [...new Set(recentContent.map((c: any) => c.category).filter(Boolean))];
    const types = [...new Set(recentContent.map((c: any) => c.type).filter(Boolean))];
    const allTags = recentContent.flatMap((c: any) => c.tags || []).filter(Boolean);
    const topTags = [...new Set(allTags)].slice(0, 10);

    return `Engify.ai is an AI training platform for engineering teams. Our site focuses on:
- Categories: ${categories.join(', ') || 'AI adoption, engineering workflows'}
- Content Types: ${types.join(', ') || 'learning resources, patterns'}
- Key Topics: ${topTags.join(', ') || 'AI tools, prompt engineering, best practices'}

Recent content themes: ${recentContent.slice(0, 5).map((c: any) => c.title).join(', ')}`;
  } catch (error) {
    logger.warn('Failed to fetch site content context', { error });
    return 'Engify.ai is an AI training platform for engineering teams, focusing on prompt engineering, AI best practices, and engineering workflows.';
  }
}

/**
 * Build prompt for Editor agent (Agent 1)
 */
function buildEditorPrompt(
  title: string,
  content: string,
  sourceUrl: string | undefined,
  siteContext: string
): string {
  return `Analyze this article and explain how it relates to Engify.ai's content and audience.

**Article Title:** ${title}
**Article Content:** ${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}
${sourceUrl ? `**Source:** ${sourceUrl}` : ''}

**Site Context:**
${siteContext}

Provide analysis covering:
1. **Content Alignment**: How does this article align with our existing content themes?
2. **Audience Relevance**: Why would our engineering audience care about this?
3. **Content Gaps**: Does this fill a gap in our content library?
4. **Cross-References**: What existing content on our site relates to this topic?
5. **Editorial Angle**: What unique angle should we take when recapping this?

Keep your analysis concise (200-300 words) and actionable.`;
}

/**
 * Build prompt for SEO/EEAT Expert agent (Agent 2)
 */
function buildSEOPrompt(
  title: string,
  content: string,
  editorAnalysis: string
): string {
  return `Review this article and editor analysis for SEO and E-E-A-T optimization.

**Article Title:** ${title}
**Article Content:** ${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

**Editor's Analysis:**
${editorAnalysis}

Provide SEO/EEAT recommendations covering:
1. **Keywords**: What primary and secondary keywords should we target?
2. **E-E-A-T Signals**: How can we demonstrate Experience, Expertise, Authoritativeness, and Trustworthiness?
3. **Content Structure**: What headings and structure would improve SEO?
4. **Internal Linking**: What topics should we reference from our existing content?
5. **Meta Description**: Suggest a compelling meta description (150-160 characters)
6. **Technical Accuracy**: Ensure all technical claims are accurate and verifiable

Keep recommendations concise (200-300 words) and specific.`;
}

/**
 * Build prompt for SME Tech Writer agent (Agent 3)
 */
function buildWriterPrompt(
  title: string,
  content: string,
  editorAnalysis: string,
  seoAnalysis: string,
  sourceUrl: string | undefined
): string {
  return `Write a tech editorial recap incorporating the editor's analysis and SEO recommendations.

**Article Title:** ${title}
**Article Content:** ${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}
${sourceUrl ? `**Source:** ${sourceUrl}` : ''}

**Editor's Analysis:**
${editorAnalysis}

**SEO/EEAT Recommendations:**
${seoAnalysis}

Write a 400-600 word editorial recap that:
1. **Captures the Essence**: Summarize the key development in accessible language
2. **Relates to Engineers**: Explain how this affects engineering teams, developers, and professionals
3. **Demonstrates Expertise**: Show technical understanding without overwhelming jargon
4. **Builds Trust**: Cite sources, acknowledge limitations, and provide context
5. **Follows SEO Guidance**: Incorporate recommended keywords naturally
6. **Connects to Site Content**: Reference how this relates to Engify.ai's mission and existing content
7. **Editorial Tone**: Write like a tech publication (TechCrunch, The Verge, etc.) - engaging, insightful, and professional

Format with clear headings, use bullet points for key takeaways, and end with actionable insights for engineering teams.`;
}

