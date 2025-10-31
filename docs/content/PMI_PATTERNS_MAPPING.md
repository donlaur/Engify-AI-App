# PMI's 7 Patterns of AI - Mapping to Engify.ai

**Phase 5 - Teaching Framework Integration**

## Overview

PMI (Project Management Institute) identified **7 Patterns of AI** in their research. This document maps PMI's patterns to Engify.ai's existing 15 prompt patterns and identifies opportunities for integration.

Source: [PMI's 7 Patterns of AI](https://www.pmi.org/blog/seven-patterns-of-ai)

## PMI's 7 AI Patterns

### 1. **Generative AI** (Content Creation)
Generate new content: text, code, images, designs.

**Engify Mapping:**
- ✅ Maps to: `zero-shot`, `few-shot`, `chain-of-thought`
- **Current Coverage:** Excellent - our library has 30+ generative prompts
- **Integration:** Add "Generative AI" badge to relevant prompts

**Examples in Library:**
- Code generation prompts
- Documentation writing prompts
- Test case generation

### 2. **Conversational AI** (Chat & Interaction)
Natural language interaction, chatbots, virtual assistants.

**Engify Mapping:**
- ✅ Maps to: `persona`, `role-prompting`, `context-window`
- **Current Coverage:** Good - 15+ conversational prompts
- **Integration:** Create `/learn/conversational-ai` guide page

**Examples in Library:**
- 1-on-1 facilitation guides
- Conflict resolution mediations
- Team communication templates

### 3. **Predictive AI** (Forecasting)
Predict outcomes, trends, risks based on historical data.

**Engify Mapping:**
- ⚠️ Maps to: `chain-of-thought`, `tree-of-thought`
- **Current Coverage:** Limited - only 3-4 predictive prompts
- **Gap:** Need more incident prediction, capacity planning prompts
- **Integration:** Add "Predictive" category tag

**Opportunity:**
- Sprint velocity prediction
- Incident likelihood analysis
- Tech debt impact forecasting
- Capacity planning prompts

### 4. **Recommendation AI** (Personalized Suggestions)
Suggest actions, content, or decisions based on preferences and context.

**Engify Mapping:**
- ⚠️ Maps to: `rag` (Retrieval-Augmented Generation)
- **Current Coverage:** Weak - not explicitly covered
- **Gap:** Need recommendation-focused prompts
- **Integration:** New use-case tag: `recommendations`

**Opportunity:**
- Career development path recommendations
- Learning resource suggestions
- Code pattern recommendations
- Tech stack selection prompts

### 5. **Recognition AI** (Pattern Detection)
Identify patterns, anomalies, objects, or entities.

**Engify Mapping:**
- ✅ Maps to: `chain-of-thought`, `reflection`, `self-consistency`
- **Current Coverage:** Good - debugging and code review prompts
- **Integration:** Add "Recognition" pattern badge

**Examples in Library:**
- Debugging prompts (recognize error patterns)
- Code review prompts (identify anti-patterns)
- Security audit prompts (detect vulnerabilities)

### 6. **Autonomous AI** (Goal-Directed Action)
AI agents that take actions to achieve goals with minimal human intervention.

**Engify Mapping:**
- ⚠️ Maps to: `react` (Reasoning + Acting)
- **Current Coverage:** Minimal - we have multi-agent playground
- **Gap:** Need agentic workflow prompts
- **Integration:** Create `/learn/autonomous-ai` guide

**Opportunity:**
- Multi-step workflow automation
- Auto-fix CI/CD failures
- Automated code refactoring agents
- Self-healing system prompts

### 7. **Sentiment Analysis AI** (Emotion Detection)
Detect emotions, opinions, and sentiments in text.

**Engify Mapping:**
- ⚠️ Not explicitly mapped
- **Current Coverage:** Implicit in management prompts
- **Gap:** Need explicit sentiment analysis prompts
- **Integration:** New skill tag: `sentiment-analysis`

**Opportunity:**
- Team morale analysis from retros
- Code review tone analysis
- Customer feedback sentiment
- Employee survey analysis

## Integration Plan

### ✅ Already Strong

**Patterns We Cover Well:**
1. Generative AI - 30+ prompts ✅
2. Conversational AI - 15+ prompts ✅
3. Recognition AI - 20+ prompts ✅

### ⚠️ Needs Expansion

**Patterns to Add:**
4. Predictive AI - Add 10-15 prompts
5. Recommendation AI - Add 10 prompts
6. Autonomous AI - Add 5-10 agentic workflows
7. Sentiment Analysis - Add 5-10 prompts

### Teaching Moments to Add

**On Prompt Pages:**
- Badge showing which PMI pattern(s) each prompt uses
- "Learn More" link to PMI pattern explanation
- "Related Patterns" section at bottom

**New Learning Pages:**
- `/learn/ai-patterns` - Overview of all patterns
- `/learn/generative-ai` - Deep dive
- `/learn/conversational-ai` - Deep dive
- `/learn/predictive-ai` - Deep dive
- `/learn/autonomous-ai` - Deep dive

**Cross-Referencing:**
- Link PMI patterns to our KERNEL framework
- Show how patterns combine (e.g., Conversational + Predictive)
- Map PMI patterns to job roles

## Implementation Priorities

### Priority 1: Quick Wins (This Week)
- [ ] Add PMI pattern badges to existing prompts
- [ ] Create `/learn/ai-patterns` landing page
- [ ] Tag existing prompts with PMI pattern types

### Priority 2: Fill Gaps (Next 2 Weeks)
- [ ] Create 10 Predictive AI prompts (sprint forecasting, risk analysis)
- [ ] Create 10 Recommendation AI prompts (career paths, learning resources)
- [ ] Create Sentiment Analysis prompts (team morale, feedback analysis)

### Priority 3: Advanced (Month 2)
- [ ] Build autonomous AI agent examples
- [ ] Create multi-pattern combo prompts
- [ ] Publish PMI integration case study

## Tag Taxonomy Update

Add new tags to align with PMI patterns:

**Pattern Tags (Add to existing):**
- `generative` - Content creation
- `conversational` - Chat/interaction
- `predictive` - Forecasting
- `recommendation` - Personalized suggestions
- `recognition` - Pattern detection
- `autonomous` - Goal-directed agents
- `sentiment` - Emotion/opinion analysis

**Skill Tags (Add to existing):**
- `forecasting` - Predict outcomes
- `anomaly-detection` - Find outliers
- `personalization` - Tailored suggestions
- `sentiment-analysis` - Emotion detection
- `agent-orchestration` - Multi-step automation

## Cross-Linking Strategy

**On Every Prompt Page:**
```
🔬 AI Pattern: Generative + Conversational
This prompt combines content generation with interactive conversation.

Learn more: [Understanding AI Patterns](/learn/ai-patterns)
```

**On Learning Pages:**
```
📚 Related PMI Research:
PMI identifies 7 core patterns of AI. This page covers [Pattern Name].

Read PMI's research: https://www.pmi.org/blog/seven-patterns-of-ai
```

**In Prompt Metadata:**
```typescript
{
  pmiPatterns: ['generative', 'conversational'],
  learnMoreUrl: '/learn/generative-ai'
}
```

## Educational Micro-Moments

**Add to Prompt Pages:**
- 💡 Tip: "This uses Few-Shot learning - showing the AI examples improves accuracy by 40%"
- ⚡ Pattern: "Chain-of-Thought helps AI 'show its work' for better reasoning"
- 🎯 Use Case: "Best for [scenario]. Try [alternative pattern] for [other scenario]"

**Add to Library Browse:**
- Filter by PMI pattern type
- "New to AI patterns? Start here" tutorial
- Pattern comparison table

## Success Metrics

**Engagement:**
- Time on `/learn/*` pages
- Pattern filter usage in library
- Click-through from pattern badges to learning pages

**Quality:**
- User feedback on teaching moments
- Completion rate of learning paths
- "Was this helpful?" on pattern explanations

**Coverage:**
- 100% of prompts tagged with PMI pattern(s)
- At least 10 prompts per PMI pattern
- 7 dedicated learning pages (one per pattern)

## Related Documentation

- [Tag Taxonomy](./TAG_TAXONOMY.md) - Tagging system
- [SEO Expansion Plan](../seo/SEO_EXPANSION_PLAN.md) - Learning pages SEO
- [Content Migration Plan](./CONTENT_MIGRATION.md) - Adding new prompts

## Next Steps

1. ✅ Document PMI pattern mapping (this file)
2. ⚠️ Add PMI pattern tags to schema
3. ⚠️ Tag all existing prompts with PMI patterns
4. ⚠️ Create `/learn/ai-patterns` landing page
5. ⚠️ Build 7 dedicated pattern pages
6. ⚠️ Add teaching micro-moments to UI
7. ⚠️ Create 30+ new prompts to fill gaps

**Timeline:** Phase 5 foundation complete. Full integration over next 4-6 weeks.
