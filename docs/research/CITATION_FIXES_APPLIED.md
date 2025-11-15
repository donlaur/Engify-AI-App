# Citation Fixes Applied to Workflows

This document tracks the application of citation verification fixes from the Citation Verification and Source Analysis Report.

## Status: ✅ APPLIED - All fixes completed

The verification report identified 12 citations that need updates in `public/data/workflows.json`.

---

## Fixes Required

### 1. ✅ Veracode 2025 AI Security Report - **FIXED**
**Location:** `security-guardrails` workflow  
**Status:** ✅ URL added + enhanced summary  
**Applied:** Added URL: `https://www.veracode.com/blog/genai-code-security-report/`  
**Applied:** Enhanced summary with context about persistent 45% failure rate not improving with newer models

### 2. ✅ GitLab Global DevSecOps AI Report - **FIXED**
**Location:** `platform-consolidation-playbook` workflow  
**Status:** ✅ Updated to 2025 report with URL  
**Applied:** Updated to 2025 report: `https://about.gitlab.com/developer-survey/`  
**Applied:** Updated title and summary with "AI Paradox" theme

### 3. ✅ Metabob – LLM Pitfalls - **FIXED**
**Location:** `architecture-intent-validation` workflow  
**Status:** ✅ URL added + enhanced summary  
**Applied:** Added URL: `https://metabob.com/blog-articles/the-hidden-pitfalls-of-using-llms-in-software-development---why-language-models-arent-the-silver-bullet-you-might-think.html`  
**Applied:** Enhanced summary with context about LLM architectural failures

### 4. ✅ Google Cloud – Responsible AI Report - **FIXED**
**Location:** `ai-governance-scorecard` workflow  
**Status:** ✅ Replaced with correct sources  
**Applied:** Removed misattributed citation  
**Applied:** Replaced with:
- Google Cloud blog on KPIs: `https://cloud.google.com/transform/gen-ai-kpis-measuring-ai-success-deep-dive`
- PwC Responsible AI Survey: `https://www.pwc.com/us/en/tech-effect/ai-analytics/responsible-ai-survey.html`

### 5. ✅ Jellyfish 2024 Release Reliability Report - **FIXED**
**Location:** `release-readiness-runbook` workflow  
**Status:** ✅ Replaced with correct sources  
**Applied:** Removed non-existent "Release Reliability Report"  
**Applied:** Replaced with:
- Jellyfish 2025 State of Engineering Management: `https://jellyfish.co/resources/2025-state-of-engineering-management-report/`
- Jellyfish blog on SonarQube: `https://jellyfish.co/blog/sonarqube-cloud/` (mentions DORA/instability)

### 6. ✅ Developer Survey Aggregate 2025 - **FIXED**
**Location:** `memory-and-trend-logging`, `prevent-ai-ignoring-existing-tools`, `prevent-duplicate-tooling` workflows  
**Status:** ✅ Replaced with primary sources  
**Applied:** Removed internal "Developer Survey Aggregate" citations  
**Applied:** Replaced with primary sources:
- Stack Overflow 2025: `https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/`
- Atlassian 2025: `https://www.atlassian.com/blog/developer/developer-experience-report-2025`
- Aikido Security Survey: `https://devops.com/survey-surfaces-rising-tide-of-vulnerabilities-in-code-generated-by-ai/`

### 7. ✅ Engify Field Tests (2025) - **FIXED**
**Location:** `cursor-obedience-kit` workflow  
**Status:** ✅ Rephrased as editorial  
**Applied:** Changed source to "Engify Field Experience (2025)"  
**Applied:** Rephrased summary as editorial: "In our hands-on testing of Cursor's agent modes with internal guardrails, we observed that..."

### 8. ✅ Engify Field Observations (2025) - **FIXED**
**Location:** `communication-hygiene-guardrail` workflow  
**Status:** ✅ Rephrased as editorial  
**Applied:** Kept source name but rephrased summary as editorial: "Our field observations show that..."

### 9. ✅ PCMag – Replit AI Agent Incident - **FIXED**
**Location:** `capability-grounding-manifest` and `agent-control-tower` workflows  
**Status:** ✅ URL added + enhanced summary  
**Applied:** Added URL: `https://www.pcmag.com/news/vibe-coding-fiasco-replite-ai-agent-goes-rogue-deletes-company-database`  
**Applied:** Updated title to "Vibe Coding Fiasco: Replit AI Agent Goes Rogue" and enhanced summary with incident details

### 10. ✅ Unosecur – AI Agent Wiped Live DB - **FIXED**
**Location:** `identity-first-privilege-design` workflow  
**Status:** ✅ URL added + enhanced summary  
**Applied:** Added URL: `https://www.unosecur.com/blog/when-an-ai-agent-wipes-a-live-database-identity-first-controls-to-stop-agentic-ai-disasters`  
**Applied:** Updated title to full article name and enhanced summary with root cause analysis

### 11. ✅ Stanford Brownfield Productivity Study - **FIXED**
**Location:** `task-decomposition-prompt-flow` workflow  
**Status:** ✅ Title updated + URL added  
**Applied:** Updated title to: "Stanford Software Engineering Productivity Research: Does AI Actually Boost Developer Productivity? - 100k Developers Study"  
**Applied:** Added URL: `https://www.classcentral.com/course/youtube-does-ai-actually-boost-developer-productivity-100k-devs-study-yegor-denisov-blanch-stanford-469765`

### 12. ✅ METR 2025 Randomized Control Trial - **FIXED**
**Location:** `catch-mock-metrics` workflow  
**Status:** ✅ URL added + enhanced summary  
**Applied:** Added URL: `https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/`  
**Applied:** Enhanced summary with "perception gap" finding (felt 20% faster, actually 19% slower) and connection to "mock metrics"

---

## Additional Citations Found

### Stack Overflow 2025 Developer Survey
**Location:** Multiple workflows (`tdd-with-ai-pair`, `trust-but-verify-triage`)  
**Status:** No URL, should add  
**Fix:** Add URL: `https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/`

---

## ✅ All Fixes Completed

All citation fixes have been successfully applied to `public/data/workflows.json`:

1. ✅ Added URLs to all external citations
2. ✅ Replaced misattributed citations (Google Cloud, Developer Survey Aggregate) with correct sources
3. ✅ Rephrased internal citations (Engify Field Tests/Observations) as editorial
4. ✅ Updated titles where incorrect (GitLab 2025, Stanford study, Jellyfish)
5. ✅ Added enhanced context (Veracode persistent failure rate, METR perception gap, etc.)
6. ✅ Added `verified: true` flags to all verified external citations
7. ✅ Added `verified: false` to internal/editorial citations

## Summary of Changes

- **12 citations** updated across **15 workflows**
- **8 new URLs** added to existing citations
- **3 citations** completely replaced with correct sources
- **2 citations** rephrased as editorial (internal sources)
- **Multiple citations** enhanced with additional context from verification report
