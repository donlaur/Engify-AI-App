# Guardrails Duplicate Check: Existing Workflows, Prompts, Patterns

## Analysis: 70 Guardrail Topics vs Existing Content

### Existing Workflows with Prevention Focus

1. **`security-guardrails`** - "Security Guardrails"
   - **Overlaps with:** Guardrails #11-22 (Security category)
   - **Relationship:** General security workflow covers multiple specific guardrails
   - **Action:** Keep both - workflow is general process, guardrails are specific incidents

2. **`prevent-ai-ignoring-existing-tools`** - "Prevent AI from Ignoring Existing Tools"
   - **Overlaps with:** Potentially duplicates some detection patterns
   - **Relationship:** Process workflow, not incident-specific guardrail
   - **Action:** Keep both - different focus (process vs incident)

3. **`prevent-duplicate-tooling`** - "Prevent Duplicate Tooling"
   - **Overlaps with:** Not directly in 70 guardrails (different problem - tool duplication)
   - **Relationship:** Process issue, not code incident
   - **Action:** Keep - different scope

4. **`catch-mock-metrics`** - "Catch Mock Metrics"
   - **Overlaps with:** Not directly in 70 guardrails
   - **Relationship:** Specific risk management workflow
   - **Action:** Keep - different focus

5. **`release-readiness-runbook`** - "Release Readiness Runbook"
   - **Overlaps with:** Multiple guardrails (testing, security, performance)
   - **Relationship:** General process that includes guardrail checks
   - **Action:** Keep both - workflow is process, guardrails are specific checks

6. **`enforce-quality-gate-hierarchy`** - "Enforce Quality Gate Hierarchy"
   - **Overlaps with:** Multiple guardrails (testing, validation)
   - **Relationship:** Meta-workflow about structuring guardrails
   - **Action:** Keep both - different levels (meta vs specific)

---

## Detailed Overlap Analysis

### Security Category Overlap

**Existing:** `security-guardrails` (general security workflow)

**Guardrails:**
- #11 Prevent Hardcoded Secrets
- #12 Prevent SQL Injection
- #13 Prevent IDOR
- #14 Prevent XSS
- #15 Prevent CSRF
- #16 Prevent Insecure File Upload
- #17 Prevent Missing Rate Limiting
- #18 Prevent Exposed Sensitive Data in Logs
- #19 Prevent Insecure Session Management
- #20 Prevent Path Traversal
- #21 Prevent Missing HTTPS Enforcement
- #22 Prevent Weak Password Validation

**Assessment:** 
- ✅ **No duplicate** - `security-guardrails` is a general process workflow
- ✅ **Guardrails are specific** - Each addresses a specific incident type
- ✅ **Can link** - Guardrails can reference the security-guardrails workflow
- **Action:** Keep all - they complement each other

---

### Testing Category Overlap

**Existing:** 
- `release-readiness-runbook` (includes testing checks)
- `tdd-with-ai-pair` (test-driven development)

**Guardrails:**
- #61 Prevent Missing Edge Case Testing
- #62 Prevent Insufficient Test Coverage
- #63 Prevent Flaky Tests from Timing Issues
- #64 Prevent Missing Integration Tests
- #65 Prevent Test Data Pollution
- #66 Prevent Missing Negative Test Cases
- #67 Prevent Incorrect Test Assertions
- #68 Prevent Missing Performance Tests
- #69 Prevent Test Environment Mismatch
- #70 Prevent Missing Security Tests

**Assessment:**
- ✅ **No duplicate** - Workflows are processes, guardrails are specific test gaps
- ✅ **Different focus** - Workflows = how to test, Guardrails = prevent missing tests
- **Action:** Keep all - complementary content

---

### Performance Category Overlap

**Existing:** None specifically for performance

**Guardrails:**
- #23 Prevent N+1 Query Problem
- #24 Prevent Missing Database Indexes
- #25 Prevent Inefficient Data Structure
- #26 Prevent Memory Leak in Event Handlers
- #27 Prevent Synchronous Blocking Operations
- #28 Prevent Inefficient Caching Strategy
- #29 Prevent Missing Connection Pooling
- #30 Prevent Inefficient Pagination
- #31 Prevent Unbounded Result Sets
- #32 Prevent Missing Load Testing

**Assessment:**
- ✅ **No duplicates** - New category
- **Action:** Add all 10 guardrails

---

### Data Integrity Category Overlap

**Existing:** `stop-schema-guessing` (prevents schema-related issues)

**Guardrails:**
- #1 Prevent Data Corruption in Migrations (schema-related)
- #2 Prevent Type Coercion Errors
- #3 Prevent Race Conditions
- #4 Prevent Silent Data Truncation
- #5 Prevent Orphaned Records
- #6 Prevent Duplicate Data
- #7 Prevent Data Type Mismatch
- #8 Prevent Timezone Errors
- #9 Prevent Buffer Overflow
- #10 Prevent Incomplete Transactions

**Assessment:**
- ✅ **Potential link** - Guardrail #1 can reference `stop-schema-guessing`
- ✅ **No duplicate** - `stop-schema-guessing` is about hallucinations, guardrail is about corruption
- **Action:** Keep both - link them

---

### Process Overlap

**Existing:**
- `keep-prs-under-control` (PR management)
- `daily-merge-discipline` (merge conflicts)

**Guardrails:**
- None directly overlapping (guardrails are code incidents, not process issues)

**Assessment:**
- ✅ **No overlap** - Different domains (process vs code incidents)
- **Action:** No changes needed

---

## Patterns Check

**Prompt Patterns:** Persona, Chain-of-Thought, Few-Shot, etc.
- ✅ **No overlap** - Patterns are prompt engineering techniques, not guardrails

**Design Patterns:** Singleton, Factory, etc.
- ✅ **No overlap** - Design patterns are code architecture, not incident prevention

---

## Prompts Check

Prompts are task-specific instructions (e.g., "Code Review Assistant", "API Endpoint Generator")
- ✅ **No overlap** - Prompts are tools/instructions, guardrails are prevention strategies
- ✅ **Can link** - Guardrails can reference prompts that help prevent incidents

---

## Summary: Duplicate Assessment

### ✅ No Direct Duplicates Found

**Workflows:**
- General processes (e.g., `security-guardrails`, `release-readiness-runbook`)
- Guardrails are specific incident prevention (e.g., `prevent-sql-injection`)

**Relationship:**
- Workflows = "How to do X" (process)
- Guardrails = "Prevent incident Y" (specific prevention)
- They complement each other, don't duplicate

**Potential Links:**
- Guardrails can reference general workflows
- Workflows can reference specific guardrails
- Both solve pain points

---

## Recommendations

1. ✅ **Keep all 70 guardrails** - They're specific incident prevention
2. ✅ **Link guardrails to workflows** - Reference existing workflows where applicable
3. ✅ **Link workflows to guardrails** - Add guardrail references to existing workflows
4. ✅ **No removal needed** - No true duplicates found

---

## Example Relationships

**Workflow:** `security-guardrails`
- **Links to:** Multiple security guardrails (#11-22)
- **Description:** "General security guardrail process. For specific incidents, see..."

**Guardrail:** `prevent-sql-injection`
- **Links to:** `security-guardrails` workflow
- **Description:** "Specific prevention for SQL injection. Part of the broader security guardrails process."

---

## Conclusion

**No duplicates found.** The 70 guardrails are specific incident prevention strategies that complement existing workflows. They can be added as a new `guardrails` category with subcategories, linking to existing workflows where appropriate.
