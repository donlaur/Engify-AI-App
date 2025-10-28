# Content Backlog - Ideas to Integrate Later

## Email: "8 AI Skills That Actually Matter Right Now"

**Source**: Dhaval Bhatt, AI Product Accelerator  
**Date Added**: Oct 27, 2025  
**Relevance**: High - aligns with our educational mission  
**Phase to Integrate**: Phase 6 or 7 (Learning Content)

### Key Content

**The 8 Skills:**

1. **Prompt Design** - Structuring input/output for predictable results
2. **RAG Basics** - Retrieval-Augmented Generation with proprietary data
3. **API Literacy** - Wiring APIs together, reading docs, debugging
4. **No-Code Workflow Tools** - Zapier, Make, Retool for rapid prototyping
5. **UX for AI** - Design for trust, retries, editability
6. **LLM Cost Awareness** - Forecasting token spend for viability
7. **Eval Discipline** - Building test sets for accuracy/consistency
8. **Storytelling** - Packaging AI outputs into narratives

### Integration Ideas

#### 1. Learning Paths (Phase 7)

Create skill-based learning tracks:

- **Beginner Track**: Prompt Design → API Literacy → Storytelling
- **Intermediate Track**: RAG Basics → Eval Discipline → UX for AI
- **Advanced Track**: LLM Cost Awareness → No-Code Workflows

#### 2. Prompt Library Categories (Phase 5 - Later)

Add prompts for each skill:

- "Prompt Design" category with templates
- "RAG Implementation" examples
- "Cost Optimization" prompts

#### 3. Blog/Resources Section (Phase 7)

- Article: "The 8 AI Skills Every Developer Needs"
- Link to original content with attribution
- Our own take with examples

#### 4. Workbench Features (Phase 5 - Later)

- **Cost Calculator**: Show token usage and cost
- **Eval Builder**: Create test sets for prompts
- **Storytelling Mode**: Format AI outputs as narratives

#### 5. AI Coding Assistant Section (Phase 5-6)

- **No-Code Tools Guide**: How to use Zapier/Make with AI
- **API Integration Patterns**: Common API workflows
- **UX Best Practices**: Design patterns for AI products

### Action Items (For Later)

- [ ] Create "8 Skills" learning path
- [ ] Add skill-based prompt categories
- [ ] Write blog post with our perspective
- [ ] Build cost calculator in Workbench
- [ ] Add eval/testing features
- [ ] Create UX guidelines for AI products

### Attribution

**Author**: Dhaval Bhatt  
**Organization**: AI Product Accelerator  
**Email**: dhaval@aiproductaccelerator.com  
**Link**: [Apply Now](https://aiproductaccelerator.com) (assumed)

---

## Notes

This content is **excellent** and aligns perfectly with our mission. However:

- It's **not urgent** - we're in Phase 5 (Core Features)
- It belongs in **Phase 6-7** (Learning Content & Resources)
- We should **finish current work first**

**Saved for future integration!** ✅

---

## Feature Idea: Cursor/Windsurf Rules Builder

**Date Added**: Oct 27, 2025  
**Relevance**: High - ties into AI Coding Assistant section  
**Phase to Integrate**: Phase 6 (AI Coding Assistant Tools)  
**Priority**: Medium-High

### Concept

An interactive tool in the Workbench that helps users build `.cursorrules` or `.windsurfrules` files.

### Features

1. **Interactive Form Builder**
   - Tech stack selector (Next.js, React, Python, etc.)
   - Code style preferences (tabs/spaces, naming conventions)
   - Framework-specific options
   - Custom rules input

2. **Live Preview**
   - Show generated rule file in real-time
   - Syntax highlighting
   - Format validation

3. **Template Library**
   - Pre-built templates for popular stacks
   - Community-contributed rules
   - Role-specific templates (Frontend, Backend, Full-stack)

4. **Export Options**
   - Download as `.cursorrules` file
   - Download as `.windsurfrules` file
   - Download as `AGENTS.md` file
   - Copy to clipboard

5. **Integration Points**
   - Link from AI Coding Assistant section
   - Accessible from Workbench
   - Shareable URLs for team standards

### Technical Implementation

**Route**: `/workbench/rules-builder`

**Components Needed:**

- `RulesBuilderForm.tsx` - Interactive form
- `RulesPreview.tsx` - Live preview panel
- `TemplateSelector.tsx` - Choose from templates
- `ExportOptions.tsx` - Download/copy buttons

**Data Structure:**

```typescript
interface RuleBuilderConfig {
  techStack: string[];
  codeStyle: {
    indentation: 'tabs' | 'spaces';
    quotes: 'single' | 'double';
    semicolons: boolean;
  };
  frameworks: string[];
  customRules: string[];
  template?: string;
}
```

### User Flow

1. User navigates to `/workbench/rules-builder`
2. Selects tech stack (e.g., Next.js + TypeScript + Tailwind)
3. Configures preferences via form
4. Sees live preview of generated rules
5. Adds custom rules if needed
6. Downloads or copies to clipboard
7. Adds file to their project

### Value Proposition

- **Saves time**: No need to write rules from scratch
- **Best practices**: Templates include proven patterns
- **Team alignment**: Easy to share and standardize
- **Learning tool**: See examples of good rules
- **Reduces errors**: Validated format

### Integration with Existing Features

**AI Coding Assistant Section:**

- Link to Rules Builder from main page
- "Generate Rules" CTA button
- Examples show output from builder

**Workbench:**

- New tab: "Rules Builder"
- Sits alongside prompt testing
- Can test rules with AI

**Prompt Library:**

- Add "Rules" category
- Prompts for generating custom rules
- Link to builder tool

### Future Enhancements

- **AI-Powered Suggestions**: Analyze codebase, suggest rules
- **Team Rules Manager**: Create and enforce team-wide rules
- **Version Control**: Track rule changes over time
- **Analytics**: See which rules are most effective
- **Community Sharing**: Share and rate rules

### Why This is Valuable

1. **Addresses real pain**: Developers struggle with rules syntax
2. **Differentiates us**: No one else has this tool
3. **Drives engagement**: Interactive, useful tool
4. **Supports main mission**: Better AI coding practices
5. **Monetization potential**: Premium templates, team features

### Action Items (For Phase 6)

- [ ] Design Rules Builder UI
- [ ] Create form components
- [ ] Build live preview
- [ ] Add 10+ templates
- [ ] Implement export functionality
- [ ] Add to Workbench navigation
- [ ] Link from AI Coding Assistant section
- [ ] Write documentation
- [ ] Create demo video

**Saved for Phase 6!** ✅

---

## Research: AI Personalities & Mentor Matching

**Source**: SonarSource - "The Coding Personalities of Leading LLMs"  
**URL**: https://www.sonarsource.com/the-coding-personalities-of-leading-llms.pdf  
**Date Added**: Oct 28, 2025  
**Relevance**: High - aligns with role-based personalization  
**Phase to Integrate**: Phase 6-7 (Learning System & Personalization)  
**Priority**: High

### Key Concept

Different AI models have different "personalities" and strengths. Users should be able to pick the right AI mentor based on their needs and learning style.

### Integration Ideas

#### 1. AI Mentor Selector (Phase 6-7)

Create a feature that helps users choose the right AI model based on:

- **Learning Style**: Visual learner, hands-on, theoretical
- **Experience Level**: Beginner, intermediate, advanced
- **Task Type**: Code review, debugging, architecture, learning
- **Personality Preference**: Patient teacher, direct feedback, encouraging coach

#### 2. Model Personality Profiles

Document each model's "personality":

- **GPT-4**: Comprehensive, detailed, patient teacher
- **Claude**: Thoughtful, ethical, step-by-step guide
- **Gemini**: Fast, practical, hands-on mentor
- **Groq**: Quick, efficient, direct feedback

#### 3. Smart Model Routing (Phase 7)

Auto-select the best model based on:

- User's role (C-Level, Engineer, PM, Designer, QA)
- Prompt type (learning, debugging, optimization)
- User's past preferences
- Task complexity

#### 4. Workbench Feature: "Find Your AI Mentor"

Interactive quiz/tool:

1. Answer questions about learning style
2. Describe your current challenge
3. Get matched with best AI model
4. See personality comparison chart
5. Try different models side-by-side

#### 5. Content Opportunities

**Blog Posts:**

- "Which AI Model is Your Perfect Coding Mentor?"
- "Understanding AI Personalities: A Guide for Developers"
- "How to Choose the Right LLM for Your Task"

**Documentation:**

- Model personality comparison chart
- Use case recommendations
- Strengths and weaknesses of each model

**Learning Content:**

- Video: "Meet Your AI Mentors"
- Interactive demo: Compare model responses
- Case studies: When to use which model

### Technical Implementation

**Route**: `/workbench/mentor-matcher`

**Components:**

- `MentorQuiz.tsx` - Interactive questionnaire
- `PersonalityChart.tsx` - Visual comparison
- `ModelRecommendation.tsx` - Show best match
- `SideBySideTest.tsx` - Compare models live

**Data Structure:**

```typescript
interface AIPersonality {
  model: string;
  traits: {
    patience: number; // 1-10
    detail: number; // 1-10
    speed: number; // 1-10
    creativity: number; // 1-10
    directness: number; // 1-10
  };
  bestFor: string[];
  learningStyle: string[];
  examples: string[];
}
```

### Research Integration

**Action Items:**

- [ ] Read SonarSource PDF thoroughly
- [ ] Extract key personality traits per model
- [ ] Map traits to user needs
- [ ] Create personality profiles
- [ ] Design mentor matching algorithm
- [ ] Build interactive quiz
- [ ] Add to Workbench
- [ ] Write blog post with findings
- [ ] Create comparison chart
- [ ] Add to documentation

### Why This Matters

1. **Personalization**: Matches users with best AI for their needs
2. **Education**: Teaches users about model differences
3. **Engagement**: Interactive, fun feature
4. **Differentiation**: Unique approach to model selection
5. **Value**: Helps users get better results faster

### Connection to Existing Features

**Role-Based Personalization:**

- C-Level → GPT-4 (comprehensive, strategic)
- Engineer → Claude (detailed, step-by-step)
- QA → Gemini (fast, practical)

**Pattern Recommendations:**

- Different models excel at different patterns
- Route patterns to best model automatically

**Gamification:**

- Achievement: "Try all AI mentors"
- Challenge: "Find your perfect match"
- XP: Bonus for using recommended model

### Future Enhancements

- **AI Personality Quiz**: Fun, shareable quiz
- **Team Matching**: Find best model for team dynamics
- **Learning Path**: Adapt based on model personality
- **Analytics**: Track which models users prefer
- **Custom Blends**: Combine traits from multiple models

**Saved for Phase 6-7!** ✅

---

## Learning Material: Claude Connectors Review

**Source**: Elephas.app Blog  
**URL**: https://elephas.app/blog/claude-connectors-review  
**Date Added**: Oct 28, 2025  
**Relevance**: Medium-High - Claude integration patterns  
**Phase to Integrate**: Phase 6-7 (AI Integrations & Learning Content)  
**Priority**: Medium

### Key Topic

Review of Claude Connectors - how to integrate Claude with various tools and workflows.

### Potential Use Cases

1. **Integration Guides**: Learn how others integrate Claude
2. **Best Practices**: Connector patterns and approaches
3. **Tutorial Content**: Create similar guides for our users
4. **Workbench Features**: Implement connector-style integrations
5. **Documentation**: Reference for integration patterns

### Action Items (For Later)

- [ ] Read full article and extract key insights
- [ ] Document integration patterns
- [ ] Consider implementing similar connectors
- [ ] Add to learning content library
- [ ] Create tutorial based on findings
- [ ] Reference in AI provider documentation

**Saved for Phase 6-7!** ✅

---

## MCP Integration Strategy

**Date Added**: Oct 28, 2025  
**Relevance**: High - Improve development workflow  
**Phase to Integrate**: Phase 2-3 (Infrastructure)  
**Priority**: High

### Recommended MCPs for Engify.ai

#### 1. **@modelcontextprotocol/server-filesystem** (HIGHEST PRIORITY)

**Why**: Access and manage project files
**Use Cases**:

- Read prompt templates from `/data/` folder
- Access documentation for context
- Read/write user-generated prompts
- Manage content files

**Integration**:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/donlaur/dev/Engify-AI-App"
      ]
    }
  }
}
```

#### 2. **@modelcontextprotocol/server-mongodb** (HIGH PRIORITY)

**Why**: Direct database access for development
**Use Cases**:

- Query user data during debugging
- Test database operations
- Analyze usage patterns
- Debug prompt storage

**Integration**:

```json
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-mongodb",
        "mongodb://localhost:27017/engify"
      ]
    }
  }
}
```

#### 3. **@modelcontextprotocol/server-github** (MEDIUM PRIORITY)

**Why**: Manage GitHub issues, PRs, and repo
**Use Cases**:

- Create issues from bugs
- Review PRs
- Check commit history
- Manage project board

**Integration**:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
```

#### 4. **Custom MCP: Prompt Pattern Server** (BUILD THIS!)

**Why**: Domain-specific MCP for prompt engineering
**Use Cases**:

- Validate prompts against patterns
- Suggest pattern improvements
- Analyze prompt effectiveness
- Generate pattern variations

### Implementation Plan

#### Phase 1: Setup (Now)

- [ ] Install filesystem MCP
- [ ] Configure in `.windsurf/mcp.json`
- [ ] Test with project files
- [ ] Document usage

#### Phase 2: Database Access (Phase 2)

- [ ] Install MongoDB MCP
- [ ] Configure connection
- [ ] Test queries
- [ ] Add to development workflow

#### Phase 3: GitHub Integration (Phase 3)

- [ ] Install GitHub MCP
- [ ] Generate token
- [ ] Configure repo access
- [ ] Test issue creation

#### Phase 4: Custom MCP (Phase 6-7)

- [ ] Design Prompt Pattern Server
- [ ] Implement validation logic
- [ ] Add pattern matching
- [ ] Integrate with workbench
- [ ] Publish as npm package

### Immediate Action: Add Filesystem MCP

**File**: `.windsurf/mcp.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/donlaur/dev/Engify-AI-App"
      ]
    }
  }
}
```

### Benefits

1. **Faster Development**: Direct file access
2. **Better Context**: AI understands project structure
3. **Database Debugging**: Query data directly
4. **GitHub Workflow**: Manage issues/PRs
5. **Custom Tools**: Domain-specific MCPs

**Saved for Phase 2-3!** ✅
