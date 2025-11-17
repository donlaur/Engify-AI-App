# Guardrail Consolidation Recommendations

**Source:** Gemini Deep Research Output Analysis  
**Date:** 2025-01-14

## Overview

The research output identified several guardrails that are duplicates or closely related. This document provides recommendations for consolidating them to reduce redundancy and improve content organization.

## Duplicates to Consolidate

### 1. Guardrail #41 & #60: Retry Logic Duplication

**Current Status:**
- **#41** (`prevent-missing-retry-logic`) - Category: availability, Severity: high
- **#60** (`prevent-missing-retry-logic-for-api-calls`) - Category: integration, Severity: high

**Rationale:**
These are the exact same guardrail. The implementation (exponential backoff with jitter) is identical for both general client code and API client code.

**Recommendation:**
- Merge into a single, definitive guardrail: `prevent-missing-retry-logic`
- Place in **availability** category (broader scope)
- Update problem statement to explicitly mention both general client code and API clients
- Ensure the checklist works for both use cases

**Implementation:**
- Keep Guardrail #41 (availability) as the authoritative version
- Remove Guardrail #60 (integration)
- Update Guardrail #41 to explicitly mention API client use cases

---

### 2. Guardrail #46 & #48: Double-Charging vs Idempotency

**Current Status:**
- **#46** (`prevent-double-charging-customers`) - Category: financial, Severity: critical
- **#48** (`prevent-missing-idempotency-check`) - Category: financial, Severity: critical

**Rationale:**
"Missing Idempotency" is the root cause that leads to "Double-Charging." The guardrail should focus on the solution (idempotency) rather than the symptom (double-charging).

**Recommendation:**
- Remove #46 (`prevent-double-charging-customers`)
- Keep #48 (`prevent-missing-idempotency-check`) as the authoritative guardrail
- Update Guardrail #48's problem statement to explicitly mention "double-charging" as the primary incident it prevents
- Ensure Guardrail #48 clearly explains how idempotency prevents double-charging

**Implementation:**
- Keep Guardrail #48 (financial) as the authoritative version
- Remove Guardrail #46 (financial)
- Update Guardrail #48 to lead with the double-charging problem in the problem statement

---

### 3. Guardrail #32 & #68: Load Testing vs Performance Testing

**Current Status:**
- **#32** (`prevent-missing-load-testing`) - Category: performance, Severity: high
- **#68** (`prevent-missing-performance-tests`) - Category: testing, Severity: high

**Rationale:**
These are synonyms in practice. Load testing is the most common and effective type of performance testing. Having both creates confusion.

**Recommendation:**
- Merge into a single, authoritative guardrail: `prevent-missing-performance-testing`
- Place in **testing** category (broader scope, includes load, stress, soak tests)
- Update checklist to cover all types of performance testing (load, stress, soak)
- Remove duplicate

**Implementation:**
- Keep Guardrail #68 (testing) as the base, but rename to `prevent-missing-performance-testing`
- Remove Guardrail #32 (performance)
- Update Guardrail #68's checklist to explicitly mention load, stress, and soak testing
- Move any unique content from #32 into #68

---

## Complementary Guardrails to Link

### 4. Guardrail #17 & #55: Rate Limiting (Server vs Client)

**Current Status:**
- **#17** (`prevent-missing-rate-limiting`) - Category: security, Severity: high
- **#55** (`prevent-rate-limit-exceeded`) - Category: integration, Severity: medium

**Rationale:**
These are NOT redundant but are two sides of the same coin:
- **#17** is the **server-side** prevention (implementing the limit)
- **#55** is the **client-side** prevention (handling the 429 response)

**Recommendation:**
- **Keep both guardrails** - they serve different purposes
- **Explicitly link them** in their "Workflows" or "Related Resources" sections
- Frame them as complementary: server-side (prevention) and client-side (resilience)
- This creates a stronger, more complete content cluster

**Implementation:**
- Add to Guardrail #17's "Related Resources": "See Guardrail #55 for client-side rate limit handling"
- Add to Guardrail #55's "Related Resources": "See Guardrail #17 for server-side rate limit implementation"
- Consider cross-linking in both guardrails' problem statements

---

## Additional Guardrails to Consider

### LLM-Specific Guardrails (New Attack Surface)

The research output identified 5 new guardrails that address LLM-native vulnerabilities (beyond traditional code vulnerabilities):

1. **Prevent Prompt Injection (LLM01)** - Category: security, Severity: critical
   - SEO Rationale: #1 vulnerability for LLM applications (OWASP Top 10 for LLMs)
   - Connection: `security/prompt-injection-defense`
   - Brief: Prevents attackers from hijacking the AI's intended function by injecting malicious instructions

2. **Prevent Insecure Output Handling (LLM02)** - Category: security, Severity: critical
   - SEO Rationale: LLM equivalent of XSS - AI output is untrusted data
   - Connection: `security/security-guardrails`
   - Brief: Prevents downstream vulnerabilities by treating AI-generated text as untrusted input

3. **Prevent Excessive Agency (LLM08)** - Category: security, Severity: high
   - SEO Rationale: Addresses "AI Agents" trend - critical as agents gain API/web access
   - Connection: `security/identity-first-privilege-design`
   - Brief: Prevents AI agents from causing catastrophic harm through least privilege enforcement

4. **Prevent Sensitive Information Disclosure (LLM06)** - Category: security, Severity: high
   - SEO Rationale: High business impact (PII/GDPR/compliance risks)
   - Connection: `risk-management/catch-mock-metrics`, `security/security-guardrails`
   - Brief: Prevents AI models from leaking memorized sensitive data from training sets

5. **Prevent Model Denial of Service (LLM04)** - Category: availability, Severity: high
   - SEO Rationale: New, high-impact availability risk specific to LLMs
   - Connection: `prevent-missing-rate-limiting`
   - Brief: Prevents resource exhaustion through resource-intensive prompts (input-length limits, cost-tracking)

**Recommendation:**
- Add these 5 guardrails to expand coverage of AI-native attack surfaces
- Place them in appropriate categories (security or availability)
- Ensure they reference OWASP Top 10 for LLMs for authoritativeness

---

## Summary of Actions

### Immediate Consolidations

1. ✅ **Merge #41 & #60:** Keep #41, remove #60, update #41 to cover API clients
2. ✅ **Merge #46 & #48:** Keep #48, remove #46, update #48 to emphasize double-charging prevention
3. ✅ **Merge #32 & #68:** Keep #68, remove #32, update #68 to cover all performance testing types

### Link Complementary Guardrails

4. ✅ **Link #17 & #55:** Keep both, add cross-references in "Related Resources" or "Workflows" sections

### Consider for Future

5. ⚠️ **Add LLM-Specific Guardrails:** Evaluate adding 5 new guardrails for LLM-native vulnerabilities

---

## Impact

**Before Consolidation:** 70 guardrails  
**After Consolidation:** 67 guardrails (3 duplicates removed)

**Net Result:**
- Reduced redundancy
- Clearer content organization
- Better user experience (no confusion from duplicates)
- Maintains comprehensive coverage

---

## Implementation Status

- [ ] Review consolidation recommendations with stakeholders
- [ ] Update guardrail files to remove duplicates
- [ ] Add cross-references for complementary guardrails
- [ ] Update category counts (performance: 10→9, integration: 10→9, financial: 8→7)
- [ ] Evaluate LLM-specific guardrails for future addition
- [ ] Update documentation and indexes

