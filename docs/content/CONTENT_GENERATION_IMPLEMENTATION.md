# Content Generation Implementation Guide

**Date:** 2025-11-20  
**Status:** Ready to Build  
**Integration:** Uses MongoDB AI models from `aiModelService`

---

## Phase 1: Content Type Definitions (1 hour)

### File: `/src/lib/content/content-types.ts`

```typescript
/**
 * Content Type Definitions
 * Defines all content types with their configurations
 */

export interface ContentTypeConfig {
  id: string;
  name: string;
  description: string;
  targetWordCount: number;
  agents: ('seo' | 'sme' | 'agile' | 'editor')[];
  features: {
    codeExamples?: boolean;
    faqs?: boolean;
    internalLinks?: boolean;
    metaDescription?: boolean;
    images?: boolean;
    diagrams?: boolean;
  };
  estimatedCost: number;
  estimatedTime: number; // minutes
  recommendedModel: {
    seo?: string; // Model ID from MongoDB
    sme?: string;
    agile?: string;
    editor?: string;
  };
}

export const CONTENT_TYPES: Record<string, ContentTypeConfig> = {
  'pillar-page': {
    id: 'pillar-page',
    name: 'Pillar Page',
    description: 'SEO anchor page (8,000+ words)',
    targetWordCount: 8000,
    agents: ['seo', 'sme', 'agile', 'editor'],
    features: {
      codeExamples: true,
      faqs: true,
      internalLinks: true,
      metaDescription: true,
    },
    estimatedCost: 0.25,
    estimatedTime: 10,
    recommendedModel: {
      seo: 'gpt-4o-mini',
      sme: 'gpt-4o', // Higher quality for technical accuracy
      agile: 'gpt-4o-mini',
      editor: 'gpt-4o-mini',
    },
  },
  'hub-spoke': {
    id: 'hub-spoke',
    name: 'Hub & Spoke',
    description: '1 hub + 5-10 spokes',
    targetWordCount: 3000,
    agents: ['seo', 'sme', 'editor'],
    features: {
      internalLinks: true,
      metaDescription: true,
    },
    estimatedCost: 1.50,
    estimatedTime: 60,
    recommendedModel: {
      seo: 'gpt-4o-mini',
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'tutorial': {
    id: 'tutorial',
    name: 'Tutorial Article',
    description: 'Step-by-step guide (1,500-3,000 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
      images: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
    recommendedModel: {
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'guide': {
    id: 'guide',
    name: 'Guide Article',
    description: 'Comprehensive reference (2,000-4,000 words)',
    targetWordCount: 3000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
      faqs: true,
    },
    estimatedCost: 0.15,
    estimatedTime: 7,
    recommendedModel: {
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'news': {
    id: 'news',
    name: 'News Update',
    description: 'Short news/update (300-800 words)',
    targetWordCount: 500,
    agents: ['editor'],
    features: {},
    estimatedCost: 0.02,
    estimatedTime: 2,
    recommendedModel: {
      editor: 'gpt-4o-mini',
    },
  },
  'case-study': {
    id: 'case-study',
    name: 'Case Study',
    description: 'Real-world example (1,500-2,500 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      images: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
    recommendedModel: {
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'comparison': {
    id: 'comparison',
    name: 'Comparison Article',
    description: 'Compare tools/approaches (1,500-2,500 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
    recommendedModel: {
      sme: 'gpt-4o',
      editor: 'gpt-4o-mini',
    },
  },
  'best-practices': {
    id: 'best-practices',
    name: 'Best Practices',
    description: 'Actionable recommendations (1,000-2,000 words)',
    targetWordCount: 1500,
    agents: ['sme', 'agile', 'editor'],
    features: {
      codeExamples: true,
    },
    estimatedCost: 0.08,
    estimatedTime: 4,
    recommendedModel: {
      sme: 'gpt-4o-mini',
      agile: 'gpt-4o-mini',
      editor: 'gpt-4o-mini',
    },
  },
};

export function getContentType(id: string): ContentTypeConfig | undefined {
  return CONTENT_TYPES[id];
}

export function getAllContentTypes(): ContentTypeConfig[] {
  return Object.values(CONTENT_TYPES);
}
```

---

## Phase 2: AI Strategy Q&A Service (2 hours)

### File: `/src/lib/content/content-strategy-qa.ts`

```typescript
/**
 * Content Strategy Q&A Service
 * Uses MongoDB AI models to answer content strategy questions
 */

import { aiModelService } from '@/lib/services/AIModelService';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

interface StrategyQuestion {
  question: string;
  context?: string;
  modelId?: string; // Optional: specific model from MongoDB
}

interface StrategyAnswer {
  answer: string;
  recommendedContentType?: string;
  suggestedKeywords?: string[];
  suggestedOutline?: string;
  estimatedCost?: number;
  estimatedTime?: number;
}

export class ContentStrategyQA {
  /**
   * Get AI model from MongoDB and initialize chat client
   */
  private async getModelClient(modelId?: string) {
    // Get model from MongoDB
    const model = modelId 
      ? await aiModelService.findById(modelId)
      : await aiModelService.findOne({ 
          provider: 'openai', 
          id: 'gpt-4o',
          isAllowed: true 
        });

    if (!model) {
      throw new Error('No suitable AI model found');
    }

    // Initialize appropriate client based on provider
    switch (model.provider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: model.id,
          temperature: 0.7,
        });
      
      case 'anthropic':
        return new ChatAnthropic({
          modelName: model.id,
          temperature: 0.7,
        });
      
      case 'google':
        return new ChatGoogleGenerativeAI({
          modelName: model.id,
          temperature: 0.7,
        });
      
      default:
        throw new Error(`Provider ${model.provider} not supported`);
    }
  }

  /**
   * Answer content strategy question
   */
  async askQuestion(params: StrategyQuestion): Promise<StrategyAnswer> {
    const client = await this.getModelClient(params.modelId);

    const systemPrompt = `You are a content strategy expert for Engify.ai, a platform for AI-assisted software development.

Your job is to help admins decide:
1. What content type to use (Pillar Page, Hub & Spoke, Tutorial, Guide, News, Case Study, Comparison, Best Practices)
2. What keywords to target
3. What structure/outline to use
4. Estimated cost and time

Available content types:
- Pillar Page: 8,000 words, SEO anchor, $0.25, 10 min
- Hub & Spoke: 1 hub + 6 spokes, $1.50, 60 min
- Tutorial: 2,000 words, step-by-step, $0.10, 5 min
- Guide: 3,000 words, comprehensive, $0.15, 7 min
- News: 500 words, quick update, $0.02, 2 min
- Case Study: 2,000 words, real-world example, $0.10, 5 min
- Comparison: 2,000 words, tool comparison, $0.10, 5 min
- Best Practices: 1,500 words, actionable tips, $0.08, 4 min

Respond in JSON format:
{
  "answer": "explanation",
  "recommendedContentType": "pillar-page",
  "suggestedKeywords": ["primary keyword", "secondary keyword"],
  "suggestedOutline": "H1\\nH2\\nH2\\n...",
  "estimatedCost": 0.25,
  "estimatedTime": 10
}`;

    const userPrompt = `${params.question}${params.context ? `\n\nContext: ${params.context}` : ''}`;

    const response = await client.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON response
    try {
      const parsed = JSON.parse(response.content as string);
      return parsed;
    } catch (error) {
      // Fallback if not JSON
      return {
        answer: response.content as string,
      };
    }
  }

  /**
   * Get available AI models for Q&A
   */
  async getAvailableModels() {
    return await aiModelService.findAllowed();
  }
}

export const contentStrategyQA = new ContentStrategyQA();
```

---

## Phase 3: API Endpoint (1 hour)

### File: `/src/app/api/admin/content/strategy-qa/route.ts`

```typescript
/**
 * Content Strategy Q&A API
 * Allows admins to ask AI about content strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { contentStrategyQA } from '@/lib/content/content-strategy-qa';
import { z } from 'zod';

const StrategyQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  context: z.string().optional(),
  modelId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // RBAC: Admin only
  const r = await RBACPresets.requireAdmin()(request);
  if (r) return r;

  try {
    const body = await request.json();
    const validated = StrategyQuestionSchema.parse(body);

    // Ask AI
    const answer = await contentStrategyQA.askQuestion(validated);

    return NextResponse.json({
      success: true,
      ...answer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Content strategy Q&A error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to answer question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET: Get available models
export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireAdmin()(request);
  if (r) return r;

  try {
    const models = await contentStrategyQA.getAvailableModels();

    return NextResponse.json({
      success: true,
      models: models.map(m => ({
        id: m.id,
        name: m.displayName,
        provider: m.provider,
        cost: {
          input: m.costPer1kInputTokens,
          output: m.costPer1kOutputTokens,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
```

---

## Phase 4: Update ContentGeneratorPanel (3 hours)

### File: `/src/components/admin/ContentGeneratorPanel.tsx`

**Changes:**
1. Add content type selector
2. Add AI Q&A section
3. Show type-specific options
4. Integrate with MongoDB AI models

```typescript
// Add to existing component

const [contentType, setContentType] = useState<string>('tutorial');
const [aiQuestion, setAiQuestion] = useState('');
const [aiAnswer, setAiAnswer] = useState<any>(null);
const [askingAI, setAskingAI] = useState(false);
const [availableModels, setAvailableModels] = useState<any[]>([]);
const [selectedModel, setSelectedModel] = useState<string>('');

// Load available AI models
useEffect(() => {
  async function loadModels() {
    try {
      const response = await fetch('/api/admin/content/strategy-qa');
      const data = await response.json();
      if (data.success) {
        setAvailableModels(data.models);
        setSelectedModel(data.models[0]?.id || '');
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }
  loadModels();
}, []);

// Ask AI question
const handleAskAI = async () => {
  try {
    setAskingAI(true);
    const response = await fetch('/api/admin/content/strategy-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: aiQuestion,
        modelId: selectedModel,
      }),
    });

    const data = await response.json();
    if (data.success) {
      setAiAnswer(data);
      
      // Auto-fill form with recommendations
      if (data.recommendedContentType) {
        setContentType(data.recommendedContentType);
      }
      if (data.suggestedKeywords) {
        setKeywords(data.suggestedKeywords.join(', '));
      }
    }
  } catch (error) {
    console.error('Error asking AI:', error);
    toast({
      title: 'Error',
      description: 'Failed to get AI answer',
      variant: 'destructive',
    });
  } finally {
    setAskingAI(false);
  }
};

// Add to UI
<Tabs defaultValue="generate">
  <TabsList>
    <TabsTrigger value="strategy">Content Strategy</TabsTrigger>
    <TabsTrigger value="generate">Generate Content</TabsTrigger>
    <TabsTrigger value="status">Job Status</TabsTrigger>
  </TabsList>

  <TabsContent value="strategy">
    <Card>
      <CardHeader>
        <CardTitle>AI Content Strategy Assistant</CardTitle>
        <CardDescription>
          Ask AI about content strategy before generating
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model Selector */}
        <div className="space-y-2">
          <Label>AI Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Input */}
        <div className="space-y-2">
          <Label>Ask AI</Label>
          <Textarea
            placeholder="What content type should I use for 'AI in Agile'?"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={handleAskAI} disabled={askingAI || !aiQuestion}>
          {askingAI ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Asking AI...
            </>
          ) : (
            <>
              <Icons.sparkles className="mr-2 h-4 w-4" />
              Ask AI
            </>
          )}
        </Button>

        {/* AI Answer */}
        {aiAnswer && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2">AI Recommendation:</h4>
            <p className="text-sm mb-4">{aiAnswer.answer}</p>
            
            {aiAnswer.recommendedContentType && (
              <div className="space-y-2 text-sm">
                <div><strong>Content Type:</strong> {aiAnswer.recommendedContentType}</div>
                <div><strong>Keywords:</strong> {aiAnswer.suggestedKeywords?.join(', ')}</div>
                <div><strong>Estimated Cost:</strong> ${aiAnswer.estimatedCost}</div>
                <div><strong>Estimated Time:</strong> {aiAnswer.estimatedTime} min</div>
              </div>
            )}

            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => {
                // Switch to generate tab with pre-filled data
                // Implementation depends on tab state management
              }}
            >
              Use These Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  </TabsContent>

  <TabsContent value="generate">
    {/* Existing generate UI + content type selector */}
    <div className="space-y-2">
      <Label>Content Type</Label>
      <Select value={contentType} onValueChange={setContentType}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getAllContentTypes().map(type => (
            <SelectItem key={type.id} value={type.id}>
              {type.name} - {type.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {/* Rest of existing UI */}
  </TabsContent>
</Tabs>
```

---

## Summary

**Total Implementation Time:** 7-9 hours

**Phase Breakdown:**
1. Content types (1 hour)
2. AI Q&A service (2 hours)
3. API endpoint (1 hour)
4. UI updates (3-4 hours)

**Integration Points:**
- ✅ Uses MongoDB AI models via `aiModelService`
- ✅ Extends existing ContentGeneratorPanel
- ✅ Reuses existing job queue
- ✅ Maintains RBAC (admin only)

**Next Step:** Start with Phase 1 (content type definitions)?
