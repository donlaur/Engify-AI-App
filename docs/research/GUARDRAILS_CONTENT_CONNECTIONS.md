# Guardrails Content Connections
## Mapping 70 Guardrails to Existing Workflows, Prompts, Patterns, and Pain Points

## Purpose

This document maps each of the 70 guardrails to existing content:
- **Workflows** that directly prevent or relate to the guardrail
- **Prompts** that help prevent the incident
- **Patterns** that can be applied
- **Pain Points** that the guardrail addresses

**Goal:** Enable comprehensive cross-linking and content discovery.

---

## Connection Analysis

### Category 1: Data Integrity Guardrails (10)

#### 1. Prevent Data Corruption in AI-Generated Migrations

**Connections:**
- **Workflows:**
  - `ai-behavior/stop-schema-guessing` - Prevents schema hallucinations that cause migration issues
  - `process/release-readiness-runbook` - Includes migration validation in release checks
- **Pain Points:**
  - `pain-point-20-schema-drift` - Direct connection (migrations cause schema drift)
  - `pain-point-05-missing-context` - AI lacks context for existing data
  - `pain-point-01-almost-correct-code` - Migration code looks right but corrupts data
- **Prompts:** (Suggested)
  - `migration-validator-prompt` - Validate migration before running
  - `rollback-script-generator` - Generate rollback scripts
  - `data-integrity-checker` - Check data before migration
- **Patterns:**
  - `structured-output` - For migration script validation
  - `cognitive-verifier` - Self-check migration logic

---

#### 2. Prevent Type Coercion Errors in Batch Processing

**Connections:**
- **Workflows:**
  - `ai-behavior/stop-schema-guessing` - Prevents assumptions about data types
  - `process/release-readiness-runbook` - Validates batch processing code
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but fails on edge cases
  - `pain-point-22-missing-validations` - Missing type validation
- **Prompts:** (Suggested)
  - `type-validation-prompt` - Validate types before processing
  - `batch-processing-safety-check` - Check batch processing logic
- **Patterns:**
  - `cognitive-verifier` - Verify type handling
  - `few-shot` - Examples of correct type handling

---

#### 3. Prevent Race Conditions in Concurrent Updates

**Connections:**
- **Workflows:**
  - `code-quality/keep-prs-under-control` - Smaller PRs reduce concurrent changes
  - `process/daily-merge-discipline` - Frequent merges reduce race windows
  - `process/release-readiness-runbook` - Tests for concurrency issues
- **Pain Points:**
  - `pain-point-11-merge-conflicts` - Related to concurrent development
  - `pain-point-01-almost-correct-code` - Code works in isolation but fails concurrently
- **Prompts:** (Suggested)
  - `concurrency-validator` - Check for race conditions
  - `locking-pattern-checker` - Verify proper locking
- **Patterns:**
  - `red-team` - Think like an attacker (race condition exploit)
  - `cognitive-verifier` - Verify thread safety

---

#### 4. Prevent Silent Data Truncation

**Connections:**
- **Workflows:**
  - `ai-behavior/stop-schema-guessing` - Prevents assumptions about field lengths
  - `process/release-readiness-runbook` - Validates data handling
- **Pain Points:**
  - `pain-point-20-schema-drift` - Schema mismatches cause truncation
  - `pain-point-01-almost-correct-code` - Code silently fails
- **Prompts:** (Suggested)
  - `data-length-validator` - Check field length constraints
  - `truncation-detector` - Detect silent truncation
- **Patterns:**
  - `precision-summary` - Ensure data integrity

---

#### 5. Prevent Orphaned Records from Cascading Delete

**Connections:**
- **Workflows:**
  - `ai-behavior/stop-schema-guessing` - Prevents incorrect foreign key assumptions
  - `process/release-readiness-runbook` - Validates deletion logic
- **Pain Points:**
  - `pain-point-20-schema-drift` - Schema understanding issues
  - `pain-point-05-missing-context` - AI lacks context for relationships
- **Prompts:** (Suggested)
  - `foreign-key-validator` - Check foreign key relationships
  - `cascade-delete-checker` - Verify cascade behavior
- **Patterns:**
  - `cognitive-verifier` - Verify relationship handling

---

#### 6. Prevent Duplicate Data from Missing Unique Constraints

**Connections:**
- **Workflows:**
  - `ai-behavior/stop-schema-guessing` - Prevents missing constraint assumptions
  - `code-quality/keep-prs-under-control` - Smaller PRs easier to review for constraints
- **Pain Points:**
  - `pain-point-20-schema-drift` - Schema issues
  - `pain-point-03-hallucinated-capabilities` - AI assumes constraints exist
- **Prompts:** (Suggested)
  - `unique-constraint-checker` - Verify unique constraints
  - `duplicate-prevention-prompt` - Prevent duplicate data
- **Patterns:**
  - `structured-output` - For constraint validation

---

#### 7. Prevent Data Type Mismatch in API Integration

**Connections:**
- **Workflows:**
  - `ai-behavior/stop-schema-guessing` - Prevents type assumptions
  - `ai-behavior/capability-grounding-manifest` - Documents API contracts
  - `process/release-readiness-runbook` - Validates API integration
- **Pain Points:**
  - `pain-point-05-missing-context` - AI lacks API contract context
  - `pain-point-03-hallucinated-capabilities` - AI assumes wrong types
- **Prompts:** (Suggested)
  - `api-contract-validator` - Validate API types
  - `type-coercion-checker` - Check type conversions
- **Patterns:**
  - `structured-output` - For API validation
  - `capability-grounding` - Ground in API documentation

---

#### 8. Prevent Incorrect Timezone Handling

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Validates datetime handling
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works in one timezone
  - `pain-point-22-missing-validations` - Missing timezone validation
- **Prompts:** (Suggested)
  - `timezone-handler-validator` - Check timezone logic
  - `datetime-consistency-checker` - Verify datetime handling
- **Patterns:**
  - `few-shot` - Examples of correct timezone handling

---

#### 9. Prevent Buffer Overflow in Data Processing

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Performance testing
  - `code-quality/keep-prs-under-control` - Easier to review memory usage
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works with small data
  - `pain-point-22-missing-validations` - Missing memory limits
- **Prompts:** (Suggested)
  - `memory-limit-checker` - Check memory constraints
  - `buffer-overflow-detector` - Detect buffer issues
- **Patterns:**
  - `red-team` - Stress test with large datasets

---

#### 10. Prevent Data Loss from Incomplete Transactions

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Transaction validation
  - `code-quality/tdd-with-ai-pair` - Test transaction rollback
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code commits partial data
  - `pain-point-22-missing-validations` - Missing transaction validation
- **Prompts:** (Suggested)
  - `transaction-validator` - Verify transaction boundaries
  - `rollback-scenario-tester` - Test rollback scenarios
- **Patterns:**
  - `cognitive-verifier` - Verify transaction integrity

---

### Category 2: Security Guardrails (12)

#### 11. Prevent Hardcoded Secrets in Generated Code

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection** (general security workflow)
  - `process/release-readiness-runbook` - Secret scanning
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection (security vulnerability)
  - `pain-point-01-almost-correct-code` - Code looks right but has secrets
- **Prompts:** (Existing/Suggested)
  - `secret-scanner-prompt` - Check for hardcoded secrets
  - `secure-config-generator` - Generate secure configuration
- **Patterns:**
  - `red-team` - Think like an attacker (find secrets)

---

#### 12. Prevent SQL Injection Vulnerability

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `process/release-readiness-runbook` - Security scanning
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-22-missing-validations` - Missing input validation
- **Prompts:** (Suggested)
  - `sql-injection-checker` - Detect SQL injection risks
  - `parameterized-query-validator` - Verify parameterized queries
- **Patterns:**
  - `red-team` - Attack scenario thinking
  - `cognitive-verifier` - Verify SQL safety

---

#### 13. Prevent IDOR (Insecure Direct Object Reference)

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `security/identity-first-privilege-design` - Related (authorization)
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-22-missing-validations` - Missing authorization checks
- **Prompts:** (Suggested)
  - `authorization-checker` - Verify access control
  - `idor-detector` - Detect IDOR vulnerabilities
- **Patterns:**
  - `red-team` - Attack scenario (accessing other users' data)

---

#### 14. Prevent XSS (Cross-Site Scripting)

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `process/release-readiness-runbook` - Security scanning
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-22-missing-validations` - Missing input sanitization
- **Prompts:** (Suggested)
  - `xss-checker` - Detect XSS risks
  - `input-sanitizer-validator` - Verify input sanitization
- **Patterns:**
  - `red-team` - XSS attack scenarios

---

#### 15. Prevent CSRF (Cross-Site Request Forgery)

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
- **Prompts:** (Suggested)
  - `csrf-protection-checker` - Verify CSRF tokens
  - `csrf-validator` - Check CSRF protection
- **Patterns:**
  - `red-team` - CSRF attack scenarios

---

#### 16. Prevent Insecure File Upload

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `process/release-readiness-runbook` - Security scanning
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-22-missing-validations` - Missing file validation
- **Prompts:** (Suggested)
  - `file-upload-validator` - Check file upload security
  - `malware-scanner-prompt` - Scan uploaded files
- **Patterns:**
  - `red-team` - File upload attack scenarios

---

#### 17. Prevent Missing Rate Limiting

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
- **Prompts:** (Suggested)
  - `rate-limit-checker` - Verify rate limiting
  - `brute-force-protection-validator` - Check brute force protection
- **Patterns:**
  - `red-team` - Brute force attack scenarios

---

#### 18. Prevent Exposed Sensitive Data in Logs

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `risk-management/catch-mock-metrics` - Related (data validation)
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-18-log-manipulation` - Related (fake/leaked data in logs)
- **Prompts:** (Suggested)
  - `log-sanitizer` - Remove sensitive data from logs
  - `pii-detector` - Detect PII in logs
- **Patterns:**
  - `precision-summary` - Ensure log data safety

---

#### 19. Prevent Insecure Session Management

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `security/identity-first-privilege-design` - Related (session/auth)
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
- **Prompts:** (Suggested)
  - `session-security-checker` - Verify session management
  - `token-validator` - Check token security
- **Patterns:**
  - `red-team` - Session hijacking scenarios

---

#### 20. Prevent Path Traversal Vulnerability

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-22-missing-validations` - Missing path validation
- **Prompts:** (Suggested)
  - `path-validator` - Check path traversal risks
  - `directory-traversal-detector` - Detect path vulnerabilities
- **Patterns:**
  - `red-team` - Path traversal attack scenarios

---

#### 21. Prevent Missing HTTPS Enforcement

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `process/release-readiness-runbook` - Security checks
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
- **Prompts:** (Suggested)
  - `https-enforcement-checker` - Verify HTTPS enforcement
  - `tls-validator` - Check TLS configuration
- **Patterns:**
  - `red-team` - Man-in-the-middle scenarios

---

#### 22. Prevent Weak Password Validation

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-22-missing-validations` - Missing validation
- **Prompts:** (Suggested)
  - `password-policy-validator` - Check password requirements
  - `password-strength-checker` - Verify password validation
- **Patterns:**
  - `cognitive-verifier` - Verify password policy

---

### Category 3: Performance Guardrails (10)

#### 23. Prevent N+1 Query Problem

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Performance testing
  - `code-quality/keep-prs-under-control` - Easier to review query patterns
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but is inefficient
- **Prompts:** (Suggested)
  - `n-plus-one-detector` - Detect N+1 queries
  - `query-optimizer` - Optimize database queries
- **Patterns:**
  - `cognitive-verifier` - Verify query efficiency

---

#### 24. Prevent Missing Database Indexes

**Connections:**
- **Workflows:**
  - `ai-behavior/stop-schema-guessing` - Related (schema understanding)
  - `process/release-readiness-runbook` - Performance validation
- **Pain Points:**
  - `pain-point-20-schema-drift` - Schema issues
  - `pain-point-01-almost-correct-code` - Code works but is slow
- **Prompts:** (Suggested)
  - `index-analyzer` - Analyze missing indexes
  - `query-performance-checker` - Check query performance
- **Patterns:**
  - `precision-summary` - Ensure query optimization

---

#### 25. Prevent Inefficient Data Structure

**Connections:**
- **Workflows:**
  - `code-quality/keep-prs-under-control` - Code review catches this
  - `process/release-readiness-runbook` - Performance testing
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but inefficient
- **Prompts:** (Suggested)
  - `data-structure-optimizer` - Suggest better data structures
  - `algorithm-complexity-checker` - Check algorithm efficiency
- **Patterns:**
  - `cognitive-verifier` - Verify algorithmic choices

---

#### 26. Prevent Memory Leak in Event Handlers

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Memory testing
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works initially
- **Prompts:** (Suggested)
  - `memory-leak-detector` - Detect memory leaks
  - `event-handler-cleanup-checker` - Verify cleanup
- **Patterns:**
  - `cognitive-verifier` - Verify resource cleanup

---

#### 27. Prevent Synchronous Blocking Operations

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Performance testing
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but blocks
- **Prompts:** (Suggested)
  - `async-validator` - Check for blocking operations
  - `non-blocking-checker` - Verify async patterns
- **Patterns:**
  - `few-shot` - Examples of async patterns

---

#### 28. Prevent Inefficient Caching Strategy

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Performance validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but inefficient
- **Prompts:** (Suggested)
  - `cache-strategy-validator` - Check caching logic
  - `cache-invalidation-checker` - Verify cache invalidation
- **Patterns:**
  - `cognitive-verifier` - Verify caching strategy

---

#### 29. Prevent Missing Connection Pooling

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Performance/scalability testing
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but doesn't scale
- **Prompts:** (Suggested)
  - `connection-pool-validator` - Check connection pooling
  - `database-connection-checker` - Verify connection management
- **Patterns:**
  - `precision-summary` - Ensure connection efficiency

---

#### 30. Prevent Inefficient Pagination

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Performance testing
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but slow
- **Prompts:** (Suggested)
  - `pagination-optimizer` - Optimize pagination
  - `cursor-pagination-validator` - Check cursor-based pagination
- **Patterns:**
  - `cognitive-verifier` - Verify pagination strategy

---

#### 31. Prevent Unbounded Result Sets

**Connections:**
- **Workflows:**
  - `code-quality/keep-prs-under-control` - Code review catches this
  - `process/release-readiness-runbook` - Performance validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works with small data
- **Prompts:** (Suggested)
  - `result-set-limiter` - Check for limits
  - `pagination-enforcer` - Enforce pagination
- **Patterns:**
  - `constraint` - Enforce limits

---

#### 32. Prevent Missing Load Testing

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - **Direct connection** (includes load testing)
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works in dev but fails under load
- **Prompts:** (Suggested)
  - `load-test-generator` - Generate load tests
  - `performance-benchmark-checker` - Verify performance benchmarks
- **Patterns:**
  - `red-team` - Stress test scenarios

---

### Category 4: Availability Guardrails (10)

#### 33. Prevent Cascading Failure from Dependency

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Dependency validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but fragile
- **Prompts:** (Suggested)
  - `circuit-breaker-validator` - Check circuit breakers
  - `dependency-failure-handler` - Handle dependency failures
- **Patterns:**
  - `cognitive-verifier` - Verify resilience

---

#### 34. Prevent Infinite Loop from Logic Error

**Connections:**
- **Workflows:**
  - `code-quality/keep-prs-under-control` - Code review catches this
  - `process/release-readiness-runbook` - Logic validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code looks right but loops
- **Prompts:** (Suggested)
  - `infinite-loop-detector` - Detect infinite loops
  - `termination-checker` - Verify loop termination
- **Patterns:**
  - `cognitive-verifier` - Verify loop logic

---

#### 35. Prevent Deadlock in Concurrent Code

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Concurrency testing
  - `code-quality/keep-prs-under-control` - Code review
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works in isolation
- **Prompts:** (Suggested)
  - `deadlock-detector` - Detect deadlock risks
  - `lock-ordering-validator` - Verify lock ordering
- **Patterns:**
  - `red-team` - Concurrency stress tests

---

#### 36. Prevent Resource Exhaustion from Memory Leak

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Memory testing
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works initially
- **Prompts:** (Suggested)
  - `memory-leak-detector` - Detect memory leaks
  - `resource-cleanup-validator` - Verify cleanup
- **Patterns:**
  - `precision-summary` - Ensure resource management

---

#### 37. Prevent Missing Health Checks

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - **Direct connection** (health check validation)
- **Pain Points:**
  - `pain-point-22-missing-validations` - Missing health validation
- **Prompts:** (Suggested)
  - `health-check-generator` - Generate health checks
  - `health-endpoint-validator` - Verify health endpoints
- **Patterns:**
  - `structured-output` - For health check structure

---

#### 38. Prevent Improper Error Handling

**Connections:**
- **Workflows:**
  - `code-quality/keep-prs-under-control` - Code review
  - `code-quality/tdd-with-ai-pair` - Test error handling
  - `process/release-readiness-runbook` - Error handling validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but crashes on errors
  - `pain-point-22-missing-validations` - Missing error handling
- **Prompts:** (Existing/Suggested)
  - `error-handler-generator` - Generate error handling
  - `exception-safety-checker` - Verify exception handling
- **Patterns:**
  - `few-shot` - Examples of proper error handling
  - `cognitive-verifier` - Verify error paths

---

#### 39. Prevent Missing Timeout Configuration

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Timeout validation
- **Pain Points:**
  - `pain-point-22-missing-validations` - Missing timeout config
- **Prompts:** (Suggested)
  - `timeout-config-validator` - Check timeout settings
  - `hanging-request-detector` - Detect missing timeouts
- **Patterns:**
  - `cognitive-verifier` - Verify timeout logic

---

#### 40. Prevent Single Point of Failure

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - High availability validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but fragile
- **Prompts:** (Suggested)
  - `redundancy-checker` - Check for redundancy
  - `failover-validator` - Verify failover mechanisms
- **Patterns:**
  - `red-team` - Failure scenario thinking

---

#### 41. Prevent Missing Retry Logic

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Resilience validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code fails on transient errors
- **Prompts:** (Suggested)
  - `retry-logic-generator` - Generate retry logic
  - `resilience-checker` - Verify retry mechanisms
- **Patterns:**
  - `few-shot` - Examples of retry patterns

---

#### 42. Prevent Improper Shutdown Handling

**Connections:**
- **Workflows:**
  - `process/daily-merge-discipline` - Deployment processes
  - `process/release-readiness-runbook` - Deployment validation
- **Pain Points:**
  - `pain-point-22-missing-validations` - Missing shutdown handling
- **Prompts:** (Suggested)
  - `graceful-shutdown-validator` - Check shutdown handling
  - `deployment-safety-checker` - Verify deployment safety
- **Patterns:**
  - `cognitive-verifier` - Verify shutdown logic

---

### Category 5: Financial Guardrails (8)

#### 43. Prevent Incorrect Financial Calculation

**Connections:**
- **Workflows:**
  - `code-quality/keep-prs-under-control` - Critical code review
  - `process/release-readiness-runbook` - Financial validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code looks right but calculates wrong
- **Prompts:** (Suggested)
  - `financial-calculation-validator` - Verify financial logic
  - `money-handling-checker` - Check money calculations
- **Patterns:**
  - `precision-summary` - Ensure financial precision

---

#### 44. Prevent Currency Conversion Error

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Financial validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but wrong currency
- **Prompts:** (Suggested)
  - `currency-converter-validator` - Check currency conversion
  - `exchange-rate-checker` - Verify exchange rates
- **Patterns:**
  - `precision-summary` - Ensure currency accuracy

---

#### 45. Prevent Missing Validation for Business Rules

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Business rule validation
  - `code-quality/keep-prs-under-control` - Code review
- **Pain Points:**
  - `pain-point-22-missing-validations` - Direct connection
  - `pain-point-01-almost-correct-code` - Code works but violates rules
- **Prompts:** (Suggested)
  - `business-rule-validator` - Check business rules
  - `validation-enforcer` - Enforce validations
- **Patterns:**
  - `cognitive-verifier` - Verify rule compliance

---

#### 46. Prevent Double-Charging Customers

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Payment validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but duplicates charges
  - `pain-point-22-missing-validations` - Missing idempotency
- **Prompts:** (Suggested)
  - `idempotency-checker` - Verify idempotency
  - `payment-duplicate-detector` - Detect duplicate charges
- **Patterns:**
  - `cognitive-verifier` - Verify idempotent operations

---

#### 47. Prevent Incorrect Tax Calculation

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Financial validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code calculates wrong
- **Prompts:** (Suggested)
  - `tax-calculator-validator` - Check tax calculations
  - `compliance-checker` - Verify tax compliance
- **Patterns:**
  - `precision-summary` - Ensure tax accuracy

---

#### 48. Prevent Missing Idempotency Check

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Idempotency validation
- **Pain Points:**
  - `pain-point-22-missing-validations` - Direct connection
  - `pain-point-01-almost-correct-code` - Code works but not idempotent
- **Prompts:** (Suggested)
  - `idempotency-enforcer` - Enforce idempotency
  - `duplicate-operation-detector` - Detect duplicates
- **Patterns:**
  - `cognitive-verifier` - Verify idempotency

---

#### 49. Prevent Incorrect Discount Application

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Business logic validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code applies wrong discount
- **Prompts:** (Suggested)
  - `discount-validator` - Check discount logic
  - `promotion-rule-checker` - Verify promotion rules
- **Patterns:**
  - `cognitive-verifier` - Verify discount logic

---

#### 50. Prevent Missing Price Validation

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - Related (input validation)
  - `process/release-readiness-runbook` - Validation checks
- **Pain Points:**
  - `pain-point-22-missing-validations` - Direct connection
  - `pain-point-17-insecure-code` - Related (security issue)
- **Prompts:** (Suggested)
  - `price-validator` - Check price validation
  - `business-rule-enforcer` - Enforce price rules
- **Patterns:**
  - `cognitive-verifier` - Verify price validation

---

### Category 6: Integration Guardrails (10)

#### 51. Prevent Breaking API Changes

**Connections:**
- **Workflows:**
  - `ai-behavior/capability-grounding-manifest` - **Direct connection** (documents API contracts)
  - `process/release-readiness-runbook` - API compatibility checks
- **Pain Points:**
  - `pain-point-05-missing-context` - AI lacks API contract context
  - `pain-point-03-hallucinated-capabilities` - AI assumes wrong API
- **Prompts:** (Suggested)
  - `api-contract-validator` - Verify API contracts
  - `breaking-change-detector` - Detect breaking changes
- **Patterns:**
  - `capability-grounding` - Ground in API documentation

---

#### 52. Prevent Missing API Versioning

**Connections:**
- **Workflows:**
  - `ai-behavior/capability-grounding-manifest` - Related (API documentation)
- **Pain Points:**
  - `pain-point-05-missing-context` - AI lacks versioning context
- **Prompts:** (Suggested)
  - `api-versioning-validator` - Check API versioning
  - `backward-compatibility-checker` - Verify compatibility
- **Patterns:**
  - `structured-output` - For version management

---

#### 53. Prevent Incorrect API Error Handling

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - API validation
- **Pain Points:**
  - `pain-point-22-missing-validations` - Missing error handling
- **Prompts:** (Suggested)
  - `api-error-handler-validator` - Check error handling
  - `http-status-checker` - Verify status codes
- **Patterns:**
  - `few-shot` - Examples of proper error handling

---

#### 54. Prevent Missing Request Validation

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection** (input validation)
  - `process/release-readiness-runbook` - Validation checks
- **Pain Points:**
  - `pain-point-22-missing-validations` - Direct connection
  - `pain-point-17-insecure-code` - Related (security)
- **Prompts:** (Suggested)
  - `request-validator` - Validate API requests
  - `input-sanitizer` - Sanitize inputs
- **Patterns:**
  - `cognitive-verifier` - Verify validation

---

#### 55. Prevent Rate Limit Exceeded

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - Related (rate limiting)
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but hits limits
- **Prompts:** (Suggested)
  - `rate-limit-manager` - Manage rate limits
  - `quota-checker` - Check quotas
- **Patterns:**
  - `cognitive-verifier` - Verify rate limit handling

---

#### 56. Prevent Missing Authentication Headers

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `security/identity-first-privilege-design` - Related (auth)
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-22-missing-validations` - Missing auth
- **Prompts:** (Suggested)
  - `auth-header-validator` - Check auth headers
  - `api-authentication-checker` - Verify authentication
- **Patterns:**
  - `cognitive-verifier` - Verify auth

---

#### 57. Prevent Incorrect Content-Type Headers

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - API validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but wrong headers
- **Prompts:** (Suggested)
  - `content-type-validator` - Check content types
  - `http-header-checker` - Verify headers
- **Patterns:**
  - `structured-output` - For header validation

---

#### 58. Prevent Missing Pagination in API Client

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - API validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but incomplete
- **Prompts:** (Suggested)
  - `pagination-enforcer` - Enforce pagination
  - `api-client-validator` - Check API clients
- **Patterns:**
  - `cognitive-verifier` - Verify pagination

---

#### 59. Prevent Incorrect Timeout Values

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - API validation
- **Pain Points:**
  - `pain-point-22-missing-validations` - Missing timeout config
- **Prompts:** (Suggested)
  - `timeout-validator` - Check timeout values
  - `api-timeout-checker` - Verify timeouts
- **Patterns:**
  - `cognitive-verifier` - Verify timeout logic

---

#### 60. Prevent Missing Retry Logic for API Calls

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - API resilience
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code fails on transient errors
- **Prompts:** (Suggested)
  - `retry-logic-generator` - Generate retry logic
  - `api-resilience-checker` - Verify resilience
- **Patterns:**
  - `few-shot` - Examples of retry patterns

---

### Category 7: Testing Guardrails (10)

#### 61. Prevent Missing Edge Case Testing

**Connections:**
- **Workflows:**
  - `code-quality/tdd-with-ai-pair` - **Direct connection** (TDD workflow)
  - `process/release-readiness-runbook` - Test coverage validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Direct connection (edge cases)
  - `pain-point-22-missing-validations` - Missing test validation
- **Prompts:** (Suggested)
  - `edge-case-test-generator` - Generate edge case tests
  - `test-coverage-analyzer` - Analyze test coverage
- **Patterns:**
  - `red-team` - Think of edge cases
  - `cognitive-verifier` - Verify test completeness

---

#### 62. Prevent Insufficient Test Coverage

**Connections:**
- **Workflows:**
  - `code-quality/tdd-with-ai-pair` - **Direct connection**
  - `process/release-readiness-runbook` - Coverage validation
  - `code-quality/keep-prs-under-control` - Code review
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Related
  - `pain-point-22-missing-validations` - Missing tests
- **Prompts:** (Suggested)
  - `test-coverage-checker` - Check test coverage
  - `test-gap-analyzer` - Find test gaps
- **Patterns:**
  - `cognitive-verifier` - Verify coverage

---

#### 63. Prevent Flaky Tests from Timing Issues

**Connections:**
- **Workflows:**
  - `process/daily-merge-discipline` - CI/CD processes
  - `process/release-readiness-runbook` - Test reliability
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Tests work but flaky
- **Prompts:** (Suggested)
  - `flaky-test-detector` - Detect flaky tests
  - `test-reliability-checker` - Verify test stability
- **Patterns:**
  - `precision-summary` - Ensure test reliability

---

#### 64. Prevent Missing Integration Tests

**Connections:**
- **Workflows:**
  - `code-quality/tdd-with-ai-pair` - Related (test strategy)
  - `process/release-readiness-runbook` - Integration test validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Unit tests pass but integration fails
- **Prompts:** (Suggested)
  - `integration-test-generator` - Generate integration tests
  - `test-strategy-validator` - Verify test strategy
- **Patterns:**
  - `cognitive-verifier` - Verify test strategy

---

#### 65. Prevent Test Data Pollution

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Test isolation validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Tests work individually but fail together
- **Prompts:** (Suggested)
  - `test-isolation-checker` - Verify test isolation
  - `test-data-cleanup-validator` - Check cleanup
- **Patterns:**
  - `cognitive-verifier` - Verify test isolation

---

#### 66. Prevent Missing Negative Test Cases

**Connections:**
- **Workflows:**
  - `code-quality/tdd-with-ai-pair` - **Direct connection** (test strategy)
  - `process/release-readiness-runbook` - Test completeness
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Only happy path tested
  - `pain-point-22-missing-validations` - Missing error tests
- **Prompts:** (Suggested)
  - `negative-test-generator` - Generate negative tests
  - `error-case-checker` - Check error handling tests
- **Patterns:**
  - `red-team` - Think of failure scenarios

---

#### 67. Prevent Incorrect Test Assertions

**Connections:**
- **Workflows:**
  - `code-quality/tdd-with-ai-pair` - Related (test quality)
  - `code-quality/keep-prs-under-control` - Code review
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Tests pass but don't verify correctly
- **Prompts:** (Suggested)
  - `test-assertion-validator` - Verify assertions
  - `test-quality-checker` - Check test quality
- **Patterns:**
  - `cognitive-verifier` - Verify test correctness

---

#### 68. Prevent Missing Performance Tests

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - **Direct connection** (performance validation)
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works but slow
- **Prompts:** (Suggested)
  - `performance-test-generator` - Generate performance tests
  - `load-test-creator` - Create load tests
- **Patterns:**
  - `red-team` - Stress test scenarios

---

#### 69. Prevent Test Environment Mismatch

**Connections:**
- **Workflows:**
  - `process/release-readiness-runbook` - Environment parity validation
- **Pain Points:**
  - `pain-point-01-almost-correct-code` - Code works in test but fails in prod
- **Prompts:** (Suggested)
  - `environment-parity-checker` - Verify environment parity
  - `config-validator` - Check configuration
- **Patterns:**
  - `precision-summary` - Ensure environment consistency

---

#### 70. Prevent Missing Security Tests

**Connections:**
- **Workflows:**
  - `security/security-guardrails` - **Direct connection**
  - `process/release-readiness-runbook` - Security testing
- **Pain Points:**
  - `pain-point-17-insecure-code` - Direct connection
  - `pain-point-22-missing-validations` - Missing security validation
- **Prompts:** (Suggested)
  - `security-test-generator` - Generate security tests
  - `vulnerability-test-creator` - Create vulnerability tests
- **Patterns:**
  - `red-team` - Security attack scenarios

---

## Summary: Connection Types

### Direct Connections (Strong Links)
1. **Security Guardrails (#11-22)** ↔ `security/security-guardrails` workflow
2. **Missing Load Testing (#32)** ↔ `process/release-readiness-runbook`
3. **Missing Health Checks (#37)** ↔ `process/release-readiness-runbook`
4. **Missing Edge Case Testing (#61)** ↔ `code-quality/tdd-with-ai-pair`
5. **Missing Security Tests (#70)** ↔ `security/security-guardrails`
6. **Breaking API Changes (#51)** ↔ `ai-behavior/capability-grounding-manifest`
7. **Data Corruption (#1)** ↔ `ai-behavior/stop-schema-guessing`
8. **Exposed Sensitive Data (#18)** ↔ `risk-management/catch-mock-metrics`

### Pattern Connections (Common Patterns)
- **Red-Team Pattern** - Used for security guardrails (#11-22, #70), attack scenarios
- **Cognitive Verifier** - Used for validation guardrails (#1-10, #22, #61-62)
- **Structured Output** - Used for validation/contract guardrails (#7, #51-52)
- **Few-Shot** - Used for examples of correct patterns (#2, #8, #27, #38, #41, #60)
- **Precision Summary** - Used for accuracy-critical guardrails (#18, #28, #43-44)

### Pain Point Connections (Most Common)
- **`pain-point-01-almost-correct-code`** - Connects to 40+ guardrails (most common)
- **`pain-point-17-insecure-code`** - Connects to all security guardrails (#11-22, #70)
- **`pain-point-22-missing-validations`** - Connects to 20+ guardrails
- **`pain-point-20-schema-drift`** - Connects to data integrity guardrails (#1, #4-7, #24)
- **`pain-point-05-missing-context`** - Connects to API/integration guardrails (#7, #51-52)
- **`pain-point-03-hallucinated-capabilities`** - Connects to schema/API guardrails

---

## Cross-Reference Summary

**Workflows with Most Guardrail Connections:**
1. `process/release-readiness-runbook` - Connects to 50+ guardrails (comprehensive validation)
2. `security/security-guardrails` - Connects to all security guardrails (#11-22, #70)
3. `ai-behavior/stop-schema-guessing` - Connects to data integrity guardrails (#1, #4-7, #24)
4. `code-quality/tdd-with-ai-pair` - Connects to testing guardrails (#61-62, #64, #66)
5. `code-quality/keep-prs-under-control` - Connects to code review-related guardrails
6. `ai-behavior/capability-grounding-manifest` - Connects to API guardrails (#51-52)

**Pain Points with Most Guardrail Connections:**
1. `pain-point-01-almost-correct-code` - 40+ guardrails
2. `pain-point-22-missing-validations` - 20+ guardrails
3. `pain-point-17-insecure-code` - 13 guardrails (all security)
4. `pain-point-20-schema-drift` - 7 guardrails (data integrity)
5. `pain-point-05-missing-context` - 5 guardrails (API/integration)

---

## Implementation Notes

When creating guardrail entries, ensure:
1. ✅ **Link to existing workflows** where applicable
2. ✅ **Link to related pain points** that this guardrail addresses
3. ✅ **Suggest prompts** that help prevent the incident
4. ✅ **Reference patterns** that can be applied
5. ✅ **Link to related guardrails** in the same category

This creates a comprehensive content graph where users can discover:
- Pain Point → Guardrails that prevent it → Workflows that implement guardrails → Prompts that help
