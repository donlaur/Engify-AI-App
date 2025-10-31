<!--
AI Summary: Multi-model prompt testing strategy to validate prompt quality and save results for display.
Tests with GPT-3.5, Gemini, Claude to show model diversity. Results stored in MongoDB.
-->

# Multi-Model Prompt Testing Strategy

This work is part of Day 5 Part 2: [Day 5 Part 2 Plan](../planning/DAY_5_PART_2_CONTENT_QUALITY.md).

## Overview

Test all 90 prompts with 2-3 different AI models to:

- Validate prompt quality and effectiveness
- Show users that results vary by model
- Build trust by displaying real tested outputs
- Demonstrate "it's not just ChatGPT" - many models available

## Models to Test

### Phase 1 (Affordable)

- **GPT-3.5-turbo** (OpenAI) - $0.002/1K tokens
- **Gemini-1.5-flash** (Google) - $0.00015/1K tokens
- **Claude-3-haiku** (Anthropic via Replicate) - $0.00025/1K tokens

### Phase 2 (Future - Premium Tier)

- GPT-4-turbo, Claude-3.5-sonnet, Llama-3-70b, Mixtral, etc.
- Access via Replicate API (100+ models)

## Test Results Schema

Store in `prompt_test_results` collection:

```typescript
{
  _id: ObjectId,
  promptId: ObjectId,        // References prompts collection
  promptTitle: string,
  model: string,             // "gpt-3.5-turbo", "gemini-1.5-flash"
  provider: string,          // "openai", "google", "anthropic"
  testScenario: string,      // What we asked the AI
  response: string,          // AI's response
  qualityScore: number,      // 1-5 rating
  metrics: {
    tokensUsed: number,
    costUSD: number,
    latencyMs: number
  },
  testedAt: Date,
  testedBy: string           // "automated-qa" or userId
}
```

## Quality Scoring Criteria

**5 Stars** - Excellent

- Response is specific, actionable, professional
- Follows the prompt pattern correctly
- Appropriate detail level for target role
- No hallucinations or errors

**4 Stars** - Good

- Response is helpful and mostly accurate
- Minor improvements possible
- Slightly generic but usable

**3 Stars** - Acceptable

- Response addresses the prompt
- Lacks specificity or depth
- Needs editing to be production-ready

**2 Stars** - Poor

- Response is vague or too generic
- Misses key aspects of the prompt
- Requires significant rework

**1 Star** - Fails

- Response is off-topic or incorrect
- Unusable output
- Prompt needs to be rewritten

## Execution Strategy

### Dry Run (Validate Script)

```bash
npx tsx scripts/content/test-prompts-multi-model.ts --dry-run
# Tests 3 prompts only, ~$0.002 cost
# Results NOT saved to database
# Verifies script works before full run
```

### Limited Test (Quality Check)

```bash
npx tsx scripts/content/test-prompts-multi-model.ts --limit=10
# Tests 10 prompts × 2 models = 20 calls
# Cost: ~$0.05
# Saves results to database
```

### Full Test (All Prompts)

```bash
npx tsx scripts/content/test-prompts-multi-model.ts --all
# Tests 90 prompts × 2 models = 180 calls
# Cost: ~$0.40-0.60
# Saves all results to database
```

## Display on Prompt Pages

Each prompt detail page (`/library/[slug]`) will show:

```
Example Outputs

[Tab: GPT-3.5-turbo] [Tab: Gemini Flash] [Tab: Claude Haiku]

<response text>

Quality: ⭐⭐⭐⭐ (4/5)
Tokens: 145
Cost: $0.0003
Tested: Oct 31, 2025
```

Users can see how different models interpret the same prompt.

## Budget Management

- Phase 1 testing: $0.50-1.00 (2 models)
- Phase 2 testing: $2.00-3.00 (add Claude)
- Future premium: $5.00-10.00 (test with 5-6 models)

## Implementation Checklist

- [x] Create testing script with dry-run mode
- [ ] Add prompt_test_results collection schema
- [ ] Run dry-run test (3 prompts)
- [ ] Review results and adjust quality scoring
- [ ] Run limited test (10 prompts)
- [ ] Run full test (90 prompts)
- [ ] Create UI component to display results on prompt pages
- [ ] Add "Compare Models" feature

## Future Enhancements

- A/B testing: Show users results from 2 models side-by-side
- User-selected model testing (let users test with their choice)
- Automated re-testing when prompts are updated
- Quality trend tracking over time
