# AI Providers Guide

**Date**: 2025-10-27
**Status**: ✅ Complete
**Providers**: 7 (OpenAI, Anthropic, Google, Perplexity, Groq, Together, Mistral)

---

## 🎯 **Supported Providers**

### 1. **OpenAI** (ChatGPT)
- **Models**: GPT-4o Mini, GPT-3.5 Turbo
- **Best For**: General chat, code generation
- **Pricing**: $0.15-$0.60 per 1M tokens
- **API Key**: `OPENAI_API_KEY`
- **Website**: https://platform.openai.com

### 2. **Anthropic** (Claude)
- **Models**: Claude 3 Haiku, Claude 3.5 Sonnet
- **Best For**: Analysis, long context, coding
- **Pricing**: $0.25-$15 per 1M tokens
- **API Key**: `ANTHROPIC_API_KEY`
- **Website**: https://console.anthropic.com

### 3. **Google** (Gemini)
- **Models**: Gemini 1.5 Flash, Gemini 1.5 Pro
- **Best For**: Multimodal, huge context (2M tokens!)
- **Pricing**: $0.075-$5 per 1M tokens
- **API Key**: `GOOGLE_API_KEY`
- **Website**: https://ai.google.dev
- **FREE TIER**: Available!

### 4. **Perplexity**
- **Models**: Sonar Small Online
- **Best For**: Search-augmented responses
- **Pricing**: $0.20 per 1M tokens
- **API Key**: `PERPLEXITY_API_KEY`
- **Website**: https://www.perplexity.ai/settings/api
- **Special**: Built-in web search!

### 5. **Groq** ⚡ FASTEST
- **Models**: Llama 3.1 8B, Llama 3.1 70B
- **Best For**: Speed, real-time chat
- **Pricing**: $0.05-$0.79 per 1M tokens
- **API Key**: `GROQ_API_KEY`
- **Website**: https://console.groq.com
- **FREE TIER**: Available!
- **Speed**: 500+ tokens/second!

### 6. **Together AI**
- **Models**: Mixtral 8x7B, open source models
- **Best For**: Open source, customization
- **Pricing**: $0.60 per 1M tokens
- **API Key**: `TOGETHER_API_KEY`
- **Website**: https://api.together.xyz

### 7. **Mistral AI**
- **Models**: Mistral Small
- **Best For**: European alternative, privacy
- **Pricing**: $1-$3 per 1M tokens
- **API Key**: `MISTRAL_API_KEY`
- **Website**: https://console.mistral.ai

---

## 💰 **Cost Comparison**

### Cheapest Options (Free/Affordable)
1. **Groq Llama 3.1 8B**: $0.05/$0.08 per 1M tokens ⭐ FREE TIER
2. **Google Gemini Flash**: $0.075/$0.30 per 1M tokens ⭐ FREE TIER
3. **OpenAI GPT-4o Mini**: $0.15/$0.60 per 1M tokens
4. **Perplexity Sonar**: $0.20/$0.20 per 1M tokens
5. **Anthropic Claude Haiku**: $0.25/$1.25 per 1M tokens

### Best Value
- **Chat**: Groq Llama 3.1 8B (fastest + cheapest)
- **Code**: GPT-4o Mini or Claude 3.5 Sonnet
- **Analysis**: Claude 3.5 Sonnet or Gemini Pro
- **Search**: Perplexity Sonar (built-in search)

---

## 🚀 **Quick Start**

### 1. Get API Keys

```bash
# Add to .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
PERPLEXITY_API_KEY=pplx-...
GROQ_API_KEY=gsk_...
TOGETHER_API_KEY=...
MISTRAL_API_KEY=...
```

### 2. Send Request

```typescript
import { sendAIRequest } from '@/lib/ai/client';

const response = await sendAIRequest({
  model: 'gpt-4o-mini',
  prompt: 'Explain prompt engineering',
  systemPrompt: 'You are a helpful AI assistant',
  temperature: 0.7,
  maxTokens: 1000,
});

console.log(response.content);
console.log('Cost:', response.cost.total);
console.log('Latency:', response.latency, 'ms');
```

### 3. Parse Response

```typescript
import { parseAIResponse } from '@/lib/ai/response-parser';

const parsed = parseAIResponse(rawResponse, 'openai');

console.log('Content:', parsed.content);
console.log('Format:', parsed.format); // 'text', 'json', 'xml', 'markdown'
console.log('Tokens:', parsed.metadata?.tokens);
```

---

## 📊 **Model Selection**

### By Use Case

```typescript
import { getRecommendedModels } from '@/lib/ai/providers';

// Get recommended models for chat
const chatModels = getRecommendedModels('chat');
// Returns: GPT-4o Mini, Claude Haiku, Gemini Flash, Groq Llama 8B

// Get recommended models for code
const codeModels = getRecommendedModels('code');
// Returns: GPT-4o Mini, Claude 3.5 Sonnet, Groq Llama 70B

// Get recommended models for analysis
const analysisModels = getRecommendedModels('analysis');
// Returns: Claude 3.5 Sonnet, GPT-4o Mini, Gemini Pro
```

### By Budget

```typescript
import { getModelsByTier, getCheapestModel } from '@/lib/ai/providers';

// Get free tier models
const freeModels = getModelsByTier('free');
// Returns: Groq Llama 3.1 8B

// Get affordable models
const affordableModels = getModelsByTier('affordable');
// Returns: GPT-4o Mini, Claude Haiku, Gemini Flash, etc.

// Get cheapest model
const cheapest = getCheapestModel();
// Returns: Groq Llama 3.1 8B
```

---

## 🎨 **Response Formats**

### Text (Default)
```typescript
const response = await sendAIRequest({
  model: 'gpt-4o-mini',
  prompt: 'Hello!',
});
// Returns plain text
```

### JSON
```typescript
const response = await sendAIRequest({
  model: 'gpt-4o-mini',
  prompt: 'Return user data as JSON',
  format: 'json',
});

const data = JSON.parse(response.content);
```

### XML
```typescript
import { extractXML, parseXMLToObject } from '@/lib/ai/response-parser';

const xml = extractXML(response.content);
const obj = parseXMLToObject(xml);
```

### Markdown
```typescript
// Automatically detected
const response = await sendAIRequest({
  model: 'claude-3-haiku',
  prompt: 'Write a markdown document',
});

if (response.parsed.format === 'markdown') {
  // Render as markdown
}
```

---

## 🔧 **Advanced Features**

### Streaming (Future)
```typescript
const stream = await sendAIRequest({
  model: 'gpt-4o-mini',
  prompt: 'Write a story',
  stream: true,
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

### Temperature Control
```typescript
// Creative (high temperature)
const creative = await sendAIRequest({
  model: 'claude-3-5-sonnet',
  prompt: 'Write a poem',
  temperature: 0.9,
});

// Precise (low temperature)
const precise = await sendAIRequest({
  model: 'gpt-4o-mini',
  prompt: 'Extract data',
  temperature: 0.1,
});
```

### Max Tokens
```typescript
const response = await sendAIRequest({
  model: 'gemini-1.5-flash',
  prompt: 'Summarize this document',
  maxTokens: 500, // Limit response length
});
```

---

## 📈 **Cost Tracking**

```typescript
const response = await sendAIRequest({
  model: 'gpt-4o-mini',
  prompt: 'Hello!',
});

console.log('Cost Breakdown:');
console.log('Input:', response.cost.input);
console.log('Output:', response.cost.output);
console.log('Total:', response.cost.total);
console.log('Tokens:', response.parsed.metadata?.tokens);
```

---

## 🎯 **Best Practices**

### 1. Start with Free Tier
```typescript
// Use Groq for development
const model = 'groq-llama-3.1-8b'; // Free!
```

### 2. Use Cheapest for Simple Tasks
```typescript
// Simple chat: Use Groq
// Complex analysis: Use Claude
// Code generation: Use GPT-4o Mini
```

### 3. Handle Errors
```typescript
try {
  const response = await sendAIRequest({
    model: 'gpt-4o-mini',
    prompt: 'Hello',
  });
} catch (error) {
  console.error('AI request failed:', error);
  // Fallback to cheaper model
}
```

### 4. Monitor Costs
```typescript
let totalCost = 0;

const response = await sendAIRequest({...});
totalCost += response.cost.total;

console.log('Total spent today:', totalCost);
```

---

## 🔐 **Security**

### API Key Management
- ✅ Store in `.env.local` (never commit)
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Monitor usage

### Rate Limiting
- ✅ Implement rate limiting
- ✅ Cache responses
- ✅ Use cheaper models for high volume
- ✅ Monitor API quotas

---

## 📊 **Provider Comparison**

| Provider | Speed | Cost | Context | Free Tier |
|----------|-------|------|---------|-----------|
| Groq | ⚡⚡⚡⚡⚡ | $ | 131K | ✅ |
| Google | ⚡⚡⚡⚡ | $ | 2M | ✅ |
| OpenAI | ⚡⚡⚡ | $$ | 128K | ❌ |
| Perplexity | ⚡⚡⚡ | $ | 127K | ❌ |
| Anthropic | ⚡⚡⚡ | $$$ | 200K | ❌ |
| Together | ⚡⚡ | $ | 33K | ❌ |
| Mistral | ⚡⚡⚡ | $$ | 32K | ❌ |

---

## 🎯 **Recommendations**

### For Personal Use
1. **Groq** (free, fast)
2. **Google Gemini** (free tier)
3. **OpenAI GPT-4o Mini** (affordable)

### For Small Business
1. **OpenAI GPT-4o Mini** (reliable)
2. **Anthropic Claude Haiku** (quality)
3. **Groq** (speed + cost)

### For Production
1. **OpenAI** (reliability)
2. **Anthropic** (quality)
3. **Google** (scale)

---

**Status**: ✅ All 7 providers integrated and ready to use!
