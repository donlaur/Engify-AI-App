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
/**
 * Director-Specific Prompts
 * Prompts tailored for engineering leaders
 */

import { Prompt } from './seed-prompts';

export const directorPrompts: Prompt[] = [
  {
    id: 'dir-001',
    title: 'AI Workflow Integration Planner',
    description:
      'Create a phased plan to introduce AI tools into your engineering workflow with proper guardrails and quality gates.',
    content: `You are an engineering director consultant specializing in AI adoption. Help me create a practical plan to introduce AI into our engineering workflow.

**Our Context:**
- Team size: [X engineers]
- Current tools: [list tools]
- Main concerns: [security, quality, consistency, etc.]

**Create a phased rollout plan that includes:**

1. **Phase 1 (Weeks 1-2): Foundation**
   - What guardrails to establish (linting, testing, code review standards)
   - Which workflows to start with (lowest risk, highest value)
   - Success metrics to track

2. **Phase 2 (Weeks 3-4): Expansion**
   - Additional workflows to enable
   - Team training approach
   - Quality checkpoints

3. **Phase 3 (Weeks 5-8): Optimization**
   - How to measure impact
   - When to adjust guardrails
   - Scaling to full team

**For each phase, specify:**
- Specific AI tools/prompts to introduce
- Quality gates and review processes
- Team communication plan
- Risk mitigation strategies

Make this actionable and specific to our context.`,
    category: 'leadership',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['ai-adoption', 'workflow', 'planning', 'guardrails'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'dir-002',
    title: 'RAG System Architecture Designer',
    description:
      'Design a production-ready RAG system with document chunking, embeddings, vector search, and tool integration.',
    content: `You are a senior AI architect with expertise in RAG (Retrieval-Augmented Generation) systems. Help me design a production-ready RAG system.

**Our Use Case:**
[Describe: support chatbot, documentation search, code assistant, etc.]

**Requirements:**
- Data sources: [documents, code, APIs, etc.]
- Scale: [number of documents, users, queries/day]
- Latency requirements: [response time expectations]

**Design the following components:**

1. **Document Processing Pipeline**
   - Chunking strategy (size, overlap, metadata)
   - Embedding model selection (OpenAI, Cohere, open-source)
   - When to re-chunk and re-embed

2. **Vector Database Setup**
   - Which vector DB (Pinecone, Weaviate, Qdrant, pgvector)
   - Index configuration
   - Metadata filtering strategy

3. **Retrieval Strategy**
   - Hybrid search (vector + keyword)
   - Re-ranking approach
   - Number of chunks to retrieve

4. **Tool Integration (Langchain/Langgraph)**
   - Which tools to expose
   - Tool calling patterns
   - Error handling

5. **Production Considerations**
   - Caching strategy
   - Monitoring and observability
   - Cost optimization
   - Security (data access, PII handling)

**Provide:**
- Architecture diagram (text-based)
- Technology recommendations with trade-offs
- Implementation phases
- Estimated costs and performance metrics`,
    category: 'architecture',
    role: 'engineering-manager',
    pattern: 'chain-of-thought',
    tags: ['rag', 'ai-architecture', 'vector-search', 'langchain'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'dir-003',
    title: 'Team AI Coaching Framework',
    description:
      'Create a coaching plan to help your team transition from traditional development to AI-augmented workflows.',
    content: `You are an engineering leadership coach specializing in AI transformation. Help me create a coaching framework for my team's AI transition.

**Team Context:**
- Team size: [X engineers]
- Experience levels: [junior/mid/senior/staff distribution]
- Current AI usage: [none/basic/intermediate]
- Team culture: [describe]

**Create a coaching framework that addresses:**

1. **Individual Coaching Plans**
   - How to assess each engineer's AI readiness
   - Personalized learning paths by level
   - Success metrics that evolve (junior → senior → staff)
   - 1:1 conversation guides

2. **Changing Success Criteria**
   - What "good" looks like with AI assistance
   - How to evaluate AI-generated code in reviews
   - New expectations for documentation, testing, speed
   - Staff-level thinking: when to use AI vs when not to

3. **Team Rituals & Practices**
   - Weekly AI learning sessions (what to cover)
   - Prompt sharing and review process
   - AI wins and fails retrospectives
   - Building a culture of experimentation

4. **Addressing Resistance**
   - Common concerns and how to address them
   - Showing value without forcing adoption
   - Celebrating early wins
   - Supporting those who struggle

5. **Measuring Progress**
   - Leading indicators (adoption, experimentation)
   - Lagging indicators (velocity, quality, satisfaction)
   - Team surveys and feedback loops
   - When to adjust the approach

**Provide specific:**
- Week-by-week rollout plan
- Conversation scripts for 1:1s
- Team meeting agendas
- Success stories to share`,
    category: 'leadership',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['coaching', 'team-development', 'ai-adoption', 'culture'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'dir-004',
    title: 'Legacy System Modernization with AI',
    description:
      'Create a strategy to modernize legacy systems (10+ years old) using AI for analysis, refactoring, and testing.',
    content: `You are a software modernization expert. Help me create a strategy to modernize our legacy system using AI.

**System Context:**
- Age: [X years old]
- Tech stack: [languages, frameworks]
- Size: [lines of code, number of files]
- Pain points: [performance, maintainability, tech debt]
- Team familiarity: [how well team knows the code]

**Create a modernization strategy:**

1. **AI-Assisted Analysis Phase**
   - Use AI to map system architecture
   - Identify high-risk areas
   - Find dead code and unused features
   - Document undocumented behavior
   - Specific prompts to use for each task

2. **Incremental Refactoring Plan**
   - Which modules to tackle first (risk vs value)
   - AI-assisted refactoring approach
   - How to maintain functionality
   - Testing strategy (AI-generated tests)

3. **Knowledge Transfer**
   - Use AI to create documentation
   - Generate onboarding materials
   - Build internal knowledge base
   - Reduce bus factor

4. **Decision Framework**
   - When to refactor vs rebuild
   - How to evaluate "disposable" vs "maintainable"
   - Cost-benefit analysis template
   - Risk assessment

5. **Execution Plan**
   - Phase 1-3 breakdown
   - Team allocation
   - Rollback strategies
   - Success metrics

**Consider:**
- Minimal disruption to business
- Maintaining stability
- Team learning curve
- Budget constraints`,
    category: 'architecture',
    role: 'engineering-manager',
    pattern: 'chain-of-thought',
    tags: ['legacy-modernization', 'refactoring', 'technical-debt'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'dir-005',
    title: 'Product-Engineering AI Collaboration Framework',
    description:
      'Design a framework for product and engineering to identify and prioritize AI opportunities together.',
    content: `You are a product-engineering collaboration expert. Help me create a framework for product and engineering to work together on AI opportunities.

**Our Context:**
- Product team size: [X PMs, Y designers]
- Engineering team size: [Z engineers]
- Current collaboration: [describe current process]
- Product roadmap: [describe current priorities]

**Create a collaboration framework:**

1. **AI Opportunity Discovery**
   - Weekly/monthly AI brainstorming format
   - How to identify "newly possible" features
   - Evaluation criteria (feasibility, value, cost)
   - Prototype vs production decision framework

2. **Joint Planning Process**
   - How to estimate AI features (different from traditional)
   - Risk assessment for AI features
   - Success metrics definition
   - Fallback plans when AI doesn't work

3. **Communication Patterns**
   - How engineers explain AI capabilities to product
   - How product communicates user needs for AI
   - Shared language and mental models
   - Regular sync cadence

4. **Experimentation Framework**
   - Fast prototyping process
   - User testing with AI features
   - When to pivot vs persevere
   - Learning capture and sharing

5. **Specific AI Use Cases to Explore**
   - Based on our product: [describe product]
   - Quick wins (1-2 weeks)
   - Medium bets (1-2 months)
   - Big swings (3-6 months)

**Deliverables:**
- Meeting templates
- Decision frameworks
- Communication guidelines
- Example AI feature specs`,
    category: 'leadership',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['product-collaboration', 'ai-features', 'planning'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },

  // PRODUCT MANAGER PROMPTS
  {
    id: 'pm-001',
    title: 'User Story Generator',
    description: 'Generate comprehensive user stories with acceptance criteria',
    content: `You are a product management expert. Create detailed user stories for:

**Feature:** {feature_description}

**Include:**
1. User story format (As a... I want... So that...)
2. Acceptance criteria (Given/When/Then)
3. Edge cases and error scenarios
4. Success metrics
5. Dependencies and assumptions

Make stories specific, testable, and valuable.`,
    category: 'documentation',
    role: 'product-manager',
    pattern: 'template',
    tags: ['user-stories', 'agile', 'requirements'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },
  {
    id: 'pm-002',
    title: 'Feature Prioritization Matrix',
    description: 'Prioritize features using impact vs effort analysis',
    content: `You are a product strategist. Help me prioritize these features:

**Features to evaluate:** {list_features}

**Create a prioritization matrix:**
1. Impact score (1-10): User value, business value, strategic alignment
2. Effort score (1-10): Engineering complexity, design work, dependencies
3. Risk assessment: Technical risk, market risk, execution risk
4. Recommended priority: Must-have, Should-have, Nice-to-have
5. Sequencing rationale: Why this order?

Provide clear recommendations with data-driven reasoning.`,
    category: 'leadership',
    role: 'product-manager',
    pattern: 'chain-of-thought',
    tags: ['prioritization', 'strategy', 'roadmap'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'pm-003',
    title: 'Competitive Analysis',
    description:
      'Analyze competitors and identify differentiation opportunities',
    content: `You are a market analyst. Conduct a competitive analysis for:

**Our product:** {product_description}
**Competitors:** {list_competitors}

**Analyze:**
1. Feature comparison matrix
2. Pricing and positioning
3. Strengths and weaknesses
4. Market gaps and opportunities
5. Differentiation strategy recommendations

Focus on actionable insights for product strategy.`,
    category: 'leadership',
    role: 'product-manager',
    pattern: 'few-shot',
    tags: ['competitive-analysis', 'strategy', 'market-research'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },

  // DESIGNER PROMPTS
  {
    id: 'des-001',
    title: 'UX Audit',
    description:
      'Conduct comprehensive UX audit with actionable recommendations',
    content: `You are a UX expert. Audit this interface and provide recommendations:

**Interface:** {describe_interface}

**Evaluate:**
1. Usability: Navigation, clarity, consistency
2. Accessibility: WCAG compliance, screen readers, keyboard navigation
3. Visual hierarchy: Information architecture, typography, spacing
4. User flow: Task completion, friction points, error prevention
5. Mobile responsiveness: Touch targets, layouts, performance

Provide specific, prioritized recommendations.`,
    category: 'documentation',
    role: 'designer',
    pattern: 'persona',
    tags: ['ux', 'audit', 'accessibility'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'des-002',
    title: 'Design System Component',
    description: 'Create design system component with variants and guidelines',
    content: `You are a design systems expert. Create a component specification:

**Component:** {component_name}
**Purpose:** {component_purpose}

**Define:**
1. Variants: Sizes, states, types
2. Props/attributes: Required and optional
3. Accessibility: ARIA labels, keyboard support
4. Usage guidelines: When to use, when not to use
5. Code examples: HTML/React implementation
6. Design tokens: Colors, spacing, typography

Follow atomic design principles.`,
    category: 'code-generation',
    role: 'designer',
    pattern: 'template',
    tags: ['design-system', 'components', 'ui'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },
  {
    id: 'des-003',
    title: 'User Research Plan',
    description: 'Design user research study with methodology and questions',
    content: `You are a UX researcher. Create a research plan for:

**Research goal:** {research_objective}
**Target users:** {user_segments}

**Plan:**
1. Research methodology: Interviews, surveys, usability testing
2. Participant criteria and recruitment
3. Discussion guide/test scenarios
4. Key questions to answer
5. Success metrics
6. Timeline and resources needed

Make it actionable and focused on insights.`,
    category: 'documentation',
    role: 'designer',
    pattern: 'template',
    tags: ['user-research', 'ux', 'methodology'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },

  // C-LEVEL / DIRECTOR PROMPTS
  {
    id: 'exec-001',
    title: 'Engineering Metrics Dashboard',
    description: 'Define key engineering metrics for executive reporting',
    content: `You are an engineering executive. Define metrics for our engineering dashboard:

**Organization:** {team_size} engineers, {product_description}

**Create metrics framework:**
1. Velocity metrics: Deployment frequency, lead time, cycle time
2. Quality metrics: Bug rates, incident frequency, test coverage
3. Team health: Retention, satisfaction, growth
4. Business impact: Feature adoption, performance, cost
5. Leading vs lagging indicators

Provide specific formulas and targets for each metric.`,
    category: 'leadership',
    role: 'director',
    pattern: 'template',
    tags: ['metrics', 'kpis', 'reporting'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'exec-002',
    title: 'Technical Strategy Presentation',
    description: 'Create executive presentation for technical strategy',
    content: `You are a CTO. Create a board-level presentation for:

**Strategy:** {technical_initiative}

**Presentation structure:**
1. Executive summary: Problem, solution, impact (1 slide)
2. Current state analysis: Challenges, costs, risks
3. Proposed solution: Architecture, timeline, resources
4. Business case: ROI, competitive advantage, risk mitigation
5. Implementation plan: Phases, milestones, dependencies
6. Ask: Budget, headcount, executive support

Make it concise, data-driven, and business-focused.`,
    category: 'leadership',
    role: 'director',
    pattern: 'template',
    tags: ['strategy', 'presentation', 'executive'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: true,
  },
  {
    id: 'exec-003',
    title: 'Team Scaling Plan',
    description: 'Plan engineering team growth and organization',
    content: `You are a VP of Engineering. Create a team scaling plan:

**Current state:** {current_team_size} engineers
**Growth target:** {target_team_size} in {timeframe}
**Product needs:** {product_roadmap}

**Plan:**
1. Hiring strategy: Roles, seniority mix, timeline
2. Team structure: Squads, platforms, reporting lines
3. Onboarding process: Ramp-up time, training, mentorship
4. Culture preservation: Values, practices, rituals
5. Budget and resources: Compensation, tools, space
6. Success metrics: Productivity, retention, quality

Balance speed with quality and culture.`,
    category: 'leadership',
    role: 'director',
    pattern: 'chain-of-thought',
    tags: ['hiring', 'scaling', 'organization'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
  },
];
