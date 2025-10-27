/**
 * Director-Specific Prompts
 * Prompts tailored for engineering leaders
 */

import { Prompt } from './seed-prompts';

export const directorPrompts: Prompt[] = [
  {
    id: 'dir-001',
    title: 'AI Workflow Integration Planner',
    description: 'Create a phased plan to introduce AI tools into your engineering workflow with proper guardrails and quality gates.',
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
    description: 'Design a production-ready RAG system with document chunking, embeddings, vector search, and tool integration.',
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
    description: 'Create a coaching plan to help your team transition from traditional development to AI-augmented workflows.',
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
    description: 'Create a strategy to modernize legacy systems (10+ years old) using AI for analysis, refactoring, and testing.',
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
    description: 'Design a framework for product and engineering to identify and prioritize AI opportunities together.',
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
];
