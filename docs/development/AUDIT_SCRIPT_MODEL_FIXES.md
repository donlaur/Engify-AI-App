# Audit Script Model Configuration Fixes

**Date:** November 5, 2024  
**Status:** ✅ Fixed

---

## 🐛 Issues Fixed

### 1. Dynamic Agents Using Replicate

**Problem:**
- `createRoleSpecificReviewer()` was using `openai/gpt-5` via Replicate
- `createPatternSpecificReviewer()` was using `openai/gpt-5` via Replicate
- These models don't exist or aren't accessible

**Fix:**
- Updated both functions to use `gpt-4o` directly via OpenAI
- Changed provider from `replicate` to `openai`

### 2. Replicate Model Blocking

**Problem:**
- Replicate adapter was blocking models with error: `"google/gemini-2.5-flash" is not in allowlist`
- Fallback logic was trying to use more Replicate models that were also blocked

**Fix:**
- Updated fallback logic to use OpenAI models when Replicate fails
- Added detection for "not in allowlist" and "blocked" errors
- Fallback now switches to OpenAI provider when Replicate fails
- Added last resort fallback to OpenAI `gpt-4o-mini` if available

### 3. Model Configuration Summary

**Using OpenAI Directly:**
- ✅ Product Reviewer: `gpt-4o`
- ✅ SEO Reviewer: `gpt-4o`
- ✅ Grading Rubric Expert: `gpt-4o`
- ✅ Role-Specific Reviewers: `gpt-4o` (dynamic)
- ✅ Pattern-Specific Reviewers: `gpt-4o` (dynamic)

**Using Replicate (Claude models):**
- ⚠️ Engineering Reviewer: `anthropic/claude-4.5-haiku`
- ⚠️ Roles & Use Cases Reviewer: `anthropic/claude-4.5-haiku`
- ⚠️ Enterprise SaaS Expert: `anthropic/claude-4.5-haiku`
- ⚠️ Enterprise Reviewer: `anthropic/claude-4.5-haiku`
- ⚠️ Web Security Reviewer: `anthropic/claude-4.5-sonnet`
- ⚠️ Compliance Reviewer: `anthropic/claude-4.5-sonnet`
- ⚠️ Completeness Reviewer: `anthropic/claude-4.5-sonnet`

**Note:** Replicate agents will fallback to OpenAI if Replicate fails.

---

## 🔄 Fallback Strategy

### Fallback Chain

1. **Primary Model:** Try configured model first
2. **Provider Fallback:** If Replicate fails → Use OpenAI
3. **Model Fallback:** If `gpt-4o` fails → Try `gpt-4o-mini`
4. **Last Resort:** If all else fails → Try OpenAI factory default

### Fallback Logic

```typescript
// Replicate agents fallback to OpenAI
if (agent.provider.includes('replicate')) {
  if (agent.model.includes('gpt-5') || agent.model.includes('claude-4.5')) {
    fallbackModel = 'gpt-4o';
    fallbackProviderType = 'openai';
  } else if (agent.model.includes('claude-4.5-haiku')) {
    fallbackModel = 'gpt-4o-mini';
    fallbackProviderType = 'openai';
  }
}

// Last resort: OpenAI if available
if (process.env.OPENAI_API_KEY && agent.provider.includes('replicate')) {
  // Try OpenAI gpt-4o-mini
}
```

---

## 📝 Files Updated

1. **`scripts/content/audit-prompts-patterns.ts`**
   - Updated `createRoleSpecificReviewer()` to use OpenAI
   - Updated `createPatternSpecificReviewer()` to use OpenAI
   - Fixed fallback logic to use OpenAI when Replicate fails
   - Added detection for "not in allowlist" errors
   - Added last resort OpenAI fallback

---

## ✅ Testing

After these fixes, audits should:
- ✅ Use OpenAI directly for dynamic agents
- ✅ Fallback to OpenAI when Replicate fails
- ✅ Handle Replicate blocking errors gracefully
- ✅ Complete audits even if some agents fail

---

## 🔧 Environment Variables

Ensure `.env.local` has:
```bash
OPENAI_API_KEY=sk-...  # Required for OpenAI agents
REPLICATE_API_TOKEN=r8_...  # Optional - only if using Replicate models
REPLICATE_ALLOW_ALL=true  # Optional - allows all Replicate models (if using Replicate)
```

---

## 🚀 Next Steps

1. **Test Audit:** Run a small batch to verify fixes
   ```bash
   pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --limit=3
   ```

2. **Monitor Results:** Check for:
   - Fewer errors
   - Successful fallbacks
   - Complete audit results

3. **Consider:** Update remaining Replicate agents to OpenAI if Replicate continues to have issues

---

**Last Updated:** November 5, 2024  
**Status:** ✅ Ready for Testing

