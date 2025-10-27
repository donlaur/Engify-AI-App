# Prompt Engineering Patterns

**Research Request for Gemini Deep Research**:

"Analyze and document the most effective prompt engineering patterns used by leading AI companies and certification programs. Focus on:

1. **Question Refinement Pattern** - How to iteratively improve questions
2. **Persona Pattern** - Role-based prompting techniques
3. **Cognitive Verifier Pattern** - Breaking down complex reasoning
4. **Audience Persona Pattern** - Tailoring output for specific audiences
5. **Chain of Thought (CoT)** - Step-by-step reasoning
6. **Few-Shot Learning** - Example-based prompting
7. **Template Pattern** - Structured prompt formats
8. **Context Control Pattern** - Managing context window efficiently
9. **Output Formatting Pattern** - Structured response formats
10. **Constraint Pattern** - Setting clear boundaries

For each pattern, provide:
- Definition and purpose
- When to use it
- Token efficiency considerations
- Real-world examples from engineering/product contexts
- Common mistakes to avoid
- Best practices from companies offering AI certifications (OpenAI, Anthropic, Google, AWS, Microsoft)

Focus on patterns that help developers, engineers, and product managers write better prompts while minimizing token usage and maximizing clarity."

---

## Pattern Categories

### 1. Role & Persona Patterns

#### Persona Pattern
**Purpose**: Assign a specific role/expertise to the AI

**Structure**:
```
You are a [ROLE] with expertise in [DOMAIN].
Your task is to [SPECIFIC_TASK].
```

**When to Use**:
- Need domain-specific expertise
- Want consistent tone/style
- Require specialized knowledge

**Token Efficiency**: ✅ Good (20-50 tokens)

**Examples**:
```
❌ Bad (vague):
"Help me with code"

✅ Good (persona):
"You are a senior software architect specializing in distributed systems.
Review this microservices design for scalability issues."
```

#### Audience Persona Pattern
**Purpose**: Tailor output for specific audience

**Structure**:
```
Explain [TOPIC] for [AUDIENCE_LEVEL] who [CONTEXT].
Use [STYLE] and avoid [AVOID].
```

**Examples**:
```
"Explain OAuth 2.0 for junior developers who are new to authentication.
Use simple analogies and avoid security jargon."
```

---

### 2. Reasoning Patterns

#### Cognitive Verifier Pattern
**Purpose**: Break complex problems into verifiable steps

**Structure**:
```
To solve [PROBLEM]:
1. Break it into sub-questions
2. Answer each sub-question
3. Synthesize the final answer
```

**When to Use**:
- Complex technical decisions
- Multi-step reasoning needed
- Need to verify logic

**Examples**:
```
"To design a caching strategy:
1. What data is accessed most frequently?
2. What's the acceptable staleness?
3. What's the cache invalidation strategy?
4. Based on answers 1-3, recommend a solution."
```

#### Chain of Thought (CoT)
**Purpose**: Show step-by-step reasoning

**Structure**:
```
Let's think step by step:
1. [First consideration]
2. [Second consideration]
3. [Conclusion]
```

**Token Efficiency**: ⚠️ Medium (increases output tokens but improves accuracy)

---

### 3. Structure Patterns

#### Template Pattern
**Purpose**: Consistent, structured responses

**Structure**:
```
Respond using this format:
## [Section 1]
[Content]

## [Section 2]
[Content]
```

**When to Use**:
- Need consistent output format
- Parsing responses programmatically
- Creating documentation

**Token Efficiency**: ✅ Excellent (reduces ambiguity)

**Examples**:
```
"Analyze this code and respond in this format:

## Issues Found
- [List issues]

## Severity
- Critical: [count]
- Medium: [count]
- Low: [count]

## Recommendations
1. [Priority 1]
2. [Priority 2]"
```

#### Output Formatting Pattern
**Purpose**: Get structured data (JSON, Markdown, etc.)

**Structure**:
```
Return your response as [FORMAT]:
[SCHEMA/STRUCTURE]
```

**Examples**:
```
"Return as JSON with this schema:
{
  "summary": "string",
  "action_items": ["string"],
  "priority": "high|medium|low"
}"
```

---

### 4. Efficiency Patterns

#### Question Refinement Pattern
**Purpose**: Improve vague questions before answering

**Structure**:
```
Before answering, ask 2-3 clarifying questions about:
- [Aspect 1]
- [Aspect 2]
- [Aspect 3]
```

**When to Use**:
- User request is vague
- Multiple interpretations possible
- Need to gather requirements

**Token Efficiency**: ✅ Excellent (prevents wasted tokens on wrong answer)

**Examples**:
```
❌ Bad:
"How do I optimize my database?"

✅ Good (with refinement):
"Before I recommend database optimizations, I need to know:
1. What database are you using? (PostgreSQL, MySQL, MongoDB?)
2. What's the main performance issue? (Slow queries, high CPU, storage?)
3. What's your current scale? (Requests/sec, data size?)

Please provide these details for a targeted recommendation."
```

#### Context Control Pattern
**Purpose**: Minimize unnecessary context

**Structure**:
```
Focus only on [SPECIFIC_ASPECT].
Ignore [IRRELEVANT_ASPECTS].
Assume [KNOWN_CONTEXT].
```

**Token Efficiency**: ✅✅ Excellent (reduces input tokens)

**Examples**:
```
"Review only the authentication logic in this code.
Ignore styling and UI components.
Assume the database schema is correct."
```

---

### 5. Constraint Patterns

#### Constraint Pattern
**Purpose**: Set clear boundaries and limits

**Structure**:
```
Requirements:
- Must [REQUIREMENT]
- Must not [PROHIBITION]
- Length: [LIMIT]
- Format: [FORMAT]
```

**When to Use**:
- Need specific output format
- Have length limitations
- Want to prevent certain content

**Token Efficiency**: ✅ Good (prevents over-generation)

**Examples**:
```
"Generate a commit message that:
- Must follow conventional commits format
- Must not exceed 72 characters
- Must include ticket number
- Must be in imperative mood"
```

---

### 6. Learning Patterns

#### Few-Shot Learning Pattern
**Purpose**: Teach by example

**Structure**:
```
Here are examples of [TASK]:

Example 1:
Input: [INPUT]
Output: [OUTPUT]

Example 2:
Input: [INPUT]
Output: [OUTPUT]

Now do the same for:
Input: [NEW_INPUT]
```

**When to Use**:
- Complex output format
- Specific style needed
- Pattern recognition tasks

**Token Efficiency**: ⚠️ Medium (examples add tokens but improve accuracy)

---

## Pattern Selection Guide

### For Engineering Tasks

**Code Review**:
```
Pattern: Persona + Template + Constraint
Tokens: ~100-150

"You are a senior code reviewer.
Analyze this code for:
1. Security vulnerabilities
2. Performance issues
3. Best practice violations

Format response as:
## Critical Issues
## Recommendations
## Code Quality Score (0-10)

Keep response under 500 words."
```

**Architecture Design**:
```
Pattern: Cognitive Verifier + Audience
Tokens: ~150-200

"You are a solutions architect.
Design a caching strategy by answering:
1. What are the access patterns?
2. What's the data volatility?
3. What's the scale requirement?

Explain for a team of mid-level engineers."
```

### For Product Tasks

**Feature Specification**:
```
Pattern: Template + Question Refinement
Tokens: ~100-150

"Create a feature spec using this template:
## Problem Statement
## User Stories
## Acceptance Criteria
## Technical Considerations

If any section is unclear, ask clarifying questions first."
```

**User Research Analysis**:
```
Pattern: Cognitive Verifier + Output Format
Tokens: ~150-200

"Analyze this user feedback by:
1. Identifying common themes
2. Categorizing by priority
3. Suggesting action items

Return as JSON with themes, priority, and actions."
```

---

## Token Optimization Rules

### DO:
✅ Use specific, focused prompts
✅ Provide necessary context only
✅ Set clear output constraints
✅ Use templates for consistency
✅ Combine patterns efficiently

### DON'T:
❌ Include irrelevant context
❌ Use vague instructions
❌ Over-explain obvious things
❌ Repeat information
❌ Use multiple personas unnecessarily

---

## Pattern Combinations

### High Efficiency Combos

**1. Persona + Template + Constraint** (150-200 tokens)
- Best for: Structured analysis tasks
- Example: Code reviews, document analysis

**2. Question Refinement + Cognitive Verifier** (100-150 tokens)
- Best for: Complex problem solving
- Example: Architecture decisions, debugging

**3. Audience + Output Format** (100-150 tokens)
- Best for: Documentation, explanations
- Example: Technical writing, onboarding docs

---

## Implementation in App

### Pattern Metadata
```typescript
interface PromptPattern {
  id: string;
  name: string;
  category: 'role' | 'reasoning' | 'structure' | 'efficiency' | 'constraint';
  tokenCost: 'low' | 'medium' | 'high';
  bestFor: string[];
  template: string;
  variables: string[];
}
```

### Pattern Selection Logic
```typescript
function selectPattern(task: string, context: string): PromptPattern[] {
  // Analyze task type
  // Consider token budget
  // Return recommended patterns
}
```

---

## Certification Sources

**Research these for best practices**:
1. **OpenAI** - Prompt Engineering Guide
2. **Anthropic** - Claude Prompt Engineering
3. **Google** - Gemini Prompting Best Practices
4. **AWS** - Bedrock Prompt Engineering
5. **Microsoft** - Azure OpenAI Prompt Engineering
6. **DeepLearning.AI** - ChatGPT Prompt Engineering Course
7. **Vanderbilt University** - Prompt Engineering Patterns

---

## Next Steps

1. **Research Phase**: Run this through Gemini Deep Research
2. **Pattern Library**: Create 50+ tested patterns
3. **Pattern Selector**: Build UI to help users choose
4. **Education**: Add learning modules per pattern
5. **Testing**: Grade each pattern's effectiveness
6. **Optimization**: Track token usage per pattern

---

**Status**: Research document ready for Gemini Deep Research
**Last Updated**: 2025-10-27
