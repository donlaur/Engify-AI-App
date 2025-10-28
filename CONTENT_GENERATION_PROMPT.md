# Content Generation Prompt for Gemini

Copy this entire prompt and paste it into Google Gemini to generate 10 learning articles + 10 prompt playbooks.

---

# System Context: Engify.ai Platform

## What We Are
Engify.ai is an AI engineering education platform that teaches prompt engineering through role-based, practical content. We help teams adopt AI effectively with curated prompts, patterns, and learning resources.

## Our Philosophy
- **Quality over quantity** - Every piece of content is production-ready
- **Role-specific** - Different roles need different approaches
- **Pattern-based** - Teach frameworks, not just examples
- **Practical** - Real-world use cases, not theory

---

## Current Content Inventory

### 1. ROLES WE SERVE (6 Primary Roles)
1. **C-Level / Directors** - Strategic decision-making, ROI analysis
2. **Engineering Managers** - Team leadership, technical strategy
3. **Engineers** (Junior, Mid, Senior) - Code, architecture, debugging
4. **Product Managers** (Associate, Mid, Senior) - Product strategy, roadmaps
5. **Designers** (UI/UX, Product) - Design systems, user research
6. **QA Engineers** - Testing, automation, quality assurance

### 2. PROMPT PATTERNS (23 Total)

**Basic Patterns (8)**:
1. Persona Pattern - "Act as..." role-based prompting
2. Few-Shot Learning - Provide examples
3. Zero-Shot - No examples needed
4. Chain-of-Thought - Step-by-step reasoning
5. Template Pattern - Structured formats
6. Cognitive Verifier - Self-checking
7. Critique & Improve - Iterative refinement
8. Flipped Interaction - AI asks questions

**Advanced Patterns (8)**:
9. Agent Pattern - Autonomous task completion
10. Function Calling - Tool use and API integration
11. Chain-of-Thought with Verification - Self-checking reasoning
12. Meta-Prompting - AI generates prompts
13. Multi-Agent Collaboration - Multiple AI agents working together
14. Constitutional AI - Built-in ethics and safety
15. Iterative Refinement - Progressive improvement
16. Context Stuffing - Maximize context window usage

**Production Patterns (7)**:
17. RAG (Retrieval-Augmented Generation)
18. Prompt Chaining - Sequential workflows
19. Batch Processing - Scale operations
20. Streaming Responses - Real-time UX
21. Error Handling - Graceful degradation
22. Caching - Performance optimization
23. A/B Testing - Prompt comparison

### 3. EXISTING PROMPT PLAYBOOKS (76 Total)

**By Role**:
- **Junior Engineers** (3): Code Navigator, Debug Assistant, Concept Translator
- **Mid Engineers** (3): PR Review Co-Pilot, Feature Pre-Mortem, Mentorship Prep
- **Senior Engineers** (4): ADR Drafter, Tech Debt Case, System Design, Security Review
- **Associate PMs** (3): User Story Crafter, Feedback Synthesizer, Stakeholder Update
- **Mid PMs** (3): Prioritization Framework, Dependency Mapper, Meeting Facilitator
- **Senior PMs** (3): Market Analysis, Vision Memo, Strategy Critique
- **Product Owners** (3): Story Refiner, Backlog Groomer, Sprint Planner
- **Designers** (~20): Various design-specific prompts
- **QA Engineers** (~15): Testing and quality prompts
- **Directors/C-Level** (~19): Strategic and leadership prompts

### 4. EXISTING LEARNING ARTICLES (26 Total)

**Topics Covered**:
- Introduction to Prompt Engineering
- LLM Basics (tokens, context windows, embeddings)
- RAG (Retrieval-Augmented Generation)
- AI Agents and Autonomous Systems
- Function Calling and Tool Use
- Prompt Chaining and Workflows
- Security (Prompt Injection, Safety)
- Production AI (Testing, Monitoring, Cost Optimization)
- Multimodal AI (Vision, Audio)
- Code Generation and Review

### 5. KERNEL FRAMEWORK (Our Unique Methodology)

**6 Principles**:
- **K**eep it Simple - One clear goal per prompt
- **E**asy to Verify - Objective success criteria
- **R**eproducible - Consistent results
- **N**arrow Scope - Focused, not broad
- **E**xplicit Constraints - Clear boundaries
- **L**ogical Structure - Organized format

**Results**: 94% success rate, 58% token reduction

---

## TASK 1: Generate 10 Learning Articles

### Requirements
- **Length**: 1000-1500 words each
- **Format**: Markdown with headers (##, ###)
- **Tone**: Professional but accessible, for engineers
- **Structure**: Intro → Sections → Key Takeaways
- **Content**: Practical examples, code snippets, real use cases
- **Quality**: Production-ready, not generic

### Topics to Cover (Fill These Gaps)

1. **"Prompt Engineering for Data Analysis: SQL, Python, and Pandas"**
   - How to use AI for data analysis tasks
   - SQL query generation from natural language
   - Python/Pandas code generation
   - Data visualization prompts
   - Common pitfalls and best practices

2. **"Building Chatbots: From Simple Q&A to Context-Aware Assistants"**
   - Chatbot architecture patterns
   - Context management strategies
   - Conversation flow design
   - Handling edge cases
   - Production deployment considerations

3. **"Prompt Engineering for Content Creation: Blogs, Social Media, and Marketing"**
   - Content generation best practices
   - SEO-optimized content prompts
   - Brand voice consistency
   - Multi-platform adaptation
   - Quality control and editing

4. **"Fine-Tuning vs RAG vs Prompt Engineering: Complete Decision Guide"**
   - When to use each approach
   - Cost-benefit analysis
   - Implementation complexity
   - Performance comparison
   - Decision framework with examples

5. **"Debugging AI Responses: When Prompts Go Wrong"**
   - Common failure modes
   - Debugging strategies
   - Prompt iteration techniques
   - Testing and validation
   - Root cause analysis

6. **"Prompt Engineering for Legal and Compliance Use Cases"**
   - Legal document analysis
   - Contract review prompts
   - Compliance checking
   - Risk assessment
   - Ethical considerations and limitations

7. **"Building AI-Powered Documentation: Auto-Generate Docs, Comments, and READMEs"**
   - Code documentation generation
   - API documentation prompts
   - README generation
   - Comment quality standards
   - Maintenance strategies

8. **"Prompt Engineering for Customer Support: Ticket Classification and Response"**
   - Ticket categorization
   - Response generation
   - Sentiment analysis
   - Escalation criteria
   - Quality assurance

9. **"Multi-Language Prompt Engineering: Handling Non-English Content"**
   - Translation best practices
   - Cultural context considerations
   - Language-specific patterns
   - Quality validation
   - Common challenges

10. **"Prompt Engineering Metrics: Measuring Success and ROI"**
    - Key performance indicators
    - Quality metrics
    - Cost tracking
    - User satisfaction measurement
    - ROI calculation frameworks

### Output Format for Each Article

```markdown
# [Article Title]

[2-3 sentence introduction that hooks the reader]

## Why This Matters

[Explain the business/technical value]

## [Main Section 1]

[Content with examples]

## [Main Section 2]

[Content with examples]

## [Main Section 3]

[Content with examples]

## Best Practices

- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

## Common Pitfalls to Avoid

- [Pitfall 1]
- [Pitfall 2]

## Key Takeaways

- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

## Next Steps

[What the reader should do next]
```

---

## TASK 2: Generate 10 Prompt Playbooks

### Requirements
- **Length**: 300-800 words per prompt
- **Format**: Detailed instructions with placeholders
- **Tone**: Direct, actionable, professional
- **Structure**: Context → Task → Process → Output
- **Quality**: Production-ready, immediately usable

### Roles/Patterns to Cover (Fill These Gaps)

1. **Designer: Accessibility Audit Assistant**
   - **Role**: Mid-Level UX Designer
   - **Pattern**: Cognitive Verifier
   - **Purpose**: Audit designs for WCAG compliance
   - **Output**: Detailed accessibility report with fixes

2. **QA Engineer: Test Case Generator**
   - **Role**: Senior QA Engineer
   - **Pattern**: Few-Shot + Chain-of-Thought
   - **Purpose**: Generate comprehensive test cases from requirements
   - **Output**: Structured test cases with edge cases

3. **Engineering Manager: Performance Review Drafter**
   - **Role**: Engineering Manager
   - **Pattern**: Template + Persona
   - **Purpose**: Draft fair, constructive performance reviews
   - **Output**: Structured review document

4. **Data Analyst: Dashboard Requirements Translator**
   - **Role**: Data Analyst
   - **Pattern**: Flipped Interaction
   - **Purpose**: Convert business questions into dashboard specs
   - **Output**: Technical requirements document

5. **DevOps Engineer: Incident Post-Mortem Writer**
   - **Role**: Senior DevOps Engineer
   - **Pattern**: Chain-of-Thought + Template
   - **Purpose**: Document incidents with root cause analysis
   - **Output**: Blameless post-mortem report

6. **Product Designer: User Research Synthesizer**
   - **Role**: Senior Product Designer
   - **Pattern**: Cognitive Verifier
   - **Purpose**: Synthesize user research into actionable insights
   - **Output**: Research findings with recommendations

7. **Technical Writer: API Documentation Generator**
   - **Role**: Technical Writer
   - **Pattern**: Template + Few-Shot
   - **Purpose**: Generate clear API documentation from code
   - **Output**: Formatted API docs with examples

8. **Sales Engineer: Technical Demo Script Creator**
   - **Role**: Sales Engineer
   - **Pattern**: Persona + Template
   - **Purpose**: Create compelling technical demo scripts
   - **Output**: Step-by-step demo guide

9. **Security Engineer: Threat Modeling Assistant**
   - **Role**: Security Engineer
   - **Pattern**: Chain-of-Thought + Cognitive Verifier
   - **Purpose**: Identify security threats in system designs
   - **Output**: Threat model with mitigations

10. **Customer Success Manager: Onboarding Plan Creator**
    - **Role**: Customer Success Manager
    - **Pattern**: Template + Flipped Interaction
    - **Purpose**: Create personalized customer onboarding plans
    - **Output**: 30-60-90 day onboarding roadmap

### Output Format for Each Playbook

```markdown
## [Role]: [Playbook Title]

**Description**: [One sentence explaining what this does]

**Patterns Used**: [List of patterns]

**Level**: [beginner/intermediate/advanced]

**Prompt**:

Act as [specific role with expertise level]. [Context about the situation].

Your task is to [specific objective]. [Any constraints or requirements].

Follow this process:
1. **[Step 1 Name]**: [What to do]
2. **[Step 2 Name]**: [What to do]
3. **[Step 3 Name]**: [What to do]
4. **[Step 4 Name]**: [What to do]

[Any additional instructions or formatting requirements]

--- INPUT ---
[Placeholder for user input]
```

---

## IMPORTANT GUIDELINES

### For Learning Articles:
1. **Be Specific**: Use real examples, not generic ones
2. **Include Code**: Show actual code snippets where relevant
3. **Cite Sources**: Reference real tools, frameworks, research
4. **Avoid Fluff**: Every sentence should add value
5. **Be Practical**: Focus on "how" not just "what"

### For Prompt Playbooks:
1. **Be Prescriptive**: Tell the AI exactly what to do
2. **Use Placeholders**: [Brackets] for user input
3. **Structure Output**: Specify the format you want
4. **Add Constraints**: Define what NOT to do
5. **Test Mentally**: Would this work if you ran it?

### Quality Standards:
- **No Generic AI Speak**: Avoid "delve", "leverage", "utilize"
- **No Fluff**: Get to the point quickly
- **No Obvious Advice**: Assume the reader is smart
- **Yes to Examples**: Show, don't just tell
- **Yes to Specifics**: Names, numbers, tools, frameworks

---

## YOUR TASK

Generate all 20 pieces of content (10 articles + 10 playbooks) following the specifications above.

For each article:
1. Write 1000-1500 words
2. Use the markdown format specified
3. Include practical examples
4. Be specific and actionable

For each playbook:
1. Write 300-800 words
2. Use the prompt format specified
3. Make it immediately usable
4. Include clear placeholders

**Start with Article 1, then continue through all 10 articles, then all 10 playbooks.**

Ready? Begin generating now.
