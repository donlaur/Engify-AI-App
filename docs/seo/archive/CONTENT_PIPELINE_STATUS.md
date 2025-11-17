# Content Pipeline Enhancement Status

**Date:** November 8, 2025  
**Status:** In Progress

---

## ✅ Completed

### 1. Research Compiled
- ✅ Gemini research (user quotes, pricing, problems)
- ✅ ChatGPT research (5 personas per article)
- ✅ Google E-E-A-T framework research

### 2. AI Slop Detector Built
- ✅ TypeScript implementation (`src/lib/content/ai-slop-detector.ts`)
- ✅ Detects 8 categories of AI slop
- ✅ Quality scoring (0-10)
- ✅ Detailed metrics and recommendations

### 3. Existing Multi-Agent System Found
- ✅ 7-agent content publishing pipeline
- ✅ Located in `src/lib/content/content-publishing-pipeline.ts`
- ✅ Already has model selection and some slop detection

---

## 🚧 In Progress

### Integrate Slop Detection
**File:** `src/lib/content/content-publishing-pipeline.ts`

**Need to add:**
```typescript
// In generateArticle() method, after final content is generated:
const slopDetection = detectAISlop(finalContent);
printDetectionReport(slopDetection);

// Add to result:
return {
  // ... existing fields
  slopDetection,
};
```

### Add E-E-A-T to Agent Prompts
**Current agents:**
1. Content Generator (GPT-4)
2. SEO Specialist (Claude)
3. Human Tone Editor (GPT-4)
4. Learning Expert (Claude)
5. Tech Accuracy SME (GPT-4)
6. Web Designer (Claude)
7. Final Publisher (Claude)

**Need to enhance prompts with:**
- Experience signals ("I tested...", screenshots, failures)
- Expertise signals (author credentials, citations)
- Authoritativeness signals (press mentions, backlinks)
- Trustworthiness signals (last updated, transparency)

---

## 📋 TODO

### 1. Model Fallback Logic
**Current:** Hardcoded models per agent  
**Need:** Dynamic model selection with fallback

**Implementation:**
```typescript
async function getActiveModel(preferredModel: string, provider: string) {
  const db = await getMongoDb();
  const models = await db.collection('ai_models').find({
    provider,
    status: 'active',
    isAllowed: { $ne: false },
  }).toArray();
  
  // Try preferred first
  const preferred = models.find(m => m.id === preferredModel);
  if (preferred) return preferred;
  
  // Fallback to most recently verified
  models.sort((a, b) => 
    (b.lastVerified?.getTime() || 0) - (a.lastVerified?.getTime() || 0)
  );
  
  return models[0] || { id: preferredModel }; // Fallback to hardcoded
}
```

### 2. Quota Handling (from batch-improve-from-audits.ts)
**Pattern:**
- Try Gemini first
- On 429 error → Try Replicate (from DB)
- On Replicate fail → Try OpenAI
- Cache quota exhaustion in Redis (24hr TTL)

**Code to port:**
```typescript
async function executeWithFallback(provider, request, taskName, db) {
  try {
    return await provider.execute(request);
  } catch (error) {
    if (error.message.includes('429') || error.message.includes('quota')) {
      // Try Replicate from DB
      const replicateModels = await getModelsByProvider('replicate');
      const activeModels = replicateModels.filter(m => 
        m.status === 'active' && m.capabilities?.includes('text')
      );
      // ... fallback logic
    }
    throw error;
  }
}
```

### 3. Update Agent Prompts with E-E-A-T

**Content Generator:**
```typescript
systemPrompt: `...existing prompt...

E-E-A-T REQUIREMENTS:
- Include "I tested..." or "We found..." (Experience)
- Add specific examples with real tools/versions (Expertise)
- Cite authoritative sources (Authoritativeness)
- Be transparent about limitations (Trustworthiness)
- NO AI slop: delve, leverage, utilize, em dashes
- Vary sentence length (avoid uniformity)
`
```

**SEO Specialist:**
```typescript
systemPrompt: `...existing prompt...

E-E-A-T SEO Signals:
- Author byline with credentials
- "Last updated" date
- Citations to official docs
- Personal experience markers
- Original screenshots/code
- Honest about trade-offs
`
```

### 4. Test with Real Article
**Command:**
```bash
pnpm tsx scripts/content/generate-article.ts "Cursor vs Windsurf: Speed vs Control (2025)"
```

**Expected output:**
- Article generated through 7 agents
- Slop detection report
- Quality score > 8.0
- E-E-A-T signals present

---

## 🎯 Next Steps (Priority Order)

1. **Integrate slop detection** into `generateArticle()` method
2. **Add E-E-A-T guidelines** to all 7 agent prompts
3. **Test with 1 article** (Cursor vs Windsurf)
4. **Review output** and refine prompts
5. **Add model fallback** logic (if needed after testing)
6. **Generate all 18 articles** this weekend

---

## 📊 Success Criteria

**Article must have:**
- ✅ Quality score > 8.0 (slop detector)
- ✅ AI probability < 30%
- ✅ Personal experience markers (3+)
- ✅ Code examples
- ✅ Specific numbers/data
- ✅ Citations with links
- ✅ 2000+ words
- ✅ Varied sentence length (std dev > 5)

**E-E-A-T signals:**
- ✅ Author byline
- ✅ "Last updated" date
- ✅ Real user quotes
- ✅ Original research/testing
- ✅ Honest about limitations

---

## 💰 Cost Estimate

**Per article (7 agents):**
- Content Generator (GPT-4): ~$0.20
- SEO Specialist (Claude): ~$0.10
- Human Tone (GPT-4): ~$0.15
- Learning Expert (Claude): ~$0.10
- Tech SME (GPT-4): ~$0.15
- Web Designer (Claude): ~$0.10
- Final Publisher (Claude): ~$0.10

**Total per article:** ~$0.90  
**18 articles:** ~$16.20

**vs Freelance:** $3,600-$10,800 (99% savings)

---

## 🚀 Ready to Test

All research compiled. Slop detector built. Multi-agent system ready.

**Next:** Integrate slop detection and test with first article.
