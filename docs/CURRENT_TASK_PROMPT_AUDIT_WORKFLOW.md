# Prompt Audit & Revision Workflow - Current Task

**Date:** November 5, 2025  
**Status:** In Progress  
**Current Prompt:** Architecture Decision Record (ADR) - `doc-001`

---

## 🎯 Current Objective

We are implementing a complete audit → revise → re-audit workflow for prompts:

1. **Audit** the Architecture Decision Record (ADR) prompt using multi-agent system
2. **Review** the audit scores and feedback
3. **Revise** the prompt based on feedback (keeping on v1 until approved)
4. **Re-audit** to see score improvement
5. **Approve** changes
6. **Create v2** revision after approval

---

## 📋 What We've Built

### 1. Revision Tracking System ✅
- **Database Schema:** `prompt_revisions` collection tracks all changes
- **Automatic Tracking:** Every prompt update creates a revision automatically
- **Revision History:** Full change history with field-level tracking
- **UI Component:** `PromptRevisions` component shows revision history on prompt pages
- **Comparison Tool:** Side-by-side diff view comparing any two revisions

### 2. Multi-Agent Audit System ✅
- **11 Base Agents:** Engineering, Product, SEO, Enterprise, Security, Compliance, etc.
- **Dynamic Agents:** Role-specific and pattern-specific reviewers added automatically
- **Grading Rubric:** 8 categories scored 1-10:
  - Engineering Usefulness (25% weight)
  - Case Study Quality (15%)
  - Completeness (15%)
  - SEO Enrichment (10%)
  - Enterprise Readiness (15%)
  - Security & Compliance (10%)
  - Accessibility (5%)
  - Performance (5%)
- **Comprehensive Feedback:** Issues, recommendations, missing elements

### 3. Database Setup ✅
- **120 prompts** initialized with `currentRevision: 1`
- **120 initial revisions** created
- **8 database indexes** created for performance
- **Freemium fields** added: `isPremium`, `isPublic`, `requiresAuth`

### 4. API Endpoints ✅
- `GET /api/prompts/[id]/revisions` - Get revision history
- `GET /api/prompts/[id]/revisions/compare?revision1=X&revision2=Y` - Compare revisions
- `GET /api/prompts/[id]/audit` - Get audit scores
- `POST /api/prompts/[id]/audit` - Trigger new audit
- `PATCH /api/prompts/[id]` - Update prompt (auto-creates revision)

### 5. UI Components ✅
- `PromptRevisions` - Shows revision history
- `RevisionComparison` - Side-by-side diff view
- `PromptAuditScores` - Displays audit results
- `PromptEnrichment` - Shows enrichment fields (case studies, best practices, etc.)
- `PremiumPromptLock` - Upgrade messaging for premium prompts

---

## 🔧 Technical Fixes Made

### Build Error Fix ✅
**Problem:** Next.js couldn't resolve imports from `scripts` directory

**Solution:**
1. Added webpack alias in `next.config.js`:
   ```js
   config.resolve.alias = {
     ...config.resolve.alias,
     '@/scripts': path.join(__dirname, 'scripts'),
   };
   ```

2. Added TypeScript path mapping in `tsconfig.json`:
   ```json
   "paths": {
     "@/*": ["./src/*"],
     "@/scripts/*": ["./scripts/*"]
   }
   ```

3. Updated API route to use alias:
   ```typescript
   const auditModule = await import('@/scripts/content/audit-prompts-patterns');
   ```

**Status:** ✅ Fixed - Build should now work

---

## 🚨 Known Issues

### 1. Live Site Shows 32 Prompts Instead of 120
**Status:** ⚠️ Needs Investigation  
**Impact:** Site may be using cached JSON files instead of MongoDB  
**Action Needed:** Regenerate JSON files or check data source

### 2. AI Models Need Verification
**Status:** ⚠️ Needs Testing  
**Models Used:** 
- Replicate: `openai/gpt-5`, `anthropic/claude-4.5-haiku`
- Fallbacks: `meta/llama-3.1-405b-instruct`
**Action Needed:** Verify all models work correctly during audit

---

## 📝 Current Task: Audit ADR Prompt

### Target Prompt
- **Title:** Architecture Decision Record (ADR)
- **ID:** `doc-001`
- **Slug:** `architecture-decision-record-adr`
- **URL:** `/prompts/architecture-decision-record-adr`
- **Category:** documentation
- **Role:** engineering-manager
- **Pattern:** template
- **Current Revision:** v1

### Test Script Created
**File:** `scripts/content/test-audit-adr.ts`

**What it does:**
1. Finds the ADR prompt (`doc-001`)
2. Runs multi-agent audit
3. Displays scores and feedback
4. Saves results to `prompt_audit_results` collection
5. Shows top issues and recommendations

### How to Run
```bash
pnpm tsx scripts/content/test-audit-adr.ts
```

**Expected Output:**
- Overall score (1-10)
- Category scores (8 categories)
- Agent reviews (11+ agents)
- Issues found
- Recommendations
- Missing elements

---

## 🔄 Workflow Steps

### Step 1: Initial Audit (v1) ✅ Ready
```bash
# Run audit
pnpm tsx scripts/content/test-audit-adr.ts

# Or via API
POST /api/prompts/doc-001/audit
```

**What to Check:**
- ✅ All AI models work correctly
- ✅ Valid scores generated (not 0/10)
- ✅ Results saved to database
- ✅ Agent feedback is comprehensive

### Step 2: Review Audit Results ⏳ Next
- Review overall score
- Check category scores (especially Engineering Usefulness, Case Study Quality)
- Read agent feedback
- Identify top issues and recommendations
- Note missing elements

### Step 3: Revise Prompt (Stay on v1) ⏳ Pending
**Fields to Update:**
- `content` - Improve prompt template
- `description` - Enhance description
- `caseStudies` - Add real-world examples
- `bestTimeToUse` - Add guidance
- `recommendedModel` - Suggest AI models
- `useCases` - Add specific use cases
- `examples` - Add more examples
- `bestPractices` - Add best practices
- `whenNotToUse` - Add when NOT to use
- `difficulty` - Set difficulty level
- `estimatedTime` - Add time estimate

**How to Update:**
```bash
# Use enrich script
pnpm tsx scripts/content/enrich-prompt.ts --id=doc-001

# Or via API
PATCH /api/prompts/doc-001
{
  "content": "...",
  "caseStudies": [...],
  "changeReason": "Enrichment based on audit feedback"
}
```

**Note:** Update will create revision automatically, but we'll stay on v1 until approved.

### Step 4: Re-Audit Revised Prompt ⏳ Pending
```bash
# Run audit again
pnpm tsx scripts/content/test-audit-adr.ts
```

**What to Check:**
- Score improvement (should go up)
- Category scores improved
- Fewer issues
- Recommendations addressed

### Step 5: Approve Changes ⏳ Pending
- Review improved scores
- Verify all feedback addressed
- Confirm quality improvement

### Step 6: Create v2 (After Approval) ⏳ Pending
**After approval:**
- Make final update if needed
- System will automatically create v2 revision
- Changes will be tracked in revision history

---

## 📊 Audit System Details

### Agents in Audit Pipeline

**Base Agents (11):**
1. **Engineering Team Reviewer** - Optimized for engineering workflows
2. **Product Team Reviewer** - Product strategy and UX
3. **Roles & Use Cases Reviewer** - Role relevance and use cases
4. **SEO Enrichment Reviewer** - SEO optimization
5. **Enterprise Reviewer** - Enterprise readiness
6. **Web Security Reviewer** - Security and compliance
7. **Compliance Reviewer** - Regulatory compliance
8. **Completeness Reviewer** - Missing fields and completeness
9. **Enterprise SaaS Expert** - SaaS best practices
10. **Grading Rubric Expert** - Comprehensive scoring

**Dynamic Agents (Added Automatically):**
- **Role-Specific Reviewer** - Based on prompt's `role` field
- **Pattern-Specific Reviewer** - Based on prompt's `pattern` field

**Total:** 11-13 agents per audit

### AI Models Used

**Primary Models:**
- `openai/gpt-5` (via Replicate) - For product analysis
- `anthropic/claude-4.5-haiku` (via Replicate) - For engineering reviews

**Fallbacks:**
- `meta/llama-3.1-405b-instruct` (via Replicate) - Last resort

**Provider:** Replicate (configured with `REPLICATE_ALLOW_ALL=true`)

### Cost Considerations
- Using cheaper models for initial passes (`claude-4.5-haiku` vs `gpt-5`)
- Token usage tracked per request
- Costs calculated from database (not hardcoded)

---

## 🔍 Verification Checklist

Before proceeding with audit:

- [ ] **Build passes** - No import errors
- [ ] **Database connected** - MongoDB accessible
- [ ] **AI models configured** - Replicate API key set
- [ ] **Environment variables** - All required vars in `.env.local`
- [ ] **Prompt exists** - `doc-001` found in database
- [ ] **Audit script works** - Can import `PromptPatternAuditor`
- [ ] **API endpoint works** - `/api/prompts/[id]/audit` accessible

After audit:

- [ ] **Scores generated** - Not all zeros
- [ ] **Results saved** - In `prompt_audit_results` collection
- [ ] **Agent feedback present** - Multiple agents reviewed
- [ ] **Issues identified** - Specific, actionable issues
- [ ] **Recommendations provided** - Clear improvement suggestions

---

## 📁 Key Files

### Scripts
- `scripts/content/audit-prompts-patterns.ts` - Main auditor class
- `scripts/content/test-audit-adr.ts` - Test script for ADR prompt
- `scripts/content/enrich-prompt.ts` - Enrich prompt with details
- `scripts/db/initialize-prompt-revisions.ts` - Initialize revisions
- `scripts/db/create-revision-indexes.ts` - Create indexes

### API Routes
- `src/app/api/prompts/[id]/audit/route.ts` - Audit API
- `src/app/api/prompts/[id]/revisions/route.ts` - Revision history API
- `src/app/api/prompts/[id]/revisions/compare/route.ts` - Comparison API
- `src/app/api/prompts/[id]/route.ts` - Update prompt (creates revision)

### Components
- `src/components/features/PromptRevisions.tsx` - Revision history UI
- `src/components/features/RevisionComparison.tsx` - Comparison UI
- `src/components/features/PromptAuditScores.tsx` - Audit scores UI
- `src/components/features/PromptEnrichment.tsx` - Enrichment fields UI
- `src/components/features/PremiumPromptLock.tsx` - Premium lock UI

### Schemas
- `src/lib/db/schemas/prompt-revision.ts` - Revision schema
- `src/lib/schemas/prompt.ts` - Prompt schema (updated with freemium fields)

### Config
- `next.config.js` - Webpack alias for scripts directory
- `tsconfig.json` - TypeScript path mapping

---

## 🚀 Next Steps After Reboot

1. **Verify Build Works**
   ```bash
   pnpm run build
   ```
   Should complete without import errors

2. **Run Initial Audit**
   ```bash
   pnpm tsx scripts/content/test-audit-adr.ts
   ```
   Verify all models work and scores are generated

3. **Check Database**
   ```bash
   # Verify audit results saved
   pnpm tsx -e "
   import { getMongoDb } from './src/lib/db/mongodb.ts';
   const db = await getMongoDb();
   const result = await db.collection('prompt_audit_results').findOne({ promptId: 'doc-001' });
   console.log('Audit Result:', JSON.stringify(result, null, 2));
   "
   ```

4. **Review Audit Results**
   - Check overall score
   - Review category scores
   - Read agent feedback
   - Identify improvements needed

5. **Revise Prompt**
   - Use `enrich-prompt.ts` script or API
   - Address issues and recommendations
   - Add missing elements
   - Keep on v1 (don't create v2 yet)

6. **Re-Audit**
   - Run audit again
   - Compare scores
   - Verify improvements

7. **Approve & Create v2**
   - After approval, make final update
   - System creates v2 automatically

---

## 📝 Notes

- **Version Control:** All changes tracked in `prompt_revisions` collection
- **No Data Loss:** Full snapshots saved at each revision
- **Audit Trail:** Complete history of who changed what and when
- **SEO Benefits:** Revision history shows active maintenance
- **Freemium Ready:** Can mark prompts as premium for future paywall

---

## 🐛 Troubleshooting

### If Build Fails
1. Check `next.config.js` has webpack alias
2. Check `tsconfig.json` has path mapping
3. Verify `scripts/content/audit-prompts-patterns.ts` exports `PromptPatternAuditor`
4. Check for TypeScript errors

### If Audit Fails
1. Verify MongoDB connection
2. Check Replicate API key (`REPLICATE_API_KEY`)
3. Verify `REPLICATE_ALLOW_ALL=true` in `.env.local`
4. Check model availability in Replicate dashboard
5. Review error logs for specific model issues

### If Scores Are Zero
1. Check agent responses in `agentReviews` field
2. Verify JSON parsing in rubric expert
3. Check score extraction logic
4. Review agent system prompts

### If Revision Not Created
1. Check `PATCH /api/prompts/[id]` endpoint
2. Verify `createRevision` function works
3. Check MongoDB connection
4. Verify prompt exists in database

---

## 📚 Documentation

- **Revision Strategy:** `docs/content/PROMPT_REVISION_FREEMIUM_STRATEGY.md`
- **Multi-Agent System:** `docs/content/MULTI_AGENT_SYSTEM_COMPREHENSIVE.md`
- **Cost Analysis:** `docs/content/COST_ANALYSIS_PROMPT_GENERATION.md`
- **Enrichment Requirements:** `docs/content/PROMPT_ENRICHMENT_REQUIREMENTS.md`

---

## ✅ Completion Criteria

**Audit Complete When:**
- [x] All AI models work correctly
- [ ] Valid scores generated (not all zeros)
- [ ] Results saved to database
- [ ] Agent feedback comprehensive
- [ ] Issues and recommendations clear

**Revision Complete When:**
- [ ] Prompt updated based on feedback
- [ ] All enrichment fields added
- [ ] Re-audit shows score improvement
- [ ] Changes approved
- [ ] v2 revision created

---

**Last Updated:** November 5, 2025  
**Status:** Ready for Audit After Reboot


