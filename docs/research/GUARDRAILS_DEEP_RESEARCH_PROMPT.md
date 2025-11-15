# Deep Research Prompt: Guardrails (Prevention Workflows)

## Context

Engify.ai is building guardrails (prevention-focused workflows) that help engineering teams prevent specific incidents in AI-generated code. Guardrails are actionable prevention strategies with detection methods and mitigation procedures.

**Philosophy:** Solution-focused prevention. Frame as "Prevent X" not "X happened."

**Target:** 70 guardrails across 7 categories: data-integrity, security, performance, availability, financial, integration, testing.

---

## Acceptance Criteria

Each guardrail entry must include:

1. **Prevention Strategies** (3-5 strategies)
   - Concrete, actionable steps
   - Links to existing workflows where applicable
   - Effectiveness estimates ("Prevents 85-95% of cases")
   - Implementation steps

2. **Early Detection Methods**
   - Automated checks (pre-commit, CI/CD, static analysis, runtime monitoring)
   - Code review checkpoints (checklist items)
   - Monitoring metrics to watch

3. **Mitigation & Response**
   - Immediate actions if incident occurs
   - Recovery procedures
   - Post-incident prevention improvements

4. **Workflow Matching**
   - Link to existing workflows that prevent/detect this
   - Suggest new workflow ideas if gaps exist
   - Link to prompts that could prevent this

---

## Required Sections for Each Guardrail

### 1. Metadata
```typescript
{
  slug: "prevent-[incident-type]",
  title: "Prevent [Incident Type] in AI-Generated Code",
  category: "guardrails",
  subcategory: "data-integrity" | "security" | "performance" | "availability" | "financial" | "integration" | "testing",
  severity: "critical" | "high" | "medium" | "low",
  audience: ["engineers", "devops-sre", "security", ...],
}
```

### 2. Description (Solution-Focused)
- 2-3 sentences framing as prevention
- What teams learn/implement
- Brief value statement

### 3. Incident Pattern (Brief)
- Incident name
- Why it happens with AI-generated code
- Real-world impact (1-2 sentences)
- Severity justification

### 4. Prevention Strategies ⭐ (Primary Focus)

For each strategy (3-5 total):
- **Title:** Strategy name
- **Description:** 2-3 sentences explaining the strategy
- **Workflow Match:** Link to existing workflow (format: `category/slug`) or suggest new
- **Prompt Ideas:** 1-2 prompts that could prevent this
- **Implementation Steps:** 4-6 concrete steps
- **Effectiveness:** Estimate ("Prevents 85-95% of cases")
- **Guardrails:** Automated checks/tools that enforce this

### 5. Early Detection Methods

**Automated Checks:**
- Pre-Commit: [Tool/check]
- CI/CD: [Automated check]
- Static Analysis: [SAST tool/pattern]
- Runtime Monitoring: [Metric/alert]

**Code Review Checkpoints:**
- [ ] [Checkpoint 1]
- [ ] [Checkpoint 2]
- [ ] [Checkpoint 3]

**Monitoring Metrics:**
- [Metric name] - [What to watch for]

**Workflow Match:** Link to detection workflows

### 6. Mitigation & Response

**Immediate Actions:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Recovery Procedures:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Post-Incident Prevention Improvements:**
1. [Improvement 1]
2. [Improvement 2]

**Workflow Match:** Link to incident response workflow

### 7. Related Resources

**Workflows:** (Link format: `category/slug`)
- [Workflow]: [How it prevents this]

**Prompts:**
- [Prompt idea]: [How it prevents this]

**Guardrails:**
- [Related guardrail]: [Connection]

**Pain Points:**
- [Pain point ID]: [Connection]

---

## Existing Workflows Reference

**code-quality:**
- `keep-prs-under-control` - Prevents oversized PRs
- `professional-commit-standards` - Enforces commit quality

**ai-behavior:**
- `stop-schema-guessing` - Prevents schema hallucinations
- `cursor-obedience-kit` - Prevents agent bypass
- `capability-grounding-manifest` - Prevents capability hallucinations

**security:**
- `security-guardrails` - Prevents security vulnerabilities
- `identity-first-privilege-design` - Prevents overprivileged agents
- `prompt-injection-defense` - Prevents prompt injection

**governance:**
- `ai-governance-scorecard` - Tracks compliance
- `platform-consolidation-playbook` - Prevents toolchain sprawl

**process:**
- `daily-merge-discipline` - Prevents merge conflicts
- `task-decomposition-prompt-flow` - Prevents scope creep
- `release-readiness-runbook` - Prevents production incidents
- `prevent-duplicate-tooling` - Prevents duplicate code

**risk-management:**
- `catch-mock-metrics` - Prevents fake metrics

**memory:**
- `memory-and-trend-logging` - Prevents repeated incidents

---

## Content Connections Reference

When creating each guardrail, reference these connections to existing workflows, pain points, patterns, and prompts. Include title and summary for each connection.

### Data Integrity Guardrails

**1. Prevent Data Corruption in AI-Generated Migrations**
- **Workflows:** `ai-behavior/stop-schema-guessing` (prevents schema hallucinations), `process/release-readiness-runbook` (migration validation)
- **Pain Points:** `pain-point-20-schema-drift`, `pain-point-05-missing-context`, `pain-point-01-almost-correct-code`
- **Patterns:** `structured-output`, `cognitive-verifier`
- **Prompts:** `migration-validator-prompt`, `rollback-script-generator`, `data-integrity-checker`

**2. Prevent Type Coercion Errors in Batch Processing**
- **Workflows:** `ai-behavior/stop-schema-guessing`, `process/release-readiness-runbook`
- **Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`
- **Patterns:** `cognitive-verifier`, `few-shot`
- **Prompts:** `type-validation-prompt`, `batch-processing-safety-check`

**3. Prevent Race Conditions in Concurrent Updates**
- **Workflows:** `code-quality/keep-prs-under-control`, `process/daily-merge-discipline`, `process/release-readiness-runbook`
- **Pain Points:** `pain-point-11-merge-conflicts`, `pain-point-01-almost-correct-code`
- **Patterns:** `red-team`, `cognitive-verifier`
- **Prompts:** `concurrency-validator`, `locking-pattern-checker`

**4. Prevent Silent Data Truncation**
- **Workflows:** `ai-behavior/stop-schema-guessing`, `process/release-readiness-runbook`
- **Pain Points:** `pain-point-20-schema-drift`, `pain-point-01-almost-correct-code`
- **Patterns:** `precision-summary`
- **Prompts:** `data-length-validator`, `truncation-detector`

**5. Prevent Orphaned Records from Cascading Delete**
- **Workflows:** `ai-behavior/stop-schema-guessing`, `process/release-readiness-runbook`
- **Pain Points:** `pain-point-20-schema-drift`, `pain-point-05-missing-context`
- **Patterns:** `cognitive-verifier`
- **Prompts:** `foreign-key-validator`, `cascade-delete-checker`

**6. Prevent Duplicate Data from Missing Unique Constraints**
- **Workflows:** `ai-behavior/stop-schema-guessing`, `code-quality/keep-prs-under-control`
- **Pain Points:** `pain-point-20-schema-drift`, `pain-point-03-hallucinated-capabilities`
- **Patterns:** `structured-output`
- **Prompts:** `unique-constraint-checker`, `duplicate-prevention-prompt`

**7. Prevent Data Type Mismatch in API Integration**
- **Workflows:** `ai-behavior/stop-schema-guessing`, `ai-behavior/capability-grounding-manifest`, `process/release-readiness-runbook`
- **Pain Points:** `pain-point-05-missing-context`, `pain-point-03-hallucinated-capabilities`
- **Patterns:** `structured-output`, `capability-grounding`
- **Prompts:** `api-contract-validator`, `type-coercion-checker`

**8. Prevent Incorrect Timezone Handling**
- **Workflows:** `process/release-readiness-runbook`
- **Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`
- **Patterns:** `few-shot`
- **Prompts:** `timezone-handler-validator`, `datetime-consistency-checker`

**9. Prevent Buffer Overflow in Data Processing**
- **Workflows:** `process/release-readiness-runbook`, `code-quality/keep-prs-under-control`
- **Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`
- **Patterns:** `red-team`
- **Prompts:** `memory-limit-checker`, `buffer-overflow-detector`

**10. Prevent Data Loss from Incomplete Transactions**
- **Workflows:** `process/release-readiness-runbook`, `code-quality/tdd-with-ai-pair`
- **Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`
- **Patterns:** `cognitive-verifier`
- **Prompts:** `transaction-validator`, `rollback-scenario-tester`

### Security Guardrails

**11-22. All Security Guardrails (SQL Injection, XSS, CSRF, etc.)**
- **Workflows:** `security/security-guardrails` (direct connection for all), `process/release-readiness-runbook`, `security/identity-first-privilege-design` (for auth-related)
- **Pain Points:** `pain-point-17-insecure-code` (all), `pain-point-22-missing-validations` (validation-related)
- **Patterns:** `red-team` (attack scenarios), `cognitive-verifier` (validation)
- **Prompts:** Security-specific validators (e.g., `sql-injection-checker`, `xss-checker`, `csrf-protection-checker`)

**18. Prevent Exposed Sensitive Data in Logs**
- **Workflows:** `security/security-guardrails`, `risk-management/catch-mock-metrics`
- **Pain Points:** `pain-point-17-insecure-code`, `pain-point-18-log-manipulation`
- **Patterns:** `precision-summary`
- **Prompts:** `log-sanitizer`, `pii-detector`

### Performance Guardrails

**23. Prevent N+1 Query Problem**
- **Workflows:** `process/release-readiness-runbook`, `code-quality/keep-prs-under-control`
- **Pain Points:** `pain-point-01-almost-correct-code`
- **Patterns:** `cognitive-verifier`
- **Prompts:** `n-plus-one-detector`, `query-optimizer`

**24. Prevent Missing Database Indexes**
- **Workflows:** `ai-behavior/stop-schema-guessing`, `process/release-readiness-runbook`
- **Pain Points:** `pain-point-20-schema-drift`, `pain-point-01-almost-correct-code`
- **Patterns:** `precision-summary`
- **Prompts:** `index-analyzer`, `query-performance-checker`

**32. Prevent Missing Load Testing**
- **Workflows:** `process/release-readiness-runbook` (direct connection)
- **Pain Points:** `pain-point-01-almost-correct-code`
- **Patterns:** `red-team`
- **Prompts:** `load-test-generator`, `performance-benchmark-checker`

### Availability Guardrails

**37. Prevent Missing Health Checks**
- **Workflows:** `process/release-readiness-runbook` (direct connection)
- **Pain Points:** `pain-point-22-missing-validations`
- **Patterns:** `structured-output`
- **Prompts:** `health-check-generator`, `health-endpoint-validator`

**38. Prevent Improper Error Handling**
- **Workflows:** `code-quality/keep-prs-under-control`, `code-quality/tdd-with-ai-pair`, `process/release-readiness-runbook`
- **Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`
- **Patterns:** `few-shot`, `cognitive-verifier`
- **Prompts:** `error-handler-generator`, `exception-safety-checker`

### Integration Guardrails

**51. Prevent Breaking API Changes**
- **Workflows:** `ai-behavior/capability-grounding-manifest` (direct connection), `process/release-readiness-runbook`
- **Pain Points:** `pain-point-05-missing-context`, `pain-point-03-hallucinated-capabilities`
- **Patterns:** `capability-grounding`
- **Prompts:** `api-contract-validator`, `breaking-change-detector`

**54. Prevent Missing Request Validation**
- **Workflows:** `security/security-guardrails` (direct connection), `process/release-readiness-runbook`
- **Pain Points:** `pain-point-22-missing-validations`, `pain-point-17-insecure-code`
- **Patterns:** `cognitive-verifier`
- **Prompts:** `request-validator`, `input-sanitizer`

### Testing Guardrails

**61. Prevent Missing Edge Case Testing**
- **Workflows:** `code-quality/tdd-with-ai-pair` (direct connection), `process/release-readiness-runbook`
- **Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`
- **Patterns:** `red-team`, `cognitive-verifier`
- **Prompts:** `edge-case-test-generator`, `test-coverage-analyzer`

**62. Prevent Insufficient Test Coverage**
- **Workflows:** `code-quality/tdd-with-ai-pair` (direct connection), `process/release-readiness-runbook`, `code-quality/keep-prs-under-control`
- **Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`
- **Patterns:** `cognitive-verifier`
- **Prompts:** `test-coverage-checker`, `test-gap-analyzer`

**70. Prevent Missing Security Tests**
- **Workflows:** `security/security-guardrails` (direct connection), `process/release-readiness-runbook`
- **Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`
- **Patterns:** `red-team`
- **Prompts:** `security-test-generator`, `vulnerability-test-creator`

### Common Pattern Connections

**Most Common Pain Points:**
- `pain-point-01-almost-correct-code` - Connects to 40+ guardrails (most common)
- `pain-point-22-missing-validations` - Connects to 20+ guardrails
- `pain-point-17-insecure-code` - Connects to all security guardrails (#11-22, #70)
- `pain-point-20-schema-drift` - Connects to data integrity guardrails
- `pain-point-05-missing-context` - Connects to API/integration guardrails

**Most Common Workflows:**
- `process/release-readiness-runbook` - Connects to 50+ guardrails (comprehensive validation)
- `security/security-guardrails` - Connects to all security guardrails (#11-22, #70)
- `ai-behavior/stop-schema-guessing` - Connects to data integrity guardrails
- `code-quality/tdd-with-ai-pair` - Connects to testing guardrails
- `code-quality/keep-prs-under-control` - Connects to code review-related guardrails

**Most Common Patterns:**
- `red-team` - Used for security guardrails and attack scenarios
- `cognitive-verifier` - Used for validation guardrails
- `structured-output` - Used for validation/contract guardrails
- `few-shot` - Used for examples of correct patterns
- `precision-summary` - Used for accuracy-critical guardrails

---

## 70 Guardrail Topics

### Data Integrity (10)
1. Prevent Data Corruption in AI-Generated Migrations
2. Prevent Type Coercion Errors in Batch Processing
3. Prevent Race Conditions in Concurrent Updates
4. Prevent Silent Data Truncation
5. Prevent Orphaned Records from Cascading Delete
6. Prevent Duplicate Data from Missing Unique Constraints
7. Prevent Data Type Mismatch in API Integration
8. Prevent Incorrect Timezone Handling
9. Prevent Buffer Overflow in Data Processing
10. Prevent Data Loss from Incomplete Transactions

### Security (12)
11. Prevent Hardcoded Secrets in Generated Code
12. Prevent SQL Injection Vulnerability
13. Prevent IDOR (Insecure Direct Object Reference)
14. Prevent XSS (Cross-Site Scripting)
15. Prevent CSRF (Cross-Site Request Forgery)
16. Prevent Insecure File Upload
17. Prevent Missing Rate Limiting
18. Prevent Exposed Sensitive Data in Logs
19. Prevent Insecure Session Management
20. Prevent Path Traversal Vulnerability
21. Prevent Missing HTTPS Enforcement
22. Prevent Weak Password Validation

### Performance (10)
23. Prevent N+1 Query Problem
24. Prevent Missing Database Indexes
25. Prevent Inefficient Data Structure
26. Prevent Memory Leak in Event Handlers
27. Prevent Synchronous Blocking Operations
28. Prevent Inefficient Caching Strategy
29. Prevent Missing Connection Pooling
30. Prevent Inefficient Pagination
31. Prevent Unbounded Result Sets
32. Prevent Missing Load Testing

### Availability (10)
33. Prevent Cascading Failure from Dependency
34. Prevent Infinite Loop from Logic Error
35. Prevent Deadlock in Concurrent Code
36. Prevent Resource Exhaustion from Memory Leak
37. Prevent Missing Health Checks
38. Prevent Improper Error Handling
39. Prevent Missing Timeout Configuration
40. Prevent Single Point of Failure
41. Prevent Missing Retry Logic
42. Prevent Improper Shutdown Handling

### Financial (8)
43. Prevent Incorrect Financial Calculation
44. Prevent Currency Conversion Error
45. Prevent Missing Validation for Business Rules
46. Prevent Double-Charging Customers
47. Prevent Incorrect Tax Calculation
48. Prevent Missing Idempotency Check
49. Prevent Incorrect Discount Application
50. Prevent Missing Price Validation

### Integration (10)
51. Prevent Breaking API Changes
52. Prevent Missing API Versioning
53. Prevent Incorrect API Error Handling
54. Prevent Missing Request Validation
55. Prevent Rate Limit Exceeded
56. Prevent Missing Authentication Headers
57. Prevent Incorrect Content-Type Headers
58. Prevent Missing Pagination in API Client
59. Prevent Incorrect Timeout Values
60. Prevent Missing Retry Logic for API Calls

### Testing (10)
61. Prevent Missing Edge Case Testing
62. Prevent Insufficient Test Coverage
63. Prevent Flaky Tests from Timing Issues
64. Prevent Missing Integration Tests
65. Prevent Test Data Pollution
66. Prevent Missing Negative Test Cases
67. Prevent Incorrect Test Assertions
68. Prevent Missing Performance Tests
69. Prevent Test Environment Mismatch
70. Prevent Missing Security Tests

---

## Output Format

**IMPORTANT: Return output in MARKDOWN format, NOT JSON. Use concise, scannable markdown.**

**Key Requirement:** Keep each guardrail under ~200 words. Focus on actionable items, not comprehensive documentation. Match the style of existing workflows (concise, practical, scannable).

### [Number]. [Title]

**Slug:** `prevent-[incident-type]`
**Category:** [subcategory] | **Severity:** [severity]

**Problem:** [One sentence explaining why AI-generated code is prone to this issue]

**Prevention Checklist:**
- [ ] [Actionable item 1]
- [ ] [Actionable item 2]
- [ ] [Actionable item 3]
- [ ] [Actionable item 4]
- [ ] [Actionable item 5]

**Early Detection:**
- **CI/CD:** [Automated check - one line]
- **Static:** [SAST tool/pattern - one line]
- **Runtime:** [Metric/alert - one line]

**Mitigation:**
1. [Immediate action 1]
2. [Recovery step 1]
3. [Post-incident fix 1]

**E-E-A-T Signals (SEO):**
- **Experience:** [First-hand testing/incident reference - one sentence]
- **Expertise:** [Technical depth/references - one sentence]
- **Authoritativeness:** [Citation/source - one sentence]
- **Trustworthiness:** [Transparency/limitations - one sentence]

**Workflows:** `category/slug` (how it helps), `category/slug` (connection)
**Pain Points:** `pain-point-XX-xxx`, `pain-point-YY-yyy`

---

## Research Instructions

**Critical: Keep it concise. Target ~200-250 words per guardrail. Focus on actionable items, not comprehensive documentation.**

1. **Be Concise** - One sentence problem statement, 5-6 checklist items, one-line detection methods, 3-step mitigation
2. **Include E-E-A-T** - Each guardrail must include E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness) for SEO
3. **Link to Existing** - Reference workflows and pain points from the "Content Connections Reference" section
4. **Actionable First** - Every checklist item should be something a developer can do today
5. **Skip Redundancy** - Don't explain why each strategy works, just state what to do
6. **Match Style** - Match the concise, scannable style of existing workflows (see `public/data/workflows.json`)
7. **No Verbosity** - Avoid effectiveness percentages, detailed explanations, or step-by-step tutorials
8. **Practical Focus** - Think "quick reference" not "comprehensive guide"

**E-E-A-T Requirements (Google SEO Signals):**
- **Experience:** Reference first-hand testing, real incidents, or production examples ("Based on Engify audits...", "From real production incidents...")
- **Expertise:** Show technical depth - specific tools, patterns, practices ("References ADRs, diff tools...", "Uses industry-standard SAST practices...")
- **Authoritativeness:** Cite authoritative sources when available ("Backed by Veracode 2025 study...", "References OWASP guidance...")
- **Trustworthiness:** Show transparency - admit limitations, acknowledge manual steps ("Acknowledges manual verification...", "Encourages honest reporting...")

### Suggestions & Improvements

**During your research, actively look for opportunities to improve the guardrail list:**

**Suggest Additional Guardrails If You Find:**
- More critical or common issues than items on the current list
- Higher search volume/SEO potential topics
- Issues that prevent multiple downstream problems
- Real-world incidents not covered by existing guardrails
- Gaps in categories (data integrity, security, performance, etc.)

**When suggesting additions, include:**
- **Title:** Clear, prevention-focused title
- **Category/Subcategory:** Where it fits
- **Severity:** Critical, high, medium, or low
- **SEO Rationale:** Why it's searchable/important (search volume, problem frequency, business impact)
- **Connection to Existing:** Links to workflows, pain points, patterns
- **Brief Description:** Why this guardrail is needed

**Suggest Removals If You Find:**
- Items that are redundant with other guardrails
- Issues that are rarely encountered in practice
- Low SEO/search potential topics
- Problems better solved by existing workflows rather than separate guardrails
- Topics that don't fit the AI-generated code prevention focus

**When suggesting removals, include:**
- **Guardrail Number:** Which item to remove
- **Rationale:** Why it should be removed (redundancy, low impact, better handled elsewhere)
- **Alternative:** If the concern is addressed by another guardrail/workflow

**Optimization Criteria:**
- **Search Volume:** How often are people searching for solutions to this problem?
- **Problem Frequency:** How common is this issue in AI-assisted development?
- **Business Impact:** How critical is preventing this incident?
- **SEO Value:** Can this rank for relevant keywords?
- **Content Completeness:** Does this add unique value or fill a gap?

**Output Format for Suggestions:**
At the end of your research, provide a "Suggestions & Improvements" section:

```markdown
## Suggestions & Improvements

### Additional Guardrails to Consider

**X. [Title]**
- **Category:** [category]
- **Severity:** [severity]
- **SEO Rationale:** [Why it's searchable/important]
- **Connection:** [Links to existing content]
- **Brief Description:** [Why this is needed]

### Guardrails to Remove/Consolidate

**X. [Current Title]**
- **Rationale:** [Why remove]
- **Alternative:** [How concern is addressed elsewhere]
```

**Goal:** Optimize the final guardrail list for maximum impact, searchability, and practical value.

## Output Requirements

**Return format:** Plain markdown text, NOT JSON.

**Structure:**
- Use markdown headers (###)
- Use bullet points for checklist items
- Use numbered lists for mitigation steps (3 items max)
- Keep each guardrail under 200 words total
- Write in direct, actionable language

**Do NOT:**
- Return JSON format
- Write paragraphs explaining strategies (use bullet points)
- Include effectiveness percentages or verbose descriptions
- Repeat information across sections
- Make it sound like AI-generated documentation

---

## Begin Research

Process all 70 guardrails systematically. For each guardrail, provide concise, actionable research in the condensed markdown format.

For each guardrail:
1. Write one-sentence problem statement
2. Create 5-6 actionable checklist items
3. List detection methods (one line each)
4. Define 3-step mitigation
5. Link to workflows and pain points

**Priority:** Start with critical/high severity guardrails (data integrity, security, financial).

**Output:** Provide concise markdown-formatted research (~150 words per guardrail). Focus on actionable items, not comprehensive documentation.

**Final Step:** After completing all 70 guardrails, provide a "Suggestions & Improvements" section with:
- Additional guardrails you discovered during research (optimized for SEO and importance)
- Guardrails to remove or consolidate (with rationale)
- Any other improvements to optimize the list for searchability and practical value
