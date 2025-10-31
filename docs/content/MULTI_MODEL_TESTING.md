# Multi-Model Prompt Testing Strategy

**Status**: ✅ Schema complete, ready to execute with MongoDB credentials

## Overview

Test all prompts with 2-3 AI models to validate quality and generate comparative data for users. Results are stored in MongoDB for display on prompt detail pages.

## Implementation

### 1. Schema Design ✅

Created comprehensive Zod schemas in `/src/lib/db/schemas/prompt-test-results.ts`:

- **PromptTestResult**: Individual test result (model, response, quality score, tokens, cost)
- **PromptQualityScore**: Aggregate scorecard across models
- **TestingSummary**: Overall testing statistics
- **MongoDB Indexes**: Optimized for querying by promptId, model, provider, quality score

### 2. Testing Script ✅

**Location**: `/scripts/content/test-prompts-multi-model.ts`

**Features**:
- Tests prompts with OpenAI GPT-3.5-turbo and Google Gemini Flash
- Tracks tokens, cost, latency, and quality score
- Supports dry-run mode (3 prompts) and full testing
- Budget tracking to stay under $5 total

**Usage**:

```bash
# Test 3 prompts (dry run) - recommended first
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run

# Test 10 prompts
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --limit=10

# Test all prompts (~90 prompts)
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --all
```

### 3. Quality Scoring

**Scoring Criteria** (1-5 scale):

- **5 - Excellent**: Comprehensive, actionable, professional tone (200-800 words)
- **4 - Good**: Complete response, minor improvements possible (100-1000 words)
- **3 - Acceptable**: Basic response, needs refinement
- **2 - Poor**: Incomplete or off-target response
- **1 - Failed**: Error or completely unusable response

**Current Implementation**: Simple heuristic based on response length (temporary)

**Future Enhancement**: Implement semantic analysis with:
- Completeness check (addresses all prompt aspects)
- Tone analysis (professional, helpful, clear)
- Actionability score (concrete steps vs. vague advice)
- Keyword coverage (technical terms, best practices)

### 4. Cost Estimation

**Per-Prompt Cost** (estimated):
- GPT-3.5-turbo: ~$0.002 per request (300 tokens @ $0.002/1K)
- Gemini Flash: ~$0.00015 per request (very cheap)
- **Total per prompt**: ~$0.0022 for 2 models

**Full Testing Budget** (90 prompts × 2 models):
- Expected: $0.20 - $0.30
- Maximum: $5.00 (with buffer for retries/longer prompts)
- Well under budget ✅

### 5. Execution Plan

#### Step 1: Dry Run (Budget: ~$0.01)
```bash
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run
```
- Tests 3 prompts with 2 models
- Validates script works correctly
- Checks MongoDB connection
- Estimates cost per prompt

#### Step 2: Small Batch (Budget: ~$0.05)
```bash
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --limit=20
```
- Tests 20 prompts (representative sample)
- Validates quality scoring
- Identifies prompts needing improvement
- Refines cost estimates

#### Step 3: Full Testing (Budget: ~$0.30)
```bash
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --all
```
- Tests all ~90 prompts
- Generates complete quality report
- Saves results to MongoDB
- Ready for display on prompt pages

### 6. MongoDB Collections

#### `prompt_test_results`

Stores individual test results:

```typescript
{
  promptId: ObjectId("..."),
  promptTitle: "Debug Production Issue",
  model: "gpt-3.5-turbo",
  provider: "openai",
  response: "Here's how to debug...",
  qualityScore: 4,
  tokensUsed: 287,
  costUSD: 0.000574,
  latencyMs: 1243,
  testedAt: ISODate("2025-10-31T..."),
  metadata: {
    temperature: 0.7,
    maxTokens: 300
  }
}
```

#### Recommended Indexes

```javascript
// Primary lookups
db.prompt_test_results.createIndex({ promptId: 1 });
db.prompt_test_results.createIndex({ model: 1 });
db.prompt_test_results.createIndex({ testedAt: -1 });

// Quality analysis
db.prompt_test_results.createIndex({ qualityScore: 1 });

// Compound for prompt history
db.prompt_test_results.createIndex({ promptId: 1, testedAt: -1 });
```

### 7. Display Integration

**Prompt Detail Page Enhancements**:

1. **Model Comparison Card**:
   - Side-by-side responses from different models
   - Quality scores with visual indicators (⭐⭐⭐⭐)
   - Speed comparison (latency)
   - Cost per generation

2. **Quality Badge**:
   - Display average quality score on prompt cards
   - Color-coded: 5=green, 4=blue, 3=yellow, 2=orange, 1=red
   - Filter prompts by quality score

3. **Testing Metadata**:
   - "Last tested: 3 days ago"
   - "Tested with: GPT-3.5, Gemini Flash"
   - "Average quality: 4.2/5"

### 8. Red Hat Security Review

✅ **API Key Security**:
- Keys loaded from environment variables only
- No hardcoded credentials
- Script fails gracefully if keys missing

✅ **Cost Controls**:
- Budget tracking built-in
- Dry-run mode for safe testing
- Token limits enforced (max 300 tokens)
- Reasonable timeout (45s per request)

✅ **Error Handling**:
- Try-catch on all API calls
- Graceful failure per model (doesn't stop entire run)
- Logs errors without exposing sensitive data

✅ **Rate Limiting**:
- Sequential requests (not parallel) to avoid API throttling
- Configurable delay between requests (if needed)

⚠️ **Future Considerations**:
- Add retry logic with exponential backoff
- Implement request queuing for large batches
- Monitor API quotas (OpenAI, Google AI)
- Add webhook for async testing notifications

### 9. Quality Improvement Workflow

**After testing, identify low-scoring prompts**:

1. **Score 3 or below**: Review and rewrite
2. **Inconsistent scores**: Test with additional models
3. **High latency**: Optimize prompt length
4. **High cost**: Reduce token limits or simplify prompt

**Prompt Improvement Process**:
1. Analyze low-quality responses
2. Refine prompt clarity and structure
3. Re-test with same models
4. Compare before/after scores
5. Update MongoDB with new results

### 10. Next Steps

- [ ] Execute dry-run with live MongoDB connection
- [ ] Review dry-run results and adjust quality scoring
- [ ] Run small batch (20 prompts) and analyze
- [ ] Execute full testing on all prompts
- [ ] Build UI components for displaying test results
- [ ] Add "Quality Score" filter to prompt library
- [ ] Create admin dashboard for test result analytics
- [ ] Schedule periodic re-testing (monthly?)

## Success Criteria

✅ **Phase 2 Complete When**:
- All prompts tested with 2+ models
- Results saved to MongoDB
- Quality scores documented
- Total cost < $5
- Low-scoring prompts identified for improvement
- Plan document updated with ✅ checkmarks

## Related Documentation

- [Tag Taxonomy](./TAG_TAXONOMY.md) - Prompt categorization system
- [Content Migration Plan](./CONTENT_MIGRATION.md) - Static to DB strategy
- [Management Templates](./MANAGEMENT_TEMPLATES.md) - Phase 4 content
