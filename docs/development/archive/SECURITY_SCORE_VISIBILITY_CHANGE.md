# Security Score Visibility Change

## Problem

Security scores were consistently low (6 or under) and causing concern for enterprise clients, even though:
- Most prompts are **NOT security-focused** but aren't insecure
- A score of 5-6 is **normal and appropriate** for non-security prompts
- The scoring rubric already defaults to 5-6 for non-security prompts

## Impact

- Enterprise clients see low security scores and get worried
- Security scores aren't meaningful for most prompts (they're not security-focused)
- It's not obvious what the "security issue" is when looking at a prompt

## Solution

**Hidden security scores from public view** while keeping them in audits internally:

### Changes Made

1. **Removed from public display** (`PromptAuditScores.tsx`):
   - Removed `securityCompliance` from `USER_FOCUSED_CATEGORIES`
   - Added `securityCompliance` to `ADMIN_METRICS` array
   - Security scores still calculated and stored in audits, just not shown to users

2. **Why this approach**:
   - ✅ Security audits still happen internally (useful for admin/internal use)
   - ✅ Enterprise clients don't see confusing low scores
   - ✅ No misleading "security issues" displayed
   - ✅ Can still monitor security via admin/internal tools
   - ✅ Overall score still includes security (5% weight), just not shown separately

### What Users See Now

**Visible metrics:**
- ✅ Ready to Use (Engineering Usefulness)
- ✅ Completeness
- ✅ Real-World Examples (Case Study Quality)
- ✅ Enterprise Ready

**Hidden metrics (internal/admin only):**
- 🔒 Security & Privacy
- 🔒 SEO Enrichment
- 🔒 Accessibility
- 🔒 Performance

### What Stays the Same

- Security is still **audited** (scored internally)
- Security contributes to **overall score** (5% weight)
- Security issues are still **flagged** in audit results
- Admin/internal tools can still see security scores

## Files Changed

- `src/components/features/PromptAuditScores.tsx`
  - Removed `securityCompliance` from `USER_FOCUSED_CATEGORIES`
  - Added `securityCompliance` to `ADMIN_METRICS`

## Rationale

Security scoring for prompts is fundamentally different from application security:
- **Prompts are text instructions** - they don't have security headers, authentication, etc.
- **Security scoring asks**: "Does this prompt encourage secure coding practices?"
- **Most prompts are neutral** - they're not security-focused but don't teach insecure patterns
- **Default score of 5-6 is correct** for non-security prompts, but looks alarming to enterprise clients

By hiding it from public view, we:
- Avoid misleading enterprise clients
- Keep security auditing internal (still useful for admin)
- Focus user attention on metrics that matter for prompt quality

## Future Considerations

If we want to show security metrics in the future, we could:
1. **Only show security scores >= 7** (only show when it's actually a security-focused prompt)
2. **Relabel it** (e.g., "Security Best Practices" or "Secure Coding Guidance")
3. **Add context** explaining why scores are 5-6 (neutral, not insecure)
4. **Filter by prompt type** (only show security scores for code-generation prompts)

But for now, hiding it is the cleanest solution.

