You are an expert prompt engineering consultant analyzing Engify.ai, an AI training platform for engineering teams.

## CRITICAL: What We ALREADY Have

**DO NOT suggest duplicates of what we already have. Review this section carefully before making suggestions.**

### Existing Patterns (15 total):
- **Chain-of-Thought** (ID: `chain-of-thought`, Category: COGNITIVE, Level: intermediate)
- **Cognitive Verifier** (ID: `cognitive-verifier`, Category: COGNITIVE, Level: intermediate)
- **Hypothesis Testing** (ID: `hypothesis-testing`, Category: COGNITIVE, Level: advanced)
- **RAG (Retrieval Augmented Generation)** (ID: `rag`, Category: COGNITIVE, Level: advanced)
- **Reverse Engineering** (ID: `reverse-engineering`, Category: COGNITIVE, Level: advanced)
- **Audience Persona** (ID: `audience-persona`, Category: FOUNDATIONAL, Level: beginner)
- **Few-Shot** (ID: `few-shot`, Category: FOUNDATIONAL, Level: beginner)
- **Persona** (ID: `persona`, Category: FOUNDATIONAL, Level: beginner)
- **Zero-Shot** (ID: `zero-shot`, Category: FOUNDATIONAL, Level: beginner)
- **Critique & Improve** (ID: `critique-improve`, Category: ITERATIVE, Level: intermediate)
- **Question Refinement** (ID: `question-refinement`, Category: ITERATIVE, Level: intermediate)
- **KERNEL Framework** (ID: `kernel`, Category: STRUCTURAL, Level: advanced)
- **Recipe** (ID: `recipe`, Category: STRUCTURAL, Level: intermediate)
- **Template** (ID: `template`, Category: STRUCTURAL, Level: beginner)
- **Visual Separators** (ID: `visual-separators`, Category: STRUCTURAL, Level: intermediate)

### Existing Prompt Categories (13 total):
- `architecture`
- `code-generation`
- `code-review`
- `debugging`
- `design`
- `documentation`
- `general`
- `leadership`
- `learning`
- `product`
- `refactoring`
- `strategy`
- `testing`

### Existing Roles (9 total):
- `architect`
- `devops-sre`
- `director`
- `engineer`
- `engineering-manager`
- `product-manager`
- `product-owner`
- `qa`
- `scrum-master`

### Patterns Already Used in Our Prompts:
- `audience-persona`
- `chain-of-thought`
- `persona`
- `template`

### Sample Prompts (30 of 102 total):
1. **Code Review Assistant**
   - Category: `code-generation`
   - Role: `engineer`
   - Pattern: `persona`
   - Description: Get detailed code reviews with actionable feedback on security, performance, and...
2. **API Endpoint Generator**
   - Category: `code-generation`
   - Role: `engineer`
   - Pattern: `template`
   - Description: Generate complete REST API endpoints with validation, error handling, and docume...
3. **React Component Builder**
   - Category: `code-generation`
   - Role: `engineer`
   - Pattern: `template`
   - Description: Generate production-ready React components with TypeScript, props validation, an...
4. **Bug Investigation Helper**
   - Category: `debugging`
   - Role: `engineer`
   - Pattern: `chain-of-thought`
   - Description: Systematic approach to debugging complex issues with root cause analysis...
5. **Performance Bottleneck Analyzer**
   - Category: `debugging`
   - Role: `engineer`
   - Pattern: `chain-of-thought`
   - Description: Identify and resolve performance issues in your application...
6. **Architecture Decision Record (ADR)**
   - Category: `documentation`
   - Role: `engineering-manager`
   - Pattern: `template`
   - Description: Create comprehensive ADRs for technical decisions with context and consequences...
7. **API Documentation Generator**
   - Category: `documentation`
   - Role: `engineer`
   - Pattern: `template`
   - Description: Generate comprehensive API documentation with examples and error cases...
8. **Unit Test Generator**
   - Category: `testing`
   - Role: `engineer`
   - Pattern: `template`
   - Description: Generate comprehensive unit tests with edge cases and mocking...
9. **E2E Test Scenario Builder**
   - Category: `testing`
   - Role: `qa`
   - Pattern: `template`
   - Description: Create end-to-end test scenarios for critical user flows...
10. **Code Refactoring Assistant**
   - Category: `refactoring`
   - Role: `engineer`
   - Pattern: `chain-of-thought`
   - Description: Refactor code for better maintainability, performance, and readability...

## Site Context

**Mission:** Help developers, engineers, and product managers use AI better through prompt engineering patterns and ready-to-use prompts.

**Pattern Categories Available:** COGNITIVE, FOUNDATIONAL, ITERATIVE, STRUCTURAL
**Pattern Levels Available:** intermediate, advanced, beginner

## Your Task

**IMPORTANT:** Before suggesting anything, verify it doesn't already exist in the lists above. Focus ONLY on genuine gaps.

Analyze the gaps and opportunities in this prompt engineering library. Provide:

### 1. Suggested New Patterns (5-10)
**CRITICAL:** Do NOT suggest patterns we already have. Check the "Existing Patterns" list above first.

Research proven prompt engineering patterns from:
- OpenAI's prompt engineering guide
- Anthropic's prompt engineering research
- Academic papers on prompt engineering
- Industry best practices

For each suggested pattern, provide:
- Name (clear, descriptive - must be different from existing patterns)
- ID (kebab-case, unique - check against existing IDs)
- Category (FOUNDATIONAL, STRUCTURAL, COGNITIVE, or ITERATIVE)
- Level (beginner, intermediate, or advanced)
- Description (1-2 sentences)
- Reason (why this fills a gap - explain what's missing that this addresses)

**Focus ONLY on:**
- Patterns we DON'T have yet (verify against existing list)
- Patterns that address different problem types than existing ones
- Patterns for skill levels we're missing
- Industry-standard patterns we're genuinely missing

**DO NOT suggest:**
- Chain-of-Thought (we have it)
- Any pattern already in our existing list
- Variations of existing patterns unless they solve distinctly different problems

### 2. Suggested New Prompts (10-20)
**CRITICAL:** Check existing categories and roles before suggesting. Only suggest new categories/roles if absolutely necessary.

Identify gaps in our prompt library and suggest prompts that:
- Cover missing categories (verify against existing categories list)
- Target missing roles (check existing roles list - we may already have DevOps, QA, etc.)
- Use patterns we have but aren't utilizing effectively
- Address common engineering tasks we're not covering
- Fill gaps in experience levels (beginner vs advanced)

For each suggested prompt, provide:
- Title (clear, action-oriented)
- Description (what it does, why it's useful)
- Category (prefer existing categories - only suggest new if truly necessary)
- Role (prefer existing roles - only suggest new if we're missing that role entirely)
- Pattern (which pattern it uses - can be null if none)
- Level (beginner, intermediate, or advanced)
- Reason (why this fills a gap - be specific about what's missing)

### 3. Missing Roles
**CRITICAL:** Check the "Existing Roles" list above first. Only list roles we DON'T have.

List engineering roles we should target but don't have prompts for yet. 
**DO NOT list:** architect, devops-sre, director, engineer, engineering-manager, product-manager, product-owner, qa, scrum-master (we already have these)

Focus on roles like: DevOps Engineer, QA Engineer, Data Scientist, Site Reliability Engineer, Security Engineer, etc. - but ONLY if they're not in our existing roles list.

### 4. Missing Categories
**CRITICAL:** Check the "Existing Prompt Categories" list above first. Only list categories we DON'T have.

List prompt categories we should add but don't have yet.
**DO NOT list:** code-generation, debugging, documentation, testing, refactoring, architecture, learning, general, code-review, leadership, product, design, strategy (we already have these)

Only suggest genuinely new categories that would serve different use cases than existing ones.

### 5. Level Distribution Analysis
For each category, identify if we're missing beginner, intermediate, or advanced prompts/patterns.

### 6. Research Insights
Share 2-3 insights from current prompt engineering research that could inform new patterns or prompts:
- Emerging techniques
- Best practices we're not covering
- Industry needs we're missing

## Output Format

Provide your analysis as a clear, actionable markdown document with bulleted lists. Use this structure:

### 1. Suggested New Patterns

For each suggested pattern, provide a bullet point with:
- **Pattern Name** (ID: pattern-id)
  - Category: COGNITIVE | STRUCTURAL | FOUNDATIONAL | ITERATIVE
  - Level: beginner | intermediate | advanced
  - Description: Brief description of what this pattern does
  - Reason: Why this fills a gap (explain what's missing that this addresses)

### 2. Suggested New Prompts

For each suggested prompt, provide a bullet point with:
- **Prompt Title**
  - Category: Existing category OR new category name
  - Role: Existing role OR new role name
  - Pattern: Pattern ID to use (or "None" if no pattern)
  - Level: beginner | intermediate | advanced
  - Description: What this prompt does and why it's useful
  - Reason: Why this fills a gap (be specific about what's missing)

### 3. Missing Roles

List engineering roles we DON'T have as bullet points:
- Role name 1
- Role name 2
- etc.

### 4. Missing Categories

List prompt categories we DON'T have as bullet points:
- Category name 1
- Category name 2
- etc.

### 5. Level Distribution Analysis

For each category, identify gaps:
- **Category Name**
  - Missing beginner prompts: X
  - Missing intermediate prompts: Y
  - Missing advanced prompts: Z

### 6. Research Insights

Provide 2-3 actionable insights as bullet points:
- Insight 1: What this means and how we can use it
- Insight 2: What this means and how we can use it
- Insight 3: What this means and how we can use it

**Important:** Use clear markdown formatting with headers, bullet points, and bold text for emphasis. Make it actionable and easy to scan. Do NOT use JSON format.