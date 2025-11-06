# AI Model Metadata APIs - Research Summary

## Overview

Yes, there are several APIs/services that aggregate AI model data across providers. Here are the best options:

## 1. OpenRouter API (RECOMMENDED) ⭐

**Endpoint**: `GET https://openrouter.ai/api/v1/models`

**Features**:
- ✅ **500+ models** from 60+ providers
- ✅ **Unified pricing** (prompt, completion, request, image tokens)
- ✅ **Context length** and **max completion tokens**
- ✅ **Modalities** (input/output: text, image, audio, video)
- ✅ **Supported parameters** (temperature, top_p, tools, etc.)
- ✅ **Architecture details** (tokenizer, instruct_type)
- ✅ **Provider information** (top_provider, moderation status)
- ✅ **Free tier** available (no API key required for basic usage)
- ✅ **RSS feed** option for model updates

**Response Structure**:
```json
{
  "data": [
    {
      "id": "openai/gpt-4",
      "canonical_slug": "openai/gpt-4",
      "name": "GPT-4",
      "created": 1692901234,
      "pricing": {
        "prompt": "0.00003",
        "completion": "0.00006",
        "request": "0",
        "image": "0"
      },
      "context_length": 8192,
      "architecture": {
        "modality": "text->text",
        "input_modalities": ["text"],
        "output_modalities": ["text"],
        "tokenizer": "GPT",
        "instruct_type": "chatml"
      },
      "top_provider": {
        "is_moderated": true,
        "context_length": 8192,
        "max_completion_tokens": 4096
      },
      "supported_parameters": ["temperature", "top_p", "max_tokens", ...],
      "description": "GPT-4 is a large multimodal model..."
    }
  ]
}
```

**Documentation**: https://openrouter.ai/docs/api-reference/models/get-models

**Pros**:
- Most comprehensive (500+ models)
- Real-time pricing updates
- Includes metadata we need (modalities, parameters, pricing)
- Free tier available
- Well-maintained and actively updated

**Cons**:
- Requires API key for full access (free tier available)
- Pricing is OpenRouter's pricing (may differ from direct provider pricing)
- Some models may not have all metadata fields populated

## 2. Other Aggregator Services

### Mori API
- **50+ models** from OpenAI, Anthropic, Google
- Enterprise features (analytics, routing, security)
- Requires paid subscription

### Eden AI
- Single API for multiple providers
- Text, vision, audio, translation categories
- Model comparison and monitoring tools
- Requires subscription

### Together AI / Replicate
- Model hosting platforms
- Some have model lists but less comprehensive metadata
- Focus on inference, not metadata aggregation

## Recommendation: Use OpenRouter API

**Why OpenRouter**:
1. **Most comprehensive**: 500+ models vs ~50-100 for others
2. **Rich metadata**: Includes all fields we need (pricing, modalities, parameters, context length)
3. **Free tier**: Can test without significant cost
4. **Well-documented**: Clear API documentation
5. **Actively maintained**: Regular updates as new models launch

## Implementation Strategy

### Option A: Primary Source (OpenRouter)
- Use OpenRouter `/api/v1/models` as primary source
- Sync models periodically (daily cron job)
- Map OpenRouter data to our `AIModel` schema
- Fallback to provider-specific APIs for missing data

### Option B: Hybrid Approach
- Use OpenRouter for discovery and initial metadata
- Use provider-specific APIs (OpenAI, Anthropic, Google) for:
  - Official pricing (OpenRouter may add markup)
  - Detailed capabilities (e.g., OpenAI's detailed model pages)
  - Rate limits and tier information
  - Snapshots and versioning

### Option C: Current Approach + OpenRouter Enhancement
- Keep current provider-specific syncing
- Use OpenRouter to:
  - Discover new models we haven't added yet
  - Verify/cross-reference pricing
  - Fill in missing metadata fields
  - Get standardized modality/parameter information

## Next Steps

1. **Test OpenRouter API**: Verify it returns quality data for our use case
2. **Create Sync Script**: Build script to fetch from OpenRouter and map to our schema
3. **Compare Data Quality**: Compare OpenRouter data vs provider-specific APIs
4. **Hybrid Implementation**: Use OpenRouter as primary, providers as fallback/verification

## Code Example

```typescript
// Fetch models from OpenRouter
async function syncFromOpenRouter() {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
  });
  
  const { data } = await response.json();
  
  // Map to our schema
  const models = data.map((model: OpenRouterModel) => ({
    id: model.id,
    slug: model.canonical_slug,
    provider: extractProvider(model.id), // 'openai', 'anthropic', etc.
    name: model.name,
    displayName: model.name,
    contextWindow: model.context_length,
    maxOutputTokens: model.top_provider?.max_completion_tokens,
    costPer1kInputTokens: parseFloat(model.pricing.prompt) * 1000,
    costPer1kOutputTokens: parseFloat(model.pricing.completion) * 1000,
    capabilities: [
      ...model.architecture.input_modalities,
      ...model.architecture.output_modalities,
      ...(model.supported_parameters.includes('tools') ? ['function-calling'] : []),
    ],
    supportsVision: model.architecture.input_modalities.includes('image'),
    supportsStreaming: true, // Most models support streaming
    supportsJSON: model.supported_parameters.includes('response_format'),
    // ... map other fields
  }));
  
  return models;
}
```

## Caveats

1. **Pricing**: OpenRouter pricing may include markup - verify against official provider pricing
2. **Missing Fields**: Some models may not have complete metadata (e.g., knowledge cutoff, snapshots)
3. **Rate Limits**: OpenRouter API has rate limits - need to handle gracefully
4. **Data Freshness**: Need to sync regularly to catch new models/pricing changes

## Conclusion

**OpenRouter API is the best option** for unified model metadata across providers. It provides the most comprehensive, standardized data structure and is actively maintained. We should use it as our primary source for model discovery and metadata, with provider-specific APIs as a fallback for detailed, official information.

