# Workflows Page Content Verification Report

**Date:** 2025-11-14  
**Page:** `/workflows`  
**Status:** Needs Review & Refinement

---

## Content Verification Checklist

### ✅ Verified Content

1. **Workflows vs Guardrails Distinction** ✅
   - **Status:** Clear and accurate
   - **Content:** Workflows = manual checklists, Guardrails = automated enforcement
   - **Alignment:** Matches site messaging about manual workflows today, automation in beta
   - **Action:** None needed

2. **Workflow Selection Criteria** ✅
   - **Status:** Accurate and aligned
   - **Content:** Criteria match actual workflow selection process
   - **Alignment:** Consistent with documentation in `docs/planning/WORKFLOWS_GUARDRAILS_EXECUTION_NOTES.md`
   - **Action:** None needed

3. **Guardrail Evolution Path** ✅
   - **Status:** Clear progression path
   - **Content:** Manual → Automation → Platform scaling
   - **Alignment:** Matches waitlist page messaging
   - **Action:** None needed

---

## ⚠️ Content Issues & Followup Needed

### 1. Source Citations Need Verification

**Issue:** Several 2025 reports may not exist yet or URLs may be incorrect.

**Affected Content:**
- GitClear 2025 State of AI Commit Quality
- Stack Overflow 2025 Developer Survey
- Veracode 2025 AI Security Report
- Developer Survey Aggregate 2025

**Status:** 🔴 **NEEDS VERIFICATION**
- **Action Required:** 
  - Verify all 2025 report URLs are accessible
  - Check if reports exist or use 2024 versions
  - Update `verified-sources.ts` with correct URLs
  - Mark sources as verified or use most recent available version

**Priority:** High (affects credibility)

---

### 2. Claims About "Engify's Guardrails"

**Issue:** The Veracode card says "Engify's guardrails require SAST/SCA..." but we're not selling guardrails yet.

**Location:** `WHY_GUARDRAILS_MATTER` array, Security card

**Current Text:**
> "Veracode's AI Security Report found 45% of AI-generated snippets ship with vulnerabilities. Engify's guardrails require SAST/SCA and secret scanning before merge."

**Problem:** 
- Suggests Engify has a product with guardrails (we don't yet)
- Should focus on what the workflows recommend, not what "Engify's guardrails" do

**Status:** 🔴 **NEEDS REWRITE**
- **Suggested Fix:** 
  > "Veracode's AI Security Report found 45% of AI-generated snippets ship with vulnerabilities. Our workflows require SAST/SCA and secret scanning before merge."

**Priority:** High (affects positioning)

---

### 3. "Developer Survey Aggregate 2025" is Vague

**Issue:** This source is too generic and may not exist as a single source.

**Location:** `WHY_GUARDRAILS_MATTER` array, Context drift card

**Current Text:**
> "Developer surveys show teams lose 10–15 hours per week when AI incidents aren't logged."

**Problem:**
- "Developer Survey Aggregate 2025" is not a real publication
- The stat (10-15 hours) needs a specific source
- Currently links to Stack Overflow 2025 survey, which may not have this specific stat

**Status:** 🔴 **NEEDS RESEARCH**
- **Action Required:**
  - Find actual source for "10-15 hours per week" stat
  - Or remove the specific number and make it more general
  - Update source to reflect actual research

**Priority:** Medium (affects credibility)

---

### 4. Guardrails Card Mentions Automation But Page Focuses on Manual

**Issue:** The Guardrails card talks about automation, but the page is primarily about manual workflows.

**Location:** Workflows vs Guardrails cards section

**Current Content:**
- Guardrails card mentions "automated quality gates", "pre-commit hooks", "CI/CD integration"
- But the workflows themselves are all manual checklists

**Status:** 🟡 **NEEDS CLARIFICATION**
- **Issue:** May confuse users - are we selling automation or just documenting manual processes?
- **Suggested Fix:** 
  - Clarify that guardrails ARE the automation we're building (beta)
  - Workflows are the manual foundation that guardrails will automate
  - Make the relationship clearer: "Workflows (today) → Guardrails (beta/coming)"

**Priority:** Medium (affects clarity)

---

### 5. Home Page vs Workflows Page Messaging Mismatch

**Issue:** Home page says "Ship AI Guardrails With Institutional Memory" and mentions automation, but workflows page is mostly manual.

**Home Page Claims:**
- "automation hooks for CI/CD"
- "incident recall built in"
- "always-on automation"

**Workflows Page Reality:**
- All workflows are manual checklists
- No automation hooks available yet
- Automation is "coming" via beta waitlist

**Status:** 🟡 **NEEDS ALIGNMENT**
- **Action Required:**
  - Either update home page to be more accurate about current state
  - Or update workflows page to better explain the beta/coming automation
  - Ensure messaging is consistent across pages

**Priority:** Medium (affects user expectations)

---

### 6. Research Citation URLs Need Verification

**Issue:** Many workflow research citations don't have URLs yet.

**Location:** `public/data/workflows.json` - `researchCitations` arrays

**Status:** 🟡 **NEEDS ENRICHMENT**
- **Action Required:**
  - Run `enrich-workflow-citations.ts` script to add URLs
  - Verify all URLs are accessible
  - Update workflows.json with verified source URLs
  - Re-seed database if needed

**Priority:** Medium (affects SEO and credibility)

---

### 7. About Page vs Workflows Page Messaging

**About Page Says:**
- "prompt engineering accessible through expert-curated content"
- Focus on "prompt engineering education"
- "Expert Prompts" and "Proven Patterns"

**Workflows Page Says:**
- "Industry-Proven AI Guardrails & Workflows"
- Focus on guardrails and automation
- Workflows, not just prompts

**Status:** 🟡 **NEEDS ALIGNMENT**
- **Issue:** About page doesn't mention workflows/guardrails at all
- **Action Required:**
  - Update About page to mention workflows/guardrails
  - Or clarify that workflows are part of the "hands-on learning" mentioned
  - Ensure consistent messaging about what Engify offers

**Priority:** Low (messaging consistency)

---

## 📋 Recommended Actions

### High Priority

1. **Verify and Update Source Citations**
   - [ ] Check all 2025 report URLs
   - [ ] Use 2024 versions if 2025 don't exist
   - [ ] Update `verified-sources.ts` with correct URLs
   - [ ] Re-run citation enrichment script

2. **Fix "Engify's Guardrails" Claim**
   - [ ] Change "Engify's guardrails" to "Our workflows"
   - [ ] Remove product claims we don't have yet
   - [ ] Focus on what workflows recommend, not what we sell

3. **Research "Developer Survey Aggregate" Stat**
   - [ ] Find actual source for "10-15 hours per week"
   - [ ] Update source citation with real research
   - [ ] Or remove specific number and make general

### Medium Priority

4. **Clarify Workflows vs Guardrails Relationship**
   - [ ] Update Guardrails card to clarify it's coming (beta)
   - [ ] Make relationship clearer: Workflows (today) → Guardrails (beta)
   - [ ] Add timeline or status indicators

5. **Align Home Page and Workflows Page**
   - [ ] Review home page claims about automation
   - [ ] Ensure workflows page accurately reflects current state
   - [ ] Clarify what's available now vs. what's coming

6. **Enrich Workflow Citations**
   - [ ] Run citation enrichment script
   - [ ] Verify all URLs are accessible
   - [ ] Update workflows.json with verified URLs

### Low Priority

7. **Update About Page**
   - [ ] Add mention of workflows/guardrails
   - [ ] Align messaging with workflows page
   - [ ] Ensure consistent value proposition

---

## Content Accuracy Summary

| Section | Status | Issues | Priority |
|---------|--------|--------|----------|
| Hero | ✅ Good | None | - |
| Workflows Card | ✅ Good | None | - |
| Guardrails Card | 🟡 Needs clarity | Automation vs manual confusion | Medium |
| Why Guardrails Matter | 🔴 Needs fixes | Source verification, "Engify's" claim | High |
| Selection Criteria | ✅ Good | None | - |
| Evolution Path | ✅ Good | None | - |
| Research Citations | 🟡 Needs URLs | Many missing verified URLs | Medium |

---

## Next Steps

1. **Immediate:** Fix "Engify's guardrails" claim in Veracode card
2. **This Week:** Verify and update all source citations
3. **This Week:** Research and fix "Developer Survey Aggregate" stat
4. **Next Week:** Clarify workflows vs guardrails relationship
5. **Next Week:** Align home page and workflows page messaging

---

## Notes

- All workflows are currently manual checklists (correct)
- Automation is in beta/coming (needs clearer messaging)
- Sources need verification (2025 reports may not exist)
- Messaging should focus on problems and solutions, not product claims
- Keep "Hire Me" positioning - demonstrate expertise, not sell product

