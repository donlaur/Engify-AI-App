# Integrate Existing Quality & Model Selection Systems

**Date:** November 8, 2025  
**Issue:** New article generator doesn't use existing quality detection and model fallback systems  
**Solution:** Integrate proven audit infrastructure

---

## What You Already Have (Proven Systems)

### 1. AI Model Selection with Fallbacks ✅

**From:** `scripts/content/batch-improve-from-audits.ts`

**Features:**
- ✅ Pulls models from `ai_models` MongoDB collection
- ✅ Automatic fallback: Gemini → Replicate (from DB) → OpenAI
- ✅ Quota detection and lockout (24-hour Redis cache)
- ✅ Model verification tracking (`lastVerified` field)
- ✅ Smart sorting (Gemini first, then by lastVerified, then recommended)

**Code:**
```typescript
// Get Replicate models from database (active, text-to-text only)
const { getModelsByProvider } = await import('@/lib/services/AIModelRegistry');
const replicateModels = await getModelsByProvider('replicate');

// Filter to active, allowed, text-to-text models
const activeModels = replicateModels.filter((m: any) => {
  const status = ('status' in m ? m.status : 'active');
  if (status !== 'active') return false;
  if ('isAllowed' in m && m.isAllowed === false) return false;
  
  const capabilities = m.capabilities || [];
  if (!capabilities.includes('text')) return false;
  
  return true;
});

// Sort: prefer Gemini models, then by lastVerified, then by recommended
activeModels.sort((a: any, b: any) => {
  const aId = (a.id || '').toLowerCase();
  const bId = (b.id || '').toLowerCase();
  const aIsGemini = aId.includes('gemini');
  const bIsGemini = bId.includes('gemini');
  
  // Prefer Gemini models first
  if (aIsGemini && !bIsGemini) return -1;
  if (!aIsGemini && bIsGemini) return 1;
  
  // Then by lastVerified (most recent first)
  const aVerified = a.lastVerified ? new Date(a.lastVerified).getTime() : 0;
  const bVerified = b.lastVerified ? new Date(b.lastVerified).getTime() : 0;
  if (aVerified !== bVerified) return bVerified - aVerified;
  
  // Then by recommended
  if (a.recommended && !b.recommended) return -1;
  if (!a.recommended && b.recommended) return 1;
  
  return 0;
});
```

### 2. AI Slop Detection ✅

**From:** Your content generation prompt (docs/content/CONTENT_GENERATION_PROMPT.md)

**Quality Standards:**
```markdown
### Quality Standards:
- **No Generic AI Speak**: Avoid "delve", "leverage", "utilize"
- **No Fluff**: Get to the point quickly
- **No Obvious Advice**: Assume the reader is smart
- **Yes to Examples**: Show, don't just tell
- **Yes to Specifics**: Names, numbers, tools, frameworks
```

**Detection Patterns:**
- "delve" → AI slop indicator
- "leverage" → AI slop indicator  
- "utilize" → AI slop indicator
- "revolutionary" → Hype language
- "game-changing" → Hype language
- Generic phrases without specifics

### 3. Audit System with Grading Rubric ✅

**From:** Multi-agent audit pipeline

**8-Category Grading:**
1. Engineering Usefulness (25% weight)
2. Case Study Quality (15% weight)
3. Completeness (15% weight)
4. SEO Enrichment (10% weight)
5. Enterprise Readiness (15% weight)
6. Security & Compliance (10% weight)
7. Accessibility (5% weight)
8. Performance (5% weight)

**11+ Specialized Reviewers:**
- Grading Rubric Expert
- Role-Specific Reviewer (dynamic)
- Pattern-Specific Reviewer (dynamic)
- Engineering Team Reviewer
- Product Team Reviewer
- SEO Enrichment Reviewer
- Enterprise SaaS Expert
- Web Security Reviewer
- Compliance Reviewer
- Completeness Reviewer

---

## What's Missing in Article Generator

### Current Article Generator (Python)
```python
# lambda/agents/article_generation.py

def get_technical_writer():
    return ChatOpenAI(
        model="gpt-4o",  # ❌ Hardcoded, no fallback
        temperature=0.3,
    )

def get_community_manager():
    return ChatAnthropic(
        model="claude-3-5-sonnet-20241022",  # ❌ Hardcoded, no fallback
        temperature=0.5,
    )
```

**Issues:**
- ❌ No connection to `ai_models` database
- ❌ No automatic fallback on quota errors
- ❌ No AI slop detection
- ❌ No quality grading
- ❌ Hardcoded models (not using your proven selection logic)

---

## Solution: Port TypeScript Logic to Python

### Option 1: Use TypeScript Script (Recommended)

**Why:**
- ✅ Reuse ALL existing infrastructure
- ✅ Proven model selection
- ✅ Proven quality detection
- ✅ Proven fallback logic
- ✅ Access to MongoDB `ai_models` collection
- ✅ Redis quota tracking

**Implementation:**
```typescript
// scripts/content/generate-seo-articles.ts

import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';
import { GeminiAdapter } from '@/lib/ai/v2/adapters/GeminiAdapter';
import { ReplicateAdapter } from '@/lib/ai/v2/adapters/ReplicateAdapter';
import { getModelsByProvider } from '@/lib/services/AIModelRegistry';
import { getMongoDb } from '@/lib/db/mongodb';

// Reuse executeWithFallback from batch-improve-from-audits.ts
async function executeWithFallback(
  provider: any,
  request: { prompt: string; temperature?: number; maxTokens?: number },
  taskName: string,
  db?: any
): Promise<{ content: string }> {
  // ... copy from batch-improve-from-audits.ts
}

// Agent 1: Technical Writer
async function technicalWriterAgent(research: any, keywords: string[]) {
  const db = await getMongoDb();
  
  // Try Gemini first (if not locked out), fallback to Replicate/OpenAI
  const provider = new GeminiAdapter('gemini-2.0-flash-exp');
  
  const prompt = `You are a Technical Writer specializing in SEO-optimized developer content.
  
  ${TECHNICAL_WRITER_SYSTEM}
  
  Research Data: ${JSON.stringify(research)}
  Keywords: ${keywords.join(', ')}
  `;
  
  const response = await executeWithFallback(
    provider,
    { prompt, temperature: 0.3, maxTokens: 4000 },
    'Technical Writer',
    db
  );
  
  return response.content;
}

// Agent 2-5: Similar pattern
```

### Option 2: Port Logic to Python

**Why:**
- Keep Python Lambda infrastructure
- But add proven model selection

**Implementation:**
```python
# lambda/lib/model_selector.py

from pymongo import MongoClient
from datetime import datetime
import os

async def get_best_model(provider: str, capability: str, db):
    """
    Get best model from ai_models collection
    
    Args:
        provider: 'openai', 'anthropic', 'replicate', etc.
        capability: 'text', 'vision', 'audio', etc.
        db: MongoDB database instance
    
    Returns:
        Model ID string
    """
    models = db['ai_models'].find({
        'provider': provider,
        'status': 'active',
        'isAllowed': {'$ne': False},
        'capabilities': capability
    })
    
    # Sort by lastVerified (most recent first), then recommended
    models_list = list(models)
    models_list.sort(key=lambda m: (
        m.get('lastVerified', datetime.min),
        m.get('recommended', False)
    ), reverse=True)
    
    if models_list:
        return models_list[0]['id']
    
    # Fallback to defaults
    defaults = {
        'openai': 'gpt-4o-mini',
        'anthropic': 'claude-3-5-sonnet-20241022',
        'replicate': 'meta/meta-llama-3-70b-instruct'
    }
    return defaults.get(provider, 'gpt-4o-mini')

async def execute_with_fallback(provider, request, task_name, db):
    """
    Execute AI request with automatic fallback
    Gemini → Replicate (from DB) → OpenAI
    """
    try:
        return await provider.execute(request)
    except Exception as e:
        error_msg = str(e)
        
        # Check for quota errors
        if '429' in error_msg or 'quota' in error_msg.lower():
            print(f"⚠️  Quota exceeded for {task_name}, switching to Replicate...")
            
            # Get best Replicate model from database
            model_id = await get_best_model('replicate', 'text', db)
            fallback = ReplicateAdapter(model_id)
            
            try:
                response = await fallback.execute(request)
                
                # Mark model as verified
                db['ai_models'].update_one(
                    {'id': model_id},
                    {'$set': {'lastVerified': datetime.now()}}
                )
                
                return response
            except:
                # Fallback to OpenAI
                print(f"⚠️  Replicate failed, trying OpenAI...")
                openai = OpenAIAdapter('gpt-4o-mini')
                return await openai.execute(request)
        
        raise e
```

### Option 3: Hybrid (Best of Both)

**Why:**
- Use TypeScript for generation (proven infrastructure)
- Use Python Lambda for API endpoint (if needed)

**Implementation:**
```bash
# Generate articles via TypeScript script
pnpm tsx scripts/content/generate-seo-articles.ts

# Or via API endpoint (calls TypeScript script)
curl -X POST /api/admin/content/generate-article \
  -d '{"research": {...}, "keywords": [...]}'
```

---

## AI Slop Detection Integration

### Add to Each Agent System Prompt

```python
QUALITY_GUIDELINES = """
CRITICAL: Avoid AI slop at all costs.

**Forbidden Phrases:**
- "delve" → Use "explore", "examine", "analyze"
- "leverage" → Use "use", "apply", "utilize"
- "utilize" → Use "use"
- "revolutionary" → Use "new", "significant", "important"
- "game-changing" → Use "impactful", "valuable"
- "cutting-edge" → Use "modern", "current", "latest"

**Forbidden Patterns:**
- Generic statements without specifics
- Obvious advice ("make sure to test your code")
- Fluffy introductions ("In today's fast-paced world...")
- Salesy language ("This amazing tool will transform...")

**Required:**
- Specific examples (real tools, real code, real numbers)
- Concrete advice (actionable steps, not platitudes)
- Direct language (get to the point quickly)
- Honest assessment (include trade-offs, limitations)

**Quality Check:**
If you find yourself writing:
- "It's important to..." → Delete it, be specific
- "One of the best..." → Quantify or cite source
- "Simply..." → If it's simple, don't say it
- "Just..." → Remove filler words
"""

# Add to each agent's system prompt
TECHNICAL_WRITER_SYSTEM = f"""You are a Technical Writer...

{QUALITY_GUIDELINES}

Your role:
- Structure articles with proper H2/H3 headings
...
"""
```

### Post-Generation Quality Check

```python
def detect_ai_slop(content: str) -> dict:
    """
    Detect AI slop indicators in generated content
    
    Returns:
        {
            'has_slop': bool,
            'slop_count': int,
            'slop_phrases': list,
            'quality_score': float  # 0-10
        }
    """
    slop_indicators = [
        'delve', 'leverage', 'utilize', 'revolutionary', 'game-changing',
        'cutting-edge', 'state-of-the-art', 'robust', 'seamless',
        'in today\'s fast-paced world', 'it\'s important to',
        'one of the best', 'simply', 'just need to'
    ]
    
    content_lower = content.lower()
    found_slop = []
    
    for indicator in slop_indicators:
        if indicator in content_lower:
            count = content_lower.count(indicator)
            found_slop.append({'phrase': indicator, 'count': count})
    
    slop_count = sum(s['count'] for s in found_slop)
    word_count = len(content.split())
    slop_ratio = slop_count / word_count if word_count > 0 else 0
    
    # Quality score: 10 = no slop, 0 = >5% slop
    quality_score = max(0, 10 - (slop_ratio * 200))
    
    return {
        'has_slop': slop_count > 0,
        'slop_count': slop_count,
        'slop_phrases': found_slop,
        'quality_score': round(quality_score, 1)
    }

# Use in article generation
async def generate_article(research, keywords):
    # ... generate article
    
    # Quality check
    quality = detect_ai_slop(final_article)
    
    if quality['quality_score'] < 7:
        print(f"⚠️  Low quality score: {quality['quality_score']}/10")
        print(f"   Found {quality['slop_count']} AI slop indicators:")
        for phrase in quality['slop_phrases']:
            print(f"   - '{phrase['phrase']}' ({phrase['count']}x)")
        
        # Regenerate or manual review
        if quality['quality_score'] < 5:
            print("   🔄 Regenerating article...")
            # ... regenerate
    
    return final_article, quality
```

---

## Recommended Implementation

### Phase 1: Port to TypeScript (This Weekend)

**Why:**
- Reuse ALL proven infrastructure
- Faster to implement (copy/paste from batch-improve-from-audits.ts)
- No need to port logic to Python

**Steps:**
1. Create `scripts/content/generate-seo-articles.ts`
2. Copy `executeWithFallback` from `batch-improve-from-audits.ts`
3. Copy model selection logic
4. Add AI slop detection
5. Add 5 agent functions (Technical Writer, Developer Advocate, etc.)
6. Add quality check after generation

**Time:** 2-3 hours  
**Cost:** Same ($0.50/article)  
**Quality:** Higher (proven systems)

### Phase 2: Add Quality Grading (Next Week)

**Why:**
- Ensure articles meet same standards as prompts
- Catch AI slop before publishing

**Steps:**
1. Reuse audit pipeline from `batch-improve-from-audits.ts`
2. Add article-specific grading rubric
3. Auto-regenerate if score < 8.0

**Time:** 1-2 hours  
**Cost:** +$0.10/article for audit  
**Quality:** Production-grade

---

## Next Steps

1. **Today:** Port article generator to TypeScript
2. **This Weekend:** Generate 18 articles with quality checks
3. **Next Week:** Add audit pipeline for articles

**Want me to create the TypeScript version now?**
