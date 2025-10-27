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
