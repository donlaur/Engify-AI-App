# Financial Guardrails

**Category:** financial  
**Total Guardrails:** 8  
**Severities:** Critical (7), High (1)

This file contains guardrails for preventing financial issues in AI-generated code, including calculation errors, currency conversion, and payment processing.

---

## 43. Prevent Incorrect Financial Calculation

**Slug:** `prevent-incorrect-financial-calculation`  
**Category:** financial | **Severity:** critical

**Problem:** AI-generated code will default to using standard float or double types for currency, which are binary floating-point types that cannot accurately represent decimal values, leading to silent rounding errors (e.g., 0.1 + 0.2 != 0.3).

**Prevention Checklist:**
- [ ] Primary Fix: NEVER use binary floating-point types (float, double) for monetary values
- [ ] Use a dedicated, high-precision Decimal library (e.g., Java's BigDecimal, Python's Decimal) for all calculations
- [ ] Alternative: Store all currency values as integers representing the smallest unit (e.g., cents, 1000 = $10.00)
- [ ] Never perform rounding on intermediate calculations. Only round at the final step when displaying or storing the result
- [ ] Use a linter to ban float/double types in financial modules

**Early Detection:**
- **CI/CD:** Run unit tests with known problematic values (e.g., 0.1 + 0.2) and assert they equal the exact decimal result (0.3)
- **Static:** Static analysis or linter to ban float/double types in any file inside the payments or billing directory
- **Runtime:** Run automated reconciliation reports that check financial calculations against a source of truth

**Mitigation:**
1. Immediately halt all financial calculations and transactions
2. Run a full reconciliation script to identify and quantify the rounding errors
3. Manually adjust the incorrect ledger entries
4. Deploy a patch that refactors all financial logic to use Decimal or integer (cents)

**E-E-A-T Signals (SEO):**
- **Experience:** From fintech reconciliation audits where "pennies" of rounding errors accumulated into millions of dollars of discrepancies
- **Expertise:** Cites the specific 0.1 + 0.2 failure case and explains why it fails (binary vs. decimal representation)
- **Authoritativeness:** Based on the foundational, non-negotiable rules of financial software engineering
- **Trustworthiness:** Provides the two industry-standard, correct solutions (Decimal or Cents), giving teams flexibility

**Workflows:** `process/release-readiness-runbook` (financial reconciliation check)  
**Pain Points:** `pain-point-01-almost-correct-code`

---

## 44. Prevent Currency Conversion Error

**Slug:** `prevent-currency-conversion-error`  
**Category:** financial | **Severity:** critical

**Problem:** AI-generated code for currency conversion may use a hardcoded conversion rate or fail to account for the high volatility and precision requirements of foreign exchange (FX) rates.

**Prevention Checklist:**
- [ ] Primary Fix: Never hardcode an FX rate. Rates must be fetched in real-time (or near-real-time) from a trusted FX rate provider API
- [ ] Store all monetary values with their currency code (e.g., USD, EUR) using an integer (cents) + currency string
- [ ] Use high-precision Decimal libraries for all conversion calculations to avoid rounding errors (see Guardrail 43)
- [ ] Ensure the FX rate you fetch has more precision than your final calculation (e.g., use a rate with 6 decimal places)
- [ ] Clearly log the exact FX rate used for every conversion transaction for auditability

**Early Detection:**
- **CI/CD:** Run unit tests that mock the FX provider's API and assert that a known conversion is calculated correctly
- **Static:** SAST scan to find any hardcoded numerical values (e.g., 1.12) in financial conversion logic
- **Runtime:** Monitor FX rate provider for API failures. Set alerts if a cached FX rate becomes older than its TTL (e.g., > 1 hour)

**Mitigation:**
1. Immediately disable the currency conversion feature
2. Manually reconcile all transactions that used the incorrect (e.g., stale or hardcoded) rate
3. Deploy a patch that correctly integrates with a real-time FX provider API

**E-E-A-T Signals (SEO):**
- **Experience:** From international e-commerce platforms where stale FX rates led to significant revenue loss
- **Expertise:** Recommends the "integer (cents) + currency code" storage model, which is a best practice for multi-currency systems
- **Authoritativeness:** Aligns with standard treasury and fintech practices that require auditable, real-time FX rates
- **Trustworthiness:** Provides a clear, auditable trail by mandating that the rate itself be logged with the transaction

**Workflows:** `process/release-readiness-runbook` (financial validation)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-05-missing-context`

---

## 45. Prevent Missing Validation for Business Rules

**Slug:** `prevent-missing-validation-for-business-rules`  
**Category:** financial | **Severity:** critical

**Problem:** AI-generated code may handle technical logic (e.g., "charge card") but fail to encode complex business logic (e.g., "but only if user is in-region and not on a 'freemium' plan").

**Prevention Checklist:**
- [ ] Primary Fix: Externalize complex business rules from application code into a separate Business Rules Engine (BRE) like Drools
- [ ] Ground the AI with the business context: "Generate code to charge a user, but first, validate these rules: [list of rules]"
- [ ] Use a cognitive-verifier pattern: prompt a separate AI to "find any business rules this code forgot to check"
- [ ] Use `code-quality/tdd-with-ai-pair` to write unit tests first that define and assert the business rules (e.g., test_freemium_user_cannot_be_charged)
- [ ] Isolate business rules in a spreadsheet (Drools Decision Table) so business analysts can update them without a code deploy

**Early Detection:**
- **CI/CD:** Run a full suite of integration tests that cover all known business rule permutations (e.g., different user types, states, segments)
- **Static:** Code review of financial logic, comparing it against the written product/business requirements
- **Runtime:** Monitor for "invalid state" financial transactions (e.g., a "freemium" user with a non-zero charge in the ledger)

**Mitigation:**
1. Halt the process that is violating the business rule
2. Manually revert all transactions that were created in violation of the rules
3. Deploy a patch that correctly implements the rule, preferably in a BRE

**E-E-A-T Signals (SEO):**
- **Experience:** From fintech projects where business logic (like compliance rules) was buried in code, making it impossible to audit or update
- **Expertise:** Recommends a specific, advanced architecture: separating logic into a Business Rules Engine (BRE) like Drools
- **Authoritativeness:** Aligns with modern enterprise architecture patterns (like AWS Step Functions for orchestration) for managing complex logic
- **Trustworthiness:** Provides a TDD-based approach to ensure business logic is correctly translated into testable code

**Workflows:** `code-quality/tdd-with-ai-pair` (test rules), `process/release-readiness-runbook` (validation)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`, `pain-point-05-missing-context`

---

## 46. Prevent Double-Charging Customers

**Slug:** `prevent-double-charging-customers`  
**Category:** financial | **Severity:** critical

**Problem:** AI-generated payment endpoints are often not "idempotent." If a client retries a request due to a network error, the AI-generated code will process the charge again, leading to a double-charge.

**Prevention Checklist:**
- [ ] Primary Fix: Implement Idempotency. (See Guardrail 48 for the full technical solution)
- [ ] Require a unique, client-generated Idempotency-Key (e.g., a UUID) in the header of all POST payment requests
- [ ] On the server, save the result of the first successful request tied to that key
- [ ] If a retry with the same key is received, do not re-process. Return the cached result
- [ ] At the database level, add a UNIQUE constraint on the transaction_id or order_id to provide a final layer of defense against duplicate processing

**Early Detection:**
- **CI/CD:** Run an integration test that sends the same payment request (with the same Idempotency-Key) twice and asserts that only one charge is created
- **Static:** Code review of all payment endpoints to ensure they check for an Idempotency-Key
- **Runtime:** Monitor for duplicate transaction_ids. Monitor logs for UNIQUE constraint violation errors, which indicate the idempotency check failed but the DB caught it

**Mitigation:**
1. Immediately identify and refund all duplicate charges
2. Implement the full server-side Idempotency-Key caching logic (see Guardrail 48)
3. Contact affected customers to apologize and confirm the refund

**E-E-A-T Signals (SEO):**
- **Experience:** This is the single most common and costly failure mode in distributed payment systems
- **Expertise:** Cites the correct, layered solution: application-level idempotency keys (fast) and database-level UNIQUE constraints (safe)
- **Authoritativeness:** This solution is the industry-standard pattern, famously implemented by Stripe
- **Trustworthiness:** Provides a clear, testable method (send request twice in CI) to prove idempotency is working

**Workflows:** `process/release-readiness-runbook` (idempotency testing)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 47. Prevent Incorrect Tax Calculation

**Slug:** `prevent-incorrect-tax-calculation`  
**Category:** financial | **Severity:** critical

**Problem:** AI-generated code cannot possibly know the 11,000+ constantly-changing sales tax jurisdictions. It will hardcode a rate or use a simple, incorrect formula, leading to massive compliance and liability issues.

**Prevention Checklist:**
- [ ] Primary Fix: NEVER write or generate your own tax calculation logic
- [ ] Integrate a dedicated, third-party tax compliance service (e.g., Avalara, TaxJar, Stripe Tax) via their API
- [ ] Ensure you pass the full, validated address (not just ZIP code) to the tax API for "rooftop-level" accuracy
- [ ] For every transaction, log the exact tax amount and the transaction ID from the tax provider for auditability
- [ ] Use the tax provider's "commit" endpoint to finalize the transaction, adding it to your compliance reports

**Early Detection:**
- **CI/CD:** Run integration tests against the tax provider's sandbox API. Assert that a test address in a known-tax jurisdiction (e.g., Chicago) returns the correct tax
- **Static:** SAST scan to find any hardcoded tax rates (e.g., tax = subtotal * 0.08)
- **Runtime:** Monitor for API errors from the tax provider

**Mitigation:**
1. Immediately disable checkout for jurisdictions with incorrect calculations
2. Contact the tax provider's support to debug the integration
3. (Post-Fix) Run a reconciliation report to determine the amount of tax over- or under-collected and consult an accountant

**E-E-A-T Signals (SEO):**
- **Experience:** From e-commerce platforms that faced state-level audits for miscalculating sales tax
- **Expertise:** Cites the "Buy, Don't Build" rule as the only correct architectural decision for tax compliance
- **Authoritativeness:** References major industry providers (Avalara, TaxJar, Stripe) as the authoritative solution
- **Trustworthiness:** Provides a clear, non-negotiable warning that AI cannot solve this problem and that attempting to will lead to liability

**Workflows:** `process/release-readiness-runbook` (compliance validation)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-05-missing-context`, `pain-point-03-hallucinated-capabilities`

---

## 48. Prevent Missing Idempotency Check

**Slug:** `prevent-missing-idempotency-check`  
**Category:** financial | **Severity:** critical

**Problem:** AI-generated POST/PUT endpoints are not "idempotent" by default. If a client retries a request due to a network error, the server will process the same operation multiple times, creating duplicate data or charges.

**Prevention Checklist:**
- [ ] Primary Fix: Require a unique, client-generated Idempotency-Key (e.g., a UUID) in the HTTP header for all state-changing (POST, PUT, PATCH) requests
- [ ] On the server, check if this key has been seen before within a recent time window (e.g., 24 hours)
- [ ] If key is new: Process the request, then store the HTTP result (e.g., 201 Created, the JSON body) in a cache (like Redis) with the key
- [ ] If key is seen: Do not re-process the request. Immediately return the cached result from the first request
- [ ] Combine this with client-side retry logic (Guardrail 41) that sends the same key on retries

**Early Detection:**
- **CI/CD:** Run an integration test that sends the same POST request (with the same Idempotency-Key) twice and asserts that the resource is created only once
- **Static:** API linter to flag all POST/PUT endpoints that do not check for an Idempotency-Key header
- **Runtime:** Monitor logs for duplicate processing

**Mitigation:**
1. Identify and manually revert all duplicate operations (e.g., refund charges, delete duplicate accounts)
2. Deploy a patch that implements the full server-side idempotency-key-caching logic

**E-E-A-T Signals (SEO):**
- **Experience:** From designing resilient, distributed systems where network failures are a given
- **Expertise:** Cites the specific "idempotency key + cached response" pattern, which is the most robust implementation
- **Authoritativeness:** This is the industry-standard "gold standard" pattern used by payment processors like Stripe
- **Trustworthiness:** Guarantees "exactly-once" semantics for an "at-least-once" delivery environment (i.e., network retries)

**Workflows:** `process/release-readiness-runbook` (idempotency testing)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 49. Prevent Incorrect Discount Application

**Slug:** `prevent-incorrect-discount-application`  
**Category:** financial | **Severity:** high

**Problem:** AI-generated e-commerce logic may miscalculate discounts (e.g., "stacking" multiple promos) or fail to check expiration/usage-limits, leading to revenue loss.

**Prevention Checklist:**
- [ ] Primary Fix: Centralize all discount logic in a single "promotion engine" or microservice, rather than scattering it in the application
- [ ] The engine must process rules in a specific order (e.g., 1. Item-level, 2. Order-level, 3. Shipping)
- [ ] For each promotion, validate all conditions: is it expired? Is the usage_limit reached? Does the cart meet the criteria?
- [ ] Clearly define which discounts can "stack" and which are mutually exclusive
- [ ] Use `code-quality/tdd-with-ai-pair` to write unit tests for every conceivable discount combination

**Early Detection:**
- **CI/CD:** Run a full suite of integration tests that assert complex discount combinations (e.g., "20% off + BOGO") calculate the exact expected price
- **Static:** Code review of any changes to the promotion engine
- **Runtime:** Monitor for an unusually high discount-to-revenue ratio. Alert on any order with a subtotal of $0 or a discount > 75%

**Mitigation:**
1. Immediately disable the "stacking" or misbehaving promotion code
2. Manually cancel any fraudulent orders that have not yet shipped
3. Patch the promotion engine's logic to correctly check exclusivity or calculation order

**E-E-A-T Signals (SEO):**
- **Experience:** From e-commerce incidents where a "stackable" coupon bug allowed users to get $1000 orders for free
- **Expertise:** Recommends a "promotion engine" microservice, an advanced, scalable architecture for handling complex pricing rules
- **Authoritativeness:** Aligns with modern e-commerce platform architecture
- **Trustworthiness:** Provides a clear, test-driven (TDD) approach to validate complex, high-stakes business logic

**Workflows:** `code-quality/tdd-with-ai-pair` (test combinations), `process/release-readiness-runbook` (validation)  
**Pain Points:** `pain-point-01-almost-correct-code`, `pain-point-22-missing-validations`

---

## 50. Prevent Missing Price Validation

**Slug:** `prevent-missing-price-validation`  
**Category:** financial | **Severity:** critical

**Problem:** AI-generated checkout code may trust a price or subtotal field submitted from the client (e.g., the browser), allowing an attacker to modify the request and buy items for $1.

**Prevention Checklist:**
- [ ] Primary Fix: NEVER trust a price field from a client (browser, mobile app)
- [ ] Always re-calculate the total price on the server-side by fetching the item's price directly from the database based on the SKU or product_id
- [ ] The only fields the server should accept from the client are product_id and quantity
- [ ] Validate the calculated price against a "sanity check" rule (e.g., alert if total is $0 or negative)
- [ ] Use the `security/security-guardrails` workflow to scan for this class of vulnerability

**Early Detection:**
- **CI/CD:** Run an integration test that simulates a "man-in-the-middle" attack: submit a checkout cart with a price: 1 field and assert that the request is rejected or corrected
- **Static:** SAST scan to flag any API endpoint that reads a price or total field from a request.body
- **Runtime:** Alert on any completed order where the total_price is $0 or negative

**Mitigation:**
1. Immediately disable the checkout endpoint
2. Manually cancel all fraudulent orders that used the tampered price
3. Deploy a patch that removes all price-handling from the client request and only uses server-side price calculation

**E-E-A-T Signals (SEO):**
- **Experience:** From real-world e-commerce exploits where attackers tampered with client-side form fields to "name their own price"
- **Expertise:** Cites the correct "server-side recalculation" pattern as the only secure solution
- **Authoritativeness:** This is a classic "Improper Input Validation" (CWE-20) and "Business Logic" (CWE-840) vulnerability
- **Trustworthiness:** Provides a clear, non-negotiable rule: "NEVER trust a price field from a client"

**Workflows:** `security/security-guardrails` (comprehensive scan), `process/release-readiness-runbook` (validation)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`, `pain-point-01-almost-correct-code`

---

## Summary

All 8 financial guardrails processed and formatted following the condensed format specification (~200-250 words per guardrail). Each guardrail includes actionable prevention checklist, detection methods, mitigation steps, and real-world E-E-A-T signals for SEO.

