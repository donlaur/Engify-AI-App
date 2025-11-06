import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/rate-limit';
import { auth } from '@/lib/auth';
import { sanitizeText } from '@/lib/security/sanitize';
import { getModelById } from '@/lib/config/ai-models';
import {
  getCachedRAGResponse,
  cacheRAGResponse,
} from '@/lib/cache/rag-cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  let body: {
    messages?: Array<{ role: string; content: string }>;
    useRAG?: boolean;
  } | null = null;

  try {
    // Rate limiting
    const session = await auth();
    const tier = session?.user ? 'authenticated' : 'anonymous';
    const identifier =
      session?.user?.id ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      'unknown';

    const rateLimitResult = await checkRateLimit(identifier, tier);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.reason || 'Rate limit exceeded',
          message: 'Sorry, too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    body = await request.json();
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    const { messages, useRAG = true } = body;

    // Sanitize user input
    const sanitizedMessages = Array.isArray(messages)
      ? messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: sanitizeText(msg.content || ''),
        }))
      : [];

    const lastMessage =
      sanitizedMessages[sanitizedMessages.length - 1]?.content || '';
    const sanitizedLastMessage = sanitizeText(lastMessage);

    // Check cache first for RAG queries
    if (useRAG && sanitizedLastMessage) {
      const cachedResponse = await getCachedRAGResponse(sanitizedLastMessage);
      if (cachedResponse) {
        return NextResponse.json({
          message: cachedResponse.message,
          sources: cachedResponse.sources,
          usedRAG: cachedResponse.usedRAG,
          cached: true,
          cachedAt: cachedResponse.cachedAt,
        });
      }
    }

    let context = '';
    let sources: Array<{ title: string; content: string; score: number }> = [];

    // Use RAG to get relevant context if enabled
    if (useRAG && sanitizedLastMessage) {
      try {
        // First, try MongoDB direct search (fallback if Python RAG service not deployed)
        try {
          const { getDb } = await import('@/lib/mongodb');
          const db = await getDb();
          // Use find with text search (requires text index)
          const prompts = await db
            .collection('prompts')
            .find(
              {
                $text: { $search: sanitizedLastMessage },
                active: { $ne: false },
              },
              {
                projection: { score: { $meta: 'textScore' } },
              }
            )
            .sort({ score: { $meta: 'textScore' } })
            .limit(3)
            .toArray();

          if (prompts.length > 0) {
            sources = prompts.map((prompt: Record<string, unknown>) => ({
              title: sanitizeText(String(prompt.title || '')),
              content: sanitizeText(String(prompt.description || '')),
              score: Number(prompt.score || 0),
            }));
            context = sources
              .map((source) => `**${source.title}**\n${source.content}`)
              .join('\n\n');
          }
        } catch (mongoError) {
          console.warn(
            'MongoDB search unavailable, trying RAG service:',
            mongoError
          );

          // Fallback to Python RAG service (if deployed)
          const ragResponse = await fetch(
            `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/rag`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: sanitizedLastMessage,
                collection: 'prompts',
                top_k: 3,
              }),
            }
          );

          if (ragResponse.ok) {
            const ragData = await ragResponse.json();
            if (ragData.success && ragData.results.length > 0) {
              sources = ragData.results.map(
                (source: {
                  title: string;
                  content: string;
                  score: number;
                }) => ({
                  title: sanitizeText(source.title || ''),
                  content: sanitizeText(source.content || ''),
                  score: source.score || 0,
                })
              );
              context = sources
                .map((source) => `**${source.title}**\n${source.content}`)
                .join('\n\n');
            }
          }
        }
      } catch (ragError) {
        console.warn(
          'RAG service unavailable, falling back to knowledge-based response:',
          ragError
        );
      }
    }

    // Build system prompt with RAG context
    const systemPrompt = `You are Engify Assistant, a helpful AI assistant for Engify.ai, a prompt engineering education platform.

You help users:
- Find the right prompts from our library of 100+ expert prompts
- Learn about 15 proven prompt patterns (Persona, Few-Shot, Chain-of-Thought, etc.)
- Understand best practices for AI-assisted coding
- Navigate our learning pathways

${context ? `\n**Relevant Knowledge Base Content:**\n${context}\n` : ''}

Be concise, friendly, and always reference our content when relevant.
${sources.length > 0 ? `\nWhen referencing information, mention it came from our knowledge base.` : ''}
Suggest specific pages: /prompts, /patterns, /learn, /workbench`;

    // Get model from centralized config
    const modelConfig =
      getModelById('gpt-3.5-turbo') || getModelById('gpt-4o-mini');
    const modelId = modelConfig?.id || 'gpt-3.5-turbo';

    // Use OpenAI to generate response
    const completion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        ...sanitizedMessages.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const response =
      completion.choices[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    const sanitizedResponse = sanitizeText(response);

    const responseData = {
      message: sanitizedResponse,
      sources:
        sources.length > 0
          ? sources.map((s) => ({ title: s.title, score: s.score }))
          : [],
      usedRAG: sources.length > 0,
    };

    // Cache the response for future requests (fire and forget)
    if (useRAG && sanitizedLastMessage) {
      cacheRAGResponse(sanitizedLastMessage, responseData).catch((err) =>
        console.error('Failed to cache response:', err)
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Chat API error:', error);

    // Fallback to knowledge-based response if OpenAI fails
    try {
      const messages = body?.messages || [];
      const lastMessage = messages[messages.length - 1]?.content || '';
      const sanitizedQuery = sanitizeText(lastMessage);
      const response = generateKnowledgeResponse(sanitizedQuery);

      return NextResponse.json({
        message: response,
        sources: [],
        usedRAG: false,
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: 'Chat service unavailable',
          message: 'Sorry, I encountered an error. Please try again later.',
        },
        { status: 500 }
      );
    }
  }
}

function generateKnowledgeResponse(query: string): string {
  const lowerQuery = sanitizeText(query).toLowerCase();

  // Pattern-based responses from our knowledge base
  const responses: Record<string, string> = {
    'chain of thought': `**Chain of Thought (CoT)** is one of our most powerful patterns!

**How it works:**
Ask the AI to "think step by step" before answering. This dramatically improves accuracy on complex reasoning tasks.

**Example:**
"Let's solve this step by step:
1. First, identify the key variables
2. Then, analyze their relationships
3. Finally, draw a conclusion"

**Results:** 30-50% improvement on complex tasks!

📚 See more in /patterns`,

    'few-shot': `**Few-Shot Learning** teaches AI by example!

**Pattern:**
Provide 2-5 examples of input → output pairs, then your actual query.

**Example:**
"Here are examples:
Input: 'happy' → Output: 'joyful'
Input: 'sad' → Output: 'melancholy'
Now: Input: 'angry' → Output: ?"

**Best for:** Classification, formatting, style matching

🎯 67+ examples in /prompts`,

    role: `**Role Prompting** defines who the AI should be!

**Pattern:**
"You are a [role] with expertise in [domain]..."

**Examples:**
• "You are a senior software architect..."
• "You are a technical writer for developers..."
• "You are a code reviewer focusing on security..."

**Impact:** More relevant, contextual responses

👥 See role-based prompts in /prompts`,
  };

  // Find matching response
  for (const [key, response] of Object.entries(responses)) {
    if (lowerQuery.includes(key)) {
      return response;
    }
  }

  // Default helpful response
  return `I can help you with:

• **Prompt Patterns** - 15 proven techniques
• **Best Practices** - Write better prompts
• **Examples** - 67+ real-world prompts
• **Learning Paths** - Guided tutorials

Try asking about:
- "What is chain of thought?"
- "How do I write better prompts?"
- "Show me examples"
- "Explain few-shot learning"

Or explore:
📚 /prompts - Browse all prompts
🎯 /patterns - Learn techniques
📖 /learn - Guided pathways`;
}
