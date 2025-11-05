# AI Model Selection & Cost Optimization Guide

**Engify.ai - Multi-Agent System Cost Optimization**

---

## 🎯 Model Selection Strategy

### Tier-Based Model Selection

**Premium Models** (Quality-critical final passes):
- `gpt-4o` - Best balance, recommended for production
- `claude-3-5-sonnet-20250219` - High quality, good for complex reasoning

**Affordable Models** (First passes, iterations):
- `gpt-4o-mini` - **17x cheaper** than GPT-4o, excellent quality
- `claude-3-haiku-20240307` - Very cheap, good for simple tasks

**Free Models** (Experimental, testing):
- `gemini-2.0-flash-exp` - FREE during experimental phase

---

## 💰 Cost Comparison

### Input Token Costs (per 1M tokens)

| Model | Input Cost | Output Cost | Ratio vs GPT-4o |
|-------|-----------|-------------|----------------|
| **GPT-4o** | $2.50 | $10.00 | 1x |
| **GPT-4o-mini** | $0.15 | $0.60 | **17x cheaper** |
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | 1.2x |
| **Claude 3 Haiku** | $0.25 | $1.25 | **10x cheaper** |
| **Gemini 2.0 Flash** | $0.00 | $0.00 | **FREE** |

### Estimated Token Usage per Prompt Generation

**Typical prompt generation:**
- Input: ~2,000 tokens (prompt + system message)
- Output: ~1,500 tokens (generated content)

**Cost per step:**
- GPT-4o: ~$0.0075 per step
- GPT-4o-mini: ~$0.00045 per step (**17x cheaper**)
- Claude 3 Haiku: ~$0.00075 per step (**10x cheaper**)

**6-step pipeline costs:**
- GPT-4o (all steps): ~$0.045 per prompt
- GPT-4o-mini (all steps): ~$0.0027 per prompt (**17x cheaper**)
- **Optimized** (mini for first 4, premium for final 2): ~$0.006 per prompt (**7.5x cheaper**)

---

## 📊 Token Usage Estimation

### Token Estimation Formula

```
Tokens ≈ Characters / 4
Tokens ≈ Words * 1.3
```

**Example:**
- 2,000 character prompt ≈ 500 tokens
- 1,500 word response ≈ 1,950 tokens

### Context Window Usage

**Typical usage per agent:**
- System prompt: ~300-500 tokens
- User prompt: ~500-1,000 tokens
- Previous agent output: ~500-1,500 tokens
- **Total per step:** ~1,500-3,000 tokens

**Most models handle this easily:**
- GPT-4o: 128K context (we use ~2.3%)
- GPT-4o-mini: 128K context (we use ~2.3%)
- Claude 3 Haiku: 200K context (we use ~1.5%)

---

## 🚀 Optimization Strategy

### Strategy 1: Progressive Quality (Recommended)

**First Passes (Steps 1-4):** Use affordable models
- ML Researcher: `gpt-4o-mini` (or `gemini-2.0-flash-exp` for FREE)
- Prompt Engineer: `gpt-4o-mini`
- Domain Expert: `claude-3-haiku-20240307`
- SEO Specialist: `gpt-4o-mini`

**Final Passes (Steps 5-6):** Use premium models
- Enterprise Expert: `gpt-4o` (enterprise quality critical)
- Quality Reviewer: `claude-3-5-sonnet-20250219` (final quality check)

**Cost Savings:** ~85% reduction (~$0.006 vs $0.045 per prompt)

### Strategy 2: All Affordable

**All Steps:** Use `gpt-4o-mini` or `claude-3-haiku`

**Cost Savings:** ~94% reduction (~$0.0027 vs $0.045 per prompt)

**Trade-off:** Slightly lower quality, but still excellent for most use cases

### Strategy 3: Quality Gates

**Use cheaper models, upgrade if quality score < 7.0:**
1. First pass: `gpt-4o-mini`
2. Check quality score
3. If score < 7.0: Re-run with `gpt-4o` on low-scoring steps

**Cost Savings:** ~70-90% (depending on quality)

---

## 📋 Model Selection Guidelines

### By Task Type

**Content Generation:**
- First pass: `gpt-4o-mini` or `gemini-2.0-flash-exp` (FREE)
- Final pass: `gpt-4o` or `claude-3-5-sonnet-20250219`

**Analysis & Review:**
- First pass: `gpt-4o-mini`
- Final pass: `claude-3-5-sonnet-20250219` (better reasoning)

**Editing & Refinement:**
- All steps: `gpt-4o-mini` (sufficient quality)

**Quality Checks:**
- Critical checks: `gpt-4o` or `claude-3-5-sonnet-20250219`
- Routine checks: `gpt-4o-mini`

### By Agent Role

**Research-heavy (needs reasoning):**
- ML Researcher: `gpt-4o-mini` (first pass) → `gpt-4o` (final)
- AI PhD: `claude-3-5-sonnet-20250219` (needs quality)

**Editing/Formatting:**
- SEO Specialist: `gpt-4o-mini` (sufficient)
- Editor: `gpt-4o-mini` (sufficient)

**Quality Critical:**
- Quality Reviewer: `claude-3-5-sonnet-20250219` (final gate)
- Enterprise Expert: `gpt-4o` (enterprise requirements)

---

## 🔧 Implementation

### Current Agent Configuration

```typescript
// Expensive (all premium models)
ML Researcher: gpt-4o ($2.50/1M input)
Prompt Engineer: gpt-4o ($2.50/1M input)
Domain Expert: claude-3-5-sonnet ($3.00/1M input)
SEO Specialist: claude-3-5-sonnet ($3.00/1M input)
Enterprise Expert: gpt-4o ($2.50/1M input)
Quality Reviewer: claude-3-5-sonnet ($3.00/1M input)
```

### Optimized Configuration

```typescript
// Affordable first passes + Premium final passes
ML Researcher: gpt-4o-mini ($0.15/1M input) - 17x cheaper
Prompt Engineer: gpt-4o-mini ($0.15/1M input) - 17x cheaper
Domain Expert: claude-3-haiku ($0.25/1M input) - 12x cheaper
SEO Specialist: gpt-4o-mini ($0.15/1M input) - 20x cheaper
Enterprise Expert: gpt-4o ($2.50/1M input) - Keep premium
Quality Reviewer: claude-3-5-sonnet ($3.00/1M input) - Keep premium
```

**Cost Reduction:** ~85% (from ~$0.045 to ~$0.006 per prompt)

---

## 📈 Token Usage Tracking

### Expected Token Usage per Step

| Step | Agent | Input Tokens | Output Tokens | Total Cost (GPT-4o-mini) |
|------|-------|--------------|---------------|-------------------------|
| 1 | ML Researcher | 2,000 | 1,500 | $0.00045 |
| 2 | Prompt Engineer | 3,500 | 1,500 | $0.00045 |
| 3 | Domain Expert | 5,000 | 1,500 | $0.000375 |
| 4 | SEO Specialist | 6,500 | 1,500 | $0.00045 |
| 5 | Enterprise Expert | 8,000 | 1,500 | $0.0075 |
| 6 | Quality Reviewer | 9,500 | 1,500 | $0.009 |
| **Total** | | **34,500** | **9,000** | **~$0.018** |

### Cost Tracking Implementation

```typescript
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  model: string;
}

function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing = MODEL_PRICING[model];
  const inputCost = (inputTokens / 1000) * pricing.inputPrice;
  const outputCost = (outputTokens / 1000) * pricing.outputPrice;
  return inputCost + outputCost;
}
```

---

## ✅ Recommendations

### For Development/Testing

**Use Strategy 2 (All Affordable):**
- All agents: `gpt-4o-mini`
- Cost: ~$0.0027 per prompt
- Quality: Still excellent (95%+ of GPT-4o quality)

### For Production

**Use Strategy 1 (Progressive Quality):**
- Steps 1-4: `gpt-4o-mini`
- Steps 5-6: `gpt-4o` / `claude-3-5-sonnet-20250219`
- Cost: ~$0.006 per prompt
- Quality: Premium quality on final passes

### For Budget-Conscious

**Use FREE models where possible:**
- Steps 1-3: `gemini-2.0-flash-exp` (FREE)
- Steps 4-6: `gpt-4o-mini`
- Cost: ~$0.0018 per prompt (96% savings!)

---

## 🔍 Monitoring

### Track These Metrics

1. **Token Usage per Agent:**
   - Input tokens
   - Output tokens
   - Total cost

2. **Cost per Prompt:**
   - Track total cost across all agents
   - Compare optimized vs non-optimized

3. **Quality Scores:**
   - Ensure quality doesn't degrade with cheaper models
   - Track quality scores by model used

4. **Cost Efficiency:**
   - Cost per quality point
   - ROI on premium models

---

## 📚 Related Documentation

- [Model Selector](../../src/lib/ai/model-selector.ts)
- [AI Models Config](../../src/lib/config/ai-models.ts)
- [Cost Analysis](./COST_ANALYSIS_PROMPT_GENERATION.md)

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Active - Implemented  
**Cost Savings:** ~85% with optimized configuration
