# Complete Prompt Library Research - For Gemini Deep Analysis

## Your Mission

Analyze our current prompt library and help us:

1. **Diversify pattern usage** - We're using Persona 95% of the time
2. **Generate new high-quality prompts** using underutilized patterns
3. **Test existing prompts** for clarity, effectiveness, and issues
4. **Expand to new roles** and use cases
5. **Create pattern-to-role recommendations**

---

## Current State Analysis

**Total Prompts**: 100+
**Total Patterns Available**: 15
**Current Pattern Distribution**:

- Persona Pattern: ~95% ❌ (Too much!)
- Chain of Thought: ~3%
- Other 13 Patterns: ~2% combined

**Target Distribution**:

- Persona: ~40%
- Chain of Thought: ~15%
- Template: ~10%
- Few-Shot: ~10%
- Recipe: ~8%
- Cognitive Verifier: ~7%
- Others: ~10% combined

---

## The 15 Prompt Patterns (Our Framework)

### 1. **Persona Pattern** ⭐ Currently Overused

**What**: AI adopts a specific role/expert persona
**Structure**: "Act as a [role] with expertise in [domain]..."
**Best For**: Technical tasks, code review, expert advice
**Example**:

```
Act as a senior software architect with 15 years of experience.
Review this code for security vulnerabilities, performance issues,
and best practice violations. Provide specific recommendations.
```

### 2. **Audience Persona Pattern**

**What**: Tailors response for specific audience level
**Structure**: "Explain [concept] to a [audience type]"
**Best For**: Training, stakeholder communication, documentation
**Example**:

```
Explain microservices architecture to a junior developer who only
knows monolithic applications. Use simple analogies and avoid jargon.
```

### 3. **Cognitive Verifier Pattern**

**What**: Breaks complex reasoning into verifiable questions
**Structure**: "Generate questions that help verify the answer"
**Best For**: Debugging, architecture decisions, complex problems
**Example**:

```
When I ask a technical question, first generate 3-5 sub-questions
that would help verify the correctness of your answer. Then answer
both the sub-questions and the main question.
```

### 4. **Chain of Thought (CoT)** ⭐ Need More

**What**: Encourages step-by-step reasoning
**Structure**: "Let's think step by step..."
**Best For**: Complex problems, planning, debugging, math
**Example**:

```
Let's debug this performance issue step by step:
1. Identify the symptom
2. Form 3 hypotheses
3. Test the most likely one
4. Analyze results
5. Iterate until root cause found
```

### 5. **Question Refinement Pattern**

**What**: AI suggests better versions of your question
**Structure**: "Suggest a better version, then answer both"
**Best For**: Unclear requirements, exploratory research
**Example**:

```
When I ask a question, first suggest 2-3 better versions of my
question that would lead to more useful answers. Then answer
the best version.
```

### 6. **Template Pattern** ⭐ Need More

**What**: Provides structured template for consistent output
**Structure**: "Use this template: [structure]"
**Best For**: Reports, documentation, standardization
**Example**:

```
Generate API documentation using this template:

# [Endpoint Name]
## Overview
[Description]

## Request
- Method: [GET/POST/etc]
- URL: [endpoint]

## Parameters
| Name | Type | Required | Description |

## Response
[JSON example]

## Errors
[Error codes and descriptions]
```

### 7. **Few-Shot Learning** ⭐ Need More

**What**: Provides 2-5 examples of input → output
**Structure**: "Here are examples: [examples]. Now: [query]"
**Best For**: Classification, formatting, style matching
**Example**:

```
Here are examples of good commit messages:

Example 1: "fix: resolve memory leak in user session handler"
Example 2: "feat: add dark mode toggle to settings page"
Example 3: "docs: update API authentication guide"

Now write a commit message for: [your change]
```

### 8. **Recipe Pattern** ⭐ Need More

**What**: Defines sequence of steps to achieve goal
**Structure**: "To accomplish X: 1) Do A, 2) Do B, 3) Do C"
**Best For**: Workflows, processes, tutorials, setup guides
**Example**:

```
To set up a CI/CD pipeline:

Step 1: Define build stages
- List what needs to be built
- Identify required tests
- Determine security scans

Step 2: Configure pipeline file
- Choose CI tool
- Define triggers
- Set environment variables

Step 3: Add deployment stages
- Define environments
- Set approval gates
- Configure rollback

Step 4: Test and iterate
```

### 9. **Flipped Interaction Pattern**

**What**: AI asks questions to gather requirements
**Structure**: "Ask me questions to understand my needs"
**Best For**: Requirements gathering, brainstorming, discovery
**Example**:

```
I need to design a new feature. Ask me 5-7 questions to understand:
- User needs
- Technical constraints
- Success metrics
- Timeline and resources
Then provide recommendations based on my answers.
```

### 10. **Game Play Pattern**

**What**: Frames task as a game with rules/objectives
**Structure**: "Let's play a game where..."
**Best For**: Learning, creative exploration, engagement
**Example**:

```
Let's play a code review game. You're the reviewer, I'm the developer.
Rules:
1. I submit code
2. You find 3 issues (1 critical, 1 moderate, 1 minor)
3. I fix them
4. You verify
5. We discuss what I learned
```

### 11. **Tree of Thought (ToT)** ⭐ Need More

**What**: Explores multiple reasoning paths simultaneously
**Structure**: "Consider 3 different approaches..."
**Best For**: Complex decisions, strategy planning, architecture
**Example**:

```
Consider 3 different architectural approaches for this system:

Approach 1: Microservices
- Pros, cons, complexity, cost

Approach 2: Modular monolith
- Pros, cons, complexity, cost

Approach 3: Serverless
- Pros, cons, complexity, cost

Then recommend the best approach based on our constraints.
```

### 12. **ReAct Pattern**

**What**: Combines reasoning with actions in iterative loop
**Structure**: "Think → Act → Observe → Repeat"
**Best For**: Multi-step tasks, tool usage, autonomous agents
**Example**:

```
Help me debug this issue using the ReAct pattern:

1. Think: What could cause this?
2. Act: Suggest a diagnostic command to run
3. Observe: I'll run it and share output
4. Think: Analyze the output
5. Repeat until solved
```

### 13. **Self-Consistency**

**What**: Generates multiple solutions, selects most consistent
**Structure**: "Generate 3 solutions, choose most consistent"
**Best For**: High-stakes decisions, verification, quality assurance
**Example**:

```
Generate 3 different solutions to this problem using different
approaches. Then analyze which solution is most consistent across
edge cases and recommend the best one with reasoning.
```

### 14. **Meta-Prompting**

**What**: Uses AI to generate or improve prompts
**Structure**: "Generate a prompt that will help me..."
**Best For**: Prompt optimization, automation, prompt libraries
**Example**:

```
I need to accomplish [goal]. Generate an optimal prompt that:
1. Uses the best pattern for this task
2. Includes necessary context
3. Specifies output format
4. Handles edge cases
Then use that prompt to solve my problem.
```

### 15. **RAG (Retrieval Augmented Generation)**

**What**: Combines AI generation with external knowledge retrieval
**Structure**: "First retrieve docs, then answer based on them"
**Best For**: Knowledge bases, documentation, fact-checking
**Example**:

```
Before answering my question about [topic]:
1. Retrieve relevant documentation from our knowledge base
2. Cite specific sections
3. Answer based only on retrieved information
4. Flag any gaps in documentation
```

---

## Current Prompt Library (100 Prompts)

### Junior Engineer Prompts (3)

**1. Codebase Navigator**

- **Pattern Used**: Persona + Cognitive Verifier
- **Prompt**: "Act as an expert Staff Engineer who is a patient mentor. I am a new developer on the team, and I'm trying to understand a part of our codebase. I'm going to paste a code file/module below. Your task is to be my guide. Analyze the code and provide the following in simple, clear terms: 1. **Primary Responsibility:** In one sentence, what is the main purpose of this code? 2. **Key Components:** List the most important functions/classes and briefly explain what each one does. 3. **Inputs & Outputs:** What are the main data inputs this code expects, and what are the primary outputs or side effects it produces? 4. **Potential 'Gotchas':** Based on your experience, are there any non-obvious behaviors, potential performance issues, or tricky parts I should be aware of? 5. **Follow-up Questions:** Now, ask me 2-3 simple questions to check my understanding and prompt my curiosity."

**2. Debugging Assistant**

- **Pattern Used**: Persona + Chain of Thought
- **Prompt**: "Act as a methodical Senior QA Engineer specializing in root cause analysis. I'm a developer who is stuck on a bug, and I need your help to think through it systematically. First, I will describe the bug. Then, you will guide me through a step-by-step debugging process. Do not solve it for me directly. Instead, ask me a series of questions to help me solve it myself."

**3. Technical Concept Translator**

- **Pattern Used**: Persona + Audience Persona
- **Prompt**: "Act as an expert Communications Coach for engineers. Your specialty is helping technical people explain complex ideas in simple, compelling ways. I need to explain a technical topic to a specific audience, and I want you to help me craft the perfect explanation. First, I will provide the technical topic and the target audience. Then, you will provide three different versions of the explanation, each with a different focus: 1. **The Analogy:** Explain the concept using a simple, real-world analogy that the audience will immediately understand. 2. **The 'Why It Matters':** Explain the concept by focusing on the direct benefit or impact it has on the audience or the end-user. 3. **The Q&A:** Provide a list of 3 likely questions the audience might ask, along with simple, direct answers for each."

---

## Research Tasks for Gemini

### Task 1: Pattern Diversification Analysis

**Prompt for Gemini**:

```
Review all 100 prompts in our library. For each prompt:
1. Identify which pattern(s) it currently uses
2. Suggest if a different pattern would be more effective
3. Explain WHY the new pattern would work better
4. Provide a rewritten version using the new pattern

Focus on converting Persona-only prompts to use:
- Template Pattern (for structured outputs)
- Few-Shot (for examples-based learning)
- Recipe Pattern (for step-by-step processes)
- Tree of Thought (for complex decisions)
- Chain of Thought (for reasoning tasks)
```

### Task 2: Generate New Prompts with Underutilized Patterns

**Prompt for Gemini**:

```
Generate 20 new high-quality prompts distributed as follows:

Template Pattern (5 prompts):
- 1 for Engineering Managers (sprint planning template)
- 1 for Product Managers (PRD template)
- 1 for QA Engineers (test plan template)
- 1 for Designers (design spec template)
- 1 for DevOps (runbook template)

Few-Shot Pattern (5 prompts):
- 1 for Engineers (code review examples)
- 1 for PMs (user story examples)
- 1 for Designers (UX critique examples)
- 1 for QA (bug report examples)
- 1 for Managers (1-on-1 examples)

Recipe Pattern (5 prompts):
- 1 for setting up monitoring
- 1 for conducting user research
- 1 for code refactoring process
- 1 for incident response
- 1 for design system creation

Tree of Thought (3 prompts):
- 1 for architecture decisions
- 1 for technology evaluation
- 1 for strategic planning

Chain of Thought (2 prompts):
- 1 for debugging complex issues
- 1 for performance optimization

Each prompt must:
- Solve a real problem that role faces
- Use the specified pattern correctly
- Include clear instructions
- Specify expected output format
- Be immediately usable
```

### Task 3: Quality Testing

**Prompt for Gemini**:

```
Test each of our 100 prompts for:

1. **Clarity**: Is it immediately clear what to do?
2. **Specificity**: Does it provide enough detail?
3. **Pattern Alignment**: Does it use the pattern correctly?
4. **Role Appropriateness**: Is it right for the target role?
5. **Completeness**: Does it handle edge cases?
6. **Output Quality**: Will it produce useful results?

For each prompt, provide:
- Quality score (1-10)
- Issues found
- Specific improvements
- Pattern recommendations
```

### Task 4: Role Expansion

**Prompt for Gemini**:

```
We're missing these roles:
- Data Scientists
- Security Engineers
- Technical Writers
- Customer Success Engineers
- Sales Engineers
- Developer Advocates

For each new role:
1. Identify top 5 pain points
2. Suggest 5 high-value prompts (using different patterns)
3. Explain which patterns work best for this role
4. Provide complete, ready-to-use prompts
```

### Task 5: Pattern-to-Role Matrix

**Prompt for Gemini**:

```
Create a matrix showing:
- Which patterns work best for which roles
- Why certain patterns suit certain roles
- Examples of good pattern-role combinations
- Anti-patterns (bad combinations to avoid)

Format as a table with recommendations.
```

---

## Success Criteria

After your analysis, we should have:

- ✅ 120+ total prompts (20 new)
- ✅ Balanced pattern distribution (no pattern >40%)
- ✅ All prompts tested and scored
- ✅ 3 new roles added
- ✅ Pattern tags for every prompt
- ✅ Clear pattern-to-role recommendations

---

## Output Format Requested

Please provide your analysis in this structure:

### Part 1: Current Library Analysis

- Pattern distribution breakdown
- Quality scores for existing prompts
- Top 10 prompts that need pattern changes

### Part 2: New Prompts Generated

- 20 new prompts with pattern tags
- Organized by role and pattern
- Ready to copy-paste into our library

### Part 3: Conversion Recommendations

- 20 existing prompts to convert
- Before/after examples
- Pattern justification

### Part 4: Role Expansion

- 3 new roles with 5 prompts each
- Pain points and use cases
- Pattern recommendations

### Part 5: Pattern-Role Matrix

- Table showing best patterns per role
- Usage guidelines
- Examples

---

**Ready for your deep analysis! Please start with Part 1.**
