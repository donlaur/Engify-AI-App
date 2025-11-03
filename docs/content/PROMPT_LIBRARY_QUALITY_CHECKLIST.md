# Prompt Library Quality Checklist

**Date:** November 2, 2025  
**Purpose:** Manual review checklist for prompt library quality

---

## Quality Standards

### ✅ Required Fields
Every prompt MUST have:
- [ ] **Title** - Clear, specific, action-oriented
- [ ] **Description** - 50+ characters explaining value
- [ ] **Content** - 100+ characters of actual prompt
- [ ] **Category** - Proper categorization
- [ ] **Role** - Target audience/persona

### ⚠️ Content Quality

**Descriptions should:**
- [ ] Be 50-150 characters (sweet spot)
- [ ] Explain **what** the prompt does
- [ ] Highlight **value/benefit** to user
- [ ] Avoid generic phrases like "helps you..."

**Prompt Content should:**
- [ ] Be 100+ characters minimum
- [ ] Include specific instructions
- [ ] Avoid overly generic phrases:
  - ❌ "Help me with..."
  - ❌ "Can you please..."
  - ❌ "I need assistance..."
  - ✅ "Analyze [specific thing] and provide [specific output]"
- [ ] Include context or variables when needed
- [ ] Be immediately actionable

### 🔄 Duplication Check

**Check for:**
- [ ] Duplicate titles (exact matches)
- [ ] Similar descriptions (>80% overlap)
- [ ] Overlapping purposes (solve same problem)

**Action:** Merge or differentiate duplicate prompts

### 🎯 Specificity Check

**Generic (needs improvement):**
- "Write code for me"
- "Help debug"
- "Create documentation"

**Specific (good):**
- "Generate TypeScript React component with props interface, error boundaries, and loading states"
- "Debug React performance issues by analyzing component render cycles and suggesting memoization"
- "Create API documentation with OpenAPI 3.0 spec, examples, and error codes"

---

## Review Process

### 1. Category Review
For each category, check:
- [ ] Are all prompts truly in the right category?
- [ ] Is there a better category structure?
- [ ] Should any categories be merged/split?

### 2. Role Review
For each role, check:
- [ ] Are prompts actually useful for that role?
- [ ] Are there missing roles?
- [ ] Should roles be more specific?

### 3. Value Assessment
Ask for each prompt:
- [ ] Would I actually use this?
- [ ] Is it better than generic ChatGPT?
- [ ] Does it save time/provide expertise?
- [ ] Is it specific to engineering/AI work?

### 4. Competitive Analysis
Compare to other prompt libraries:
- [ ] Is our prompt more specific?
- [ ] Does it provide more context?
- [ ] Is it tailored to our audience?

---

## Common Issues to Fix

### Issue: Generic Prompts
**Example:** "Create a README"

**Fix:** 
```
Title: Generate Professional README with Badges & Examples
Description: Creates comprehensive README.md with installation steps, usage examples, API docs, contribution guidelines, and status badges
Content: Generate a professional README.md for a [project type] project named [project name] that includes:
- Project description and value proposition
- Installation instructions for multiple package managers
- Usage examples with code snippets
- API documentation if applicable
- Contributing guidelines
- License information
- Status badges (build, coverage, version)
- Screenshots or demo GIFs section

Tech stack: [list technologies]
Target audience: [describe users]
```

### Issue: Overlapping Prompts
**Example:** Two prompts for "API documentation"

**Action:**
- Keep the more specific/complete one
- Delete or merge the generic one
- Or differentiate: "Quick API Docs" vs "Comprehensive OpenAPI Spec"

### Issue: Missing Context
**Example:** "Optimize React component"

**Fix:** Add specificity
```
Analyze this React component for performance issues:
- Identify unnecessary re-renders
- Suggest memoization opportunities (useMemo, useCallback, React.memo)
- Check for expensive computations in render
- Recommend virtualization for large lists
- Provide before/after code examples
```

---

## Quality Metrics

### Target Scores
- **Completeness:** 100% (all fields filled)
- **Minimum Length:** 95%+ meet min requirements
- **Specificity:** 80%+ highly specific
- **Duplication:** <5% overlap
- **Value Rating:** 4.0+ stars average

### Red Flags
🚨 **High Priority Fixes:**
- Missing title/description/content
- <50 char descriptions
- <100 char content
- Exact duplicate titles

⚠️ **Medium Priority:**
- Generic phrasing (3+ generic phrases)
- Very short content (<200 chars for complex topics)
- No examples/variables in prompt
- Unclear value proposition

---

## Review Workflow

1. **Scan for Red Flags** (30 min)
   - Sort by length, check shortest prompts first
   - Look for missing fields
   - Identify exact duplicates

2. **Category-by-Category Review** (2 hours)
   - Review each category systematically
   - Check for overlaps within category
   - Assess overall category coherence

3. **Competitive Comparison** (1 hour)
   - Sample 10-20 prompts
   - Compare to PromptBase, ShareGPT, etc.
   - Ensure ours are more valuable

4. **User Testing** (ongoing)
   - Try 5-10 random prompts
   - Rate usability and value
   - Note improvements needed

---

## Next Steps

Based on this review:
1. Create list of prompts to fix/delete
2. Identify gaps (missing categories/roles)
3. Generate new high-value prompts for gaps
4. Set up automated quality checks (future)

---

**Review Status:** Not Started  
**Target Completion:** TBD  
**Owner:** [Your Name]

