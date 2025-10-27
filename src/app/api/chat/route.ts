import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // TODO: Replace with actual LLM API call (OpenAI, Anthropic, etc.)
    // For now, return intelligent mock responses based on our content
    
    const response = generateKnowledgeResponse(message);

    return NextResponse.json({
      message: response,
      sources: getSources(message),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

function generateKnowledgeResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

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

🎯 67+ examples in /library`,

    'role': `**Role Prompting** defines who the AI should be!

**Pattern:**
"You are a [role] with expertise in [domain]..."

**Examples:**
• "You are a senior software architect..."
• "You are a technical writer for developers..."
• "You are a code reviewer focusing on security..."

**Impact:** More relevant, contextual responses

👥 See role-based prompts in /library`,
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
📚 /library - Browse all prompts
🎯 /patterns - Learn techniques
📖 /learn - Guided pathways`;
}

function getSources(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const sources: string[] = [];

  if (lowerQuery.includes('pattern')) {
    sources.push('/patterns');
  }
  if (lowerQuery.includes('example') || lowerQuery.includes('prompt')) {
    sources.push('/library');
  }
  if (lowerQuery.includes('learn') || lowerQuery.includes('guide')) {
    sources.push('/learn');
  }

  return sources.length > 0 ? sources : ['/library', '/patterns'];
}
