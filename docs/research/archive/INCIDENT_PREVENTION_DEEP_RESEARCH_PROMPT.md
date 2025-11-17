# Deep Research Prompt: Incident Prevention Patterns
## Solutions, Preventions, and Mitigations for AI-Generated Code Incidents

## Context

Engify.ai is building a comprehensive **Incident Prevention Patterns** content library that helps engineering teams embrace AI confidently by providing proven prevention strategies, detection methods, and mitigation workflows.

**Philosophy:** AI is powerful, but it needs guardrails. We help teams adopt AI with confidence by providing proven prevention strategies, not fearmongering.

**Target Audience:** Engineering leaders, senior engineers, architects, DevOps teams, and security engineers who need to prevent production incidents in AI-assisted development.

---

## Your Task

For each of the **70 AI Incident Patterns** below, generate comprehensive research that includes:

1. **Prevention Strategies** (Primary Focus) ⭐
   - 3-5 specific prevention strategies with actionable steps
   - Link to existing workflows where applicable
   - Include prompts that could prevent this incident
   - Effectiveness estimates (e.g., "Prevents 95% of cases")

2. **Early Detection Methods**
   - Automated checks (pre-commit, CI/CD, static analysis, runtime monitoring)
   - Code review checkpoints
   - Monitoring metrics to watch
   - Link to existing guardrails/workflows

3. **Mitigation & Response Procedures**
   - Immediate actions if incident occurs
   - Recovery procedures
   - Post-incident prevention improvements
   - Link to incident response workflows

4. **Match to Existing Workflows**
   - Review the existing workflows list (provided below)
   - Identify which workflows directly prevent or address each incident
   - Suggest new workflow ideas if gaps exist
   - Link to prompts, patterns, and guardrails

---

## Existing Workflows & Guardrails

Review these existing workflows and identify how they relate to each incident pattern:

### Workflow Categories:

**code-quality:**
- `keep-prs-under-control` - Prevents oversized PRs that hide bugs
- `professional-commit-standards` - Enforces commit quality and review standards

**ai-behavior:**
- `stop-schema-guessing` - Prevents schema hallucinations and drift
- `cursor-obedience-kit` - Prevents agents from bypassing guardrails
- `capability-grounding-manifest` - Documents system capabilities and prevents hallucinations

**risk-management:**
- `catch-mock-metrics` - Prevents fake metrics and placeholder data

**memory:**
- `memory-and-trend-logging` - Prevents repeated incidents through memory

**security:**
- `security-guardrails` - Prevents security vulnerabilities in AI-generated code
- `identity-first-privilege-design` - Prevents overprivileged agents
- `prompt-injection-defense` - Prevents prompt injection attacks

**governance:**
- `ai-governance-scorecard` - Tracks AI adoption and compliance
- `platform-consolidation-playbook` - Prevents toolchain sprawl

**process:**
- `daily-merge-discipline` - Prevents merge conflicts and code conflicts
- `task-decomposition-prompt-flow` - Prevents scope creep and plan derailment
- `release-readiness-runbook` - Prevents production incidents through validation
- `prevent-duplicate-tooling` - Prevents duplicate code and scripts

**communication:**
- `communication-hygiene-guardrail` - Prevents poor commit messages and documentation

**code-quality:**
- `enforce-quality-gate-hierarchy` - Prevents bypassing quality gates
- `architecture-intent-validation` - Prevents architectural drift

---

## 70 AI Incident Patterns

### Category 1: Data Integrity & Corruption (10 patterns)

#### 1. Data Corruption from AI Migration Script
**Severity:** Critical  
**Pattern:** AI-generated migration script corrupts production data due to missing validation or wrong assumptions.

**Real-World Scenario:**
- AI generates migration to change user status from enum to string
- Script assumes all existing values are valid, but legacy data has null values
- Migration runs successfully but corrupts 500K user records
- Result: Production outage, data recovery from backups, 4-hour incident

**Keywords:** "ai migration data corruption", "database migration failure", "data loss ai code"

**Match to Workflows:** `stop-schema-guessing`, `release-readiness-runbook`

---

#### 2. Type Coercion Error in Batch Processing
**Severity:** High  
**Pattern:** AI-generated batch processing code fails to handle data type mismatches, corrupting financial calculations.

**Real-World Scenario:**
- AI generates invoice calculation code that assumes numeric strings
- Legacy system returns mixed types (numbers, strings, nulls)
- Type coercion fails silently, producing incorrect invoice totals
- Result: $50K in incorrect invoices sent to customers

**Keywords:** "type coercion errors", "batch processing failures", "ai-generated data corruption"

**Match to Workflows:** `stop-schema-guessing`, `release-readiness-runbook`

---

#### 3. Race Condition in Concurrent Updates
**Severity:** Critical  
**Pattern:** AI generates code without proper locking, causing lost updates in concurrent transactions.

**Real-World Scenario:**
- AI generates inventory deduction code without database locks
- Two concurrent requests process same order, deducting inventory twice
- Result: Negative inventory counts, orders fulfilled without stock

**Keywords:** "race condition ai code", "concurrent update failures", "lost update problem"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

#### 4. Silent Data Truncation
**Severity:** High  
**Pattern:** AI-generated code truncates data without warnings, losing critical information.

**Real-World Scenario:**
- AI generates API code that limits description field to 255 characters
- Existing database has descriptions up to 2000 characters
- Code silently truncates without logging or error
- Result: Customer support tickets missing critical context

**Keywords:** "data truncation", "silent failures", "information loss ai code"

**Match to Workflows:** `stop-schema-guessing`, `release-readiness-runbook`

---

#### 5. Orphaned Records from Cascading Delete
**Severity:** Medium  
**Pattern:** AI-generated deletion logic doesn't handle foreign key relationships correctly.

**Real-World Scenario:**
- AI generates user deletion code that removes user but not related orders
- Cascading delete misconfigured, creating orphaned records
- Result: Analytics broken, reporting queries fail, data integrity violations

**Keywords:** "orphaned records", "foreign key violations", "cascade delete errors"

**Match to Workflows:** `stop-schema-guessing`, `release-readiness-runbook`

---

#### 6. Duplicate Data from Missing Unique Constraints
**Severity:** Medium  
**Pattern:** AI-generated code creates duplicate records due to missing unique constraints.

**Real-World Scenario:**
- AI generates user registration code without checking for existing emails
- Concurrent signups create duplicate accounts
- Result: Users unable to log in, support tickets spike

**Keywords:** "duplicate data", "unique constraint violations", "race condition signup"

**Match to Workflows:** `stop-schema-guessing`, `daily-merge-discipline`

---

#### 7. Data Type Mismatch in API Integration
**Severity:** High  
**Pattern:** AI-generated API integration code assumes wrong data types, causing silent failures.

**Real-World Scenario:**
- AI generates code to integrate with payment processor
- API returns strings for amounts, but code expects numbers
- Type conversion fails, payments silently rejected
- Result: Failed transactions, customer complaints, revenue loss

**Keywords:** "api integration failures", "type mismatch errors", "payment processing bugs"

**Match to Workflows:** `stop-schema-guessing`, `capability-grounding-manifest`, `release-readiness-runbook`

---

#### 8. Incorrect Timezone Handling
**Severity:** Medium  
**Pattern:** AI-generated code mishandles timezones, causing incorrect date/time calculations.

**Real-World Scenario:**
- AI generates scheduling code that stores UTC but displays in local time
- Daylight saving time transition causes double-bookings
- Result: Customer appointments scheduled incorrectly, refund requests

**Keywords:** "timezone bugs", "datetime handling errors", "dst problems"

**Match to Workflows:** `release-readiness-runbook`

---

#### 9. Buffer Overflow in Data Processing
**Severity:** Critical  
**Pattern:** AI-generated code processes large datasets without memory limits, causing crashes.

**Real-World Scenario:**
- AI generates report generation code that loads entire dataset into memory
- Large customer export (500K records) crashes server
- Result: Production outage, OOM errors, service unavailable

**Keywords:** "memory overflow", "buffer overflow", "out of memory errors"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

#### 10. Data Loss from Incomplete Transactions
**Severity:** Critical  
**Pattern:** AI-generated code commits partial transactions, losing data consistency.

**Real-World Scenario:**
- AI generates order processing code that commits order before inventory deduction
- Transaction fails midway, order created but inventory not deducted
- Result: Overselling inventory, fulfillment failures, refunds

**Keywords:** "transaction failures", "data consistency", "partial commit errors"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

### Category 2: Security Breaches & Vulnerabilities (12 patterns)

#### 11. Hardcoded Secrets in Generated Code
**Severity:** Critical  
**Pattern:** AI generates code with hardcoded API keys, passwords, or tokens.

**Real-World Scenario:**
- AI generates deployment script with AWS credentials hardcoded
- Code committed to public GitHub repository
- Result: Credentials exposed, unauthorized access, AWS bill spike ($10K)

**Keywords:** "hardcoded secrets", "api key exposure", "security vulnerability ai code"

**Match to Workflows:** `security/security-guardrails`, `prevent-duplicate-tooling`

---

#### 12. SQL Injection Vulnerability
**Severity:** Critical  
**Pattern:** AI-generated code uses string concatenation instead of parameterized queries.

**Real-World Scenario:**
- AI generates user search code that concatenates input into SQL query
- Attacker injects malicious SQL, extracts entire user database
- Result: PII breach, GDPR violation, security incident, legal liability

**Keywords:** "sql injection", "security vulnerability", "database attack"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

#### 13. IDOR (Insecure Direct Object Reference)
**Severity:** Critical  
**Pattern:** AI-generated API endpoints don't verify user authorization, allowing access to other users' data.

**Real-World Scenario:**
- AI generates order retrieval endpoint that accepts any order ID
- No authorization check to verify order belongs to requesting user
- Result: Users can access other users' orders, PII exposure, privacy violation

**Keywords:** "idor vulnerability", "authorization bypass", "access control failure"

**Match to Workflows:** `security/security-guardrails`, `identity-first-privilege-design`

---

#### 14. XSS (Cross-Site Scripting)
**Severity:** High  
**Pattern:** AI-generated code renders user input without sanitization, allowing script injection.

**Real-World Scenario:**
- AI generates comment system that displays user comments without escaping
- Attacker injects malicious script, steals session cookies
- Result: Account hijacking, session theft, user data compromise

**Keywords:** "xss vulnerability", "cross-site scripting", "input sanitization"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

#### 15. CSRF (Cross-Site Request Forgery)
**Severity:** High  
**Pattern:** AI-generated forms lack CSRF tokens, allowing unauthorized actions.

**Real-World Scenario:**
- AI generates password reset form without CSRF protection
- Attacker crafts malicious link that resets user passwords
- Result: Account takeovers, unauthorized access

**Keywords:** "csrf vulnerability", "cross-site request forgery", "token validation"

**Match to Workflows:** `security/security-guardrails`

---

#### 16. Insecure File Upload
**Severity:** Critical  
**Pattern:** AI-generated file upload code doesn't validate file types or scan for malware.

**Real-World Scenario:**
- AI generates file upload endpoint that accepts any file type
- Attacker uploads PHP shell script, gains server access
- Result: Server compromise, data exfiltration, ransomware attack

**Keywords:** "file upload vulnerability", "remote code execution", "malware upload"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

#### 17. Missing Rate Limiting
**Severity:** Medium  
**Pattern:** AI-generated API endpoints lack rate limiting, enabling brute force attacks.

**Real-World Scenario:**
- AI generates login endpoint without rate limiting
- Attacker brute forces passwords, gains admin access
- Result: Account compromise, unauthorized access, data breach

**Keywords:** "rate limiting", "brute force attack", "api security"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

#### 18. Exposed Sensitive Data in Logs
**Severity:** High  
**Pattern:** AI-generated logging code includes sensitive information in logs.

**Real-World Scenario:**
- AI generates error logging that includes full request body
- Request body contains credit card numbers, logged in plain text
- Result: PCI DSS violation, compliance breach, financial penalties

**Keywords:** "data leakage", "log exposure", "pii in logs"

**Match to Workflows:** `security/security-guardrails`, `catch-mock-metrics`

---

#### 19. Insecure Session Management
**Severity:** High  
**Pattern:** AI-generated code uses weak session tokens or doesn't expire sessions.

**Real-World Scenario:**
- AI generates session code with predictable tokens
- Attacker guesses session IDs, hijacks user sessions
- Result: Unauthorized access, account takeover, data theft

**Keywords:** "session hijacking", "weak session tokens", "session management"

**Match to Workflows:** `security/security-guardrails`

---

#### 20. Path Traversal Vulnerability
**Severity:** Critical  
**Pattern:** AI-generated file access code doesn't validate file paths, allowing directory traversal.

**Real-World Scenario:**
- AI generates file download endpoint that accepts relative paths
- Attacker requests `../../../etc/passwd`, accesses system files
- Result: Sensitive file exposure, server compromise

**Keywords:** "path traversal", "directory traversal", "file access vulnerability"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

#### 21. Missing HTTPS Enforcement
**Severity:** High  
**Pattern:** AI-generated code allows HTTP connections, exposing data in transit.

**Real-World Scenario:**
- AI generates API that accepts both HTTP and HTTPS
- User sends sensitive data over HTTP, intercepted by attacker
- Result: Data breach, man-in-the-middle attack, compliance violation

**Keywords:** "http security", "tls enforcement", "data in transit"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

#### 22. Weak Password Validation
**Severity:** Medium  
**Pattern:** AI-generated password validation code doesn't enforce strong password requirements.

**Real-World Scenario:**
- AI generates registration code with weak password requirements (4 characters)
- Users create weak passwords, easily brute forced
- Result: Account compromises, security incidents

**Keywords:** "weak passwords", "password validation", "security policy"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

### Category 3: Performance & Scalability (10 patterns)

#### 23. N+1 Query Problem
**Severity:** High  
**Pattern:** AI-generated code executes database queries in loops instead of using batch queries.

**Real-World Scenario:**
- AI generates code that fetches users, then loops to fetch orders for each user
- 1000 users = 1001 queries instead of 2 queries
- Result: Database overload, 30-second page loads, timeouts

**Keywords:** "n+1 query problem", "database performance", "query optimization"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

#### 24. Missing Database Indexes
**Severity:** Medium  
**Pattern:** AI-generated code queries unindexed columns, causing slow queries.

**Real-World Scenario:**
- AI generates search code that queries email column without index
- Production database with 10M users, query takes 5 minutes
- Result: Timeouts, poor user experience, database CPU spike

**Keywords:** "missing indexes", "slow queries", "database performance"

**Match to Workflows:** `stop-schema-guessing`, `release-readiness-runbook`

---

#### 25. Inefficient Data Structure
**Severity:** Medium  
**Pattern:** AI-generated code uses wrong data structure for the use case.

**Real-World Scenario:**
- AI generates code that uses array for 1M item lookups
- O(n) lookups instead of O(1) with hash map
- Result: 10-second response times, poor scalability

**Keywords:** "algorithm efficiency", "data structure selection", "performance optimization"

**Match to Workflows:** `code-quality/keep-prs-under-control`, `release-readiness-runbook`

---

#### 26. Memory Leak in Event Handlers
**Severity:** High  
**Pattern:** AI-generated code doesn't clean up event listeners, causing memory leaks.

**Real-World Scenario:**
- AI generates single-page app that adds event listeners without removing
- Each page navigation adds new listeners, memory grows unbounded
- Result: Browser crashes after 30 minutes, poor user experience

**Keywords:** "memory leaks", "event handler cleanup", "resource management"

**Match to Workflows:** `release-readiness-runbook`

---

#### 27. Synchronous Blocking Operations
**Severity:** Medium  
**Pattern:** AI-generated code performs blocking I/O operations synchronously.

**Real-World Scenario:**
- AI generates API that reads files synchronously
- Each request blocks thread, server can't handle concurrent requests
- Result: Server becomes unresponsive under load, timeouts

**Keywords:** "blocking operations", "async programming", "thread blocking"

**Match to Workflows:** `release-readiness-runbook`

---

#### 28. Inefficient Caching Strategy
**Severity:** Medium  
**Pattern:** AI-generated code caches everything or nothing, causing performance issues.

**Real-World Scenario:**
- AI generates code that caches all database queries indefinitely
- Stale data served to users, cache never invalidated
- Result: Users see outdated information, data inconsistency

**Keywords:** "caching strategy", "cache invalidation", "performance optimization"

**Match to Workflows:** `release-readiness-runbook`

---

#### 29. Missing Connection Pooling
**Severity:** High  
**Pattern:** AI-generated code creates new database connections for each request.

**Real-World Scenario:**
- AI generates code that opens new DB connection per request
- Under load, exhausts database connection pool
- Result: New requests fail, service unavailable, cascading failures

**Keywords:** "connection pooling", "database connections", "resource exhaustion"

**Match to Workflows:** `release-readiness-runbook`

---

#### 30. Inefficient Pagination
**Severity:** Medium  
**Pattern:** AI-generated code uses offset-based pagination instead of cursor-based.

**Real-World Scenario:**
- AI generates pagination that uses OFFSET 10000 LIMIT 10
- Database scans 10000 rows for each page request
- Result: Slow pagination, poor user experience, database load

**Keywords:** "pagination performance", "offset pagination", "cursor pagination"

**Match to Workflows:** `release-readiness-runbook`

---

#### 31. Unbounded Result Sets
**Severity:** Medium  
**Pattern:** AI-generated code returns all results without limits.

**Real-World Scenario:**
- AI generates API endpoint that returns all users without pagination
- 1M users returned in single response, 500MB payload
- Result: Network timeout, memory exhaustion, API crashes

**Keywords:** "unbounded queries", "result set limits", "pagination"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

#### 32. Missing Load Testing
**Severity:** Medium  
**Pattern:** AI-generated code works fine in development but fails under production load.

**Real-World Scenario:**
- AI generates feature that works perfectly with 10 test users
- Production has 100K concurrent users, code doesn't scale
- Result: Service degradation, outages, user complaints

**Keywords:** "load testing", "scalability", "production performance"

**Match to Workflows:** `release-readiness-runbook`

---

### Category 4: Availability & Outages (10 patterns)

#### 33. Cascading Failure from Dependency
**Severity:** Critical  
**Pattern:** AI-generated code doesn't handle dependency failures gracefully.

**Real-World Scenario:**
- AI generates code that calls external API without timeout or fallback
- External API goes down, internal service hangs indefinitely
- Result: Service outage, cascading failures across system

**Keywords:** "cascading failures", "dependency failures", "circuit breakers"

**Match to Workflows:** `release-readiness-runbook`

---

#### 34. Infinite Loop from Logic Error
**Severity:** Critical  
**Pattern:** AI-generated code has infinite loop due to incorrect termination condition.

**Real-World Scenario:**
- AI generates retry logic with wrong condition, retries forever
- Service consumes 100% CPU, becomes unresponsive
- Result: Complete service outage, requires manual intervention

**Keywords:** "infinite loops", "logic errors", "cpu exhaustion"

**Match to Workflows:** `code-quality/keep-prs-under-control`, `release-readiness-runbook`

---

#### 35. Deadlock in Concurrent Code
**Severity:** High  
**Pattern:** AI-generated code acquires locks in wrong order, causing deadlocks.

**Real-World Scenario:**
- AI generates code that locks resources A then B in one place, B then A in another
- Concurrent requests deadlock, all requests hang
- Result: Service freeze, requires restart, data corruption risk

**Keywords:** "deadlocks", "concurrent programming", "lock ordering"

**Match to Workflows:** `code-quality/keep-prs-under-control`, `release-readiness-runbook`

---

#### 36. Resource Exhaustion from Memory Leak
**Severity:** Critical  
**Pattern:** AI-generated code leaks memory over time, eventually exhausting system memory.

**Real-World Scenario:**
- AI generates code that adds items to array without cleanup
- Memory usage grows linearly with uptime, server crashes after 24 hours
- Result: Periodic outages, requires daily restarts

**Keywords:** "memory leaks", "resource exhaustion", "memory management"

**Match to Workflows:** `release-readiness-runbook`

---

#### 37. Missing Health Checks
**Severity:** Medium  
**Pattern:** AI-generated service doesn't expose health check endpoint.

**Real-World Scenario:**
- AI generates service without health check
- Load balancer can't detect unhealthy instances, routes traffic to dead servers
- Result: Intermittent failures, poor user experience, difficult debugging

**Keywords:** "health checks", "service monitoring", "load balancer"

**Match to Workflows:** `release-readiness-runbook`

---

#### 38. Improper Error Handling
**Severity:** High  
**Pattern:** AI-generated code crashes on unexpected errors instead of handling gracefully.

**Real-World Scenario:**
- AI generates code that crashes on null pointer exception
- Single bad request crashes entire service
- Result: Service outage, requires restart, data loss risk

**Keywords:** "error handling", "exception handling", "graceful degradation"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

#### 39. Missing Timeout Configuration
**Severity:** High  
**Pattern:** AI-generated code doesn't set timeouts, causing requests to hang indefinitely.

**Real-World Scenario:**
- AI generates API call without timeout
- External service hangs, internal service waits forever
- Result: Thread pool exhaustion, service unavailable

**Keywords:** "timeout configuration", "hanging requests", "resource management"

**Match to Workflows:** `release-readiness-runbook`

---

#### 40. Single Point of Failure
**Severity:** High  
**Pattern:** AI-generated code depends on single resource without redundancy.

**Real-World Scenario:**
- AI generates code that connects to single database instance
- Database fails, entire service unavailable
- Result: Complete outage, no failover, long recovery time

**Keywords:** "single point of failure", "high availability", "redundancy"

**Match to Workflows:** `release-readiness-runbook`

---

#### 41. Missing Retry Logic
**Severity:** Medium  
**Pattern:** AI-generated code doesn't retry transient failures.

**Real-World Scenario:**
- AI generates code that fails on first network hiccup
- Temporary network issues cause unnecessary failures
- Result: Intermittent outages, poor reliability, user complaints

**Keywords:** "retry logic", "transient failures", "resilience"

**Match to Workflows:** `release-readiness-runbook`

---

#### 42. Improper Shutdown Handling
**Severity:** Medium  
**Pattern:** AI-generated code doesn't handle graceful shutdown, drops in-flight requests.

**Real-World Scenario:**
- AI generates service that terminates immediately on shutdown signal
- In-flight requests lost during deployment
- Result: Data loss, user complaints, inconsistent state

**Keywords:** "graceful shutdown", "deployment", "request handling"

**Match to Workflows:** `release-readiness-runbook`, `daily-merge-discipline`

---

### Category 5: Business Logic & Financial (8 patterns)

#### 43. Incorrect Financial Calculation
**Severity:** Critical  
**Pattern:** AI-generated code has incorrect business logic for financial calculations.

**Real-World Scenario:**
- AI generates discount calculation that applies discount twice
- Customers charged incorrectly, company loses revenue
- Result: $100K in incorrect charges, refunds, financial loss

**Keywords:** "financial calculation errors", "pricing bugs", "revenue impact"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

#### 44. Currency Conversion Error
**Severity:** Critical  
**Pattern:** AI-generated code mishandles currency conversion.

**Real-World Scenario:**
- AI generates code that converts USD to EUR using wrong exchange rate
- Orders priced incorrectly, company loses money on international sales
- Result: Financial loss, customer complaints, refund requests

**Keywords:** "currency conversion", "international payments", "financial errors"

**Match to Workflows:** `release-readiness-runbook`

---

#### 45. Missing Validation for Business Rules
**Severity:** High  
**Pattern:** AI-generated code doesn't validate against business rules.

**Real-World Scenario:**
- AI generates order processing code that doesn't check inventory limits
- System allows orders beyond available inventory
- Result: Overselling, fulfillment failures, refunds, customer complaints

**Keywords:** "business rule validation", "inventory management", "order processing"

**Match to Workflows:** `release-readiness-runbook`

---

#### 46. Double-Charging Customers
**Severity:** Critical  
**Pattern:** AI-generated payment code processes payments multiple times.

**Real-World Scenario:**
- AI generates retry logic that doesn't check if payment already processed
- Network hiccup causes payment to be charged twice
- Result: Customer complaints, chargebacks, financial reconciliation issues

**Keywords:** "double charging", "payment processing", "idempotency"

**Match to Workflows:** `release-readiness-runbook`

---

#### 47. Incorrect Tax Calculation
**Severity:** High  
**Pattern:** AI-generated code calculates taxes incorrectly.

**Real-World Scenario:**
- AI generates code that applies tax to already-taxed amount
- Customers overcharged, company at risk of tax audit
- Result: Refunds, compliance issues, legal liability

**Keywords:** "tax calculation", "compliance", "financial accuracy"

**Match to Workflows:** `release-readiness-runbook`

---

#### 48. Missing Idempotency Check
**Severity:** High  
**Pattern:** AI-generated code doesn't check for duplicate operations.

**Real-World Scenario:**
- AI generates order creation code without idempotency check
- Network retry creates duplicate orders
- Result: Double fulfillment, inventory issues, customer confusion

**Keywords:** "idempotency", "duplicate prevention", "retry logic"

**Match to Workflows:** `release-readiness-runbook`

---

#### 49. Incorrect Discount Application
**Severity:** Medium  
**Pattern:** AI-generated code applies discounts incorrectly.

**Real-World Scenario:**
- AI generates code that stacks discounts when not allowed
- Customer gets 90% off instead of 10%, company loses revenue
- Result: Revenue loss, pricing inconsistency, customer complaints

**Keywords:** "discount logic", "pricing rules", "promotion handling"

**Match to Workflows:** `release-readiness-runbook`

---

#### 50. Missing Price Validation
**Severity:** High  
**Pattern:** AI-generated code doesn't validate price changes against business rules.

**Real-World Scenario:**
- AI generates code that allows negative prices
- Bug exploited, customers get paid to buy products
- Result: Financial loss, exploitation, requires emergency fix

**Keywords:** "price validation", "business rules", "financial security"

**Match to Workflows:** `release-readiness-runbook`, `security/security-guardrails`

---

### Category 6: Integration & API Failures (10 patterns)

#### 51. Breaking API Changes
**Severity:** High  
**Pattern:** AI-generated code makes breaking changes to API contract.

**Real-World Scenario:**
- AI refactors API endpoint, changes response structure
- Mobile apps break, users unable to use app
- Result: Service degradation, user complaints, requires rollback

**Keywords:** "api breaking changes", "backward compatibility", "contract changes"

**Match to Workflows:** `capability-grounding-manifest`, `release-readiness-runbook`

---

#### 52. Missing API Versioning
**Severity:** Medium  
**Pattern:** AI-generated code doesn't version APIs, making updates risky.

**Real-World Scenario:**
- AI generates new API endpoint without versioning
- Clients depend on endpoint, update breaks integrations
- Result: Integration failures, customer complaints, forced rollback

**Keywords:** "api versioning", "backward compatibility", "api design"

**Match to Workflows:** `capability-grounding-manifest`, `release-readiness-runbook`

---

#### 53. Incorrect API Error Handling
**Severity:** Medium  
**Pattern:** AI-generated code doesn't handle API errors correctly.

**Real-World Scenario:**
- AI generates code that treats 404 as success
- Missing resources cause silent failures
- Result: Data inconsistency, difficult debugging, user confusion

**Keywords:** "api error handling", "http status codes", "error responses"

**Match to Workflows:** `release-readiness-runbook`

---

#### 54. Missing Request Validation
**Severity:** High  
**Pattern:** AI-generated API endpoints don't validate request payloads.

**Real-World Scenario:**
- AI generates endpoint that accepts any JSON structure
- Invalid data causes crashes, corrupts database
- Result: Service outages, data corruption, difficult debugging

**Keywords:** "request validation", "input validation", "api security"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

#### 55. Rate Limit Exceeded
**Severity:** Medium  
**Pattern:** AI-generated code doesn't respect API rate limits.

**Real-World Scenario:**
- AI generates code that makes unlimited API calls
- Rate limit exceeded, service blocked by external API
- Result: Feature unavailable, user complaints, requires fix

**Keywords:** "rate limiting", "api throttling", "quota management"

**Match to Workflows:** `release-readiness-runbook`

---

#### 56. Missing Authentication Headers
**Severity:** High  
**Pattern:** AI-generated code doesn't include required authentication headers.

**Real-World Scenario:**
- AI generates API client without authentication
- All requests rejected, feature completely broken
- Result: Feature unavailable, requires immediate fix

**Keywords:** "authentication", "api security", "authorization headers"

**Match to Workflows:** `security/security-guardrails`, `capability-grounding-manifest`

---

#### 57. Incorrect Content-Type Headers
**Severity:** Medium  
**Pattern:** AI-generated code sends wrong content-type headers.

**Real-World Scenario:**
- AI generates code that sends JSON as text/plain
- API rejects requests, feature doesn't work
- Result: Integration failures, requires fix

**Keywords:** "content-type", "http headers", "api integration"

**Match to Workflows:** `release-readiness-runbook`

---

#### 58. Missing Pagination in API Client
**Severity:** Medium  
**Pattern:** AI-generated API client doesn't handle pagination.

**Real-World Scenario:**
- AI generates client that only fetches first page
- Incomplete data displayed to users
- Result: Data inconsistency, user complaints, requires fix

**Keywords:** "pagination", "api client", "data completeness"

**Match to Workflows:** `release-readiness-runbook`

---

#### 59. Incorrect Timeout Values
**Severity:** Medium  
**Pattern:** AI-generated code uses wrong timeout values for API calls.

**Real-World Scenario:**
- AI generates code with 1-second timeout for 10-second operation
- Requests always timeout, feature unusable
- Result: Feature broken, user complaints, requires fix

**Keywords:** "timeout configuration", "api performance", "request handling"

**Match to Workflows:** `release-readiness-runbook`

---

#### 60. Missing Retry Logic for API Calls
**Severity:** Medium  
**Pattern:** AI-generated code doesn't retry failed API calls.

**Real-World Scenario:**
- AI generates code that fails on first network error
- Transient failures cause unnecessary feature unavailability
- Result: Intermittent failures, poor reliability, user complaints

**Keywords:** "retry logic", "api resilience", "transient failures"

**Match to Workflows:** `release-readiness-runbook`

---

### Category 7: Testing & Quality (10 patterns)

#### 61. Missing Edge Case Testing
**Severity:** High  
**Pattern:** AI-generated code doesn't handle edge cases, causing production failures.

**Real-World Scenario:**
- AI generates code tested only with normal inputs
- Production receives edge case (null, empty string, very large number)
- Result: Crashes, data corruption, service outages

**Keywords:** "edge case testing", "test coverage", "production failures"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

#### 62. Insufficient Test Coverage
**Severity:** Medium  
**Pattern:** AI-generated tests don't cover critical paths.

**Real-World Scenario:**
- AI generates code with 20% test coverage
- Critical payment flow untested, bug shipped to production
- Result: Production incident, requires hotfix, trust erosion

**Keywords:** "test coverage", "testing gaps", "quality assurance"

**Match to Workflows:** `release-readiness-runbook`, `code-quality/keep-prs-under-control`

---

#### 63. Flaky Tests from Timing Issues
**Severity:** Medium  
**Pattern:** AI-generated tests have race conditions or timing dependencies.

**Real-World Scenario:**
- AI generates tests that depend on exact timing
- Tests pass locally but fail in CI, blocking deployments
- Result: Development slowdown, false negatives, trust issues

**Keywords:** "flaky tests", "test reliability", "ci/cd failures"

**Match to Workflows:** `release-readiness-runbook`, `daily-merge-discipline`

---

#### 64. Missing Integration Tests
**Severity:** High  
**Pattern:** AI-generated code has unit tests but no integration tests.

**Real-World Scenario:**
- AI generates feature with unit tests passing
- Integration issues missed, feature doesn't work end-to-end
- Result: Production bug, requires fix, deployment delays

**Keywords:** "integration testing", "test strategy", "end-to-end testing"

**Match to Workflows:** `release-readiness-runbook`

---

#### 65. Test Data Pollution
**Severity:** Medium  
**Pattern:** AI-generated tests don't clean up test data, affecting other tests.

**Real-World Scenario:**
- AI generates tests that create data without cleanup
- Test data accumulates, tests start interfering with each other
- Result: Unreliable test suite, false positives, difficult debugging

**Keywords:** "test data management", "test isolation", "test pollution"

**Match to Workflows:** `release-readiness-runbook`

---

#### 66. Missing Negative Test Cases
**Severity:** Medium  
**Pattern:** AI-generated tests only cover happy path, missing error cases.

**Real-World Scenario:**
- AI generates tests that only test success scenarios
- Error handling untested, production failures occur
- Result: Production incidents, poor error messages, user confusion

**Keywords:** "negative testing", "error case testing", "test completeness"

**Match to Workflows:** `release-readiness-runbook`

---

#### 67. Incorrect Test Assertions
**Severity:** Medium  
**Pattern:** AI-generated tests have wrong assertions, giving false confidence.

**Real-World Scenario:**
- AI generates test that always passes due to incorrect assertion
- Bug exists but test doesn't catch it, shipped to production
- Result: Production bug, false confidence, trust issues

**Keywords:** "test assertions", "test accuracy", "false positives"

**Match to Workflows:** `release-readiness-runbook`

---

#### 68. Missing Performance Tests
**Severity:** Medium  
**Pattern:** AI-generated code doesn't have performance tests.

**Real-World Scenario:**
- AI generates feature that works but is slow
- No performance tests, slow code shipped to production
- Result: Poor user experience, requires optimization, user complaints

**Keywords:** "performance testing", "load testing", "scalability testing"

**Match to Workflows:** `release-readiness-runbook`

---

#### 69. Test Environment Mismatch
**Severity:** Medium  
**Pattern:** AI-generated code works in test but fails in production.

**Real-World Scenario:**
- AI generates code that depends on test environment specifics
- Code doesn't work in production, requires fixes
- Result: Production bugs, deployment delays, trust issues

**Keywords:** "test environment", "environment parity", "production readiness"

**Match to Workflows:** `release-readiness-runbook`

---

#### 70. Missing Security Tests
**Severity:** High  
**Pattern:** AI-generated code doesn't have security tests.

**Real-World Scenario:**
- AI generates code with security vulnerabilities
- No security tests, vulnerabilities shipped to production
- Result: Security incidents, breaches, compliance issues

**Keywords:** "security testing", "vulnerability testing", "penetration testing"

**Match to Workflows:** `security/security-guardrails`, `release-readiness-runbook`

---

## Output Format Requirements

For each incident pattern, provide research in the following structure:

```markdown
### [Incident Pattern Number]. [Prevention-Focused Title]

**Example:** "1. Prevent Data Corruption in AI-Generated Migrations"

#### Prevention Strategies (Primary Focus) ⭐

1. **[Strategy Name]**
   - **Description:** [2-3 sentences explaining the strategy]
   - **Workflow Match:** [Link to existing workflow if applicable, or suggest new workflow]
   - **Prompt Ideas:** [1-2 prompts that could prevent this]
   - **Implementation Steps:**
     1. [Step 1]
     2. [Step 2]
     3. [Step 3]
   - **Effectiveness:** [Estimate: "Prevents 85-95% of cases" or similar]
   - **Guardrails:** [Link to guardrails that enforce this]

2. **[Strategy Name 2]**
   - [Same structure]

#### Early Detection Methods

**Automated Checks:**
- **Pre-Commit:** [Tool/check that can catch this]
- **CI/CD:** [Automated check in pipeline]
- **Static Analysis:** [SAST tool or pattern]
- **Runtime Monitoring:** [Metric/alert to watch]

**Code Review Checkpoints:**
- [ ] [Checkpoint 1]
- [ ] [Checkpoint 2]
- [ ] [Checkpoint 3]

**Monitoring Metrics:**
- [Metric name] - [What to watch for]

**Match to Workflows:** [Link to detection workflows/guardrails]

#### Mitigation & Response

**Immediate Actions:**
1. [Action 1]
2. [Action 2]

**Recovery Procedures:**
1. [Step 1]
2. [Step 2]

**Post-Incident Prevention Improvements:**
1. [Improvement 1]
2. [Improvement 2]

**Match to Workflows:** [Link to incident response workflows]

#### Related Resources

**Workflows:**
- [Existing workflow 1]: [How it prevents this]
- [Existing workflow 2]: [How it detects this]

**Prompts:**
- [Prompt idea 1]: [How it prevents this]
- [Prompt idea 2]: [How it detects this]

**Guardrails:**
- [Guardrail 1]: [How it prevents this]

**Pain Points:**
- [Related pain point 1]: [Connection]
- [Related pain point 2]: [Connection]

#### Research Citations

- [Source 1]: [Relevant finding/statistic]
- [Source 2]: [Relevant finding/statistic]

---

```

## Key Requirements

1. **Solution-Focused:** Always frame as "Prevent X" not "X happened"
2. **Match to Workflows:** Link each incident to existing workflows where possible
3. **Actionable:** Provide concrete, implementable steps
4. **Effective:** Include effectiveness estimates where possible
5. **Comprehensive:** Cover prevention, detection, and mitigation
6. **Linked:** Connect to prompts, guardrails, and pain points

## Focus Areas

### High Priority Patterns (Research in Detail):
1. Data Corruption (Patterns 1-10)
2. Security Vulnerabilities (Patterns 11-22)
3. Critical Availability Issues (Patterns 33-42)
4. Financial Errors (Patterns 43-50)

### Medium Priority Patterns (Research with Standard Detail):
- Performance Issues (Patterns 23-32)
- API Integration Issues (Patterns 51-60)
- Testing Gaps (Patterns 61-70)

## Success Criteria

For each incident pattern, the research should:
- ✅ Provide 3-5 concrete prevention strategies
- ✅ Link to at least 1-2 existing workflows
- ✅ Include detection methods (automated and manual)
- ✅ Include mitigation procedures
- ✅ Connect to prompts, guardrails, and pain points
- ✅ Be actionable and implementable
- ✅ Include effectiveness estimates
- ✅ Reference research where applicable

---

## Begin Research

Start with Pattern #1 and work through all 70 patterns systematically. For each pattern, generate comprehensive prevention, detection, and mitigation strategies that align with Engify.ai's solution-focused philosophy of empowering teams to embrace AI confidently.
