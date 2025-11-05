# Prompt Security Scoring Guide

## Problem Statement

The security scores for prompts were consistently low because the audit rubric was checking for **application-level security concerns** (OWASP Top 10, security headers, authentication patterns) that don't apply to prompts themselves.

## Understanding Prompts vs Applications

**Prompts are text instructions** - they don't have:
- Security headers
- Authentication/authorization systems
- Direct OWASP compliance needs
- Input validation (they ARE the input)

**Applications have security** - they need:
- OWASP Top 10 compliance
- Security headers (CSP, HSTS, etc.)
- Authentication/authorization
- Input validation and sanitization
- Threat modeling

## What Security Scoring Should Evaluate for Prompts

For prompts, security scoring should evaluate:

### ✅ Good Security Practices (Score 8-10)
- Prompt actively encourages secure coding practices
- Includes security warnings about common pitfalls
- For code generation prompts: Generates secure code patterns (parameterized queries, input validation, no hardcoded secrets)
- Explicitly mentions security considerations or best practices
- Warns about SQL injection, XSS, authentication issues

### ✅ Neutral/Appropriate (Score 5-6) - DEFAULT
- Prompt doesn't encourage insecure patterns
- Handles security appropriately for its purpose
- Not security-focused but doesn't teach bad practices
- **Most prompts should score here** - they're not security-focused but aren't insecure

### ❌ Insecure Patterns (Score 1-3)
- Prompt encourages hardcoded credentials or secrets
- Generates SQL injection vulnerabilities
- Encourages weak encryption or authentication
- Teaches insecure coding patterns
- **Only penalize if prompt actively teaches insecure practices**

## Updated Rubric Criteria

The audit rubric now evaluates:

1. **Does the prompt encourage secure coding practices?**
   - For code generation prompts: Does it generate secure code?
   - Does it mention security considerations?

2. **Does it warn about common security pitfalls?**
   - SQL injection, XSS, authentication issues
   - Input validation and sanitization

3. **Does it avoid prompting for insecure patterns?**
   - No hardcoded credentials
   - No weak encryption
   - No SQL injection vulnerabilities

4. **Does it include security considerations or best practices?**
   - Security-focused prompts should emphasize proper validation
   - General prompts should at least not encourage insecure patterns

## Scoring Guidance

### Default Score for Non-Security Prompts

**Most prompts are NOT security-focused.** They should receive a **default score of 5-6** if they:
- Don't encourage insecure patterns
- Handle security appropriately for their purpose
- Are neutral on security (not their main focus)

### When to Score Lower

Only score lower (1-4) if the prompt:
- **Actively teaches insecure practices**
- Encourages hardcoded secrets
- Generates vulnerable code patterns
- Promotes unsafe coding practices

### When to Score Higher

Score higher (7-10) if the prompt:
- **Actively encourages secure practices**
- Includes security warnings
- Generates secure code patterns
- Emphasizes proper validation and sanitization

## Examples

### Example 1: Code Review Prompt (Score 5-6)
```
"Review this code for bugs and improvements"
```
- **Not security-focused** but doesn't encourage insecure patterns
- **Default score: 5-6**
- ✅ Appropriate for a general code review prompt

### Example 2: Secure API Prompt (Score 8-9)
```
"Generate a secure API endpoint that:
- Uses parameterized queries to prevent SQL injection
- Validates and sanitizes all input
- Implements proper authentication
- Includes security headers"
```
- **Actively promotes secure practices**
- **Score: 8-9**
- ✅ High score for security-focused prompt

### Example 3: Database Query Prompt (Score 2-3)
```
"Generate SQL queries that concatenate user input directly"
```
- **Teaches insecure patterns** (SQL injection risk)
- **Score: 2-3**
- ❌ Low score - actively insecure

## Impact

This change ensures:
- **Non-security prompts** get appropriate scores (5-6) instead of being penalized
- **Security-focused prompts** are rewarded for good practices (8-10)
- **Insecure prompts** are still penalized (1-3)
- **Overall scores** better reflect prompt quality without false security penalties

## Related Files

- `scripts/content/audit-prompts-patterns.ts` - Audit rubric with updated security criteria
- `docs/development/AUDIT_VERSION_3_UPDATE.md` - Audit versioning documentation


