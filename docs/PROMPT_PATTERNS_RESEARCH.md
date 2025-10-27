# Prompt Engineering Patterns - Research Documentation

**Purpose**: This document catalogs proven prompt engineering patterns for our AI education platform. These patterns will be integrated into our learning pathways and used to validate user prompts for appropriate use.

**Version**: 2.0 (Integrated ChatGPT + Gemini Research)  
**Last Updated**: 2025-10-27  
**Sources**: ChatGPT Analysis, Gemini Deep Research, Vanderbilt University, OpenAI, Anthropic, Google

## 📋 Experience Level Guide

**Beginner**: Foundational patterns, easy to implement, immediate value  
**Intermediate**: Complex structures, multi-turn interactions, nuanced control  
**Expert**: Advanced architectural approaches, orchestrate multiple prompts, production-grade systems

---

## Table of Contents

1. [Role/Instruction Patterns](#roleinstructio-patterns)
2. [Reasoning Patterns](#reasoning-patterns)
3. [Structure/Format Patterns](#structureformat-patterns)
4. [Context Management](#context-management)
5. [Advanced Patterns](#advanced-patterns)
6. [Misuse Prevention](#misuse-prevention)

---

## Role/Instruction Patterns

### 1. Persona Pattern

**Source**: Vanderbilt University (Generative AI)

**Category**: Role/Instruction

**Definition**: Instructs the AI to adopt a specific role or expert persona before performing a task. The prompt explicitly tells the model "Act as [Persona]" and then describes the task.

**When to Use**:

- Complex technical tasks requiring expert knowledge
- Code review or debugging
- Documentation generation
- Product management tasks

**Structure/Template**:

```
Act as a [Persona X] expert. Perform [task Y] accordingly.
```

**Engineering Example**:

```
Act as a seasoned cybersecurity engineer. Review the following code and identify any vulnerabilities or best practice violations:
[Paste code here]
```

**Product Example**:

```
Act as a senior product manager. Create a product requirements document for a new social media feature that enables group video calls. Outline key user stories and acceptance criteria.
```

**Token Efficiency**:

- Input tokens: Medium (adds only a short role instruction)
- Output tokens: Depends on task complexity
- Efficiency: Medium – Persona adds context but uses few tokens

**Effectiveness Metrics**:

- Accuracy: Improves domain-specific correctness
- Consistency: High for style/tone
- User satisfaction: High when expertise tone is desired

**Common Mistakes**:

- Vague personas (e.g., "Act as an expert" without specifying domain)
- Too many personas in one prompt
- Inconsistent instructions

**Best Practices**:

- Use system prompts for multi-turn conversations
- Be specific (e.g., "professional software architect" vs. "expert")
- Align examples with persona's voice

---

### 2. Audience Persona Pattern

**Source**: Vanderbilt University (Generative AI)

**Category**: Role/Instruction

**Definition**: Tailors the AI's response to a specific audience's perspective or background. Includes an "Assume I am [audience persona]" clause before asking the question.

**When to Use**:

- Education/Onboarding
- Documentation for specific audiences
- Product management (framing technical info for business stakeholders)

**Structure/Template**:

```
Explain [Topic X] to me. Assume that I am [Persona Y].
```

**Engineering Example**:

```
Explain how a REST API works. Assume that I am a junior software engineer new to web development.
```

**Product Example**:

```
Explain the core benefits of A/B testing for feature development. Assume that I am a marketing manager with no background in analytics.
```

**Token Efficiency**:

- Input tokens: Low (adds a brief audience clause)
- Output tokens: Varies (simpler explanations may be shorter)
- Efficiency: High – adds little overhead

**Effectiveness Metrics**:

- Accuracy: Helps focus on relevant detail for the audience
- Consistency: High (response consistently matched to stated persona)
- User satisfaction: Improves comprehension by using appropriate language

**Common Mistakes**:

- Overly broad persona ("Assume I'm a person")
- Conflicting instructions
- Forgetting to adjust language

**Best Practices**:

- Be explicit about technical background level
- Follow through with consistent terminology
- Use examples tailored to that audience

---

## Reasoning Patterns

### 3. Cognitive Verifier Pattern

**Source**: Vanderbilt University (Generative AI)

**Category**: Reasoning/Verification

**Definition**: Makes the model generate sub-questions or checks to verify its reasoning before answering. Directs the AI to break down a query by asking and answering auxiliary questions.

**When to Use**:

- Complex problem-solving
- Knowledge-heavy tasks
- Data analysis

**Structure/Template**:

```
When asked [primary question], follow these rules:
1. Generate [N] additional questions about [aspect X].
2. Answer each question.
3. Combine those answers to produce [final answer Y].
```

**Engineering Example**:

```
When reviewing this code, follow these rules:
1. Generate additional questions about potential security vulnerabilities (X).
2. Answer each question.
3. Combine answers to produce a security assessment summary (Y).
```

**Token Efficiency**:

- Input tokens: Medium (adds multi-step instructions)
- Output tokens: Higher (multiple sub-answers then summary)
- Efficiency: Low/Medium – more tokens used, but yields thorough output

**Effectiveness Metrics**:

- Accuracy: Improves accuracy by decomposing tasks
- Consistency: Helps ensure no step is skipped
- User satisfaction: Generally higher for complex tasks

**Best Practices**:

- Limit iterations (3–5 sub-questions)
- Be explicit with format (numbered steps)
- Refine subtopics to be domain-relevant

---

### 4. Chain of Thought (CoT)

**Source**: OpenAI GPT-4.1 Prompting Guide, Anthropic Claude Docs

**Category**: Reasoning

**Definition**: Instructs the model to "think step-by-step" by including a reasoning trace in its response. Helps decompose complex problems and often yields more accurate answers.

**When to Use**:

- Math/Logic problems
- Debugging
- Design/Architecture evaluation
- Analysis tasks

**Structure/Template**:

```
First, think step by step about [the task]. Then, answer the question [or produce the output].
```

**Engineering Example**:

```
The user asked: "Why does this Python loop not terminate?"
First, think step by step:
1. Check loop condition and variables.
2. Is the condition updated inside?
3. ...
Finally, answer: [final explanation].
```

**Token Efficiency**:

- Input tokens: Low (adds reasoning instruction)
- Output tokens: Higher (model generates reasoning)
- Efficiency: Low – produces more tokens but improves correctness

**Effectiveness Metrics**:

- Accuracy: High increase on multi-step tasks
- Consistency: Generally consistent logic if instructions are clear
- User satisfaction: Often higher for complex answers due to transparency

**Common Mistakes**:

- Overuse on trivial tasks
- Unstructured requests
- Forgetting to extract final answer

**Best Practices**:

- Use clear step markers or numbering
- Explicit instructions for reasoning vs. final answer
- Audit failures and refine instructions

---

### 5. Question Refinement Pattern

**Source**: Vanderbilt University (Generative AI)

**Category**: Clarification/Refinement

**Definition**: Asks the model to refactor or improve a user's question before answering it. The model proposes a clearer or more effective rephrasing.

**When to Use**:

- Ambiguous queries
- Complex multi-part questions
- User engagement in interactive workflows

**Structure/Template**:

```
From now on, whenever I ask a question, suggest a better version of the question to use instead.
```

**Engineering Example**:

```
From now on, whenever I ask a question about debugging code, suggest a clearer, more specific version of it. For example, if I ask "It doesn't work," ask "What is the error message and which part of the code is failing?"
```

**Token Efficiency**:

- Input tokens: Low (one instruction)
- Output tokens: Minimal (mostly rewrites)
- Efficiency: High – little overhead, can save tokens later

**Effectiveness Metrics**:

- Accuracy: Improves relevance of responses by clarifying intent
- Consistency: Can vary
- User satisfaction: Generally positive if clarifications help

**Best Practices**:

- Offer as suggestion, ask user before using
- Give examples of refined questions
- Maintain user's original intent

---

## Structure/Format Patterns

### 6. Template Pattern

**Source**: Vanderbilt University (Generative AI)

**Category**: Output Structure

**Definition**: Gives the model a structured format (with placeholders) that the answer must fit into. Ensures consistency and improves output parsing.

**When to Use**:

- Structured output required (JSON, tables, schemas)
- Technical documentation
- Product documentation (PRDs, release notes)

**Structure/Template**:

```
I am going to provide a template for your output. PLACEHOLDERS such as [X] are content variables. Fit your output into the placeholders below and preserve formatting. Template:
[e.g. JSON or labeled fields here]
```

**Engineering Example**:

```
Provide API details using this template:
Endpoint: [URL]
Method: [GET/POST]
Request Body: [JSON schema]
Response: [JSON schema]
```

**Product Example**:

```
Generate a product requirement document:
1. **Feature Name:** [Name]
2. **Description:** [One-sentence summary]
3. **User Story:** [As a ..., I want ..., so that ...]
4. **Acceptance Criteria:** [List of bullet points]
```

**Token Efficiency**:

- Input tokens: Medium (template adds overhead)
- Output tokens: Constrained (answers fit set format)
- Efficiency: Medium – initial template consumes tokens, but output is concise

**Effectiveness Metrics**:

- Accuracy: High formatting accuracy if template is clear
- Consistency: Very high (every answer follows same format)
- User satisfaction: High for automation/parsing needs

**Best Practices**:

- Use distinct placeholders (CAPITALS or brackets)
- Provide 1–2 example outputs in exact template format
- Verify output, especially for code/JSON

---

### 7. Few-Shot Learning

**Source**: Prompt Engineering Guide

**Category**: In-Context Learning

**Definition**: Provides the model with several example pairs of inputs and outputs (demonstrations) in the prompt before the user's query. These examples "teach" the model the desired task format or style.

**When to Use**:

- Complex tasks with clear examples
- Consistent style needs
- Low-resource training (instead of fine-tuning)

**Structure/Template**:

```
Example 1:
Q: [First example question]
A: [First example answer]

Example 2:
Q: [Second example question]
A: [Second example answer]

User's Question:
Q: [Your question here]
A:
```

**Engineering Example**:

```
Q: How do you fix a NullPointerException in Java?
A: When a variable is null but accessed, check object initialization and add null checks or proper initialization.

Q: How to resolve a segmentation fault in C++?
A: A segmentation fault occurs on invalid memory access. Ensure pointers are initialized and bounds are checked.

Q: How to optimize a slow SQL query?
A:
```

**Token Efficiency**:

- Input tokens: High (each example adds tokens)
- Output tokens: Patterned but possibly shorter
- Efficiency: Low for tokens but improves accuracy

**Effectiveness Metrics**:

- Accuracy: Greatly improves output on patterned tasks
- Consistency: Outputs match style and format of examples
- User satisfaction: High for structured tasks

**Best Practices**:

- Quality over quantity (3–5 relevant examples)
- Consistent format for all examples
- Examples must closely match domain of query

---

## Context Management

### 8. Context Control Pattern

**Source**: White et al., 2023 (prompt engineering study)

**Category**: Context Management

**Definition**: Explicitly directs what context the model should consider or ignore through statements like "Consider X" or "Ignore Y". Helps manage the model's limited attention.

**When to Use**:

- Long inputs
- Irrelevant data present (logs, transcripts)
- Multi-turn agents

**Structure/Template**:

```
[Main task prompt].
Consider: [Relevant context or constraints].
Do not consider: [Irrelevant context or details].
```

**Engineering Example**:

```
Here's a crash log transcript.
Do not consider any messages marked [DEBUG] as they are irrelevant.
Consider only the lines marked [ERROR] or [WARN] when diagnosing the issue.
```

**Token Efficiency**:

- Input tokens: Low to medium (adds a few directives)
- Output tokens: Improved relevance (may reduce wordiness)
- Efficiency: High – minimal overhead

**Effectiveness Metrics**:

- Accuracy: Increases accuracy by focusing on relevant info
- Consistency: Ensures model's attention stays on intended context
- User satisfaction: Reduces noise in outputs

**Best Practices**:

- Use clear phrases like "ignore [X]" or "focus on [Y]"
- Only ignore truly irrelevant content
- Test prompts to verify model omits instructed content

---

### 9. Output Formatting Pattern

**Source**: Google Gemini Prompting Best Practices

**Category**: Structure/Format

**Definition**: Explicitly instructs the model how to structure its answer (table, bulleted list, JSON) or style guidelines.

**When to Use**:

- Data extraction tasks
- Summaries or outlines
- User-facing content with specific tone

**Structure/Template**:

```
Please format the response as [TABLE/JSON/LIST/…]. For example:
[Provide a small example if needed]

System instructions: [e.g. "Answer in bullet points."]
```

**Engineering Example**:

```
List all APIs and their descriptions. Format output as JSON with fields: {"api_name": "...", "purpose": "..."}.
```

**Token Efficiency**:

- Input tokens: Low (simple instruction)
- Output tokens: Possibly shorter
- Efficiency: High – small prompt overhead, output is concise

**Effectiveness Metrics**:

- Accuracy: High for format compliance
- Consistency: Very consistent format across responses
- User satisfaction: High when integrating with parsing systems

**Best Practices**:

- Be specific about format
- Use system prompts for style/tone
- Show samples of desired format

---

### 10. Constraint Pattern

**Source**: Google Gemini Prompting Best Practices

**Category**: Constraints

**Definition**: Instructs the model what it must or must not do within the answer. Sets boundaries on content, length, style, or content.

**When to Use**:

- Length limits
- Content filtering
- Stylistic rules
- Data restrictions

**Structure/Template**:

```
[Task instructions].
Constraints:
- [Constraint 1] (e.g. "Answer in one sentence.")
- [Constraint 2] (e.g. "Do not use abbreviations.")
```

**Engineering Example**:

```
Explain this code segment in simple terms.
Constraint: Answer using no more than 2 sentences and avoid technical jargon.
```

**Token Efficiency**:

- Input tokens: Low (just a few keywords)
- Output tokens: More focused (possibly shorter)
- Efficiency: High – negligible cost, reduces unnecessary output

**Effectiveness Metrics**:

- Accuracy: Increases adherence to requirements
- Consistency: High if constraints are clear
- User satisfaction: Avoids common errors

**Best Practices**:

- Prioritize constraints (most important first)
- Test iteratively
- Use clear language

---

## Advanced Patterns

### 11. Tree of Thoughts (ToT)

**Source**: AI Engineering Guide (IBM), Yao et al. (2023)

**Category**: Advanced Reasoning

**Definition**: Advanced reasoning framework where the model explores multiple intermediate "thoughts" or solution paths in parallel. The model generates a tree of possibilities, evaluates them, and backtracks as needed.

**When to Use**:

- Complex puzzles or games
- Scenarios with branching solutions
- Tasks requiring lookahead/backtracking

**Structure/Template**:

```
Imagine [N] different thought paths to solve [task].
For each path:
- Step 1, Step 2, ... (allow branching)
Then evaluate each final outcome for correctness or quality, and choose the best answer.
```

**Token Efficiency**:

- Input tokens: High (introduces branching instructions)
- Output tokens: Very high (multiple "thought" branches)
- Efficiency: Low – produces lots of content, but solves complex tasks

**Effectiveness Metrics**:

- Accuracy: Significantly higher on complex reasoning benchmarks
- Consistency: More robust (finds correct solution via exploration)
- User satisfaction: Produces creative/diverse solutions

**Best Practices**:

- Limit breadth (2-3 candidate paths)
- Use evaluation step to rank branches
- Chain to answer after exploring

---

### 12. ReAct Pattern

**Source**: Prompt Engineering Guide (AI2)

**Category**: Reasoning/Tool-Use

**Definition**: ReAct (Reasoning + Acting) interleaves reasoning steps ("Thought: …") with actions ("Action: …"). The model can perform actions like querying external tools, then incorporate observations before continuing reasoning.

**When to Use**:

- Question Answering with tools
- Decision-making tasks
- Coding with execution

**Structure/Template**:

```
Question: [User's question]
Thought 1: [Model's reasoning about first step]
Action 1: [e.g. Search[query] or Lookup[database]]
Observation 1: [Result of Action 1]
Thought 2: [Next reasoning considering observation]
Action 2: [Next action if needed]
...
Answer: [Final answer]
```

**Engineering Example**:

```
Question: "Which Python libraries can help detect SQL injection vulnerabilities?"
Thought 1: I should search for Python tools for SQL injection.
Action 1: Search["Python SQL injection detection library"]
Observation 1: [Search results listing libraries like 'sqlmap', 'sqlalchemy insights'...]
Thought 2: I found "sqlmap" as a popular tool.
Answer: "One commonly used tool is sqlmap, and for code analysis libraries, XYZ..."
```

**Token Efficiency**:

- Input tokens: High (requires narrative of thoughts/actions)
- Output tokens: Very high (detailed reasoning + tool queries)
- Efficiency: Low – but necessary for tasks needing external info

**Effectiveness Metrics**:

- Accuracy: High for knowledge-intensive tasks
- Consistency: Good, as actions ground answers
- User satisfaction: High if helpful facts are retrieved

**Best Practices**:

- Limit actions (e.g., "perform up to 2 searches")
- Use consistent markers for actions and observations
- Validate sources after retrieving data

---

### 13. Self-Consistency

**Source**: LearnPrompting (Schulhoff)

**Category**: Reasoning/Efficiency

**Definition**: Decoding strategy that aggregates multiple reasoning paths. The model is prompted multiple times to produce various chains, then a majority vote or consensus selects the final answer.

**When to Use**:

- Ambiguous or tricky reasoning tasks
- Critical decisions
- Testing prompt quality

**Structure/Template**:
No special prompt needed beyond CoT; instead, output is generated multiple times, then select the most common final answer.

**Token Efficiency**:

- Input tokens: Same as CoT prompt
- Output tokens: × N (multiple runs multiply cost)
- Efficiency: Low – uses significantly more tokens/time

**Effectiveness Metrics**:

- Accuracy: Substantially higher than single CoT
- Consistency: Higher consistency via consensus
- User satisfaction: Very high accuracy, but costlier

**Best Practices**:

- Enable sampling (temperature >0.7)
- Run sufficient times (5–10 samples)
- Aggregate intelligently (majority vote for classification)

---

### 14. Meta-Prompting

**Source**: Prompt Engineering Guide

**Category**: Structure/Advanced

**Definition**: Focuses on the structure and pattern of problem-solving rather than content. Uses abstract templates and examples of reasoning patterns to guide the model's answer.

**When to Use**:

- Generalization tasks
- Token-limited scenarios
- Comparative evaluation

**Structure/Template**:

```
Solve [Task X] by following the pattern below:
Example (meta-level):
- Pattern: [Abstract structure of solution, e.g. A->B->C steps]
- New Problem: [Actual problem here]
Solution:
```

**Token Efficiency**:

- Input tokens: Low to medium (abstraction uses fewer words)
- Output tokens: Moderate (fills in structure)
- Efficiency: High – uses fewer tokens than detailed few-shot examples

**Effectiveness Metrics**:

- Accuracy: Very good for tasks fitting the pattern
- Consistency: High structural consistency
- User satisfaction: Good for logic-intensive problems

**Best Practices**:

- Balance abstraction (enough detail to guide, not full content)
- Focus on form (use categories or placeholders)
- Test variations to ensure model can apply pattern

---

### 15. Retrieval Augmented Generation (RAG)

**Source**: AWS (what-is RAG)

**Category**: Knowledge Augmentation

**Definition**: Design pattern where the model's output is augmented by external retrieved knowledge. The system first retrieves relevant documents or data from an external source, then provides those as context to the LLM.

**When to Use**:

- Factual QA with large knowledge base
- Domain-specific tasks
- Reduce hallucinations

**Structure/Template**:

```
User Query: [Question]
Action: Retrieve [top-N] relevant documents for query.
Augmented Prompt: [Include retrieved text, then] "Based on the above documents and your knowledge, answer: [Question]"
```

**Engineering Example**:

```
Query: "How do I configure Apache for SSL?"
Action: Retrieve Apache documentation snippet on SSL.
Prompt: "<doc>...SSL configuration steps from official docs...</doc> Now answer the user's query using above."
```

**Token Efficiency**:

- Input tokens: Higher (adds retrieved documents)
- Output tokens: Potentially similar (answer plus citations)
- Efficiency: Medium – extra context costs tokens

**Effectiveness Metrics**:

- Accuracy: Greatly improved factuality and relevancy
- Consistency: High (answers aligned with provided documents)
- User satisfaction: High for trust-critical tasks

**Best Practices**:

- High-quality retriever (ensure relevant passages)
- Clearly separate retrieved data (use tags)
- Instruct model to cite sources for transparency

---

## Misuse Prevention

### Overview

Our platform must prevent misuse of company AI keys. Users should not be able to use our AI execution features for personal, off-topic, or inappropriate queries.

### Validation Strategy

**Pattern-Based Validation**:

1. **Topic Classification**: Classify user prompts to ensure they relate to:
   - Prompt engineering
   - AI education
   - Professional development
   - Technical learning
   - Business use cases

2. **Prohibited Topics Detection**:
   - Personal advice (dating, relationships)
   - Gambling/betting predictions
   - Medical/legal advice
   - Harmful content generation
   - Off-topic entertainment queries

3. **Pattern Compliance Check**:
   - Verify prompt follows one of the documented patterns
   - Check for proper structure and intent
   - Validate educational or professional purpose

### Implementation Approach

**Pre-Execution Validation**:

```typescript
// Pseudo-code for validation
async function validatePrompt(userPrompt: string): Promise<ValidationResult> {
  // 1. Check against prohibited topics
  const topicCheck = await classifyTopic(userPrompt);
  if (topicCheck.isProhibited) {
    return { valid: false, reason: 'Off-topic or inappropriate content' };
  }

  // 2. Verify educational/professional intent
  const intentCheck = await verifyIntent(userPrompt);
  if (!intentCheck.isProfessional) {
    return { valid: false, reason: 'Must be for professional/educational use' };
  }

  // 3. Check pattern compliance (optional but recommended)
  const patternCheck = await matchPattern(userPrompt);

  return { valid: true, pattern: patternCheck.matchedPattern };
}
```

**Rate Limiting by Topic**:

- Educational prompts: Higher rate limits
- Experimental/testing: Moderate limits
- Flagged content: Immediate blocking

**User Education**:

- Show examples of appropriate prompts
- Explain pattern-based approach
- Provide feedback on rejected prompts
- Guide users to proper patterns

### Monitoring & Enforcement

**Metrics to Track**:

- Rejection rate by reason
- Pattern usage distribution
- User compliance trends
- False positive/negative rates

**Enforcement Actions**:

1. **First violation**: Warning + educational message
2. **Repeated violations**: Temporary rate limit reduction
3. **Persistent abuse**: Account review/suspension

**Transparency**:

- Clear terms of use
- Visible validation feedback
- Appeal process for false positives

---

## Pattern Selection Guide

### Quick Reference

| Use Case            | Recommended Pattern(s)      |
| ------------------- | --------------------------- |
| Code Review         | Persona + CoT               |
| Documentation       | Audience Persona + Template |
| Debugging           | CoT + Cognitive Verifier    |
| API Design          | Template + Constraint       |
| Learning Content    | Audience Persona + Few-Shot |
| Complex Analysis    | CoT + Self-Consistency      |
| Knowledge Retrieval | RAG + Output Formatting     |
| Multi-step Planning | Tree of Thoughts + Template |
| Interactive Q&A     | Question Refinement + ReAct |

### Combining Patterns

**Best Combinations**:

1. **Persona + CoT + Template**: Expert reasoning with structured output
2. **RAG + CoT + Constraint**: Fact-based reasoning with boundaries
3. **Few-Shot + Output Formatting**: Consistent, formatted responses
4. **Audience Persona + Constraint**: Tailored, focused explanations
5. **Context Control + Template**: Filtered input, structured output

---

## Citations & Sources

1. **Vanderbilt University** - Generative AI Prompt Patterns
   - https://www.vanderbilt.edu/generative-ai/prompt-patterns/

2. **Anthropic Claude Docs** - Prompt Engineering
   - https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/

3. **OpenAI** - GPT-4.1 Prompting Guide
   - https://cookbook.openai.com/examples/gpt4-1_prompting_guide

4. **Prompt Engineering Guide** - Comprehensive Techniques
   - https://www.promptingguide.ai/

5. **Google AI** - Gemini API Prompting Strategies
   - https://ai.google.dev/gemini-api/docs/prompting-strategies

6. **AWS** - Retrieval-Augmented Generation
   - https://aws.amazon.com/what-is/retrieval-augmented-generation/

7. **LearnPrompting** - Self-Consistency Prompting
   - https://learnprompting.org/docs/intermediate/self_consistency

8. **White et al., 2023** - Prompt Engineering Study
   - https://arxiv.org/pdf/2311.13274

---

## Next Steps

1. **Integration**: Incorporate these patterns into learning pathways
2. **Validation**: Implement pattern-based prompt validation
3. **Education**: Create interactive tutorials for each pattern
4. **Monitoring**: Track pattern usage and effectiveness
5. **Iteration**: Refine patterns based on user feedback and results
