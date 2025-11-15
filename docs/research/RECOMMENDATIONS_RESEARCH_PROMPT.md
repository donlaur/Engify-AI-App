# Deep Research Prompt: Recommendations (Best Practices & Strategic Guidance)

## Context

Engify.ai is building recommendations (best practices and strategic guidance) for AI-assisted development. Recommendations provide proactive "should do" advice that informs workflows and guardrails, helping teams avoid pain points.

**Philosophy:** Solution-focused guidance. Frame as "should do" rather than "how to do" (workflows) or "prevent X" (guardrails).

**Target:** Generate additional recommendations across categories: best-practices, strategic-guidance, tool-selection, team-structure, process-optimization, risk-mitigation.

---

## Current Recommendations (10 Total)

1. **Start with Few-Shot Learning for Beginners** (best-practices, high priority)
   - For teams new to AI, use few-shot patterns with examples
   - Links to: TDD workflow, trust-but-verify workflow
   - Solves: hallucinated capabilities, missing context, brownfield penalty

2. **Implement Guardrails for Critical Code Paths** (risk-mitigation, high priority)
   - Use automated guardrails for auth, payments, migrations
   - Links to: release-readiness workflow, security guardrails
   - Solves: almost-correct code, insecure code, schema drift

3. **Choose AI Model Based on Task Requirements** (tool-selection, medium priority)
   - Match model selection to task complexity and cost
   - Links to: platform consolidation workflow
   - Solves: toolchain sprawl

4. **Enforce Small PRs for AI-Generated Code** (best-practices, high priority)
   - Maintain strict PR size limits (≤250 lines)
   - Links to: keep-prs-under-control workflow
   - Solves: oversized PRs, almost-correct code

5. **Structure Your AI Prompt Library for Reusability** (process-optimization, medium priority)
   - Create shared, searchable prompt library
   - Links to: platform consolidation workflow
   - Solves: toolchain sprawl, duplicate tooling

6. **Always Validate AI Suggestions Before Merging** (best-practices, high priority)
   - Treat all AI code as untrusted until validated
   - Links to: trust-but-verify, TDD, release-readiness workflows
   - Solves: almost-correct code, trust deficit, insecure code

7. **Use Test-Driven Development with AI-Generated Code** (best-practices, high priority)
   - Start with tests, then generate code to pass tests
   - Links to: TDD workflow
   - Solves: almost-correct code

8. **Establish AI Governance Before Scaling** (strategic-guidance, high priority)
   - Set up policies, guardrails, workflows early
   - Links to: governance scorecard, security guardrails
   - Solves: toolchain sprawl, vibe coding, guardrail evasion

9. **Focus AI on Strategic Tasks, Not Just Code Generation** (strategic-guidance, medium priority)
   - Use AI for architecture, risk assessment, incident analysis
   - Links to: capability grounding, architecture validation
   - Solves: tactical trap

10. **Monitor AI Costs and Usage from Day One** (process-optimization, medium priority)
    - Track costs by team, project, model type
    - Links to: platform consolidation workflow
    - Solves: toolchain sprawl

---

## Acceptance Criteria

Each recommendation entry must include:

1. **Recommendation Statement** (1-2 sentences)
   - Clear, actionable "should do" statement
   - Focused on strategic guidance or best practice
   - Links to existing workflows/guardrails where applicable

2. **Why This Matters** (2-3 paragraphs)
   - Business/technical rationale
   - Quantifiable benefits where possible
   - Real-world impact and consequences

3. **When to Apply** (1-2 paragraphs)
   - Context and scenarios
   - Team size, situation, requirements
   - Clear criteria for when this recommendation applies

4. **Implementation Guidance** (2-3 paragraphs, optional)
   - Practical steps to implement
   - Tools, workflows, or processes to use
   - Best practices for adoption

5. **Content Connections**
   - Link to related workflows (format: `category/slug`)
   - Link to related guardrails (format: `guardrails/subcategory/slug`)
   - Link to related pain points (format: `pain-point-XX-xxx`)
   - Link to related prompts, patterns (if applicable)

6. **SEO Keywords**
   - Primary keywords (main topic)
   - Recommendation-specific keywords
   - Solution/guidance keywords
   - General keywords (for backwards compatibility)

---

## Required Sections for Each Recommendation

### 1. Metadata
```typescript
{
  id: "recommendation-XX-[slug]",
  slug: "[slug]",
  title: "[Title]",
  category: "best-practices" | "strategic-guidance" | "tool-selection" | "team-structure" | "process-optimization" | "risk-mitigation",
  audience: ["engineers", "engineering-managers", "devops-sre", "security", "qa", "cto", "vp-engineering"],
  priority: "high" | "medium" | "low",
  status: "published" | "draft"
}
```

### 2. Description (Brief)
- 2-3 sentences summarizing the recommendation
- What teams should do and why it matters
- Brief value statement

### 3. Recommendation Statement (Core)
- Clear, actionable statement
- "Should do" framing (not "how to do")
- 1-2 sentences

### 4. Why This Matters (Rationale)
- Business/technical rationale (2-3 paragraphs)
- Quantifiable benefits where possible
- Real-world impact and consequences
- Why this recommendation is important

### 5. When to Apply (Context)
- Context and scenarios (1-2 paragraphs)
- Team size, situation, requirements
- Clear criteria for when this applies

### 6. Implementation Guidance (Optional)
- Practical steps to implement (2-3 paragraphs)
- Tools, workflows, or processes to use
- Best practices for adoption
- Links to specific workflows

### 7. Related Content
- Related workflows (array of slugs: `category/slug`)
- Related guardrails (array of slugs: `guardrails/subcategory/slug`)
- Related pain points (array of IDs: `pain-point-XX-xxx`)
- Related prompts (array of slugs, if applicable)
- Related patterns (array of pattern names, if applicable)

### 8. Research Citations (Optional)
- External sources (research, articles, case studies)
- Format: `{ source: string, summary: string, url?: string, verified: boolean }`

### 9. SEO Keywords
- Primary keywords (main topic)
- Recommendation keywords (recommendation-specific)
- Solution keywords (guidance/solution-focused)
- General keywords (for backwards compatibility)

---

## Content Connections Reference

### Existing Workflows
- `code-quality/keep-prs-under-control` - PR size management
- `code-quality/tdd-with-ai-pair` - Test-driven development
- `ai-behavior/stop-schema-guessing` - Prevent schema hallucinations
- `ai-behavior/trust-but-verify-triage` - Validation workflows
- `ai-behavior/capability-grounding-manifest` - Context grounding
- `process/release-readiness-runbook` - Release validation
- `process/platform-consolidation-playbook` - Tool consolidation
- `process/daily-merge-discipline` - Merge conflict prevention
- `security/security-guardrails` - Security workflows
- `governance/ai-governance-scorecard` - Governance framework
- `governance/architecture-intent-validation` - Architecture validation

### Existing Guardrails (Sample)
- `guardrails/data-integrity/prevent-data-corruption-in-ai-generated-migrations`
- `guardrails/security/prevent-sql-injection-vulnerability`
- `guardrails/security/prevent-hardcoded-secrets-in-ai-generated-code`
- `guardrails/testing/prevent-missing-edge-case-tests`

### Existing Pain Points (Sample)
- `pain-point-01-almost-correct-code` - AI code looks right but has bugs
- `pain-point-02-trust-deficit` - Developers don't trust AI output
- `pain-point-03-hallucinated-capabilities` - AI invents APIs/features
- `pain-point-04-skill-atrophy` - Over-reliance on AI reduces skills
- `pain-point-05-missing-context` - AI lacks codebase context
- `pain-point-06-brownfield-penalty` - AI struggles with legacy code
- `pain-point-07-context-forgetting` - AI loses context in long conversations
- `pain-point-08-toolchain-sprawl` - Fragmented AI tool usage
- `pain-point-09-ai-slop` - Over-engineered, verbose code
- `pain-point-10-oversized-prs` - Giant PRs from AI-generated code
- `pain-point-12-vibe-coding` - Bypassing governance via AI
- `pain-point-16-guardrail-evasion` - AI suggests bypassing guardrails
- `pain-point-19-insecure-code` - AI generates security vulnerabilities
- `pain-point-20-schema-drift` - Database/app mismatches from AI
- `pain-point-21-duplicate-tooling` - AI creates duplicate utilities
- `pain-point-23-tactical-trap` - Misaligning AI on wrong tasks

### Existing Patterns
- `few-shot` - Learning from examples
- `chain-of-thought` - Step-by-step reasoning
- `persona` - Role-based prompting
- `template` - Structured formats
- `cognitive-verifier` - Self-checking
- `structured-output` - Validated output formats
- `rag` - Retrieval-augmented generation

---

## Output Format (MARKDOWN, NOT JSON)

**IMPORTANT: Return output in MARKDOWN format, NOT JSON. Use plain text markdown with clear section headers.**

### Format for Each Recommendation

```markdown
## [Number]. [Title]

**Slug:** `[slug]`
**Category:** [category] | **Priority:** [priority] | **Audience:** [audience1, audience2, ...]

**Description:**
[2-3 sentence summary]

**Recommendation Statement:**
[Clear, actionable 1-2 sentence statement]

**Why This Matters:**
[2-3 paragraphs explaining business/technical rationale, quantifiable benefits, real-world impact]

**When to Apply:**
[1-2 paragraphs describing context, scenarios, team size, requirements, clear criteria]

**Implementation Guidance:**
[2-3 paragraphs with practical steps, tools, workflows, best practices for adoption]

**Related Workflows:**
- `category/slug` (Brief description of connection)
- `category/slug` (Brief description of connection)

**Related Guardrails:**
- `guardrails/subcategory/slug` (Brief description of connection)

**Related Pain Points:**
- `pain-point-XX-xxx` (Brief description of connection)

**Related Patterns:**
- `pattern-name` (Brief description of connection)

**Primary Keywords:**
- [keyword1]
- [keyword2]
- [keyword3]

**Recommendation Keywords:**
- [keyword1]
- [keyword2]

**Solution Keywords:**
- [keyword1]
- [keyword2]

**General Keywords:**
- [keyword1]
- [keyword2]
- [keyword3]

---

```

---

## Research Instructions

1. **Review Existing Recommendations:** Ensure your new recommendations don't duplicate existing ones. Build on or expand existing themes.

2. **Focus on Gaps:** Identify areas where strategic guidance is missing:
   - Team structure and organization
   - AI tool selection and evaluation
   - Process optimization and scaling
   - Risk mitigation strategies
   - Strategic decision-making

3. **Link to Content:** Connect recommendations to existing workflows, guardrails, and pain points. Include brief descriptions of connections.

4. **Provide Actionable Guidance:** Recommendations should be strategic ("should do") not procedural ("how to do"). Focus on best practices and strategic decisions.

5. **Consider Audience:** Tailor recommendations for specific audiences (engineers, managers, CTOs). Some recommendations apply broadly, others are role-specific.

6. **SEO Optimization:** Include keywords that teams would search for when looking for guidance on AI adoption, best practices, and strategic decisions.

---

## Suggested Topic Areas for New Recommendations

### Best Practices (Expand)
- AI code review practices
- AI-assisted debugging workflows
- Documentation generation with AI
- AI-assisted code refactoring
- AI prompt engineering best practices

### Strategic Guidance (Expand)
- When to use AI vs. manual development
- AI adoption roadmap for teams
- Building AI literacy in engineering teams
- Measuring AI ROI and productivity
- AI ethics and responsible development

### Tool Selection (Expand)
- Evaluating AI coding assistants
- Choosing between AI tools (Cursor, Copilot, etc.)
- AI tool integration strategies
- Cost-benefit analysis for AI tools

### Team Structure (New Category)
- AI champions and advocates
- AI training and onboarding
- Cross-functional AI teams
- AI governance roles and responsibilities

### Process Optimization (Expand)
- AI-assisted sprint planning
- AI in CI/CD pipelines
- AI-powered code quality metrics
- AI for technical debt management

### Risk Mitigation (Expand)
- AI security best practices
- Compliance and regulatory considerations
- AI vendor risk management
- Data privacy with AI tools

---

## Output Requirements

1. **Format:** Markdown, NOT JSON
2. **Length:** Each recommendation should be ~300-400 words total
3. **Structure:** Follow the format specified above
4. **Connections:** Link to at least 2-3 existing workflows/guardrails/pain points per recommendation
5. **Keywords:** Include 8-12 total keywords (primary, recommendation, solution, general)
6. **Categories:** Use appropriate categories (best-practices, strategic-guidance, tool-selection, team-structure, process-optimization, risk-mitigation)
7. **Audience:** Specify relevant audiences (engineers, engineering-managers, devops-sre, security, qa, cto, vp-engineering)
8. **Priority:** Assign priority (high, medium, low) based on impact and urgency

---

## Do NOT

- ❌ Return JSON format (use markdown)
- ❌ Create recommendations that duplicate existing ones
- ❌ Focus on procedural "how-to" (that's workflows)
- ❌ Focus on prevention only (that's guardrails)
- ❌ Ignore existing content (always link to workflows/guardrails/pain points)
- ❌ Make unsubstantiated claims (provide rationale or cite sources)
- ❌ Use overly technical jargon (make it accessible)

---

## Success Criteria

A good recommendation:
- ✅ Provides strategic "should do" guidance
- ✅ Links to existing workflows, guardrails, and pain points
- ✅ Includes clear rationale and context
- ✅ Offers practical implementation guidance
- ✅ Uses appropriate keywords for SEO
- ✅ Targets specific audiences when relevant
- ✅ Avoids duplication with existing content

---

## Example Output Structure

Here's an example of the expected format:

```markdown
## 11. Establish AI Code Review Standards

**Slug:** `establish-ai-code-review-standards`
**Category:** best-practices | **Priority:** high | **Audience:** engineers, engineering-managers, qa

**Description:**
Define clear code review standards specifically for AI-generated code. Traditional code review checklists miss AI-specific risks like hallucinated APIs, missing error handling, or security vulnerabilities that look plausible.

**Recommendation Statement:**
Create and enforce AI-specific code review checklists that catch common AI-generated issues before they reach production. Supplement traditional review processes with AI-aware validation steps.

**Why This Matters:**
[2-3 paragraphs on rationale, benefits, impact]

**When to Apply:**
[1-2 paragraphs on context, scenarios, requirements]

**Implementation Guidance:**
[2-3 paragraphs on practical steps, tools, best practices]

**Related Workflows:**
- `ai-behavior/trust-but-verify-triage` (Provides validation framework for AI code)
- `code-quality/keep-prs-under-control` (Ensures PRs are small enough for thorough review)

**Related Guardrails:**
- `guardrails/security/prevent-sql-injection-vulnerability` (Catches security issues in AI code)

**Related Pain Points:**
- `pain-point-01-almost-correct-code` (AI code looks right but has bugs)
- `pain-point-19-insecure-code` (AI generates security vulnerabilities)

**Primary Keywords:**
- AI code review
- Code review best practices
- AI code validation

**Recommendation Keywords:**
- Review standards
- AI code quality
- Review checklists

**Solution Keywords:**
- Quality assurance
- Bug prevention
- Security validation

**General Keywords:**
- code review
- quality
- validation
- standards

---
```

---

## Next Steps

1. Review the 10 existing recommendations to understand the format and style
2. Identify gaps in coverage (categories, audiences, use cases)
3. Generate new recommendations that fill those gaps
4. Link new recommendations to existing workflows, guardrails, and pain points
5. Ensure each recommendation provides unique, actionable strategic guidance
6. Optimize for SEO with appropriate keywords

**Ready to start?** Review the existing recommendations, identify gaps, and generate new ones following this format.

