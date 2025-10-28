import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Use OpenAI to generate response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant for Engify.ai, a prompt engineering education platform. 
          
You help users:
- Find the right prompts from our library of 66+ expert prompts
- Learn about 15 proven prompt patterns (Persona, Few-Shot, Chain-of-Thought, etc.)
- Understand best practices for AI-assisted coding
- Navigate our learning pathways

Be concise, friendly, and always reference our content when relevant.
Suggest specific pages: /library, /patterns, /learn, /ai-coding, /mcp`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response =
      completion.choices[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    return NextResponse.json({
      message: response,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    // Fallback to knowledge-based response if OpenAI fails
    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1]?.content || '';
    const response = generateKnowledgeResponse(lastMessage);

    return NextResponse.json({
      message: response,
    });
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

    role: `**Role Prompting** defines who the AI should be!

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
