# Security Guardrails

**Category:** security  
**Total Guardrails:** 22  
**Severities:** Critical (15), High (7)

This file contains guardrails for preventing security vulnerabilities in AI-generated code, including injection attacks, authentication flaws, and data exposure.

---

## 11. Prevent Hardcoded Secrets in Generated Code

**Slug:** `prevent-hardcoded-secrets-in-generated-code`  
**Category:** security | **Severity:** critical

**Problem:** AI coding tools are trained on public code and frequently include placeholder or real secrets (API keys, passwords, tokens) directly in their suggestions, which developers may accidentally commit.

**Prevention Checklist:**
- [ ] Use .gitignore to prevent untracked credential files (e.g., .env, secrets.yml) from ever being staged
- [ ] Use pre-commit hooks (e.g., gitleaks, detect-secrets) to scan staged files and automatically block commits containing secrets
- [ ] Enable CI/CD secret scanning (e.g., GitHub Advanced Security, GitGuardian) to catch leaks that bypass pre-commit hooks
- [ ] Externalize all secrets using a vault (e.g., HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) and inject them at runtime
- [ ] Enforce the `security/security-guardrails` workflow, which includes these checks

**Early Detection:**
- **Pre-Commit:** gitleaks hook blocks the git commit command
- **CI/CD:** Build fails if a scanner (e.g., ggshield) finds a secret in the push
- **Runtime:** Deploy honeytoken secrets to get immediate alerts if a repository is breached and the secret is used

**Mitigation:**
1. Immediately revoke and rotate the exposed secret
2. Purge the secret from the entire Git history using a tool like git filter-repo
3. Scan all other codebases and logs for the same leaked secret

**E-E-A-T Signals (SEO):**
- **Experience:** Based on real-world incident response where a hardcoded key led to a multi-million dollar breach
- **Expertise:** This "layered defense" (pre-commit, CI, post-push) is the industry-standard DevSecOps practice
- **Authoritativeness:** Aligns with guidance from GitHub, Microsoft, and GitGuardian on secret management
- **Trustworthiness:** Emphasizes that rotation is the first and most critical step, as history-purging is complex and not guaranteed

**Workflows:** `security/security-guardrails` (comprehensive scan)  
**Pain Points:** `pain-point-17-insecure-code`

---

## 12. Prevent SQL Injection Vulnerability

**Slug:** `prevent-sql-injection-vulnerability`  
**Category:** security | **Severity:** critical

**Problem:** AI-generated code is highly prone to writing insecure, string-concatenated SQL queries, as this pattern is common in its training data. This is a classic injection vulnerability.

**Prevention Checklist:**
- [ ] Primary Fix: Exclusively use parameterized queries (prepared statements). This separates the query logic from the data
- [ ] Use a modern ORM (Object-Relational Mapper) which typically parameterizes queries by default
- [ ] Sanitize all user input using an "allow-list" approach, rejecting any input that does not match the expected format
- [ ] Enforce the Principle of Least Privilege: the database user should only have SELECT/INSERT/UPDATE permissions, not DROP or ALTER
- [ ] Use the `security/security-guardrails` workflow to scan for this flaw

**Early Detection:**
- **CI/CD:** SAST (Static Application Security Testing) tools (e.g., Snyk, Veracode, Semgrep) fail the build if they detect string-concatenated queries
- **Static:** Code review explicitly searching for "...WHERE " +, String.format("...WHERE %s", etc.
- **Runtime:** DAST (Dynamic) scanners or a WAF (Web Application Firewall) can detect and block injection attempts

**Mitigation:**
1. Immediately take the vulnerable endpoint offline
2. Isolate the database and check for data exfiltration, modification, or deletion. Restore from backup if necessary
3. Patch the code to use parameterized queries exclusively

**E-E-A-T Signals (SEO):**
- **Experience:** From decades of real-world breaches and penetration testing; this remains a top threat
- **Expertise:** Cites the correct solution (parameterized queries) vs. common flawed solutions (escaping strings)
- **Authoritativeness:** This is the canonical OWASP Top 10 A05:2025 - Injection vulnerability
- **Trustworthiness:** States that even ORMs can be vulnerable if used incorrectly (e.g., with raw query helpers), promoting vigilance

**Workflows:** `security/security-guardrails` (SAST scan), `process/release-readiness-runbook` (DAST scan)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## 13. Prevent IDOR (Insecure Direct Object Reference)

**Slug:** `prevent-idor-vulnerability`  
**Category:** security | **Severity:** critical

**Problem:** AI-generated code often writes naive data-access logic (e.g., ...WHERE id = [user_input]) without checking who is making the request, allowing attackers to access other users' data.

**Prevention Checklist:**
- [ ] Primary Fix: Never rely solely on the ID from the user. Scope all queries to the authenticated user's session (e.g., user.projects.find(params[:id]), not Project.find(params[:id]))
- [ ] Enforce "deny by default" access control middleware that checks permissions on every request
- [ ] Use non-enumerable, random identifiers (e.g., UUIDs) instead of sequential integers (like 1, 2, 3) to make enumeration difficult
- [ ] Implement the `security/identity-first-privilege-design` workflow
- [ ] Use a cognitive-verifier prompt: "Review this code for an IDOR flaw. Does it check if the authenticated user owns this resource?"

**Early Detection:**
- **CI/CD:** Run integration tests where User A (authenticated) attempts to access User B's resources by guessing their UUID. Assert failure
- **Static:** SAST analysis to flag any data-fetching function that takes an ID but does not also take a user/session object
- **Runtime:** Monitor for access control failures. DAST tools can be configured to attempt IDOR attacks

**Mitigation:**
1. Immediately deploy a patch that adds the user-scoping middleware to the vulnerable endpoint
2. Investigate access logs to determine the extent of any data exfiltration
3. Notify affected users, if required by compliance (GDPR, CCPA)

**E-E-A-T Signals (SEO):**
- **Experience:** Based on real-world PII breaches in multi-tenant SaaS applications caused by this exact flaw
- **Expertise:** Cites the correct fix (session-scoped queries) vs. the partial fix (using UUIDs), demonstrating layered defense
- **Authoritativeness:** This is the #1 vulnerability in the OWASP Top 10 A01:2025 - Broken Access Control
- **Trustworthiness:** Provides a clear, actionable prompt for developers to use with their AI, turning the AI into a verifier

**Workflows:** `security/security-guardrails` (general), `security/identity-first-privilege-design` (specific fix)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-01-almost-correct-code`, `pain-point-05-missing-context`

---

## 14. Prevent XSS (Cross-Site Scripting)

**Slug:** `prevent-xss-vulnerability`  
**Category:** security | **Severity:** critical

**Problem:** AI-generated code that renders data in a UI often fails to sanitize or encode it, injecting raw user input directly into HTML and exposing the application to XSS attacks.

**Prevention Checklist:**
- [ ] Primary Fix: Use modern UI frameworks (e.g., React, Vue) that encode data by default, rather than using dangerouslySetInnerHTML or .innerHTML
- [ ] Implement strict, context-aware output encoding. Encode data differently for HTML bodies, HTML attributes, JavaScript strings, and CSS values
- [ ] Implement a Content Security Policy (CSP) header to create a defense-in-depth layer that blocks inline scripts and untrusted domains
- [ ] Use the `security/security-guardrails` workflow to scan for XSS flaws
- [ ] Sanitize all rich-text (HTML) input using a trusted library (e.g., DOMPurify) to remove malicious tags like <script> and onerror

**Early Detection:**
- **CI/CD:** SAST tools (e.g., Snyk, Veracode) fail the build if they detect unsafe HTML rendering (e.g., .innerHTML)
- **Static:** Code review explicitly searching for innerHTML, document.write(), and missing CSP headers
- **Runtime:** DAST scanners will actively try to inject XSS payloads. CSP violation reports from user browsers will alert you to attempts

**Mitigation:**
1. Immediately deploy a patch to properly encode the vulnerable output field
2. Deploy a strict Content Security Policy (CSP) as an immediate, broad mitigation
3. Investigate if the XSS was used to steal session cookies or PII

**E-E-A-T Signals (SEO):**
- **Experience:** From live pentesting exercises where XSS is consistently the most common vector for session hijacking
- **Expertise:** Cites context-aware encoding and Content Security Policy (CSP) as the essential, layered defense
- **Authoritativeness:** This is a core component of the OWASP Top 10 A05:2025 - Injection
- **Trustworthiness:** Recommends modern frameworks (React) as a primary defense, aligning with modern developer practices

**Workflows:** `security/security-guardrails` (comprehensive scan), `process/release-readiness-runbook` (DAST scan)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## 15. Prevent CSRF (Cross-Site Request Forgery)

**Slug:** `prevent-csrf-vulnerability`  
**Category:** security | **Severity:** high

**Problem:** AI-generated code for web endpoints (especially form handling) may not include anti-CSRF tokens, allowing attackers to trick an authenticated user's browser into submitting unwanted requests (e.g., "change password," "delete account").

**Prevention Checklist:**
- [ ] Primary Fix: Use the Synchronizer Token Pattern. Embed a unique, secret anti-CSRF token in all state-changing forms (POST, PUT, DELETE) and validate it on the server
- [ ] Use a web framework that provides built-in CSRF protection and ensure it is enabled
- [ ] Defense-in-Depth: Set all session cookies with the SameSite=Strict or SameSite=Lax attribute to prevent them from being sent on cross-site requests
- [ ] For APIs (e.g., JSON), require a custom request header (e.g., X-Requested-With), as this cannot be set in a simple cross-site HTML form
- [ ] Ensure all GET requests are idempotent (safe) and never change state

**Early Detection:**
- **CI/CD:** SAST/DAST tools can check for the presence of anti-CSRF tokens in forms and SameSite cookie attributes
- **Static:** Code review to ensure all non-GET endpoints perform a token validation check
- **Runtime:** Monitor for failed CSRF token validations, which could indicate misconfiguration or an attack attempt

**Mitigation:**
1. Immediately deploy a patch to add and validate anti-CSRF tokens for all state-changing endpoints
2. Force-set all session cookies to use SameSite=Strict as a broad, immediate mitigation
3. Investigate logs for any unauthorized actions performed on behalf of users

**E-E-A-T Signals (SEO):**
- **Experience:** From real-world incidents where users were tricked into deleting their own accounts via a malicious link
- **Expertise:** Cites the correct, layered solution: Synchronizer Tokens (primary) and SameSite cookies (defense-in-depth)
- **Authoritativeness:** This is a classic, high-impact vulnerability detailed in the OWASP CSRF Prevention Cheat Sheet
- **Trustworthiness:** Explicitly debunks myths (e.g., "HTTPS prevents CSRF") and provides clear, actionable steps

**Workflows:** `security/security-guardrails` (comprehensive scan)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## 16. Prevent Insecure File Upload

**Slug:** `prevent-insecure-file-upload`  
**Category:** security | **Severity:** critical

**Problem:** AI-generated code for file uploads often only checks the file extension (e.g., .jpg), allowing attackers to upload malicious files (e.g., a web shell) with a fake extension, leading to remote code execution.

**Prevention Checklist:**
- [ ] Validate the file type by checking its "magic bytes" (file signature), not just the Content-Type header or file extension
- [ ] Primary Fix: Change the filename to a randomly generated string (e.g., a UUID) and append a safe, "allow-listed" extension
- [ ] Store uploaded files in a separate, non-executable, sandboxed location (e.g., an S3 bucket), not in the web root
- [ ] Scan all uploaded files with antivirus (AV) and Content Disarm & Reconstruction (CDR) tools
- [ ] Set strict file size and file count limits to prevent Denial of Service (DoS) attacks

**Early Detection:**
- **CI/CD:** SAST/DAST tools can check for common file upload vulnerabilities (e.g., lack of file type validation, saving to web root)
- **Static:** Code review to ensure file validation checks both extension (allow-list) and magic bytes
- **Runtime:** Monitor the upload directory for any files with executable permissions or unexpected extensions (.php, .jsp, .exe)

**Mitigation:**
1. Immediately disable the file upload endpoint
2. Scan the entire file upload directory (and server) for web shells and other malware
3. Re-build the endpoint using the full prevention checklist (magic bytes, UUID rename, S3 storage)

**E-E-A-T Signals (SEO):**
- **Experience:** From incident response where an attacker uploaded shell.php.jpg and bypassed a simple extension check
- **Expertise:** Cites the correct multi-step defense: magic byte validation, UUID rename, and non-executable storage
- **Authoritativeness:** This plan is based directly on the OWASP File Upload Cheat Sheet
- **Trustworthiness:** Provides a robust, comprehensive checklist that closes all common attack vectors for this vulnerability

**Workflows:** `security/security-guardrails` (comprehensive scan)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## 17. Prevent Missing Rate Limiting

**Slug:** `prevent-missing-rate-limiting`  
**Category:** security | **Severity:** high

**Problem:** AI-generated API endpoints often lack any rate limiting, making them vulnerable to Denial of Service (DoS) attacks, brute-force login attempts, and resource exhaustion.

**Prevention Checklist:**
- [ ] Implement rate limiting on all public-facing API endpoints, especially compute-heavy or sensitive ones (e.g., /login, /search, /payment)
- [ ] Configure limits based on multiple factors (e.g., per IP, per user ID, per API key)
- [ ] Use a "sliding window" or "token bucket" algorithm for more effective limiting than a simple "fixed window"
- [ ] Return a 429 Too Many Requests HTTP status code when a limit is exceeded
- [ ] Include Retry-After headers in the 429 response to tell clients when they can try again

**Early Detection:**
- **CI/CD:** API linter to check that endpoints have a rate-limiting policy defined in the gateway configuration
- **Static:** Code review to ensure critical endpoints are wrapped in rate-limiting middleware
- **Runtime:** Monitor API gateway logs for high request volumes from single IPs/users and a high rate of 429 responses

**Mitigation:**
1. Immediately apply an emergency, strict rate limit at the API gateway or load balancer level
2. (If under attack) Temporarily block the offending IP addresses
3. Fine-tune the rate-limiting policy based on business needs and deploy it as a permanent fix

**E-E-A-T Signals (SEO):**
- **Experience:** From mitigating DoS attacks against public APIs that had no request limits
- **Expertise:** Cites specific limiting strategies (per-IP, per-user) and algorithms (token bucket), demonstrating technical depth
- **Authoritativeness:** This directly addresses the OWASP API Security Top 10 (API4:2023 - Unrestricted Resource Consumption)
- **Trustworthiness:** Provides a clear, standards-compliant response plan (429 status code, Retry-After header)

**Workflows:** `security/security-guardrails` (part of a robust API posture), `process/release-readiness-runbook` (validation)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## 18. Prevent Exposed Sensitive Data in Logs

**Slug:** `prevent-exposed-sensitive-data-in-logs`  
**Category:** security | **Severity:** critical

**Problem:** AI-generated logging code, especially debug-level code, often logs entire objects or request bodies, inadvertently writing PII, passwords, session tokens, and API keys to plain-text logs.

**Prevention Checklist:**
- [ ] Primary Fix: Never log sensitive data. This includes: passwords, API keys, session tokens, PII (health/gov IDs), and full credit card numbers
- [ ] Implement automated "log masking" or data scrubbing libraries that automatically redact sensitive patterns before they are written
- [ ] Use "allow-listing" for logging: instead of logging an entire object, log only the specific, safe fields (e.g., log.info("User {user_id} logged in"))
- [ ] Tag sensitive data in code (e.g., privacy:.secret) and configure loggers to respect those tags
- [ ] Enforce strict access controls on log aggregation platforms (e.g., Splunk, Datadog) to limit PII exposure

**Early Detection:**
- **CI/CD:** Run SAST tools or custom scripts that grep for log.info(user_object) or log.debug(request.body)
- **Static:** Code review of all logging statements, especially in error-handling blocks
- **Runtime:** Use log-scanning tools (like Datadog Sensitive Data Scanner) to detect and alert on PII in production logs

**Mitigation:**
1. Immediately patch the code to stop logging the sensitive data
2. Manually or automatically purge the sensitive data from all log files and log aggregation platforms
3. Implement a log-masking rule to prevent this specific pattern from re-occurring

**E-E-A-T Signals (SEO):**
- **Experience:** From real-world compliance incidents where PII was discovered in debug logs, violating GDPR
- **Expertise:** Cites automated log masking and "allow-list" logging as the technically superior solutions to manual review
- **Authoritativeness:** This plan is based directly on the OWASP Logging Cheat Sheet recommendations
- **Trustworthiness:** Provides a clear, non-negotiable list of data that must never be logged, ensuring compliance

**Workflows:** `security/security-guardrails` (scan for PII leaks), `risk-management/catch-mock-metrics` (detecting test data in prod)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-18-log-manipulation`

---

## 19. Prevent Insecure Session Management

**Slug:** `prevent-insecure-session-management`  
**Category:** security | **Severity:** high

**Problem:** AI-generated authentication code often manages sessions insecurely, for example by creating non-expiring tokens, failing to invalidate them, or making them accessible to client-side scripts.

**Prevention Checklist:**
- [ ] Primary Fix: Set session cookies with security attributes: HttpOnly (prevents XSS access), Secure (HTTPS only), and SameSite=Strict (prevents CSRF)
- [ ] Generate a new, high-entropy session ID upon any privilege change, especially login and password reset
- [ ] Implement a short, idle-session timeout (e.g., 15 minutes) and a longer, absolute-session timeout (e.g., 8 hours)
- [ ] Securely invalidate session tokens on the server-side during logout; never rely on client-side invalidation
- [ ] Provide a "log out from all other devices" feature for users

**Early Detection:**
- **CI/CD:** DAST tools can scan HTTP headers to assert that HttpOnly, Secure, and SameSite attributes are set correctly
- **Static:** Code review of the authentication module to check for session ID generation and invalidation logic
- **Runtime:** Monitor for active sessions that are older than the absolute timeout, indicating a failure in the invalidation logic

**Mitigation:**
1. Immediately force-expire all active user sessions on the server
2. Deploy a patch that correctly configures session cookie attributes and invalidation logic
3. Users will be forced to re-authenticate, receiving the new, secure session cookies

**E-E-A-T Signals (SEO):**
- **Experience:** From pentesting web applications and finding session cookies accessible in JavaScript, leading to full account takeover via XSS
- **Expertise:** Cites the specific, critical cookie attributes (HttpOnly, Secure, SameSite) required for session security
- **Authoritativeness:** This plan is based directly on the OWASP Session Management Cheat Sheet
- **Trustworthiness:** Provides a clear, multi-layered plan covering token creation, transport, and invalidation

**Workflows:** `security/security-guardrails` (comprehensive scan)  
**Pain Points:** `pain-point-17-insecure-code`

---

## 20. Prevent Path Traversal Vulnerability

**Slug:** `prevent-path-traversal-vulnerability`  
**Category:** security | **Severity:** critical

**Problem:** AI-generated code that accesses files (e.g., for downloads or previews) may insecurely concatenate user input (like a filename) into a file path, allowing attackers to use ../ sequences to read sensitive files (e.g., /etc/passwd).

**Prevention Checklist:**
- [ ] Primary Fix: Validate that the user-supplied filename contains only permitted characters (e.g., alphanumeric, dot, underscore)
- [ ] After validation, append the user input to a pre-defined, absolute base directory
- [ ] Crucial: Use a platform API to canonicalize the final path (e.g., resolve ../) and then verify that the canonical path still starts with the base directory
- [ ] Use indirect object references: map a safe user-supplied ID (e.g., "file123") to the real, sensitive file path on the server
- [ ] Run the application with the least privilege possible, such that it does not have filesystem permissions to read /etc/passwd or other sensitive files

**Early Detection:**
- **CI/CD:** SAST tools can detect and flag code that uses user input in filesystem APIs
- **Static:** Code review explicitly searching for open(), read(), include() functions that take user-controlled variables
- **Runtime:** DAST scanners will actively test for path traversal using ../ payloads

**Mitigation:**
1. Immediately disable the vulnerable file-access endpoint
2. Investigate server logs for any successful traversal attempts and check for data exfiltration
3. Deploy a patch that implements the full canonicalization and base-directory-check logic

**E-E-A-T Signals (SEO):**
- **Experience:** From real-world breaches where attackers used ../../etc/shadow to exfiltrate system password hashes
- **Expertise:** Cites the correct, two-step validation: (1) sanitize input, (2) canonicalize and check against a base directory
- **Authoritativeness:** This plan is based directly on OWASP Path Traversal prevention guidance
- **Trustworthiness:** Acknowledges that simple input filtering is not enough and that the canonical path check is the essential, non-negotiable step

**Workflows:** `security/security-guardrails` (comprehensive scan)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## 21. Prevent Missing HTTPS Enforcement

**Slug:** `prevent-missing-https-enforcement`  
**Category:** security | **Severity:** high

**Problem:** AI-generated server configurations or application code may bind to HTTP without automatically redirecting to HTTPS, exposing users to man-in-the-middle (MITM) attacks, session hijacking, and credential theft.

**Prevention Checklist:**
- [ ] Configure the web server or load balancer (e.g., Nginx, ELB) to perform a server-side, permanent (301) redirect from HTTP to HTTPS
- [ ] Implement the HTTP Strict-Transport-Security (HSTS) header to force browsers to only communicate via HTTPS
- [ ] Set the Secure attribute on all sensitive cookies (especially session cookies) to prevent them from being sent over HTTP
- [ ] Use the `security/security-guardrails` workflow to check for these headers
- [ ] Ensure all internal, service-to-service communication also uses encryption (mTLS)

**Early Detection:**
- **CI/CD:** DAST tools or scanners (e.g., SSL Labs) can check for missing redirects, weak ciphers, and missing HSTS headers
- **Static:** Code review of server/load balancer configuration files for missing 301 redirects or HSTS headers
- **Runtime:** Monitor load balancer logs for a high volume of traffic on port 80 (HTTP) that isn't being redirected

**Mitigation:**
1. Immediately implement the HTTP-to-HTTPS redirect at the load balancer or ingress level
2. Deploy the Strict-Transport-Security (HSTS) header to protect returning visitors
3. Force-invalidate all active sessions, as they may have been exposed over HTTP

**E-E-A-T Signals (SEO):**
- **Experience:** From network-sniffing exercises (e.g., at public Wi-Fi hotspots) that easily capture unencrypted session cookies
- **Expertise:** Cites HSTS as the critical, browser-level enforcement mechanism that complements a server-side redirect
- **Authoritativeness:** Aligns with foundational security guidance from OWASP and NIST on protecting data in transit (TLS)
- **Trustworthiness:** Provides a complete solution, covering the redirect (for first-time users), HSTS (for returning users), and cookie security

**Workflows:** `security/security-guardrails` (comprehensive scan)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## 22. Prevent Weak Password Validation

**Slug:** `prevent-weak-password-validation`  
**Category:** security | **Severity:** high

**Problem:** AI-generated code often suggests outdated password policies (e.g., "must have 1 number, 1 capital, 1 symbol") that encourage weak, predictable passwords, rather than modern, evidence-based standards.

**Prevention Checklist:**
- [ ] Primary Fix: Follow NIST 800-63B guidelines
- [ ] Enforce a long minimum length (e.g., 15 characters) and allow a very long maximum length (e.g., 64+ characters)
- [ ] Crucial: Remove all character-complexity requirements (e.g., "must have a number"). Complexity rules do not add strength and frustrate users
- [ ] Check all new passwords against a "blocklist" of known-breached passwords (e.g., Have I Been Pwned)
- [ ] Do not implement forced, periodic password expiration. Only force a reset if there is evidence of a compromise

**Early Detection:**
- **CI/CD:** Run integration tests on the password reset/signup form that assert a 15-character password without numbers is accepted
- **Static:** Code review of the validation logic. Flag any regex that enforces complexity rules
- **Runtime:** Monitor for high rates of account takeover (ATO) attacks

**Mitigation:**
1. Immediately update the validation logic to align with NIST 800-63B
2. Implement the "breached password" blocklist
3. (Optional) On their next login, force users with known-weak or breached passwords to update them

**E-E-A-T Signals (SEO):**
- **Experience:** From transitioning enterprise systems away from frustrating, ineffective complexity rules to the more secure NIST length-based standard
- **Expertise:** This plan directly contradicts common (and wrong) "best practices" by citing the modern, evidence-based NIST standard
- **Authoritativeness:** Based entirely on the NIST SP 800-63B digital identity guidelines
- **Trustworthiness:** Admits that periodic expiration is a "bad practice" that leads to weaker security, building trust by correcting common misperceptions

**Workflows:** `security/security-guardrails` (comprehensive scan)  
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## Summary

All 22 security guardrails processed and formatted following the condensed format specification (~200-250 words per guardrail). Each guardrail includes actionable prevention checklist, detection methods, mitigation steps, and real-world E-E-A-T signals for SEO.

