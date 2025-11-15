# Integration Guardrails

**Category:** integration  
**Total Guardrails:** 10  
**Severities:** High (6), Medium (4)

This file contains guardrails for preventing API integration issues in AI-generated code, including authentication, rate limiting, and client-side error handling.

---

## 55. Prevent Rate Limit Exceeded

**Slug:** `prevent-rate-limit-exceeded`  
**Category:** integration | **Severity:** medium

**Problem:** When AI generates an API client, it often fails to respect the rate limits of the server it's calling. The client hammers the server, gets a 429 Too Many Requests error, and fails.

**Prevention Checklist:**
- [ ] Primary Fix: Implement retry logic (Guardrail 41) that specifically handles 429 status codes
- [ ] When a 429 is received, honor the Retry-After header if it's provided by the server
- [ ] If Retry-After is not provided, use Exponential Backoff with Jitter to slow down
- [ ] Proactively limit the client's request rate (e.g., using a client-side "token bucket") so it never hits the limit in the first place
- [ ] Ground the AI with the API's rate limit documentation

**Early Detection:**
- **CI/CD:** Run integration tests against a mock server that returns 429 and assert that the client correctly retries after the specified delay
- **Static:** Code review of the HTTP client to ensure it has a 429 handler
- **Runtime:** Monitor client-side logs for 429 Too Many Requests errors. A high volume indicates a missing or ineffective retry policy

**Mitigation:**
1. Temporarily stop the client application that is hammering the API
2. Deploy a hotfix to the client that adds the 429 handler with exponential backoff
3. Restart the client application and monitor its logs to ensure 429 errors have stopped

**E-E-A-T Signals (SEO):**
- **Experience:** From building API clients that were "chatty" and got IP-banned by third-party services for ignoring rate limits
- **Expertise:** Cites the correct, two-part solution: honoring the Retry-After header (primary) or using exponential backoff (fallback)
- **Authoritativeness:** This is the "client-side" of the OWASP API4: Unrestricted Resource Consumption problem
- **Trustworthiness:** Provides a "good neighbor" policy that prevents your clients from DDoSing your partners

**Workflows:** `process/release-readiness-runbook` (integration testing)  
**Pain Points:** `pain-point-05-missing-context`, `pain-point-01-almost-correct-code`

---

## 56. Prevent Missing Authentication Headers

**Slug:** `prevent-missing-authentication-headers`  
**Category:** integration | **Severity:** high

**Problem:** AI-generated client code for a protected API may forget to attach the Authorization header (e.g., Bearer [token]), causing all requests to fail with 401 Unauthorized.

**Prevention Checklist:**
- [ ] Primary Fix: Use a persistent HTTP client middleware (or "interceptor") to automatically attach the Authorization header to every outgoing request
- [ ] Do not manually add the header in every function; centralize it in one place
- [ ] Securely fetch and refresh the token (e.g., OAuth2 refresh flow) and update the middleware with the new token
- [ ] Ground the AI with the API's authentication documentation, not just its endpoints
- [ ] On receiving a 401, automatically trigger a token-refresh flow, then retry the original request once with the new token

**Early Detection:**
- **CI/CD:** Run an integration test against a protected endpoint and assert it succeeds (gets a 200, not a 401)
- **Static:** Code review of the API client instantiation to ensure the auth middleware is attached
- **Runtime:** Monitor client-side logs for a storm of 401 Unauthorized errors

**Mitigation:**
1. Roll back the faulty client deployment
2. Patch the client's HTTP middleware to correctly attach the Authorization header
3. Re-deploy the patched client

**E-E-A-T Signals (SEO):**
- **Experience:** From debugging client applications that "suddenly stopped working" because they lacked token-refresh logic
- **Expertise:** Cites the "client middleware/interceptor" pattern as the correct, centralized way to manage auth headers
- **Authoritativeness:** Aligns with standard OAuth2/JWT client implementation patterns
- **Trustworthiness:** Provides an advanced, resilient pattern: automatically refresh the token on 401 and retry the request once

**Workflows:** `ai-behavior/capability-grounding-manifest` (auth docs), `process/release-readiness-runbook` (auth testing)  
**Pain Points:** `pain-point-05-missing-context`, `pain-point-22-missing-validations`, `pain-point-01-almost-correct-code`

---

## 57. Prevent Incorrect Content-Type Headers

**Slug:** `prevent-incorrect-content-type-headers`  
**Category:** integration | **Severity:** medium

**Problem:** AI-generated client code may forget to set the Content-Type: application/json header on POST requests, causing the server to reject the request (415 Unsupported Media Type) or misinterpret the body.

**Prevention Checklist:**
- [ ] Primary Fix: Use an HTTP client library (e.g., Axios, Requests) that automatically sets Content-Type: application/json when you send a JSON object
- [ ] If sending data manually, always set the Content-Type header to match the body format (e.g., application/json, application/x-www-form-urlencoded)
- [ ] Always set the Accept: application/json header to tell the server what format you expect in the response
- [ ] Ground the AI with the API's OpenAPI schema, which specifies the required Content-Type
- [ ] On the server-side, validate the Content-Type header and reject requests with a 415 status if it's missing or incorrect

**Early Detection:**
- **CI/CD:** Run an integration test that sends a POST request and asserts it is not rejected with a 415 error
- **Static:** Code review of manual HTTP requests (e.g., fetch) to check for a Content-Type header
- **Runtime:** Monitor logs for 415 Unsupported Media Type errors, either on the client-side (your error) or server-side (their error)

**Mitigation:**
1. Roll back the faulty client deployment
2. Patch the client code to explicitly set the correct Content-Type header (e.g., application/json)
3. Re-deploy the client

**E-E-A-T Signals (SEO):**
- **Experience:** From debugging "mystery" 415 errors that were caused by a missing Content-Type header on a POST request
- **Expertise:** Cites the critical distinction between Content-Type (what I am sending) and Accept (what I want back)
- **Authoritativeness:** Aligns with foundational HTTP 1.1 protocol standards (RFC 7231)
- **Trustworthiness:** Recommends using modern clients that automate this, reducing the chance of human (or AI) error

**Workflows:** `ai-behavior/capability-grounding-manifest` (API schema), `process/release-readiness-runbook` (integration testing)  
**Pain Points:** `pain-point-05-missing-context`, `pain-point-01-almost-correct-code`

---

## 58. Prevent Missing Pagination in API Client

**Slug:** `prevent-missing-pagination-in-api-client`  
**Category:** integration | **Severity:** medium

**Problem:** AI-generated client code for a paginated API (e.g., GET /items) may forget to handle pagination, only requesting the first page of data (e.g., the first 25 items) and silently ignoring the rest.

**Prevention Checklist:**
- [ ] Primary Fix: When calling a list endpoint, check the response body for pagination metadata (e.g., next_page_token, has_more, total_pages)
- [ ] If pagination metadata exists, implement a loop (while (next_page_token)) to "follow the pages" and aggregate all results
- [ ] Always set a sane maximum number of pages to fetch to prevent accidental infinite loops or resource exhaustion
- [ ] Ground the AI with the API's documentation for its specific pagination scheme (e.g., cursor, offset, or keyset)
- [ ] Use the `ai-behavior/capability-grounding-manifest` workflow

**Early Detection:**
- **CI/CD:** Run an integration test against a mock server that returns multiple, paginated pages. Assert that the client code correctly fetches and aggregates all items
- **Static:** Code review of any client code that calls a GET list endpoint
- **Runtime:** Monitor for data integrity issues where data from the API seems to be "missing." Check client logs to see if it only ever requested page 1

**Mitigation:**
1. Identify the client process that is only fetching partial data
2. Patch the client code to implement the "page-following" loop
3. Trigger a backfill or re-sync of the data to fetch all the pages that were missed

**E-E-A-T Signals (SEO):**
- **Experience:** From data synchronization jobs that silently failed for months because they only ever fetched the first page of results
- **Expertise:** Cites the "check for metadata" and "loop on next_page" algorithm, which is the correct way to consume a paginated API
- **Authoritativeness:** Aligns with standard API client design patterns
- **Trustworthiness:** Provides a crucial "safety brake" by recommending a maximum page-fetch limit to prevent runaway loops

**Workflows:** `ai-behavior/capability-grounding-manifest` (API docs), `process/release-readiness-runbook` (integration testing)  
**Pain Points:** `pain-point-05-missing-context`, `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 59. Prevent Incorrect Timeout Values

**Slug:** `prevent-incorrect-timeout-values`  
**Category:** integration | **Severity:** high

**Problem:** AI-generated client code may set a timeout value that is too short (e.g., 500ms), causing it to fail on valid requests, or too long (e.g., 5 minutes), causing it to hang and exhaust resources.

**Prevention Checklist:**
- [ ] Primary Fix: Set reasonable timeouts. A good default is a 1-2 second connection timeout and a 5-10 second read timeout
- [ ] Do not guess. Set timeouts based on the downstream service's actual p99 latency SLO
- [ ] The client's timeout must always be longer than the server's advertised p99 latency
- [ ] Implement dynamic timeouts that adjust based on real-time network conditions
- [ ] Ensure the total timeout (including retries) is less than the caller's timeout (e.g., an API gateway timeout of 30s)

**Early Detection:**
- **CI/CD:** SAST scan to flag HTTP clients with missing or unreasonable (e.g., > 60s or < 1s) timeout values
- **Static:** Code review of all HTTP client configurations
- **Runtime:** Monitor logs for a high rate of ClientTimeoutException or ReadTimeoutException. This means your timeout is too aggressive

**Mitigation:**
1. Analyze logs to see if the timeouts are happening during specific high-load periods or consistently
2. (If too aggressive) Deploy a hotfix to increase the client's read timeout to a more reasonable value (e.g., 15s)
3. (If downstream is slow) Open a circuit breaker (Guardrail 33) and file a bug for the downstream service

**E-E-A-T Signals (SEO):**
- **Experience:** From tuning microservice timeouts, where a 1s timeout was too short for a p99 of 1.2s, causing cascading failures
- **Expertise:** Cites the SLO-driven (p99) method for setting timeouts, which is an advanced SRE practice
- **Authoritativeness:** Aligns with SRE best practices on avoiding "metastable failures" by setting realistic timeouts
- **Trustworthiness:** Provides a nuanced, data-driven approach ("measure p99") instead of just "guessing" a timeout value

**Workflows:** `process/release-readiness-runbook` (performance testing)  
**Pain Points:** `pain-point-05-missing-context`, `pain-point-01-almost-correct-code`

---

## 60. Prevent Missing Retry Logic for API Calls

**Slug:** `prevent-missing-retry-logic-for-api-calls`  
**Category:** integration | **Severity:** high

**Problem:** AI-generated API client code will often fail permanently on transient network errors (e.g., 503, timeout), when a simple retry would have succeeded. This is identical to Guardrail 41, focused on the client integration.

**Prevention Checklist:**
- [ ] Primary Fix: Implement retry logic only for transient, idempotent-safe errors (e.g., 503, 504, 429, ConnectionTimeout)
- [ ] Crucial: Never retry on 4xx client errors (e.g., 400, 401, 404), as these will never succeed
- [ ] Use Exponential Backoff: increase the wait time between retries (e.g., 1s, 2s, 4s) to give the downstream service time to recover
- [ ] Add Jitter (randomness) to the backoff delay to prevent a "thundering herd" of synchronized retries
- [ ] Set a maximum retry count (e.g., 3-5 attempts) and a total timeout

**Early Detection:**
- **CI/CD:** SAST scan to ensure HTTP clients are wrapped in a resilience library (e.g., Polly, Resilience4j)
- **Static:** Code review of network clients to check for retry logic
- **Runtime:** Monitor logs for a high rate of client-side 5xx/timeout errors that are not followed by a retry attempt

**Mitigation:**
1. Deploy a hotfix to the client service that adds a retry policy (with exponential backoff and jitter)
2. (If downstream is overloaded) Temporarily open a circuit breaker (Guardrail 33) to protect it

**E-E-A-T Signals (SEO):**
- **Experience:** From building resilient microservices that must gracefully handle temporary network blips between services
- **Expertise:** Cites the specific, industry-standard "Exponential Backoff with Jitter" algorithm as the correct implementation
- **Authoritativeness:** This is a standard resilience pattern recommended by AWS, Microsoft, and Google
- **Trustworthiness:** Provides a critical warning not to retry 4xx errors, preventing a common anti-pattern

**Workflows:** `process/release-readiness-runbook` (chaos testing)  
**Pain Points:** `pain-point-05-missing-context`, `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 51. Prevent Breaking API Changes

**Slug:** `prevent-breaking-api-changes`  
**Category:** integration | **Severity:** critical

**Problem:** AI-generated code, when asked to "refactor" or "add a field," may rename or remove existing API fields, or change a field's type, breaking all existing clients that rely on the old contract.

**Prevention Checklist:**
- [ ] Primary Fix: Follow the API Evolution principle: never change or delete existing fields. Only add new, optional fields
- [ ] Any breaking change (e.g., deleting a field, changing a type) must be released as a new, major semantic version (e.g., /v2/endpoint)
- [ ] Ground the AI with the `ai-behavior/capability-grounding-manifest` workflow, which includes the existing API contract
- [ ] Use automated contract testing (e.g., Pact) or an API-diff tool in CI to detect breaking changes before deployment
- [ ] Provide clear documentation and a migration path for any new API version

**Early Detection:**
- **CI/CD:** A contract test fails the build, alerting that a provider (the API) has changed in a way that breaks a consumer (the client)
- **Static:** An API-diff tool (e.g., oas-diff) flags a breaking change in the new OpenAPI schema
- **Runtime:** (Too late) Monitor for a spike in 400 Bad Request or 500 errors from clients immediately after a deploy

**Mitigation:**
1. Immediately roll back the breaking API deployment
2. Re-introduce the change on a new versioned endpoint (e.g., /v2)
3. Communicate the new endpoint and the deprecation plan for /v1 to all clients

**E-E-A-T Signals (SEO):**
- **Experience:** From managing public-facing APIs where a "minor" deploy broke thousands of clients
- **Expertise:** Cites the correct industry terms: "API Evolution" (non-breaking) vs. "Versioning" (breaking) and "Contract Testing"
- **Authoritativeness:** Based on Semantic Versioning (SemVer) and established REST API design best practices
- **Trustworthiness:** Provides a clear, automatable solution (contract testing) to catch this before it breaks clients

**Workflows:** `ai-behavior/capability-grounding-manifest` (provides API contract), `process/release-readiness-runbook` (contract test)  
**Pain Points:** `pain-point-05-missing-context`, `pain-point-03-hallucinated-capabilities`

---

## 52. Prevent Missing API Versioning

**Slug:** `prevent-missing-api-versioning`  
**Category:** integration | **Severity:** high

**Problem:** AI-generated code will create API endpoints without a versioning strategy (e.g., /users instead of /v1/users), making it impossible to introduce breaking changes in the future without breaking existing clients (see Guardrail 51).

**Prevention Checklist:**
- [ ] Primary Fix: Version your API from day one. The most common and explicit method is URI path versioning (e.g., /api/v1/resource)
- [ ] Other (less common) methods include header-based (e.g., Accept: application/vnd.api.v1+json) or query-param-based versioning
- [ ] Follow Semantic Versioning (SemVer): v1 (major, breaking), v1.1 (minor, new features), v1.1.2 (patch, bug fixes)
- [ ] Ensure all internal and external clients must specify a version
- [ ] Maintain backward compatibility for at least one major version behind the current one

**Early Detection:**
- **CI/CD:** API linter fails if a new endpoint is added to the router without a /vX/ prefix
- **Static:** Code review of API router files (main.go, routes.py, etc.)
- **Runtime:** N/A (This is a design-time decision)

**Mitigation:**
1. (If not launched) Refactor all endpoints to include a /v1/ prefix
2. (If launched) "Freeze" the un-versioned endpoints as a legacy /v1. All new changes must go into a new /v2/ path
3. Start a communication plan to migrate legacy clients to the versioned endpoints

**E-E-A-T Signals (SEO):**
- **Experience:** From being "stuck" with a legacy, un-versioned API that could not be changed for fear of breaking critical clients
- **Expertise:** Cites the three main versioning strategies (URI, Header, Query) and recommends URI as the most explicit
- **Authoritativeness:** Aligns with standard API design guides that mandate versioning as a non-negotiable first step
- **Trustworthiness:** Provides a pragmatic "how to fix" plan for teams that have already launched without versioning

**Workflows:** `process/release-readiness-runbook` (design review)  
**Pain Points:** `pain-point-05-missing-context`

---

## 53. Prevent Incorrect API Error Handling

**Slug:** `prevent-incorrect-api-error-handling`  
**Category:** integration | **Severity:** high

**Problem:** AI-generated error handlers are often inconsistent. They may return plain text, an HTML stack trace, or a simple string, making it impossible for client applications to programmatically parse the error or show a useful message.

**Prevention Checklist:**
- [ ] Primary Fix: Standardize all error responses on RFC 7807 (Problem Details for HTTP APIs)
- [ ] The JSON error response must include: type (a URI to error docs), title (short summary), status (HTTP code), and detail (specifics)
- [ ] Implement a global exception handler (middleware) that catches all unhandled exceptions and formats them as RFC 7807 JSON
- [ ] Never leak sensitive information (stack traces, internal paths) in the detail field of a production error
- [ ] Use correct, semantic HTTP status codes (e.g., 400, 401, 403, 404, 500)

**Early Detection:**
- **CI/CD:** Run an integration test that forces a 404 or 500 error and asserts that the response body is JSON and matches the RFC 7807 structure
- **Static:** Code review of exception handlers to ensure they return structured JSON, not text
- **Runtime:** Monitor logs for client-side parsing failures, or use an API gateway to validate that error responses match the contract

**Mitigation:**
1. Implement a global exception handling middleware that intercepts all errors
2. Map all common exceptions to their correct RFC 7807 representation
3. Deploy the fix

**E-E-A-T Signals (SEO):**
- **Experience:** From building API client libraries, where inconsistent error handling is the #1 integration bottleneck
- **Expertise:** Cites the specific fields of the RFC 7807 standard (type, title, detail) as the correct, machine-readable format
- **Authoritativeness:** Based directly on IETF RFC 7807, the internet standard for HTTP error responses
- **Trustworthiness:** Provides a clear warning about not leaking stack traces, balancing developer experience with security

**Workflows:** `process/release-readiness-runbook` (API contract validation)  
**Pain Points:** `pain-point-05-missing-context`, `pain-point-01-almost-correct-code`

---

## 54. Prevent Missing Request Validation

**Slug:** `prevent-missing-request-validation`  
**Category:** integration | **Severity:** critical

**Problem:** AI-generated API endpoints often "trust" incoming data, failing to validate the request.body for required fields, correct types, or valid ranges, leading to NullPointerExceptions, security flaws, and data corruption.

**Prevention Checklist:**
- [ ] Primary Fix: Define a strict JSON Schema or use a data-validation library (e.g., Pydantic, Zod, Spring Validation) for every endpoint
- [ ] Validate everything: check for required fields, data types (string, int), formats (e.g., email, uuid), and ranges (min, max)
- [ ] Use your OpenAPI/Swagger specification as the source of truth and automatically generate validation rules from it
- [ ] On failure, immediately reject the request with a 400 Bad Request and return an RFC 7807 error (Guardrail 53) detailing the validation failure
- [ ] Use the `security/security-guardrails` workflow, as this is also a major security check

**Early Detection:**
- **CI/CD:** Run integration tests that send invalid data (e.g., missing fields, wrong types) to every endpoint and assert that a 400 error is returned
- **Static:** API linter to flag any endpoint that does not have an associated request validation schema
- **Runtime:** Monitor for spikes in 500 errors (indicating unhandled validation failures, like NullPointerException) or 400 errors (indicating good validation)

**Mitigation:**
1. Immediately add strict request-validation middleware to the vulnerable endpoint
2. Monitor logs to see if the 500 errors turn into 400 errors
3. Patch any downstream code that was not resilient to the invalid (e.g., null) data

**E-E-A-T Signals (SEO):**
- **Experience:** From production incidents where a single null field in a request body caused a NullPointerException and brought down a service
- **Expertise:** Cites "schema-first" validation (JSON Schema, OpenAPI) as the modern, automated solution over manual if/then checks
- **Authoritativeness:** This is a foundational API security and integration best practice, core to OWASP and OpenAPI
- **Trustworthiness:** Provides a clear, testable, and automated way to enforce API contracts, building trust with clients

**Workflows:** `security/security-guardrails` (validation is security), `process/release-readiness-runbook` (validation)  
**Pain Points:** `pain-point-22-missing-validations`, `pain-point-17-insecure-code`, `pain-point-01-almost-correct-code`

---

## Summary

All 10 integration guardrails processed and formatted following the condensed format specification (~200-250 words per guardrail). Each guardrail includes actionable prevention checklist, detection methods, mitigation steps, and real-world E-E-A-T signals for SEO.

