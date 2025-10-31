# Intelligent Prompt Library Expansion System

**Status:** ✅ Ready to Execute  
**Script:** `scripts/content/expand-prompt-library.ts`  
**Purpose:** Continuously improve and expand the prompt library using AI-driven analysis

---

## Overview

This system automatically:
1. ✅ **Analyzes** existing prompts to find gaps
2. ✅ **Identifies** missing roles and personas
3. ✅ **Generates** 20+ new high-quality prompts per run
4. ✅ **Recommends** optimal prompt frameworks (CRAFT, KERNEL, Chain-of-Thought, etc.)
5. ✅ **Recommends** cost-effective AI models per task type
6. ✅ **Red-hat reviews** all prompts with detailed scoring (1-10)
7. ✅ **Avoids duplication** by analyzing existing prompts
8. ✅ **Teaches** users which frameworks and models to use

---

## Features

### 1. Gap Analysis
Identifies what's missing in your library:
- **Missing roles** (e.g., SRE, ML Engineer, Solutions Architect)
- **Underserved categories** (security, DevOps, testing)
- **Complexity gaps** (too many simple prompts, not enough expert-level)

### 2. Smart Prompt Generation
- Uses GPT-4o to generate production-ready prompts
- Each prompt is 80-90% complete (user customizes 10-20%)
- Structured with examples and clear instructions
- Targets specific roles and real engineering problems

### 3. Framework Recommendations
Recommends the best prompt framework for each task:

| Framework | Best For | Complexity | Example Use Case |
|-----------|----------|------------|------------------|
| **CRAFT** | Code generation, templates | Simple | "Generate API endpoint with auth" |
| **KERNEL** | High-stakes, enterprise | Complex | "Production incident response plan" |
| **Chain-of-Thought** | Debugging, analysis | Medium | "Debug performance bottleneck" |
| **Few-Shot** | Consistent format | Medium | "Generate test cases matching style" |
| **Zero-Shot** | Brainstorming, ideation | Simple | "Propose 5 architecture options" |
| **Persona** | Domain expertise | Simple | "As a security expert, review code" |

**Why it matters:** Teaches users which framework works best for their problem type.

### 4. Model Recommendations
Suggests the most cost-effective model:

| Model | Cost/Call | Best For | Reasoning |
|-------|-----------|----------|-----------|
| **GPT-4o-mini** | $0.0001 | Simple tasks, formatting | Cheap and fast |
| **GPT-4o** | $0.005 | Complex code, architecture | Best balance |
| **GPT-4-turbo** | $0.01 | Large codebases | Large context |
| **o1-preview** | $0.15 | Critical bugs, algorithms | Advanced reasoning (use sparingly!) |
| **Claude 3.5 Sonnet** | $0.003 | Code generation | Great at instructions |
| **Gemini Flash** | $0.00015 | Batch processing | Extremely cheap |

**Cost optimization:** Prevents overkill (no $0.15 model for simple formatting!)

### 5. Red-Hat Scoring System
Every generated prompt gets 4 scores (1-10):

#### Score 1: Skill Level
*How specialized is the knowledge required?*
- **1-3**: Any engineer can use this
- **4-7**: Requires some experience  
- **8-10**: Expert-level only

**Example:**
- "Format JSON" → 2/10 (anyone can use)
- "Kubernetes troubleshooting" → 7/10 (needs K8s experience)
- "Design distributed consensus algorithm" → 10/10 (experts only)

#### Score 2: Role Specificity
*How tied is this to a specific role?*
- **1-3**: General use across all roles
- **4-7**: Somewhat role-specific
- **8-10**: Very role-specific

**Example:**
- "Write documentation" → 3/10 (any role)
- "Sprint retrospective facilitator" → 7/10 (managers, leads)
- "Write performance improvement plan" → 10/10 (engineering managers only)

#### Score 3: Usefulness
*Does AI significantly help vs. doing manually?*
- **1-3**: Easy to do without AI, minimal time saved
- **4-7**: Moderate help, some complexity
- **8-10**: AI essential, major time/quality improvement

**Example:**
- "Add TODO comment" → 2/10 (faster to type manually)
- "Generate test cases" → 7/10 (AI saves time, improves coverage)
- "Multi-step incident response with RCA" → 9/10 (AI essential for completeness)

#### Score 4: Optimization
*Is the prompt well-structured and effective?*
- **1-3**: Vague, poorly structured, missing context
- **4-7**: Decent but could improve
- **8-10**: Excellent structure, clear instructions, great examples

**Example:**
- "Write code" → 2/10 (too vague)
- "Write a function that..." → 6/10 (decent, could add more context)
- "Write a TypeScript function that... [with examples, edge cases, tests]" → 9/10 (excellent!)

#### Overall Score
*Average of all 4 scores*
- **8-10**: Featured prompts (shown first in library)
- **6-8**: Good quality, include in library
- **4-6**: Needs improvement before adding
- **<4**: Reject, regenerate

---

## Usage

### Analyze Existing Library
```bash
pnpm exec tsx scripts/content/expand-prompt-library.ts --analyze
```

**Output:**
```
📊 ANALYZING EXISTING PROMPT LIBRARY
✅ Total prompts: 90
✅ Existing roles: 12
⚠️  Missing roles (15):
   - site-reliability-engineer
   - principal-engineer
   - ml-engineer
   - solutions-architect
   ...
```

### Dry Run (Test Without Saving)
```bash
pnpm exec tsx scripts/content/expand-prompt-library.ts --dry-run --generate=5
```

Generates 5 prompts, shows results, but doesn't save to MongoDB.

### Generate 20 New Prompts
```bash
pnpm exec tsx scripts/content/expand-prompt-library.ts --generate=20
```

**What happens:**
1. Analyzes existing 90 prompts
2. Identifies gaps (missing roles, underserved categories)
3. Generates 20 NEW prompts targeting those gaps
4. Red-hat reviews each prompt (1-10 scoring)
5. Recommends framework and model for each
6. Saves to MongoDB

**Cost:** ~$0.15 for 20 prompts (GPT-4o for generation + GPT-4o-mini for reviews)

### Full Run (20 Prompts + Analysis)
```bash
pnpm exec tsx scripts/content/expand-prompt-library.ts --full
```

Runs complete cycle: analyze → generate → review → save

---

## Example Output

### Generated Prompt Example

```
🤖 GENERATING 20 NEW PROMPTS

[1/20] Generating prompt...
   ✅ Kubernetes Pod Crash Investigation (SRE)
      Role: site-reliability-engineer | Category: debugging
      Framework: Chain-of-Thought | Model: gpt-4o
      Red-Hat Score: 8.5/10

RED-HAT REVIEW:
├─ Skill Level: 8/10 (requires K8s expertise)
├─ Role Specificity: 9/10 (SRE/DevOps specific)
├─ Usefulness: 9/10 (AI essential for systematic debugging)
├─ Optimization: 7/10 (well-structured, could add more examples)
└─ Overall: 8.3/10 ⭐ FEATURED

FRAMEWORK: Chain-of-Thought
Why: Multi-step debugging requires step-by-step reasoning

MODEL: gpt-4o ($0.005/call)
Why: Complex debugging justifies the cost vs. gpt-4o-mini

PROMPT CONTENT:
You are a Site Reliability Engineer investigating a Kubernetes pod crash...
[Full prompt with step-by-step debugging guide]
```

### Summary Report

```
📊 GENERATION SUMMARY

Total prompts generated: 20
Average red-hat score: 7.8/10
High-quality prompts (8+): 12
New roles added: 5
   - site-reliability-engineer (3 prompts)
   - ml-engineer (2 prompts)
   - solutions-architect (4 prompts)
   - security-engineer (6 prompts)
   - principal-engineer (5 prompts)

🏆 TOP 5 PROMPTS BY RED-HAT SCORE:

1. Security Audit for Production API (9.2/10)
   Comprehensive security checklist for API review
   Framework: KERNEL | Model: gpt-4o
   Scores: Skill 9/10 | Role 9/10 | Useful 10/10 | Optimized 9/10

2. Distributed System Design Review (8.8/10)
   Systematic review of distributed architecture
   Framework: Chain-of-Thought | Model: gpt-4o
   Scores: Skill 9/10 | Role 8/10 | Useful 9/10 | Optimized 9/10

3. ML Model Deployment Checklist (8.5/10)
   Production readiness for ML models
   Framework: KERNEL | Model: gpt-4o
   Scores: Skill 8/10 | Role 9/10 | Useful 9/10 | Optimized 8/10

...

💾 SAVING 20 NEW PROMPTS TO DATABASE
✅ Saved 20 prompts to MongoDB
   12 marked as featured (score >= 8)
```

---

## Teaching Moments in UI

### Show Framework Recommendations
On each prompt page:

```
🎯 RECOMMENDED FRAMEWORK: Chain-of-Thought

Why? This prompt requires multi-step reasoning to solve complex 
debugging problems. Chain-of-Thought helps the AI "show its work" 
for better accuracy.

Learn more: /learn/chain-of-thought
```

### Show Model Recommendations
```
💡 RECOMMENDED MODEL: GPT-4o ($0.005/call)

Why? This is a complex coding task that justifies the cost. 
Using gpt-4o-mini ($0.0001) would save money but reduce quality.

For simple tasks, consider: gpt-4o-mini
Learn more: /learn/choosing-ai-models
```

### Cost Comparison Widget
```
COST COMPARISON FOR THIS PROMPT:

○ gpt-4o-mini:   $0.0001  ⚠️  May produce lower quality
● gpt-4o:        $0.005   ✅ RECOMMENDED (best balance)
○ o1-preview:    $0.15    ⚠️  Overkill for this task

Estimated uses: 100/month
Monthly cost: $0.50 (vs. $0.01 with mini or $15 with o1)
```

---

## Red-Hat Review Examples

### Example 1: High-Quality Prompt (9.1/10)

**Prompt:** "Production Incident Response Plan for Database Outage"  
**Role:** site-reliability-engineer  
**Framework:** KERNEL  

**Scores:**
- Skill Level: 9/10 (expert-level SRE knowledge)
- Role Specificity: 10/10 (SRE/DevOps only)
- Usefulness: 9/10 (AI essential for comprehensive planning)
- Optimization: 9/10 (excellent structure, examples, checklists)
- **Overall: 9.3/10** ⭐ **FEATURED**

**Reasoning:**
"This prompt is exceptionally well-structured with clear sections for detection, triage, mitigation, and post-mortem. It includes concrete examples for common database issues (replication lag, connection pool exhaustion, disk I/O). The KERNEL framework ensures all guardrails are in place. Perfect for high-stakes production incidents."

**Decision:** ✅ Add to library, mark as featured

---

### Example 2: Medium-Quality Prompt (6.2/10)

**Prompt:** "Write Code"  
**Role:** mid-engineer  
**Framework:** Zero-Shot  

**Scores:**
- Skill Level: 3/10 (anyone can use)
- Role Specificity: 2/10 (not role-specific)
- Usefulness: 8/10 (AI helpful for code generation)
- Optimization: 2/10 (way too vague, no context)
- **Overall: 3.8/10** ⚠️ **NEEDS IMPROVEMENT**

**Reasoning:**
"While AI is useful for code generation (8/10 usefulness), this prompt is far too vague (2/10 optimization). It lacks context about language, requirements, constraints, testing needs. Users would waste time clarifying what they want. Needs complete restructuring with CRAFT or Few-Shot framework."

**Decision:** ❌ Reject, regenerate with better structure

---

### Example 3: Role-Specific Prompt (8.0/10)

**Prompt:** "1-on-1 Coaching Conversation Prep for Underperforming Engineer"  
**Role:** engineering-manager  
**Framework:** CRAFT  

**Scores:**
- Skill Level: 6/10 (requires management experience)
- Role Specificity: 10/10 (engineering managers only)
- Usefulness: 8/10 (AI saves significant time, improves quality)
- Optimization: 8/10 (well-structured with examples)
- **Overall: 8.0/10** ⭐ **FEATURED**

**Reasoning:**
"This prompt is highly role-specific (10/10) and well-optimized (8/10) with clear structure: situation analysis, conversation goals, talking points, follow-up plan. The CRAFT framework ensures managers get actionable guidance. AI is genuinely useful here (8/10) vs. managers winging difficult conversations."

**Decision:** ✅ Add to library, mark as featured

---

## Continuous Improvement

### Weekly Run
```bash
# Every Monday, generate 10 new prompts
cron: 0 9 * * 1
pnpm exec tsx scripts/content/expand-prompt-library.ts --generate=10
```

### Monthly Deep Analysis
```bash
# First of each month, full analysis + 50 prompts
cron: 0 9 1 * *
pnpm exec tsx scripts/content/expand-prompt-library.ts --full --generate=50
```

### Quality Control
- Prompts scoring <6/10 are flagged for review
- Prompts scoring 8+/10 are auto-featured
- Monthly review of low-scoring prompts (improve or remove)

---

## Database Schema

Each generated prompt is saved with metadata:

```typescript
{
  id: "generated-1730400000-abc123",
  title: "Kubernetes Pod Crash Investigation",
  description: "Systematic debugging guide for K8s pod failures",
  content: "You are an SRE investigating...", // Full prompt
  category: "debugging",
  role: "site-reliability-engineer",
  pattern: "chain-of-thought",
  tags: ["kubernetes", "debugging", "sre", "production"],
  difficulty: "advanced",
  isFeatured: true, // If score >= 8
  views: 0,
  rating: 0,
  ratingCount: 0,
  createdAt: ISODate("2025-10-31..."),
  updatedAt: ISODate("2025-10-31..."),
  
  // Expansion metadata
  metadata: {
    recommendedFramework: "Chain-of-Thought",
    frameworkReasoning: "Multi-step debugging requires reasoning",
    recommendedModel: "gpt-4o",
    modelReasoning: "Complex debugging justifies cost",
    estimatedCostPerUse: 0.005,
    
    redHatScores: {
      skillLevel: 8,
      roleSpecificity: 9,
      usefulness: 9,
      optimization: 7,
      overall: 8.3,
      reasoning: "Well-structured, highly useful..."
    },
    
    generatedBy: "ai-expansion-system",
    generatedAt: ISODate("2025-10-31...")
  }
}
```

---

## Success Metrics

### Library Growth
- **Target:** Add 20-50 new prompts per month
- **Quality bar:** Average red-hat score >= 7.0/10
- **Featured rate:** 40-60% of new prompts score 8+/10

### Role Coverage
- **Target:** All 30 comprehensive roles have at least 3 prompts
- **Current gaps:** SRE, ML Engineer, Solutions Architect
- **Priority:** Fill missing roles first

### Category Balance
- **Target:** No category has <10 prompts
- **Current gaps:** Security (5 prompts), ML/Data (3 prompts)
- **Priority:** Underserved categories

### Cost Efficiency
- **Target:** Average cost per prompt generation <= $0.01
- **Current:** $0.0075 per prompt (GPT-4o + GPT-4o-mini reviews)
- **Optimization:** Use gpt-4o-mini for simpler prompts

---

## Future Enhancements

### Phase 2 (Month 2)
- [ ] User feedback loop (thumbs up/down on prompts)
- [ ] Automatic prompt improvement (re-generate low-scoring prompts)
- [ ] Multi-language support (generate prompts in Spanish, Japanese, etc.)
- [ ] Prompt versioning (track improvements over time)

### Phase 3 (Month 3)
- [ ] Community contributions (users submit prompts)
- [ ] A/B testing (test different frameworks for same task)
- [ ] Personalization (learn user preferences, suggest relevant prompts)
- [ ] Prompt collections (curated sets for specific workflows)

---

## Related Documentation

- [Multi-Model Testing](./MULTI_MODEL_TESTING.md) - Test prompts with AI
- [Tag Taxonomy](./TAG_TAXONOMY.md) - Categorization system
- [PMI Patterns Mapping](./PMI_PATTERNS_MAPPING.md) - Teaching framework
- [Test Results Summary](./TEST_RESULTS_SUMMARY.md) - Latest test results

---

## Next Steps

1. ✅ Script created and ready to run
2. ⚠️ Run analysis: `pnpm exec tsx scripts/content/expand-prompt-library.ts --analyze`
3. ⚠️ Generate 5 test prompts: `pnpm exec tsx scripts/content/expand-prompt-library.ts --dry-run --generate=5`
4. ⚠️ Review results, adjust scoring criteria if needed
5. ⚠️ Run full generation: `pnpm exec tsx scripts/content/expand-prompt-library.ts --generate=20`
6. ⚠️ Build UI to display framework/model recommendations
7. ⚠️ Set up weekly cron job for continuous expansion

**Ready to expand your library! 🚀**

