# Guardrail Content Processing Guide

## Goal

Process the Gemini research output (70 guardrails) into category files with condensed, scannable format.

## Target Format

**Length:** ~200-250 words per guardrail (not brief, but not lengthy)
- One-sentence problem statement
- 5-6 actionable checklist items
- One-line detection methods (CI/CD, Static, Runtime)
- 3-step mitigation
- E-E-A-T signals (4 one-sentence summaries)
- Inline workflow and pain point links

## Review Criteria

When processing each guardrail, ensure:

✅ **DO:**
- Keep problem statement to one sentence (concise but clear)
- Use actionable language ("Require..." not "Consider requiring...")
- Limit checklist to 5-6 most critical items
- One line per detection method (specific tool/pattern)
- 3 clear mitigation steps
- Include real-world E-E-A-T references (not generic)
- Link to specific workflows and pain points

❌ **DON'T:**
- Multiple paragraphs per section
- Verbose explanations or effectiveness estimates
- Generic statements ("This is important...")
- More than 6 checklist items
- Lengthy citations or "Works Cited" sections
- Redundant information across sections

## Length Guidelines

**Too Brief (< 150 words):**
- Missing actionable detail
- No context or examples
- Generic statements

**Just Right (200-250 words):**
- Clear problem statement
- Specific, actionable checklist
- Concise detection methods
- Brief mitigation steps
- Real-world E-E-A-T signals

**Too Lengthy (> 300 words):**
- Multiple paragraphs per section
- Verbose explanations
- Extended citations
- Effectiveness estimates
- Step-by-step implementation details

## File Organization

Split into 7 category files:
- `data-integrity.md` - 10 guardrails
- `security.md` - 22 guardrails  
- `performance.md` - 11 guardrails
- `availability.md` - 9 guardrails
- `financial.md` - 8 guardrails
- `integration.md` - 10 guardrails
- `testing.md` - 10 guardrails

Each file should have:
1. Header with category info
2. Guardrails numbered sequentially within category
3. Separator lines between guardrails

## Next Steps

1. Extract full Gemini research output content
2. Split by category (data-integrity, security, etc.)
3. Review each guardrail for length and clarity
4. Condense verbose sections while keeping actionable detail
5. Ensure E-E-A-T signals reference real examples
6. Verify workflow and pain point links are accurate

