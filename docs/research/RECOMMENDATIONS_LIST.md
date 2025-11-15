# Recommendations List

**Last Updated:** November 15, 2025  
**Total:** 10 recommendations

---

## Current Recommendations

### Best Practices (4)

1. **Start with Few-Shot Learning for Beginners**
   - **Slug:** `start-with-few-shot-learning`
   - **Priority:** High
   - **Audience:** Engineers, QA
   - **Category:** best-practices
   - **Summary:** For teams new to AI-assisted development, start with few-shot learning patterns with examples to reduce hallucinations and increase reliability.
   - **Links to:** TDD workflow, trust-but-verify workflow
   - **Solves:** Hallucinated capabilities, missing context, brownfield penalty

2. **Enforce Small PRs for AI-Generated Code**
   - **Slug:** `enforce-small-prs`
   - **Priority:** High
   - **Audience:** Engineers, Engineering Managers
   - **Category:** best-practices
   - **Summary:** Maintain strict PR size limits (≤250 lines) for all code, especially AI-generated code, to make reviews effective and catch issues early.
   - **Links to:** keep-prs-under-control workflow
   - **Solves:** Oversized PRs, almost-correct code

3. **Always Validate AI Suggestions Before Merging**
   - **Slug:** `validate-ai-suggestions-before-merge`
   - **Priority:** High
   - **Audience:** Engineers, QA, Security
   - **Category:** best-practices
   - **Summary:** Treat all AI-generated code as untrusted until validated through manual review, tests, and verification workflows.
   - **Links to:** trust-but-verify, TDD, release-readiness workflows
   - **Solves:** Almost-correct code, trust deficit, insecure code

4. **Use Test-Driven Development with AI-Generated Code**
   - **Slug:** `use-tdd-for-ai-generated-code`
   - **Priority:** High
   - **Audience:** Engineers, QA
   - **Category:** best-practices
   - **Summary:** Start with tests, then generate code to pass those tests. This forces consideration of edge cases and requirements upfront.
   - **Links to:** TDD workflow
   - **Solves:** Almost-correct code

### Strategic Guidance (2)

5. **Establish AI Governance Before Scaling**
   - **Slug:** `establish-ai-governance-early`
   - **Priority:** High
   - **Audience:** Engineering Managers, CTO, VP Engineering, Security
   - **Category:** strategic-guidance
   - **Summary:** Create AI governance policies, guardrails, and workflows before your team scales AI usage to prevent chaos, security risks, and technical debt.
   - **Links to:** Governance scorecard, security guardrails, platform consolidation
   - **Solves:** Toolchain sprawl, vibe coding, guardrail evasion

6. **Focus AI on Strategic Tasks, Not Just Code Generation**
   - **Slug:** `focus-ai-on-strategic-tasks`
   - **Priority:** Medium
   - **Audience:** Engineering Managers, Director, CTO, VP Engineering
   - **Category:** strategic-guidance
   - **Summary:** Expand AI usage beyond code generation. Use AI for strategic tasks like architecture planning, risk assessment, and incident analysis.
   - **Links to:** Capability grounding, architecture validation
   - **Solves:** Tactical trap

### Tool Selection (1)

7. **Choose AI Model Based on Task Requirements**
   - **Slug:** `choose-ai-model-by-task`
   - **Priority:** Medium
   - **Audience:** Engineers, Engineering Managers, CTO, VP Engineering
   - **Category:** tool-selection
   - **Summary:** Match AI model selection to task complexity and requirements. Use cheaper models for simple tasks, expensive models for complex problems.
   - **Links to:** Platform consolidation workflow
   - **Solves:** Toolchain sprawl

### Process Optimization (2)

8. **Structure Your AI Prompt Library for Reusability**
   - **Slug:** `structure-ai-prompt-library`
   - **Priority:** Medium
   - **Audience:** Engineers, Engineering Managers
   - **Category:** process-optimization
   - **Summary:** Create a shared, searchable prompt library organized by pattern, role, and use case to reduce inconsistency and improve output quality.
   - **Links to:** Platform consolidation workflow
   - **Solves:** Toolchain sprawl, duplicate tooling

9. **Monitor AI Costs and Usage from Day One**
   - **Slug:** `monitor-ai-costs-and-usage`
   - **Priority:** Medium
   - **Audience:** Engineering Managers, CTO, VP Engineering
   - **Category:** process-optimization
   - **Summary:** Implement AI cost monitoring and usage tracking from day one to identify optimization opportunities and prevent cost overruns.
   - **Links to:** Platform consolidation workflow
   - **Solves:** Toolchain sprawl

### Risk Mitigation (1)

10. **Implement Guardrails for Critical Code Paths**
    - **Slug:** `use-guardrails-for-critical-paths`
    - **Priority:** High
    - **Audience:** Engineers, DevOps/SRE, Security, Engineering Managers
    - **Category:** risk-mitigation
    - **Summary:** Automatically enforce quality gates for critical code paths (authentication, payments, data migrations) to prevent incidents before they happen.
    - **Links to:** Release-readiness workflow, security guardrails
    - **Solves:** Almost-correct code, insecure code, schema drift

---

## Category Breakdown

| Category | Count | Priority Distribution |
|----------|-------|----------------------|
| **Best Practices** | 4 | High: 4, Medium: 0 |
| **Strategic Guidance** | 2 | High: 1, Medium: 1 |
| **Tool Selection** | 1 | High: 0, Medium: 1 |
| **Process Optimization** | 2 | High: 0, Medium: 2 |
| **Risk Mitigation** | 1 | High: 1, Medium: 0 |
| **Team Structure** | 0 | None yet |

---

## Priority Breakdown

| Priority | Count | Recommendations |
|----------|-------|----------------|
| **High** | 6 | Start with few-shot, Enforce small PRs, Validate AI suggestions, Use TDD, Establish governance, Use guardrails for critical paths |
| **Medium** | 4 | Choose AI model by task, Structure prompt library, Monitor costs, Focus AI on strategic tasks |

---

## Audience Breakdown

| Audience | Count | Recommendations |
|----------|-------|----------------|
| **Engineers** | 7 | Start with few-shot, Enforce small PRs, Validate AI suggestions, Use TDD, Choose AI model, Structure prompt library, Use guardrails |
| **Engineering Managers** | 5 | Enforce small PRs, Structure prompt library, Establish governance, Focus AI on strategic tasks, Monitor costs |
| **QA** | 3 | Start with few-shot, Validate AI suggestions, Use TDD |
| **Security** | 2 | Validate AI suggestions, Establish governance, Use guardrails |
| **CTO/VP Engineering** | 4 | Choose AI model, Establish governance, Focus AI on strategic tasks, Monitor costs |
| **DevOps/SRE** | 1 | Use guardrails for critical paths |

---

## Gap Analysis

### Missing Categories
- **Team Structure** (0 recommendations)
  - AI champions and advocates
  - AI training and onboarding
  - Cross-functional AI teams
  - AI governance roles

### Missing Topics
- **Best Practices**
  - AI code review practices
  - AI-assisted debugging workflows
  - Documentation generation with AI
  - AI-assisted code refactoring

- **Strategic Guidance**
  - When to use AI vs. manual development
  - AI adoption roadmap for teams
  - Building AI literacy in engineering teams
  - Measuring AI ROI and productivity
  - AI ethics and responsible development

- **Tool Selection**
  - Evaluating AI coding assistants
  - Choosing between AI tools (Cursor, Copilot, etc.)
  - AI tool integration strategies
  - Cost-benefit analysis for AI tools

- **Process Optimization**
  - AI-assisted sprint planning
  - AI in CI/CD pipelines
  - AI-powered code quality metrics
  - AI for technical debt management

- **Risk Mitigation**
  - AI security best practices (beyond guardrails)
  - Compliance and regulatory considerations
  - AI vendor risk management
  - Data privacy with AI tools

---

## Next Steps

1. **Generate recommendations for missing categories** (team-structure)
2. **Expand coverage in existing categories** (best-practices, strategic-guidance)
3. **Add more tool-selection guidance** (evaluating tools, integration strategies)
4. **Expand process-optimization** (sprint planning, CI/CD, metrics)
5. **Add risk-mitigation beyond guardrails** (compliance, vendor risk, privacy)

See `RECOMMENDATIONS_RESEARCH_PROMPT.md` for detailed instructions on generating new recommendations.

