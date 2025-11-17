# E-E-A-T Guidelines for Guardrails

## Overview

E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is Google's quality framework for ranking content. For optimal SEO, each guardrail must demonstrate these signals.

## Format Requirements

Each guardrail includes a brief **E-E-A-T Signals** section with 4 one-sentence signals:

```markdown
**E-E-A-T Signals (SEO):**
- **Experience:** [First-hand testing/incident reference]
- **Expertise:** [Technical depth/references]
- **Authoritativeness:** [Citation/source]
- **Trustworthiness:** [Transparency/limitations]
```

## Signal Guidelines

### Experience (First-Hand Testing)

**What Google Wants:** Real-world use, actual incidents, production examples

**Good Examples:**
- "Based on Engify audits of legacy systems where AI proposed invalid migrations."
- "From real production incidents where existing tools were ignored, leading to preventable breakages."
- "Synthesized from Engify team reviews of 40+ AI-assisted PRs and QA post-mortems."

**Bad Examples:**
- "This is a common problem." (No first-hand reference)
- "AI-generated code often has issues." (Too vague)
- "Developers report problems." (No specific source)

### Expertise (Technical Depth)

**What Google Wants:** Specific tools, patterns, industry practices, technical details

**Good Examples:**
- "Checklist references ADRs, diff tools, and schema validation prompts."
- "Uses industry-standard SAST/SCA practices (Snyk, SonarQube)."
- "References ORM query optimization (JOIN FETCH, batch fetching)."

**Bad Examples:**
- "Uses best practices." (Too vague)
- "Follows industry standards." (Not specific)
- "Implements validation." (Doesn't show expertise)

### Authoritativeness (Credible Sources)

**What Google Wants:** Citations to authoritative sources (studies, official docs, recognized experts)

**Good Examples:**
- "Backed by Veracode's 2025 AI Security Report."
- "Cites OWASP guidance on SQL injection prevention."
- "References GitClear's 2025 defect analysis."

**Bad Examples:**
- "Many developers say..." (No source)
- "Research shows..." (Unspecific)
- "Experts recommend..." (No citation)

### Trustworthiness (Transparency)

**What Google Wants:** Honesty about limitations, manual steps, trade-offs

**Good Examples:**
- "Acknowledges manual verification and ongoing audits are required."
- "Encourages honest reporting and incremental improvement."
- "Calls out manual review requirements and cites OWASP."

**Bad Examples:**
- "This solution works perfectly." (No limitations mentioned)
- "100% automated." (Unrealistic)
- "Zero configuration required." (Overpromising)

## Examples from Existing Workflows

### Example 1: Security Guardrails

```markdown
**E-E-A-T Signals (SEO):**
- **Experience:** Security engineers reviewed Engify's AI-assisted commits and noted missing scans.
- **Expertise:** Checklist references industry-standard SAST/SCA practices.
- **Authoritativeness:** Veracode's 2025 study gives quantitative backing.
- **Trustworthiness:** Acknowledges manual review requirements and cites OWASP.
```

### Example 2: Schema Validation

```markdown
**E-E-A-T Signals (SEO):**
- **Experience:** Informed by Engify audits of legacy systems where AI proposed invalid migrations.
- **Expertise:** References ADRs, diff tools, and schema validation prompts.
- **Authoritativeness:** Cites Qodo's 2025 developer survey.
- **Trustworthiness:** Calls out manual verification and acknowledges AI limits.
```

## Common Patterns

### When No External Citation Available

Use internal experience and expertise:
- **Experience:** "Based on Engify field observations..." or "From production incidents..."
- **Expertise:** Reference specific tools/practices without external source
- **Authoritativeness:** "Supported by production data" or "Validated in real-world usage"
- **Trustworthiness:** Always include limitations/transparency

### When Research Citation Exists

Leverage the citation for authoritativeness:
- Reference the citation in **Authoritativeness**
- Use it to support **Expertise** (show you're referencing credible data)
- Still include **Experience** (first-hand testing/validation)
- Always include **Trustworthiness** (limitations/manual steps)

## Integration with Research Citations

If a guardrail has a `researchCitation`, use it:
- **Authoritativeness:** Reference the citation directly
- **Expertise:** Show how the citation supports the technical approach
- **Experience:** Still include first-hand validation/testing
- **Trustworthiness:** Acknowledge limitations even when citing authoritative sources

## Checklist for Each Guardrail

Before finalizing, verify:
- [ ] **Experience:** Includes first-hand testing, real incidents, or production examples
- [ ] **Expertise:** Shows specific tools, patterns, or technical practices
- [ ] **Authoritativeness:** Cites authoritative source when available (studies, docs, experts)
- [ ] **Trustworthiness:** Acknowledges limitations, manual steps, or trade-offs
- [ ] All signals are one sentence each
- [ ] Language is specific, not vague
- [ ] Matches style of existing workflow E-E-A-T signals

## Why This Matters for SEO

Google's Quality Rater Guidelines explicitly mention:
- Content created with "little to no effort, little to no originality" gets lowest rating
- "Auto or AI generated" content is flagged
- Content needs "information gain" (beyond what's in SERPs)
- First-hand experience is prioritized over summarized information

E-E-A-T signals help demonstrate:
- ✅ Real-world experience (not AI summarization)
- ✅ Technical expertise (not surface-level content)
- ✅ Authoritative sources (not unsubstantiated claims)
- ✅ Transparent limitations (not overpromising)

This aligns with Google's anti-AI-content policies while still being concise and actionable.

