# Prompt Audit Review & Model Strategy

**Date:** November 5, 2025  
**Status:** Reviewing audits and updating model configuration

---

## 📊 Current Audit Status

### Recent Audit Reports

Based on the markdown files created, we have 3 recent audits:

1. **doc-001** (Architecture Decision Record)
   - Score: 3.7/10 → 5.2/10 (improved after re-audit)
   - Status: ⚠️ NEEDS FIX
   - Missing: Case studies, best time to use, recommended models

2. **pm-sen-product-strategy-critique** (Product Strategy Red Team)
   - Score: 5.6/10
   - Status: ⚠️ NEEDS FIX
   - Missing: Case studies (0/10 score)

3. **cg-001** (Code Review Assistant)
   - Score: 2.4/10
   - Status: ⚠️ NEEDS FIX
   - Missing: Case studies, security/compliance considerations

### Overall Status

- **Total Prompts:** 120
- **Audited:** 3 (or 1 if counting latest)
- **Unaudited:** 117-119 prompts need scoring
- **Average Score:** ~3.7/10 (needs significant improvement)

---

## 🤖 Why Only One Model Was Used?

### The Issue

The audit script actually uses **multiple models** (11-13 different agents), but there was a configuration problem:

1. **Original Configuration:** Used `openai/gpt-5` for product/SEO reviews
2. **Problem:** `openai/gpt-5` isn't available on Replicate (or requires special access)
3. **Result:** All agents using `gpt-5` failed, causing audit to fail

### The Fix

✅ **Updated Models:**
- Replaced `openai/gpt-5` → `anthropic/claude-4.5-sonnet` for product/SEO reviews
- Kept `anthropic/claude-4.5-haiku` for engineering reviews (cheaper, fast)
- Updated fallback logic to use Sonnet → Haiku → Llama

### Current Model Distribution

The audit system uses **different models for different agents**:

| Agent Type | Model | Provider | Purpose |
|------------|-------|-----------|---------|
| Engineering Reviewer | `anthropic/claude-4.5-haiku` | Replicate | Technical accuracy |
| Product Reviewer | `anthropic/claude-4.5-sonnet` | Replicate | Product strategy |
| SEO Reviewer | `anthropic/claude-4.5-sonnet` | Replicate | SEO optimization |
| Grading Rubric Expert | `anthropic/claude-4.5-sonnet` | Replicate | Comprehensive scoring |
| Enterprise Reviewer | `anthropic/claude-4.5-haiku` | Replicate | Enterprise readiness |
| Security Reviewer | `anthropic/claude-4.5-haiku` | Replicate | Security analysis |
| Compliance Reviewer | `anthropic/claude-4.5-haiku` | Replicate | Compliance checks |

**Total:** 11-13 agents (some added dynamically based on prompt role/pattern)

---

## 🎯 Should We Create Custom Models on Replicate?

### For Engineering/Product Use Cases

**Short Answer:** **Not necessary for now**, but could be valuable later.

### Analysis

#### ✅ **Pros of Custom Replicate Models:**

1. **Fine-Tuned for Specific Tasks**
   - Engineering: Code review, architecture decisions, debugging
   - Product: Strategy analysis, user research, roadmap planning
   - Could improve accuracy and reduce hallucination

2. **Cost Optimization**
   - Fine-tuned models might be cheaper per token than base models
   - Could reduce token usage through better prompts

3. **Consistency**
   - Same model version always available
   - No API changes breaking integrations

4. **Privacy**
   - Custom models can be deployed privately
   - Data stays within your infrastructure

#### ❌ **Cons of Custom Replicate Models:**

1. **Upfront Cost**
   - Fine-tuning costs: $100-1000+ per model
   - Infrastructure costs for hosting
   - Maintenance overhead

2. **Training Data Required**
   - Need high-quality examples (100s-1000s)
   - Must curate engineering/product-specific datasets
   - Annotation time and cost

3. **Maintenance**
   - Models need updates as new patterns emerge
   - Must track performance and retrain
   - Version management complexity

4. **Current Models Are Good Enough**
   - Claude 4.5 Sonnet is excellent for product analysis
   - Claude 4.5 Haiku is great for engineering tasks
   - Base models work well with good prompts

### Recommendation

**Phase 1 (Current):** ✅ **Use Base Models**
- `anthropic/claude-4.5-sonnet` for product/strategy reviews
- `anthropic/claude-4.5-haiku` for engineering reviews
- Focus on improving **prompt engineering** and **system prompts**

**Phase 2 (Future):** Consider Custom Models If:
- Volume justifies cost (1000+ audits/month)
- Base models consistently fail on specific tasks
- Need domain-specific knowledge (e.g., Red Hat compliance)
- Have high-quality training data ready

### Alternative: Prompt Templates Instead

Instead of custom models, consider:
1. **Optimized System Prompts** - Better instructions for base models
2. **Few-Shot Examples** - Include examples in prompts
3. **Chain-of-Thought** - Break complex reviews into steps
4. **Ensemble Approach** - Run multiple models and aggregate results

---

## 🔄 Next Steps

### 1. Run Audits with Fixed Models ✅

```bash
# Test with 5 prompts first
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --limit=5

# Then scale up to 20-50 prompts
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --limit=20
```

### 2. Review Audit Scores

- Check which prompts score < 5/10
- Identify common missing elements
- Prioritize high-value prompts for enrichment

### 3. Enrich Low-Scoring Prompts

```bash
# Enrich prompts based on audit feedback
pnpm tsx scripts/content/enrich-prompt.ts --id=doc-001
pnpm tsx scripts/content/enrich-prompt.ts --id=cg-001
pnpm tsx scripts/content/enrich-prompt.ts --id=pm-sen-product-strategy-critique
```

### 4. Re-Audit Enriched Prompts

- Verify score improvements
- Target: 7.0+/10 average score
- Document improvements

### 5. Batch Process Remaining Prompts

- Once pattern is proven, batch audit all 120 prompts
- Prioritize by category/role
- Generate enrichment scripts for common patterns

---

## 📝 Model Configuration Updates

### Changes Made

1. ✅ Replaced `openai/gpt-5` → `anthropic/claude-4.5-sonnet`
2. ✅ Updated fallback logic (Sonnet → Haiku → Llama)
3. ✅ Added `claude-4.5-sonnet` to ReplicateAdapter allowlist
4. ✅ Added cost estimates for Sonnet model

### Environment Variables

Ensure `.env.local` has:
```bash
REPLICATE_API_TOKEN=your_token
REPLICATE_ALLOW_ALL=true  # Allows all models (registry-controlled)
```

---

## 💡 Model Strategy Summary

**Current Approach:**
- Use base models (`claude-4.5-sonnet`, `claude-4.5-haiku`)
- Optimize system prompts and few-shot examples
- Monitor costs and performance

**Future Consideration:**
- Custom models only if volume/cost justifies it
- Focus on prompt engineering first
- Consider ensemble approaches

**Cost Optimization:**
- Use Haiku for simpler tasks (engineering reviews)
- Use Sonnet for complex analysis (product strategy, grading)
- Monitor token usage per audit

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Models Fixed - Ready for Batch Auditing

