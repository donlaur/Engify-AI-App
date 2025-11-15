# Testing Guardrails

**Category:** testing  
**Total Guardrails:** 10  
**Severities:** High (7), Medium (3)

This file contains guardrails for preventing testing issues in AI-generated code, including missing edge cases, insufficient coverage, and flaky tests.

---

## 61. Prevent Missing Edge Case Testing

**Slug:** `prevent-missing-edge-case-testing`  
**Category:** testing | **Severity:** high

**Problem:** AI-generated tests are excellent at covering the "happy path" (e.g., valid input) but consistently fail to test edge cases (e.g., null, 0, -1, empty string, max length), leading to a false sense of security.

**Prevention Checklist:**
- [ ] Use Boundary Value Analysis (BVA): for a range [1, 100], test 0, 1, 100, and 101
- [ ] Use Equivalence Partitioning (EP): divide inputs into classes (e.g., valid, invalid, null) and test one from each class
- [ ] Use the `code-quality/tdd-with-ai-pair` workflow to first write failing tests for these edge cases
- [ ] Prompt the AI specifically for edge cases: "Generate unit tests for this function, including null, zero, negative, empty, and maximum value inputs"
- [ ] Use scenario-based testing to check for real-world user-flow edge cases, not just function inputs

**Early Detection:**
- **CI/CD:** A low "branch" or "decision" coverage score (even with 100% "line" coverage) often indicates missed edge cases
- **Static:** Code review of unit tests. A lack of tests for if (input == null) is a red flag
- **Runtime:** Production errors (e.g., NullPointerException) that were not caught by unit tests

**Mitigation:**
1. Triage the production bug
2. Write a new, failing unit test that reproduces the edge case
3. Fix the application code to correctly handle the edge case (the test will now pass)
4. Add this test to the permanent test suite

**E-E-A-T Signals (SEO):**
- **Experience:** From real-world QA, where most production bugs are found in edge cases that the "happy path" tests missed
- **Expertise:** Cites the specific, professional QA methodologies of Boundary Value Analysis (BVA) and Equivalence Partitioning (EP)
- **Authoritativeness:** Based on foundational software testing (ISTQB) principles and best practices
- **Trustworthiness:** Provides a specific, actionable prompt to "guide" the AI into generating the correct, robust tests

**Workflows:** `code-quality/tdd-with-ai-pair` (TDD process), `process/release-readiness-runbook` (QA validation)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 62. Prevent Insufficient Test Coverage

**Slug:** `prevent-insufficient-test-coverage`  
**Category:** testing | **Severity:** medium

**Problem:** AI-generated tests may only cover one path through a complex function, leaving other logical branches (e.g., else blocks, catch blocks) untested and unverified.

**Prevention Checklist:**
- [ ] Primary Fix: Configure a test coverage tool (e.g., JaCoCo, Istanbul, pytest-cov) to run in your CI pipeline
- [ ] Set a "quality gate" that fails the build if coverage decreases or drops below a set threshold (e.g., 80%)
- [ ] Measure decision or branch coverage, not just line coverage. 100% line coverage is a vanity metric; 100% branch coverage is robust
- [ ] Use parameterized tests to efficiently cover multiple inputs and branches with a single test function
- [ ] Use the `code-quality/tdd-with-ai-pair` workflow to ensure tests are written for all logic paths

**Early Detection:**
- **CI/CD:** The test coverage quality gate fails the build
- **Static:** Review the HTML coverage report, which visually highlights untested lines and branches in red
- **Runtime:** N/A (This is a pre-production metric)

**Mitigation:**
1. Analyze the coverage report to identify the red (untested) lines/branches
2. Write new unit tests (using `code-quality/tdd-with-ai-pair`) to specifically execute those untested logic paths
3. Re-run the build and confirm coverage now meets the threshold

**E-E-A-T Signals (SEO):**
- **Experience:** From managing large codebases where "line" coverage was high but "branch" coverage was low, hiding significant risk
- **Expertise:** Cites the critical difference between "line" coverage (weak) and "branch/decision" coverage (strong)
- **Authoritativeness:** Aligns with standard "shift-left" QA and Test Automation best practices
- **Trustworthiness:** Debunks "100% line coverage" as a vanity metric, promoting a more robust and honest measure of test quality

**Workflows:** `code-quality/tdd-with-ai-pair` (write tests), `process/release-readiness-runbook` (enforce coverage gate)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 63. Prevent Flaky Tests from Timing Issues

**Slug:** `prevent-flaky-tests-from-timing-issues`  
**Category:** testing | **Severity:** high

**Problem:** AI-generated asynchronous or UI tests often use hardcoded, arbitrary sleep() or setTimeout() commands. These create "flaky" tests that fail intermittently in CI due to timing or load variations.

**Prevention Checklist:**
- [ ] Primary Fix: NEVER use hardcoded sleep() or fixed timeouts in tests to wait for something to happen
- [ ] Use explicit, condition-based waits. Wait for a specific condition to be true (e.g., "element is visible," "API response is received," "text appears")
- [ ] Use modern test frameworks (e.g., Playwright, Cypress) that have "auto-waiting" assertions built-in (e.g., expect(..).toBeVisible())
- [ ] Isolate tests from external dependencies (like APIs) by using mock servers (e.g., Mock Service Worker)
- [ ] Ensure all tests are 100% independent and can be run in parallel or in any order

**Early Detection:**
- **CI/CD:** Automatically re-run any failed test once. If it passes on the second try, automatically quarantine it and flag it as "flaky"
- **Static:** Linter to detect and ban sleep() or Thread.sleep() from all test files
- **Runtime:** Maintain a "Flaky Test Dashboard" that tracks the failure rate of all tests, highlighting the most frequent offenders

**Mitigation:**
1. Immediately quarantine the flaky test so it no longer blocks the CI pipeline
2. Analyze the test and refactor it to use explicit, condition-based waits instead of sleep()
3. Run the refactored test 100 times in a loop to verify its stability before re-enabling it

**E-E-A-T Signals (SEO):**
- **Experience:** From managing large CI/CD pipelines where flaky tests destroyed developer trust and slowed down releases
- **Expertise:** Cites the correct "explicit wait" (e.g., waitForElementVisible) pattern vs. the sleep() anti-pattern
- **Authoritativeness:** Aligns with official Playwright/Selenium documentation and testing best practices
- **Trustworthiness:** Provides a pragmatic "auto-retry and quarantine" workflow, which is a key practice for managing large test suites

**Workflows:** `code-quality/tdd-with-ai-pair` (writing stable tests), `process/release-readiness-runbook` (running tests)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 64. Prevent Missing Integration Tests

**Slug:** `prevent-missing-integration-tests`  
**Category:** testing | **Severity:** high

**Problem:** AI is good at generating "unit tests" that test functions in isolation. It fails to generate "integration tests" that verify that multiple services (e.g., your app, a database, and an external API) work together correctly.

**Prevention Checklist:**
- [ ] Primary Fix: Implement a "Test Pyramid" strategy: have many unit tests, some integration tests, and few end-to-end tests
- [ ] Write integration tests that check the full flow of a feature (e.g., "API endpoint -> Database" or "API -> External API")
- [ ] Use test containers (e.g., Testcontainers) to spin up real, ephemeral dependencies (like a real PostgreSQL or Redis container) for your tests
- [ ] Use mock servers (e.g., Mock Service Worker, WireMock) to simulate external API dependencies
- [ ] Run integration tests as a separate, mandatory stage in the CI/CD pipeline after unit tests pass

**Early Detection:**
- **CI/CD:** A dedicated "integration-test" job in the pipeline
- **Static:** Code review. If a new feature only has unit tests, it's a red flag
- **Runtime:** (Too late) Production incidents where two "unit-tested" services fail to integrate, e.g., due to a schema mismatch

**Mitigation:**
1. A production incident occurs where two components fail to integrate
2. Write a new, failing integration test that reproduces this production failure in the CI environment
3. Fix the code (e.g., fix the schema mismatch, auth error). The integration test will now pass
4. Add this test to the permanent integration suite

**E-E-A-T Signals (SEO):**
- **Experience:** From incidents where all unit tests passed, but the application failed in production because the "plumbing" between components was broken
- **Expertise:** Cites the "Test Pyramid" model and "Testcontainers" as modern, advanced integration testing practices
- **Authoritativeness:** Aligns with all modern software testing and CI/CD best practices
- **Trustworthiness:** Provides a clear, practical strategy for testing with real dependencies (Testcontainers) and simulated ones (Mock Servers)

**Workflows:** `code-quality/tdd-with-ai-pair` (can be adapted), `process/release-readiness-runbook` (CI stage)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`, `pain-point-05-missing-context`

---

## 65. Prevent Test Data Pollution

**Slug:** `prevent-test-data-pollution`  
**Category:** testing | **Severity:** medium

**Problem:** AI-generated tests may not clean up after themselves, leaving "polluted" data (e.g., test_user_123) in the test database. This causes other tests to fail intermittently when they collide with this data.

**Prevention Checklist:**
- [ ] Primary Fix: Ensure every test is idempotent and isolated. Each test must create its own required data and destroy it afterward
- [ ] Use a setup() and teardown() function (e.g., beforeEach/afterEach) to create and delete test-specific data for every single test
- [ ] Better yet, wrap every test in a database transaction, and execute a ROLLBACK in the teardown() step. This is faster and cleaner
- [ ] Never allow tests to share state. Test A should never depend on data created by Test B
- [ ] Use dynamic, unique data (e.g., UUIDs or random strings) for test records to prevent collisions (e.g., user_ + uuid.v4())

**Early Detection:**
- **CI/CD:** Tests fail intermittently, especially when run in parallel or in a different order. This is a classic sign of data pollution
- **Static:** N/A (Hard to detect statically)
- **Runtime:** Manually inspecting the test database and finding thousands of leftover test_... records

**Mitigation:**
1. (In CI) Re-run the build. If it passes, you have a data pollution problem
2. (Fix) Identify the polluting test (the one that doesn't clean up) and the victim test (the one that fails)
3. Refactor all tests to wrap them in a database transaction with an automatic ROLLBACK

**E-E-A-T Signals (SEO):**
- **Experience:** From debugging "flaky" CI pipelines, only to find the root cause was tests colliding over a shared test_user record
- **Expertise:** Cites the "transactional rollback" method as the superior, faster, and cleaner solution to manual teardown() deletion
- **Authoritativeness:** Aligns with Test Data Management (TDM) best practices that mandate test isolation
- **Trustworthiness:** Provides a clear, actionable rule: "Never allow tests to share state"

**Workflows:** `code-quality/tdd-with-ai-pair` (writing isolated tests), `process/release-readiness-runbook` (CI pipeline)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 66. Prevent Missing Negative Test Cases

**Slug:** `prevent-missing-negative-test-cases`  
**Category:** testing | **Severity:** high

**Problem:** AI-generated tests excel at the "happy path" (e.g., "test valid login") but almost never generate "negative tests" (e.g., "test invalid login," "test empty password," "test locked-out user").

**Prevention Checklist:**
- [ ] Primary Fix: For every "happy path" test, write at least one "unhappy path" (negative) test
- [ ] Test for invalid inputs (e.g., bad format, out of range), as defined by your BVA and EP (Guardrail 61)
- [ ] Test for invalid states (e.g., "try to charge an unpaid invoice" or "log in with a suspended account")
- [ ] Test for correct error handling: assert that invalid input correctly returns a 400 error or throws the expected exception
- [ ] Prompt the AI specifically: "Generate negative test cases for this login function, including wrong password, empty email, and non-existent user"

**Early Detection:**
- **CI/CD:** A low branch coverage score often means your catch blocks and if (error) blocks are not being tested
- **Static:** Code review of test files. If there are no assert_throws or expect(..).to_return_400 tests, it's a red flag
- **Runtime:** (Too late) A 500 error in production because an invalid input caused an unhandled exception instead of a handled 400 error

**Mitigation:**
1. A production bug is found where invalid input (e.g., an empty string) causes a 500 error
2. Write a new, failing test that sends that exact invalid input and asserts that the function returns a graceful error (e.g., a 400 status)
3. Fix the application code to catch the error and return the graceful response

**E-E-A-T Signals (SEO):**
- **Experience:** From production incidents where "unhappy paths" were never tested, leading to unhandled exceptions that crashed services
- **Expertise:** Cites the distinction between testing invalid inputs (e.g., bad email) and invalid states (e.g., suspended user)
- **Authoritativeness:** This is a foundational QA practice, often called "destructive testing" or "failure testing"
- **Trustworthiness:** Provides a clear, actionable prompt to "guide" the AI into generating the negative tests that it naturally misses

**Workflows:** `code-quality/tdd-with-ai-pair` (TDD), `process/release-readiness-runbook` (QA validation)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 67. Prevent Incorrect Test Assertions

**Slug:** `prevent-incorrect-test-assertions`  
**Category:** testing | **Severity:** medium

**Problem:** AI-generated tests can be tautological or incorrect. They may test the wrong thing (e.g., assert(true)), have logical errors, or accidentally repeat the same logic from the function, thus failing to catch bugs.

**Prevention Checklist:**
- [ ] Primary Fix: Never repeat the implementation logic in the assertion. Use static, "known-good" values
- [ ] (Bad: assert(add(2, 2) == 2 + 2). Good: assert(add(2, 2) == 4))
- [ ] Use the Arrange-Act-Assert (AAA) pattern to structure tests clearly and keep assertions separate from logic
- [ ] Test one thing per test. Have a single Act and a single, clear Assert
- [ ] Use specific assertion methods (e.g., assertIsNotNull, assertHasLength) instead of assertTrue(x != null)
- [ ] Use "web-first" assertions (e.g., Playwright's expect()) that auto-wait, rather than asserting on a boolean (expect(..).isVisible() == true)

**Early Detection:**
- **CI/CD:** N/A (A bad assertion will still pass, giving a false positive)
- **Static:** Code review is the only way to catch this. Reviewers must ask: "Does this assertion validate the requirement or just the implementation?"
- **Runtime:** (Too late) A production bug is found in code that was "100% tested," indicating the tests were invalid

**Mitigation:**
1. A production bug is found in "tested" code
2. Analyze the test and find the incorrect assertion
3. Fix the assertion first to be a "known-good" value, which will make the test fail (revealing the bug)
4. Now, fix the application code. The test will pass

**E-E-A-T Signals (SEO):**
- **Experience:** From code reviews where AI-generated tests were found to be testing themselves, not the actual business logic
- **Expertise:** Cites the specific "Arrange-Act-Assert" (AAA) pattern and the "don't repeat logic" rule
- **Authoritativeness:** Aligns with unit testing best practices (e.g., Kent Beck's TDD, Roy Osherove's Art of Unit Testing)
- **Trustworthiness:** Admits that CI/CD cannot catch this; it requires human review, promoting a "human-in-the-loop" (HITL) process

**Workflows:** `code-quality/tdd-with-ai-pair` (reviewing AI-generated assertions), `code-quality/keep-prs-under-control` (easier reviews)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 68. Prevent Missing Performance Tests

**Slug:** `prevent-missing-performance-tests`  
**Category:** testing | **Severity:** high

**Problem:** AI-generated code works for one user, but teams deploy it without performance testing. The code is inefficient and fails under real-world load (e.g., N+1 queries, slow algorithms). This is a duplicate of Guardrail 32.

**Prevention Checklist:**
- [ ] Integrate performance testing into the `process/release-readiness-runbook` workflow before every production release
- [ ] Define clear Service Level Objectives (SLOs) (e.g., "p99 latency < 500ms," "error rate < 0.1%") and fail the test if they are breached
- [ ] Use load testing tools (e.g., k6, Artillery, JMeter) to simulate realistic, concurrent user traffic
- [ ] Run a "soak test" (long-duration test) to find memory leaks (see Guardrail 36)
- [ ] Use AI to generate the performance test scripts, e.g., "Write a k6 script that simulates 100 virtual users"

**Early Detection:**
- **CI/CD:** Automated performance test stage in the deployment pipeline. A breached SLO (high latency, high error rate) fails the build
- **Static:** N/A (This is a runtime testing process)
- **Runtime:** N/A (This is the runtime detection method, done pre-production)

**Mitigation:**
1. (In Test) The build fails. Analyze the test results (e.g., APM trace) to find the bottleneck (e.g., N+1 query, slow function)
2. (In Prod) If an untested service fails, immediately roll it back
3. (Post-Incident) Replicate the production load in a staging environment, fix the bottleneck, and add this test to the permanent CI/CD pipeline

**E-E-A-T Signals (SEO):**
- **Experience:** Based on countless "successful" launches that immediately crashed when real users arrived
- **Expertise:** Cites specific SLO-driven testing (p99 latency) and test types (load, soak) as the correct methodology
- **Authoritativeness:** Aligns with SRE and release engineering best practices that treat performance testing as a mandatory gate
- **Trustworthiness:** Acknowledges the difficulty of testing in production and recommends a realistic, production-like staging environment

**Workflows:** `process/release-readiness-runbook` (this is the workflow)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

**Note:** This guardrail duplicates Guardrail 32 (Prevent Missing Load Testing). Consider consolidating into a single guardrail covering all performance testing types.

---

## 69. Prevent Test Environment Mismatch

**Slug:** `prevent-test-environment-mismatch`  
**Category:** testing | **Severity:** high

**Problem:** AI-generated tests pass in a "mock" or local environment, but the code fails in production because the test environment did not match production (e.g., different dependency versions, missing service, different data).

**Prevention Checklist:**
- [ ] Primary Fix: Use Infrastructure as Code (IaC) (e.g., Terraform, Docker Compose) to define all environments (local, CI, staging, prod) from the same source files
- [ ] Use Docker containers to ensure all developers and the CI pipeline run the code with the exact same OS and dependency versions
- [ ] Use tools like LocalStack to simulate cloud (AWS) services locally
- [ ] Automate the provisioning and teardown of test environments for every CI run
- [ ] Use a single, version-controlled catalog of all environment configurations

**Early Detection:**
- **CI/CD:** The CI build fails, but the developer says "it works on my machine." This is the #1 symptom of environment mismatch
- **Static:** Code review of Dockerfiles, docker-compose.yml, and Terraform (.tf) files
- **Runtime:** (Too late) A deployment fails in production with an error (e.g., "service not found," "config file missing") that did not happen in staging

**Mitigation:**
1. Roll back the deployment
2. Analyze the error. Identify the configuration or version difference between production and the test environment (e.g., "Prod has Postgres 15, Staging has 14")
3. Update the Infrastructure as Code (IaC) files to make the test/staging environment match production
4. Re-run tests in the new, matched environment, then redeploy

**E-E-A-T Signals (SEO):**
- **Experience:** From debugging the classic "it works on my machine" problem, which is almost always an environment mismatch
- **Expertise:** Cites the correct, modern DevSecOps solution: Infrastructure as Code (IaC), Docker, and simulation tools (LocalStack)
- **Authoritativeness:** Aligns with HashiCorp (Terraform) and AWS best practices for environment management
- **Trustworthiness:** Provides a clear, automatable, and version-controlled approach to eliminate an entire class of "flaky" failures

**Workflows:** `process/release-readiness-runbook` (validation)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 70. Prevent Missing Security Tests

**Slug:** `prevent-missing-security-tests`  
**Category:** testing | **Severity:** critical

**Problem:** AI-generated code is highly prone to security vulnerabilities, but AI-generated tests almost never include security assertions, focusing only on "happy path" functionality.

**Prevention Checklist:**
- [ ] Primary Fix: Integrate automated security testing tools directly into the CI/CD pipeline (this is DevSecOps)
- [ ] SAST (Static Analysis): Run tools (e.g., Snyk, Semgrep) that scan the source code for vulnerabilities (e.g., SQLi, hardcoded secrets)
- [ ] DAST (Dynamic Analysis): Run tools (e.g., OWASP ZAP) that "attack" the running application in a test environment
- [ ] SCA (Software Composition Analysis): Run tools (e.g., Dependabot, BlackDuck) to scan for vulnerabilities in your third-party libraries
- [ ] Enforce the `security/security-guardrails` workflow, which automates these scans

**Early Detection:**
- **CI/CD:** The SAST, DAST, or SCA scan fails the build, blocking the vulnerable code from being merged
- **Static:** Code review by a security champion
- **Runtime:** (Too late) A WAF (Web Application Firewall) blocks an attack, or a breach occurs

**Mitigation:**
1. The CI build fails with a security vulnerability report
2. Triage the vulnerability. (Is it a false positive? What is the severity?)
3. Use the tool's recommendation (or `code-quality/tdd-with-ai-pair`) to patch the code
4. Re-run the scan. The build passes

**E-E-A-T Signals (SEO):**
- **Experience:** From implementing "shift-left" DevSecOps pipelines that find and fix vulnerabilities before they reach production
- **Expertise:** Cites the specific AST (Application Security Testing) tool types: SAST, DAST, SCA, and IAST
- **Authoritativeness:** This is the industry-standard approach to scaling security, recommended by OWASP, Gartner, and all major security vendors
- **Trustworthiness:** Promotes an automated, "shift-left" culture where security is part of the build, not an afterthought

**Workflows:** `security/security-guardrails` (this is the workflow), `process/release-readiness-runbook` (CI gate)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## Summary

All 10 testing guardrails processed and formatted following the condensed format specification (~200-250 words per guardrail). Each guardrail includes actionable prevention checklist, detection methods, mitigation steps, and real-world E-E-A-T signals for SEO.

## Consolidation Notes

**Note on Guardrail 68:** This guardrail duplicates Guardrail 32 (Prevent Missing Load Testing in performance.md). Consider consolidating into a single, authoritative guardrail: `prevent-missing-performance-testing`, which can cover load, stress, and soak tests in its checklist.

