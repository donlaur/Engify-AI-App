/**
 * Seed Prompts for Library
 *
 * Initial set of high-quality prompts for the library
 * Organized by category and role
 *
 * NOTE: This file contains curated example prompts.
 * For role-based playbooks, see playbooks.ts
 */

import type { Prompt } from '@/lib/schemas/prompt';
import { convertPlaybooksToPrompts } from './convert-playbooks';

// Curated example prompts
export const curatedPrompts: Omit<Prompt, 'createdAt' | 'updatedAt'>[] = [
  // CODE GENERATION
  {
    id: 'cg-001',
    title: 'Code Review Assistant',
    description:
      'Get detailed code reviews with actionable feedback on security, performance, and best practices',
    content: `You are an expert code reviewer with 15+ years of experience. Review the following code and provide:

1. **Security Issues**: Identify potential vulnerabilities
2. **Performance Concerns**: Highlight inefficiencies
3. **Best Practice Violations**: Note deviations from standards
4. **Suggestions for Improvement**: Provide specific, actionable recommendations

Code to review:
{code}

Format your response with clear sections and prioritize issues by severity.`,
    category: 'code-generation',
    role: 'engineer',
    pattern: 'persona',
    tags: ['code-review', 'best-practices', 'security'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'cg-002',
    title: 'API Endpoint Generator',
    description:
      'Generate complete REST API endpoints with validation, error handling, and documentation',
    content: `You are a senior backend engineer. Create a complete REST API endpoint with:

**Requirements:**
- Endpoint: {endpoint_description}
- Method: {http_method}
- Framework: {framework}

**Include:**
1. Route definition with proper HTTP method
2. Request validation (body, params, query)
3. Error handling with appropriate status codes
4. Response formatting
5. JSDoc/comments explaining the endpoint
6. Example request/response

Follow {framework} best practices and include proper TypeScript types.`,
    category: 'code-generation',
    role: 'engineer',
    pattern: 'template',
    tags: ['api', 'backend', 'rest'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },
  {
    id: 'cg-003',
    title: 'React Component Builder',
    description:
      'Generate production-ready React components with TypeScript, props validation, and accessibility',
    content: `You are a React expert specializing in component architecture. Create a React component with:

**Component Spec:**
- Name: {component_name}
- Purpose: {component_purpose}
- Props: {props_description}

**Requirements:**
1. TypeScript with proper prop types
2. Functional component with hooks
3. Accessibility (ARIA labels, keyboard navigation)
4. Responsive design considerations
5. PropTypes or Zod validation
6. JSDoc comments
7. Example usage

Follow React best practices and modern patterns (hooks, composition).`,
    category: 'code-generation',
    role: 'engineer',
    pattern: 'template',
    tags: ['react', 'frontend', 'typescript', 'accessibility'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },

  // DEBUGGING
  {
    id: 'db-001',
    title: 'Bug Investigation Helper',
    description:
      'Systematic approach to debugging complex issues with root cause analysis',
    content: `Act as a senior debugging expert. Help me investigate this bug using a systematic approach:

**Bug Details:**
- Symptoms: {symptoms}
- Expected behavior: {expected}
- Actual behavior: {actual}
- Environment: {environment}
- Steps to reproduce: {steps}

**Provide:**
1. **Potential Root Causes**: List 3-5 likely causes ranked by probability
2. **Debugging Steps**: Specific actions to isolate the issue
3. **Questions to Ask**: What additional information would help?
4. **Tools to Use**: Recommended debugging tools/techniques
5. **Quick Wins**: Immediate things to check

Use a methodical, step-by-step approach.`,
    category: 'debugging',
    role: 'engineer',
    pattern: 'chain-of-thought',
    tags: ['debugging', 'troubleshooting', 'root-cause'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'db-002',
    title: 'Performance Bottleneck Analyzer',
    description: 'Identify and resolve performance issues in your application',
    content: `You are a performance optimization expert. Analyze this performance issue:

**Performance Problem:**
- Issue: {performance_issue}
- Metrics: {current_metrics}
- Target: {target_metrics}
- Stack: {tech_stack}

**Analysis Required:**
1. **Likely Bottlenecks**: Identify probable causes
2. **Profiling Strategy**: How to measure and confirm
3. **Optimization Approaches**: Specific techniques to try
4. **Trade-offs**: Pros/cons of each approach
5. **Implementation Priority**: Order by impact vs effort

Provide concrete, measurable recommendations.`,
    category: 'debugging',
    role: 'engineer',
    pattern: 'chain-of-thought',
    tags: ['performance', 'optimization', 'profiling'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },

  // DOCUMENTATION
  {
    id: 'doc-001',
    title: 'Architecture Decision Record (ADR)',
    description:
      'Create comprehensive ADRs for technical decisions with context and consequences',
    content: `You are a technical architect. Create an Architecture Decision Record (ADR) for:

**Decision:** {decision}
**Context:** {context}

**ADR Format:**
# ADR {number}: {title}

## Status
{Proposed | Accepted | Deprecated | Superseded}

## Context
What is the issue we're trying to solve? What are the constraints?

## Decision
What decision did we make and why?

## Consequences
### Positive
- What improves?

### Negative
- What trade-offs are we making?

### Neutral
- What else changes?

## Alternatives Considered
1. **Option 1**: Why we didn't choose this
2. **Option 2**: Why we didn't choose this

Be specific and include technical details.`,
    category: 'documentation',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['architecture', 'documentation', 'adr', 'decisions'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'doc-002',
    title: 'API Documentation Generator',
    description:
      'Generate comprehensive API documentation with examples and error cases',
    content: `You are a technical writer specializing in API documentation. Document this API:

**API Details:**
- Endpoint: {endpoint}
- Method: {method}
- Purpose: {purpose}

**Documentation Structure:**
# {Endpoint Name}

## Overview
Brief description of what this endpoint does.

## Request
### URL
\`{method} {endpoint}\`

### Headers
| Header | Required | Description |
|--------|----------|-------------|

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|

### Request Body
\`\`\`json
{example}
\`\`\`

## Response
### Success (200)
\`\`\`json
{example}
\`\`\`

### Errors
| Code | Description |
|------|-------------|

## Examples
### cURL
\`\`\`bash
{example}
\`\`\`

### JavaScript
\`\`\`javascript
{example}
\`\`\``,
    category: 'documentation',
    role: 'engineer',
    pattern: 'template',
    tags: ['api', 'documentation', 'technical-writing'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },

  // TESTING
  {
    id: 'test-001',
    title: 'Unit Test Generator',
    description:
      'Generate comprehensive unit tests with edge cases and mocking',
    content: `You are a testing expert. Generate unit tests for:

**Code to Test:**
\`\`\`{language}
{code}
\`\`\`

**Test Requirements:**
1. **Happy Path**: Test normal operation
2. **Edge Cases**: Boundary conditions, empty inputs, null/undefined
3. **Error Cases**: Invalid inputs, exceptions
4. **Mocking**: Mock external dependencies
5. **Assertions**: Clear, specific assertions

**Format:**
- Framework: {test_framework}
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Include setup/teardown if needed
- Add comments explaining complex test logic

Aim for >90% code coverage.`,
    category: 'testing',
    role: 'engineer',
    pattern: 'template',
    tags: ['testing', 'unit-tests', 'tdd'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'test-002',
    title: 'E2E Test Scenario Builder',
    description: 'Create end-to-end test scenarios for critical user flows',
    content: `You are a QA engineer specializing in E2E testing. Create test scenarios for:

**User Flow:** {user_flow}
**Tool:** {e2e_tool}

**Test Scenario Structure:**
## Test: {test_name}

### Objective
What are we testing?

### Preconditions
- User state
- Data setup
- Environment requirements

### Test Steps
1. **Step 1**: Action → Expected Result
2. **Step 2**: Action → Expected Result
...

### Assertions
- [ ] Assertion 1
- [ ] Assertion 2

### Cleanup
What needs to be reset?

### Edge Cases to Cover
- Case 1
- Case 2

Include both happy path and error scenarios.`,
    category: 'testing',
    role: 'qa',
    pattern: 'template',
    tags: ['e2e', 'testing', 'qa', 'user-flows'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },

  // REFACTORING
  {
    id: 'ref-001',
    title: 'Code Refactoring Assistant',
    description:
      'Refactor code for better maintainability, performance, and readability',
    content: `You are a refactoring expert. Analyze and refactor this code:

**Current Code:**
\`\`\`{language}
{code}
\`\`\`

**Refactoring Goals:**
{goals}

**Provide:**
1. **Issues Identified**: What's wrong with the current code?
2. **Refactored Code**: Improved version
3. **Explanation**: What changed and why?
4. **Benefits**: How is this better?
5. **Migration Notes**: How to safely apply these changes?

**Focus On:**
- SOLID principles
- DRY (Don't Repeat Yourself)
- Clear naming
- Reduced complexity
- Better error handling
- Improved testability

Show before/after comparison.`,
    category: 'refactoring',
    role: 'engineer',
    pattern: 'chain-of-thought',
    tags: ['refactoring', 'clean-code', 'solid'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },

  // ARCHITECTURE
  {
    id: 'arch-001',
    title: 'System Design Review',
    description:
      'Comprehensive system design review with scalability and reliability analysis',
    content: `You are a principal architect. Review this system design:

**System:** {system_description}
**Scale:** {scale_requirements}
**Constraints:** {constraints}

**Review Areas:**
1. **Architecture Patterns**: Are the right patterns being used?
2. **Scalability**: Can it handle growth?
3. **Reliability**: Single points of failure?
4. **Security**: Vulnerabilities and attack vectors?
5. **Performance**: Bottlenecks and optimization opportunities?
6. **Cost**: Resource efficiency?
7. **Maintainability**: Long-term sustainability?

**Provide:**
- Current state assessment
- Risks and concerns
- Specific recommendations
- Alternative approaches
- Migration strategy (if changes needed)

Use diagrams or ASCII art where helpful.`,
    category: 'architecture',
    role: 'engineering-manager',
    pattern: 'chain-of-thought',
    tags: ['architecture', 'system-design', 'scalability'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },

  // LEARNING
  {
    id: 'learn-001',
    title: 'Concept Explainer',
    description:
      'Explain complex technical concepts with examples and analogies',
    content: `You are a technical educator. Explain this concept:

**Concept:** {concept}
**Audience Level:** {beginner|intermediate|advanced}

**Explanation Structure:**
## What is {concept}?
Simple, one-sentence definition.

## Why Does It Matter?
Real-world relevance and use cases.

## How Does It Work?
Step-by-step explanation with examples.

## Analogy
Relate it to something familiar.

## Code Example
\`\`\`{language}
{practical_example}
\`\`\`

## Common Pitfalls
What mistakes do people make?

## Best Practices
How to use it effectively?

## Further Reading
- Resource 1
- Resource 2

Use clear language and avoid jargon. Build from simple to complex.`,
    category: 'learning',
    role: 'engineer',
    pattern: 'audience-persona',
    tags: ['learning', 'education', 'concepts'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },

  // GENERAL - FOR MANAGERS
  {
    id: 'gen-001',
    title: 'Technical Roadmap Builder',
    description:
      'Create strategic technical roadmaps aligned with business goals',
    content: `You are a technical product strategist. Help build a technical roadmap:

**Context:**
- Business Goals: {business_goals}
- Current State: {current_state}
- Timeline: {timeline}
- Team Size: {team_size}

**Roadmap Structure:**
## Q1: Foundation
### Goals
- Goal 1
- Goal 2

### Key Initiatives
1. **Initiative**: Description
   - Success Metrics
   - Dependencies
   - Risks

## Q2-Q4: Similar structure

**For Each Initiative:**
- Business value
- Technical complexity
- Resource requirements
- Dependencies
- Risks and mitigation

**Prioritization Framework:**
- Impact vs Effort matrix
- Dependencies mapping
- Risk assessment

Balance quick wins with long-term investments.`,
    category: 'general',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['roadmap', 'planning', 'strategy'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'gen-002',
    title: 'Sprint Planning Assistant',
    description:
      'Plan effective sprints with capacity planning and risk assessment',
    content: `You are an agile coach. Help plan this sprint:

**Sprint Details:**
- Duration: {duration}
- Team Capacity: {capacity}
- Carry-over: {carry_over_points}

**Backlog Items:**
{backlog_items}

**Provide:**
1. **Capacity Analysis**: Available vs required
2. **Sprint Goal**: Clear, achievable objective
3. **Story Selection**: What to include and why
4. **Risk Assessment**: What could go wrong?
5. **Dependencies**: Cross-team or technical
6. **Success Criteria**: How to measure success

**Consider:**
- Team velocity
- Technical debt allocation (20% rule)
- Buffer for unknowns
- Skills distribution
- Blockers and dependencies

Output a balanced, achievable sprint plan.`,
    category: 'general',
    role: 'engineering-manager',
    pattern: 'chain-of-thought',
    tags: ['agile', 'sprint-planning', 'scrum'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },
];

// Combine curated prompts with playbook prompts
export const seedPrompts: Omit<Prompt, 'createdAt' | 'updatedAt'>[] = [
  ...curatedPrompts,
  ...convertPlaybooksToPrompts(),
];

// Helper to add timestamps
export function getSeedPromptsWithTimestamps(): Prompt[] {
  const now = new Date();
  return seedPrompts.map((prompt, index) => ({
    ...prompt,
    createdAt: new Date(
      now.getTime() - (seedPrompts.length - index) * 24 * 60 * 60 * 1000
    ),
    updatedAt: new Date(
      now.getTime() - (seedPrompts.length - index) * 24 * 60 * 60 * 1000
    ),
  }));
}
