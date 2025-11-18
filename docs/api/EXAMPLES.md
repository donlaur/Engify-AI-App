# Engify API - Code Examples

Complete, runnable code examples for integrating with the Engify AI API across different languages and frameworks.

## Table of Contents

- [JavaScript/TypeScript](#javascripttypescript)
- [Python](#python)
- [cURL](#curl)
- [React Integration](#react-integration)
- [Next.js Integration](#nextjs-integration)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Testing](#testing)

---

## JavaScript/TypeScript

### Basic Chat Request

```typescript
import fetch from 'node-fetch';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  message: string;
  sources: Array<{ title: string; score: number }>;
  usedRAG: boolean;
}

async function sendChatMessage(
  messages: ChatMessage[],
  useRAG: boolean = true
): Promise<ChatResponse> {
  const response = await fetch('https://engify.ai/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for session cookies
    body: JSON.stringify({
      messages,
      useRAG,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Chat request failed');
  }

  return await response.json();
}

// Usage
const response = await sendChatMessage([
  { role: 'user', content: 'What is chain of thought prompting?' },
]);

console.log(response.message);
console.log('Sources:', response.sources);
```

### Get Patterns with Filtering

```typescript
interface Pattern {
  id: string;
  name: string;
  category: 'FOUNDATIONAL' | 'STRUCTURAL' | 'COGNITIVE' | 'ITERATIVE';
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

interface PatternsResponse {
  success: boolean;
  data: Pattern[];
  count: number;
}

async function getPatterns(
  category?: string,
  level?: string
): Promise<Pattern[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (level) params.append('level', level);

  const url = `https://engify.ai/api/patterns${
    params.toString() ? `?${params}` : ''
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch patterns');
  }

  const result: PatternsResponse = await response.json();
  return result.data;
}

// Usage
const cognitivePatterns = await getPatterns('COGNITIVE', 'intermediate');
console.log(`Found ${cognitivePatterns.length} patterns`);

cognitivePatterns.forEach((pattern) => {
  console.log(`- ${pattern.name}: ${pattern.description}`);
});
```

### Submit Rating with Dimensions

```typescript
interface RatingDimensions {
  clarity?: number;
  usefulness?: number;
  completeness?: number;
  accuracy?: number;
}

interface SubmitRatingRequest {
  promptId: string;
  rating: number;
  dimensions?: RatingDimensions;
  usageContext?: {
    aiModel?: string;
    useCase?: string;
  };
  comment?: string;
  tags?: string[];
  suggestedImprovements?: string[];
}

async function submitRating(
  ratingData: SubmitRatingRequest
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('https://engify.ai/api/feedback/rating', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(ratingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit rating');
  }

  return await response.json();
}

// Usage
await submitRating({
  promptId: 'prompt_123',
  rating: 5,
  dimensions: {
    clarity: 5,
    usefulness: 5,
    completeness: 4,
    accuracy: 5,
  },
  usageContext: {
    aiModel: 'gpt-4',
    useCase: 'code generation',
  },
  comment: 'Excellent prompt for generating React components!',
  tags: ['react', 'frontend'],
  suggestedImprovements: ['Add TypeScript examples'],
});
```

### AI Execution (Multi-Provider)

```typescript
interface AIExecutionRequest {
  prompt: string;
  provider?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIExecutionResponse {
  success: boolean;
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency: number;
  provider: string;
  model: string;
}

async function executeAI(
  request: AIExecutionRequest
): Promise<AIExecutionResponse> {
  const response = await fetch('https://engify.ai/api/v2/ai/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'AI execution failed');
  }

  return await response.json();
}

// Usage - OpenAI
const openaiResult = await executeAI({
  prompt: 'Write a Python function to calculate fibonacci numbers',
  provider: 'openai',
  temperature: 0.7,
  maxTokens: 500,
});

console.log('Response:', openaiResult.response);
console.log('Cost:', `$${openaiResult.cost.total}`);
console.log('Latency:', `${openaiResult.latency}ms`);

// Usage - Claude
const claudeResult = await executeAI({
  prompt: 'Explain quantum computing in simple terms',
  provider: 'claude',
  systemPrompt: 'You are a physics professor. Explain concepts clearly.',
  temperature: 0.5,
  maxTokens: 1000,
});
```

---

## Python

### Basic Chat Request

```python
import requests
from typing import List, Dict, Optional

class EngifyClient:
    def __init__(self, base_url: str = "https://engify.ai/api"):
        self.base_url = base_url
        self.session = requests.Session()

    def send_chat_message(
        self,
        messages: List[Dict[str, str]],
        use_rag: bool = True
    ) -> Dict:
        """
        Send a chat message to Engify AI.

        Args:
            messages: List of message dicts with 'role' and 'content'
            use_rag: Enable RAG for context retrieval

        Returns:
            Response dict with 'message', 'sources', and 'usedRAG'

        Example:
            >>> client = EngifyClient()
            >>> response = client.send_chat_message([
            ...     {"role": "user", "content": "What is few-shot learning?"}
            ... ])
            >>> print(response["message"])
        """
        url = f"{self.base_url}/chat"
        payload = {
            "messages": messages,
            "useRAG": use_rag
        }

        response = self.session.post(url, json=payload)
        response.raise_for_status()

        return response.json()

# Usage
client = EngifyClient()

response = client.send_chat_message([
    {"role": "user", "content": "What is chain of thought prompting?"}
])

print(response["message"])
print(f"Used RAG: {response['usedRAG']}")
print(f"Sources: {len(response['sources'])}")
```

### Get Patterns

```python
from typing import Optional, List

def get_patterns(
    category: Optional[str] = None,
    level: Optional[str] = None
) -> List[Dict]:
    """
    Fetch patterns from Engify AI.

    Args:
        category: Filter by category (FOUNDATIONAL, STRUCTURAL, COGNITIVE, ITERATIVE)
        level: Filter by level (beginner, intermediate, advanced)

    Returns:
        List of pattern dictionaries
    """
    url = "https://engify.ai/api/patterns"
    params = {}

    if category:
        params["category"] = category
    if level:
        params["level"] = level

    response = requests.get(url, params=params)
    response.raise_for_status()

    result = response.json()
    return result["data"]

# Usage
cognitive_patterns = get_patterns(category="COGNITIVE", level="intermediate")

for pattern in cognitive_patterns:
    print(f"- {pattern['name']}: {pattern['description']}")
```

### Submit Rating

```python
def submit_rating(
    prompt_id: str,
    rating: int,
    dimensions: Optional[Dict[str, int]] = None,
    usage_context: Optional[Dict[str, str]] = None,
    comment: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> Dict:
    """
    Submit a rating for a prompt.

    Args:
        prompt_id: Prompt ID
        rating: Overall rating (1-5)
        dimensions: Multi-dimensional ratings
        usage_context: Context of usage (aiModel, useCase)
        comment: Optional comment
        tags: Tags for categorization

    Returns:
        Success response
    """
    url = "https://engify.ai/api/feedback/rating"

    payload = {
        "promptId": prompt_id,
        "rating": rating,
    }

    if dimensions:
        payload["dimensions"] = dimensions
    if usage_context:
        payload["usageContext"] = usage_context
    if comment:
        payload["comment"] = comment
    if tags:
        payload["tags"] = tags

    response = requests.post(url, json=payload)
    response.raise_for_status()

    return response.json()

# Usage
result = submit_rating(
    prompt_id="prompt_123",
    rating=5,
    dimensions={
        "clarity": 5,
        "usefulness": 5,
        "completeness": 4,
        "accuracy": 5
    },
    usage_context={
        "aiModel": "gpt-4",
        "useCase": "code generation"
    },
    comment="Excellent prompt!",
    tags=["react", "frontend"]
)

print(result["message"])
```

### AI Execution

```python
def execute_ai(
    prompt: str,
    provider: str = "openai",
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 2000
) -> Dict:
    """
    Execute AI request with specified provider.

    Args:
        prompt: User prompt
        provider: AI provider (openai, claude, gemini, groq, replicate)
        system_prompt: System prompt
        temperature: Sampling temperature (0-2)
        max_tokens: Maximum tokens to generate

    Returns:
        Response with AI output, usage, cost, and latency
    """
    url = "https://engify.ai/api/v2/ai/execute"

    payload = {
        "prompt": prompt,
        "provider": provider,
        "temperature": temperature,
        "maxTokens": max_tokens
    }

    if system_prompt:
        payload["systemPrompt"] = system_prompt

    response = requests.post(url, json=payload)
    response.raise_for_status()

    return response.json()

# Usage
result = execute_ai(
    prompt="Write a Python function to calculate fibonacci numbers",
    provider="openai",
    temperature=0.7,
    max_tokens=500
)

print(f"Response: {result['response']}")
print(f"Cost: ${result['cost']['total']}")
print(f"Latency: {result['latency']}ms")
print(f"Tokens: {result['usage']['totalTokens']}")
```

---

## cURL

### Chat Request

```bash
curl -X POST https://engify.ai/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What is chain of thought prompting?"
      }
    ],
    "useRAG": true
  }'
```

### Get Patterns

```bash
# Get all patterns
curl https://engify.ai/api/patterns

# Get cognitive patterns
curl https://engify.ai/api/patterns?category=COGNITIVE

# Get beginner patterns
curl https://engify.ai/api/patterns?level=beginner

# Get cognitive beginner patterns
curl https://engify.ai/api/patterns?category=COGNITIVE&level=beginner
```

### Submit Rating

```bash
curl -X POST https://engify.ai/api/feedback/rating \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "promptId": "prompt_123",
    "rating": 5,
    "dimensions": {
      "clarity": 5,
      "usefulness": 5,
      "completeness": 4,
      "accuracy": 5
    },
    "usageContext": {
      "aiModel": "gpt-4",
      "useCase": "code generation"
    },
    "comment": "Excellent prompt!",
    "tags": ["react", "frontend"]
  }'
```

### AI Execution

```bash
curl -X POST https://engify.ai/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "prompt": "Write a Python function to calculate fibonacci numbers",
    "provider": "openai",
    "temperature": 0.7,
    "maxTokens": 500
  }'
```

---

## React Integration

### Custom Hook for Chat

```typescript
import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatSource {
  title: string;
  score: number;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<ChatSource[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    const newMessage: Message = { role: 'user', content };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: updatedMessages,
          useRAG: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: data.message },
      ]);
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    error,
    sources,
    sendMessage,
  };
}

// Usage in component
function ChatComponent() {
  const { messages, isLoading, error, sources, sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
    sendMessage(input.value);
    input.value = '';
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="sources">
          <h3>Sources:</h3>
          {sources.map((source, idx) => (
            <div key={idx}>{source.title}</div>
          ))}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input name="message" disabled={isLoading} />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

### Custom Hook for Patterns

```typescript
import { useState, useEffect } from 'react';

interface Pattern {
  id: string;
  name: string;
  category: string;
  level: string;
  description: string;
}

export function usePatterns(category?: string, level?: string) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatterns = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (level) params.append('level', level);

        const url = `/api/patterns${params.toString() ? `?${params}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch patterns');
        }

        const result = await response.json();
        setPatterns(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatterns();
  }, [category, level]);

  return { patterns, isLoading, error };
}

// Usage in component
function PatternsComponent() {
  const { patterns, isLoading, error } = usePatterns('COGNITIVE', 'intermediate');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Patterns ({patterns.length})</h2>
      {patterns.map((pattern) => (
        <div key={pattern.id}>
          <h3>{pattern.name}</h3>
          <p>{pattern.description}</p>
          <span>Level: {pattern.level}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Next.js Integration

### Server-Side Rendering (SSR)

```typescript
// pages/patterns/[category].tsx
import { GetServerSideProps } from 'next';

interface Pattern {
  id: string;
  name: string;
  description: string;
}

interface Props {
  patterns: Pattern[];
  category: string;
}

export default function CategoryPage({ patterns, category }: Props) {
  return (
    <div>
      <h1>{category} Patterns</h1>
      {patterns.map((pattern) => (
        <div key={pattern.id}>
          <h2>{pattern.name}</h2>
          <p>{pattern.description}</p>
        </div>
      ))}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { category } = context.params!;

  const response = await fetch(
    `https://engify.ai/api/patterns?category=${category}`
  );

  if (!response.ok) {
    return { notFound: true };
  }

  const result = await response.json();

  return {
    props: {
      patterns: result.data,
      category: category as string,
    },
  };
};
```

### API Route Handler

```typescript
// app/api/custom-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Call Engify Chat API
    const response = await fetch('https://engify.ai/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    const data = await response.json();

    // Add custom processing here
    // ...

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Error Handling

### Comprehensive Error Handler

```typescript
class EngifyAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'EngifyAPIError';
  }
}

async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const resetAt = response.headers.get('X-RateLimit-Reset');

      throw new EngifyAPIError(
        `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED',
        { retryAfter, resetAt }
      );
    }

    // Handle unauthorized
    if (response.status === 401) {
      throw new EngifyAPIError(
        'Unauthorized. Please sign in.',
        401,
        'UNAUTHORIZED'
      );
    }

    // Handle forbidden
    if (response.status === 403) {
      throw new EngifyAPIError(
        'Forbidden. Insufficient permissions.',
        403,
        'FORBIDDEN'
      );
    }

    // Parse error response
    if (!response.ok) {
      const error = await response.json();
      throw new EngifyAPIError(
        error.message || 'API request failed',
        response.status,
        error.error,
        error.details
      );
    }

    return await response.json();
  } catch (error) {
    // Re-throw EngifyAPIError
    if (error instanceof EngifyAPIError) {
      throw error;
    }

    // Network error
    if (error instanceof TypeError) {
      throw new EngifyAPIError(
        'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    // Unknown error
    throw new EngifyAPIError(
      error instanceof Error ? error.message : 'Unknown error',
      500,
      'UNKNOWN_ERROR'
    );
  }
}

// Usage
try {
  const response = await apiRequest('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [...] }),
  });
} catch (error) {
  if (error instanceof EngifyAPIError) {
    console.error(`Error ${error.code}: ${error.message}`);

    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      // Handle rate limit
      const { retryAfter } = error.details as { retryAfter: string };
      console.log(`Retry after ${retryAfter} seconds`);
    }
  }
}
```

---

## Rate Limiting

### Rate Limit Handler with Retry

```typescript
async function makeRequestWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Check rate limit headers
      const limit = response.headers.get('X-RateLimit-Limit');
      const remaining = response.headers.get('X-RateLimit-Remaining');

      console.log(`Rate limit: ${remaining}/${limit} remaining`);

      // Warn if low on requests
      if (remaining && parseInt(remaining) < 10) {
        console.warn('Low rate limit! Consider slowing down requests.');
      }

      // Handle rate limit
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000
          : Math.pow(2, attempt) * 1000; // Exponential backoff

        console.log(`Rate limited. Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${maxRetries})`);

        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      // Don't retry on other errors
      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
const response = await makeRequestWithRetry('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [...] }),
});
```

---

## Testing

### Jest Test Examples

```typescript
import { describe, it, expect, jest } from '@jest/globals';

describe('Engify API - Chat', () => {
  it('should send a chat message successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          message: 'Test response',
          sources: [],
          usedRAG: false,
        }),
      })
    ) as jest.Mock;

    const response = await sendChatMessage([
      { role: 'user', content: 'Test message' },
    ]);

    expect(response.message).toBe('Test response');
    expect(fetch).toHaveBeenCalledWith(
      'https://engify.ai/api/chat',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('should handle rate limit errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        headers: {
          get: (name: string) => {
            if (name === 'Retry-After') return '60';
            if (name === 'X-RateLimit-Reset') return '2025-11-17T15:30:00.000Z';
            return null;
          },
        },
        json: async () => ({
          error: 'free_trial_limit_reached',
          message: 'Rate limit exceeded',
        }),
      })
    ) as jest.Mock;

    await expect(
      sendChatMessage([{ role: 'user', content: 'Test' }])
    ).rejects.toThrow('Rate limit exceeded');
  });
});
```

---

## Support

For more examples and documentation:

- **API Reference**: [/docs/api/API.md](/docs/api/API.md)
- **OpenAPI Spec**: [/docs/api/openapi.yaml](/docs/api/openapi.yaml)
- **GitHub**: [github.com/donlaur/Engify-AI-App](https://github.com/donlaur/Engify-AI-App)

**Questions?** Contact: donlaur@engify.ai
