# Engineering Governance Playbook – Working Outline

_Last updated: 2025-11-10_

## Hub Page Structure

1. **Hero**
   - **H1:** Stop AI Slop Before It Hits Production
   - **Subhead:** Oversized AI-assisted PRs (+150%), review cycles dragging (+90%), and compliance deadlines looming (EU AI Act fines up to 7% of revenue) are erasing AI velocity gains.
   - **Primary CTA:** Request an AI Governance Assessment  
     **Secondary CTA:** Download the Engineering Governance Playbook  
     **Tertiary CTA:** Explore the open reference implementation (optional)

2. **The AI Productivity Paradox**
   - Visual: three-line chart (PRs merged ↑, review time ↑, delivery flat).
   - Key stats (DORA/Faros 2025): PR size +154%, review time +91%, bug rate +9%, delivery performance flat.
   - Narrative: individual throughput growth is cancelled by review bottlenecks and downstream chaos.

3. **Define "AI Slop" & Its Damage**
   - Evidence: GitClear (refactoring share ↓ from ~25% to <10%; copy/paste ↑ past 12%), HBR/BetterUp (2 hours rework per AI deliverable), Veracode (45% insecure AI code), GitGuardian (+25% leaked secrets YoY).
   - Highlight leadership risk: brand trust erosion, audit failures, burnout.

4. **Layered Governance Controls**
   - Table mapping problem → root cause → control.
   - Controls: PR size guardrails (<400 lines), AI-quality scoring (publish gate ≥8.5 with slop/E-E-A-T ≥8.0), pre-commit security/PII/license scans, automated review assistants, snippet-level license/IP scanning plus code similarity detection, auditable multi-agent governance (MCP).

5. **ROI & Cost Control**
   - Quantify the "AI slop tax" (developer-hours, incident costs, token spend).  
   - Include before/after KPI chart (cycle time, change failure rate, incident MTTR, review backlog).

6. **Proof & Audit Readiness**
   - Evidence types: industry benchmarks, anonymized case snapshots, compliance mapping (EU AI Act, NIST AI RMF, ISO/IEC 42001), governance dashboards.

7. **Objections & Answers**
   - Address speed concerns, existing CI coverage, experienced team skepticism, "is this only for AI code".
   - Anchor rebuttals with data (e.g., AI without guardrails increases PR size and bug rates; guardrails reclaim review bandwidth).

8. **Closing CTA**
   - Reinforce value: "Book an AI Governance Readiness Session" plus toolkit or checklist download.

---

## Spoke Briefs (Working Drafts)

### 1. The True Cost of AI Slop: Quantifying Technical Debt Before It Escapes Review
- **Audience:** Staff+ engineers, engineering managers.
- **Core Points:**
  - Define AI slop and connect to maintainability collapse (GitClear 2025: refactoring ↓ to <10%, copy/paste >12%).
  - Quantify rework: HBR/BetterUp shows ~2 hours per AI deliverable; convert to $ cost using blended senior engineer salary.
  - Highlight security overhead (Veracode: 45% insecure, GitGuardian: +25% leaked secrets).
  - Illustrate monthly "slop tax" scenarios for mid-size teams.
  - Mitigation checklist: enforce ≥8.5 quality gate, targeted review, AI usage telemetry.
- **CTA:** Link to governance playbook + ROI calculator worksheet.

### 2. Executive Checklist: Meeting EU AI Act & ISO/IEC 42001 Obligations in Software Delivery
- **Audience:** VP Engineering, CTO, compliance partners.
- **Core Points:**
  - Summarize deadlines (Feb 2025 prohibitions, Aug 2025 GPAI rules) and penalties (up to 7% global revenue).
  - Clarify Article 6 risk classification for code generation / agentic workflows.
  - Map engineering controls to ISO/IEC 42001 artifacts (model inventory, risk registers, audit logs, incident handling).
  - Provide checklist tables: governance ownership, technical safeguards, monitoring/audit evidence captured via MCP logs.
  - Include "fast start" documentation template per release.
- **CTA:** Download compliance workbook + invite to readiness session.

### 3. The AI Productivity Paradox: Why Larger PRs Are Stalling Delivery (and How to Reclaim Throughput)
- **Audience:** Directors / VPs focused on delivery metrics.
- **Core Points:**
  - Present paradox data (DORA/Faros: PR count +98%, size +154%, review time +91%, bug rate +9%).
  - Reference developer sentiment (burnout threads, trust surveys showing low confidence in AI for complex code).
  - Governance levers: small-batch PR policy (<400 lines), stacked diffs, automated review assistants, pre-PR slop scoring.
  - Expected outcomes: restored cycle time, reduced change failure rate, healthier review backlog.
  - Change-management tips for rolling out thresholds and measuring improvement via repo analytics.
- **CTA:** Adopt the PR governance playbook + integrate guardrail pipeline.

### 4. Secure at Inception: Pre-Commit Guardrails for AI-Generated Code
- **Audience:** Security engineering leaders, DevSecOps owners.
- **Core Points:**
  - Contrast reactive CI scans vs. proactive pre-commit enforcement in AI-heavy workflows.
  - Surface risk stats: 45% insecure AI suggestions (Veracode), 25% YoY increase in leaked secrets (GitGuardian), OWASP LLM Top 10 categories (LLM02/05/06).
  - Detail guardrail stack: SAST, secret/PII scanning, schema validation, license/IP checks, quality scores before the code leaves the IDE.
  - Provide implementation blueprint referencing existing scripts (`scripts/ai/enforce-guardrails.ts`, compliance checks, targeted tests).
  - Include measurement guidance (e.g., tracked reductions in blocked vulnerabilities, time saved per failure avoided).
- **CTA:** Deploy the secure-at-inception checklist + request pre-commit policy workshop.

### 5. Competitive Landscape: Platform vs. Security vs. Quality Approaches
- **Audience:** Directors/VPs evaluating governance tooling; procurement stakeholders.
- **Core Points:**
  - Summarize three archetypes: platform control planes (GitHub), security-first (Snyk), reactive quality scanners (Sonar/Codacy).
  - Tabulate strengths/gaps: agent management vs. maintainability enforcement, security vs. review bottlenecks, reactive vs. proactive controls.
  - Highlight need for unified layer that integrates quality, security, compliance with open extensibility (where Engify can play without naming directly).
  - Include emerging entrants (VerifyWise, Holistic AI, Airia) and onboarding timelines/cost implications.
  - Advise leaders on evaluation criteria (DevOps integration depth, audit logging, customization, time-to-value).
- **CTA:** Download the governance comparison worksheet + schedule architecture review.

### 6. Five Insecure Patterns AI Assistants Introduce (and How to Block Them)
- **Audience:** Senior/staff engineers, security champions.
- **Core Points:**
  - Identify top failure modes: SQL injection, XSS, unsafe dependency recommendations, hard-coded secrets, hallucinated APIs/configs.
  - Cite Veracode stats per vulnerability class and supporting studies (e.g., 36% of AI-assisted participants introduced SQLi).
  - Provide blocking tactics: stricter schema validation (Zod), sanitization utilities, dependency allowlists, secret detection, prompt hygiene.
  - Offer code snippets referencing repository utilities (e.g., `src/lib/security/sanitize.ts`).
  - Encourage embedding these checks into both automation and review guidelines.
- **CTA:** Grab the insecure-patterns playbook + enable guardrail presets.

### 7. AI Hidden Costs: Building the Governance ROI Calculator
- **Audience:** VP Engineering, CTO, finance/business partners.
- **Core Points:**
  - Itemize hidden cost drivers: review rework hours (HBR), incident remediation (Veracode/GitGuardian), compliance overhead (PYMNTS $1 → $5–$10 multiplier), model/token spend (Menlo Ventures).
  - Provide configurable calculator inputs (team size, avg salary, PR volume, incident frequency) to model the "slop tax" vs. governance investment.
  - Include benchmarks: Gartner prediction (40% AI projects cancelled for cost/risk), PwC ROI uplift when responsible AI is adopted (~58–60%).
  - Suggest dashboards/KPIs to track savings (review time, change failure rate, escaped defects, audit prep hours).
  - Outline narrative for leadership decks and fundraising positioning (TAM sizing placeholder).
- **CTA:** Access the ROI calculator spreadsheet + invite to governance cost workshop.

### 8. PR Governance Playbook: Enforcing Small Batches Without Slowing Devs
- **Audience:** Engineering managers, tech leads owning review workflows.
- **Core Points:**
  - Present evidence that PRs <300–400 lines yield faster approvals (Propel, Microsoft internal studies) and fewer defects.
  - Detail enforcement tactics: GitHub Action rules, stacked diffs, Graphite/Aviator workflows, review SLA dashboards.
  - Explain change management: start with soft warnings, educate on stacked diffs, pair with automated lint/test gating.
  - Integrate AI-specific guardrails (slop scoring, automatic diff annotations, suggested break-up points).
  - Provide sample policy templates and metrics to monitor (average lines/PR, review age, idle time).
- **CTA:** Implement the PR governance checklist + measure impact with provided dashboard template.

  **Key Research Inputs:**
  - SmartBear/Cisco foundational study: defect detection drops sharply beyond ~400 LoC or >60–90 minutes of review; optimal pace <300 LoC/hr.
  - Modern telemetry (Propel, Graphite): sweet spot 25–100 significant lines with 87% defect detection and 3× faster approvals; revert risk rises when PRs <25 lines; mega-PRs (~1000+ lines) see detection fall to ~28% and reviewer engagement collapse.
  - Meta DevEx data: P75 Time in Review tightly correlated with engineer satisfaction; “eyeball time” guardrail ensures quality while reducing queue time.
  - Implementation playbook: crawl (non-blocking size labels), walk (CI hard limit ~500 LoC), run (cognitive-complexity gating, stacked diffs, feature flags).

### 9. MCP Security Blueprint: Sandboxing, Registries, and Audit Logging
- **Audience:** Platform architects, security/compliance teams.
- **Core Points:**
  - Distill best practices from Wiz and other MCP security advisories: sandbox agent execution, signed registries, strict permission scopes, network egress control.
  - Map to Engify roadmap: MCP gateway, allowlist/denylist, tenant isolation, immutable audit log of agent actions.
  - Recommend infrastructure patterns (containerization, policy-as-code, SIEM integrations) and testing regimes.
  - Provide checklist for onboarding new agents/tools, including threat modeling and monitoring hooks.
  - Highlight compliance alignments (ISO/IEC 42001 evidence capture, NIST AI RMF "Manage" function).
- **CTA:** Download the MCP security blueprint + schedule architecture assessment.

### 10. IP Compliance Playbook: Snippet Scanning & Regurgitation Detection
- **Audience:** DevSecOps leaders, legal/compliance partners, staff engineers.
- **Core Points:**
  - Frame the dual risk: copyleft "snippet" contamination (GPL/AGPL) and copyrighted regurgitation from training data.
  - Explain why manifest-only SCA fails on AI-generated code; emphasize snippet-level scanning (Black Duck, Snyk DeepCode) and open-source stacks (ORT + ScanCode) as mandatory upgrades.
  - Outline code similarity detection options (MOSS, TF-IDF, LLM embeddings) to catch proprietary or semantic clones beyond known OSS fingerprints.
  - Provide defense-in-depth workflow: enable tool-native attribution filters, enforce CI/CD snippet scans, add human adjudication, maintain an AI Bill of Materials (AIBOM).
  - Include evaluation checklist covering coverage (GitHub-only vs. multi-registry), false-positive handling, policy-as-code support, audit logging, and legal review SLAs.
- **CTA:** Run the IP compliance readiness assessment + pilot snippet scanning in CI within 30 days.

---

## Next Steps
- Compile internal metrics/screenshots:
  - Quality scoring outputs (publish gate ≥8.5, slop/E-E-A-T thresholds) from `src/lib/content/content-quality-scorer.ts`.
  - Pre-commit pipeline evidence (`.husky/pre-commit`, guardrail scripts, targeted test enforcement).
  - CI enforcement coverage from `.github/workflows/ci.yml`.
  - Production stability checklist excerpts (`docs/operations/PRODUCTION_STABILITY.md`).
  - Evidence of snippet-level license scanning and similarity analysis (tool screenshots, policy configs, sample reports).
- Produce supporting visuals/charts: productivity paradox, refactor vs. copy/paste trend, proactive vs. reactive workflow, governance pillar icons, ROI calculator frame.
- Document open research items:
  1. Pre-commit quality metrics benchmarks (SonarQube, Code Climate scoring).
  2. PR size enforcement tooling (Graphite, Aviator, LinearB best practices).
  3. MCP security patterns from Wiz and related advisories (sandboxing, registries, audit logs).
  4. ISO/IEC 42001 audit artifacts + EU AI Act Article 6 obligations for code generation.
  5. Codacy Guardrails feature comparison and onboarding experience.
  6. Public AI governance policy examples (Google, Meta, Microsoft, etc.).
  7. Governance TAM estimates (Gartner, VC market maps).
  8. AI slop cost modeling inputs (salary benchmarks, rework studies).
  9. DORA metric improvement benchmarks from guardrail case studies (Codacy, Snyk, Sonar customers).
  10. Comparative evaluation of snippet-scanning vendors vs. open-source stacks (coverage, accuracy, maintenance burden).
- Begin drafting hub copy (Hero → CTA) leveraging finalized outline and cited evidence once visuals/metrics are ready.
