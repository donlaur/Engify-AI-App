/**
 * Content Strategy Q&A Service
 * Uses MongoDB AI models to answer content strategy questions
 */

import { aiModelService } from '@/lib/services/AIModelService';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { CONTENT_TYPES } from './content-types';

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
          model: model.id,
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

    // Build content type descriptions
    const contentTypeDescriptions = Object.values(CONTENT_TYPES)
      .map(type => `- ${type.name}: ${type.description} (${type.targetWordCount} words, $${type.estimatedCost}, ${type.estimatedTime} min)`)
      .join('\n');

    const systemPrompt = `You are a content strategy expert for Engify.ai, a platform for AI-assisted software development.

Your job is to help admins decide:
1. What content type to use
2. What keywords to target
3. What structure/outline to use
4. Estimated cost and time

Available content types:
${contentTypeDescriptions}

Respond in JSON format:
{
  "answer": "Brief explanation of your recommendation",
  "recommendedContentType": "pillar-page",
  "suggestedKeywords": ["primary keyword", "secondary keyword"],
  "suggestedOutline": "H1: Title\\nH2: Section 1\\nH2: Section 2\\n...",
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
      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      // Fallback if not JSON
      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      return {
        answer: content,
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
