# Multi-Agent Prompt & Pattern Generator

**Purpose:** Generate high-quality prompts and patterns using multiple AI agents with specialized expertise (ML Experts, AI PhD, Prompt Engineers, Domain Experts)

**Location:** `scripts/content/generate-prompts-patterns.ts`

---

## Overview

This script uses a **5-agent pipeline** to generate production-ready prompts and patterns:

```
1. ML Research Expert (GPT-4)
   └─> Creates initial prompt/pattern structure with technical accuracy

2. AI PhD Researcher (Claude)
   └─> Adds theoretical foundation and research backing

3. Prompt Engineer (GPT-4)
   └─> Optimizes for production use and token efficiency

4. Domain Expert (Claude)
   └─> Adds role-specific context and real-world use cases

5. Quality Reviewer (Claude)
   └─> Scores quality (1-10) and provides feedback
```

---

## Agents

### 1. ML Research Expert
- **Model:** GPT-4 Turbo
- **Expertise:**
  - Deep understanding of neural networks, transformers, LLMs
  - Research background in NLP, computer vision, RL
  - Published papers in top-tier conferences
  - Experience with cutting-edge techniques
- **Role:**
  - Ensures technical accuracy
  - References proven techniques from research
  - Explains WHY patterns work (not just WHAT)
  - Considers model-specific nuances

### 2. AI PhD Researcher
- **Model:** Claude 3.5 Sonnet
- **Expertise:**
  - PhD-level understanding of AI systems
  - Research in prompt engineering and in-context learning
  - Publications on AI safety and evaluation
- **Role:**
  - Grounds prompts/patterns in theory
  - Ensures robustness across models
  - Considers safety and ethics
  - Provides evaluation criteria

### 3. Senior Prompt Engineer
- **Model:** GPT-4 Turbo
- **Expertise:**
  - 5+ years production prompt engineering
  - Optimization for cost, latency, quality
  - A/B testing and versioning
- **Role:**
  - Makes prompts production-ready
  - Optimizes for token efficiency
  - Focuses on clarity and actionability
  - Provides copy-paste-ready prompts

### 4. Domain Expert
- **Model:** Claude 3.5 Sonnet
- **Expertise:**
  - Understanding of different roles (engineers, managers, PMs, etc.)
  - Industry-specific knowledge
  - Real-world scenarios and pain points
- **Role:**
  - Tailors to specific roles
  - Provides realistic use cases
  - Adds domain-specific context
  - Ensures immediate applicability

### 5. Quality Reviewer
- **Model:** Claude 3.5 Sonnet
- **Role:**
  - Reviews for completeness and accuracy
  - Scores quality (1-10)
  - Provides specific feedback
  - Approves or requests revisions

---

## Usage

### CLI Commands

```bash
# Generate prompts only
pnpm content:generate-prompts --count=10

# Generate patterns only
pnpm content:generate-patterns --count=5

# Generate both
pnpm content:generate-both --count=20

# Custom output directory
tsx scripts/content/generate-prompts-patterns.ts --type=prompts --count=10 --output=content/my-prompts
```

### Direct Script Execution

```bash
# Generate 10 prompts
tsx scripts/content/generate-prompts-patterns.ts --type=prompts --count=10

# Generate 5 patterns
tsx scripts/content/generate-prompts-patterns.ts --type=patterns --count=5

# Generate both (20 total)
tsx scripts/content/generate-prompts-patterns.ts --type=both --count=20
```

---

## Output

### Generated Files

The script saves to:
- **JSON files:** `content/generated/YYYY-MM-DD-generated-prompts.json`
- **JSON files:** `content/generated/YYYY-MM-DD-generated-patterns.json`
- **Database:** Automatically saves to MongoDB (`prompts` and `patterns` collections)

### Prompt Structure

```typescript
{
  id: string;                    // Unique ID (e.g., "cg-code-review-abc")
  title: string;                 // Prompt title
  description: string;           // Short description
  content: string;               // Full prompt content
  category: string;             // Category (code-review, database, etc.)
  role: string;                 // Target role (engineer, manager, etc.)
  pattern: string;              // Pattern used (cognitive-verifier, etc.)
  tags: string[];               // Tags for search
  isPublic: boolean;            // Public visibility
  isFeatured: boolean;          // Featured status (if score >= 8.0)
  qualityScore: number;         // Quality score (1-10)
  agentReviews: string[];       // Reviews from each agent
}
```

### Pattern Structure

```typescript
{
  id: string;                   // Pattern ID (e.g., "few-shot-learning")
  name: string;                 // Pattern name
  category: string;             // Category (FOUNDATIONAL, ADVANCED, etc.)
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;          // Short description
  shortDescription: string;     // 1-2 sentence summary
  fullDescription: string;      // Detailed explanation
  howItWorks: string;          // Step-by-step explanation
  whenToUse: string[];         // Use cases
  example: {
    before: string;           // Example before
    after: string;             // Example after
    explanation: string;      // Why it works
  };
  bestPractices: string[];      // Best practices
  commonMistakes: string[];    // Common mistakes
  relatedPatterns: string[];   // Related patterns
  qualityScore: number;        // Quality score (1-10)
  agentReviews: string[];      // Reviews from each agent
}
```

---

## Quality Standards

### Scoring System

- **9-10:** Excellent - Production-ready, publish immediately
- **7-8:** Good - Minor tweaks needed
- **5-6:** Fair - Significant revisions required
- **3-4:** Poor - Major rewrite needed
- **1-2:** Reject - Doesn't meet standards

### Quality Criteria

**Prompts:**
- ✅ Technically accurate
- ✅ Clear and actionable
- ✅ Production-ready
- ✅ Role-specific
- ✅ Uses pattern effectively
- ✅ Includes examples when needed

**Patterns:**
- ✅ Theoretically sound
- ✅ Well-documented
- ✅ Includes examples
- ✅ Explains WHY it works
- ✅ Covers best practices
- ✅ Lists common mistakes

---

## Example Topics

### Prompts Generated

- Code Review with AI (cognitive-verifier pattern)
- SQL Query Optimization (chain-of-thought pattern)
- API Documentation Generation (template pattern)
- Test Case Generation (few-shot pattern)
- Architecture Decision Analysis (hypothesis-testing pattern)
- Performance Analysis (chain-of-thought pattern)
- Security Audit (cognitive-verifier pattern)
- Technical Writing (persona pattern)
- Data Analysis (RAG pattern)
- Error Debugging (reverse-engineering pattern)

### Patterns Generated

- Few-Shot Learning (FOUNDATIONAL, beginner)
- Zero-Shot Prompting (FOUNDATIONAL, beginner)
- Meta-Prompting (ADVANCED, advanced)
- Constitutional AI (ADVANCED, advanced)
- Iterative Refinement (ITERATIVE, intermediate)
- Context Stuffing (ADVANCED, advanced)
- Function Calling (ADVANCED, advanced)
- Multi-Agent Collaboration (ADVANCED, advanced)

---

## Cost & Performance

- **Tokens per prompt:** ~8,000-12,000
- **Cost per prompt:** ~$0.40-0.60
- **Time per prompt:** 30-60 seconds
- **Tokens per pattern:** ~10,000-15,000
- **Cost per pattern:** ~$0.50-0.75
- **Time per pattern:** 45-90 seconds

---

## Integration

### Automatic Database Saving

All generated prompts and patterns are automatically saved to MongoDB:
- `prompts` collection (upsert by `id`)
- `patterns` collection (upsert by `id`)

### Manual Review

After generation:
1. Review JSON files in `content/generated/`
2. Check quality scores
3. Review agent feedback
4. Edit if needed
5. Run seed script to ensure database is updated

---

## Best Practices

1. **Start small:** Generate 5-10 at a time to review quality
2. **Review scores:** Focus on prompts/patterns with scores ≥ 8.0
3. **Edit as needed:** AI is 90% there, you polish the 10%
4. **Check patterns:** Ensure patterns are correctly linked
5. **Test prompts:** Try generated prompts before publishing
6. **Iterate:** Use feedback to improve future generations

---

## Troubleshooting

### Common Issues

**Error: "No API key found"**
- Ensure `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is in `.env.local`

**Error: "MongoDB connection failed"**
- Check `MONGODB_URI` in `.env.local`
- Ensure MongoDB is accessible

**Low quality scores**
- Review agent feedback for specific issues
- Adjust topic or pattern selection
- Try different categories or roles

**Missing fields**
- Check agent reviews for parsing issues
- May need manual editing of JSON files

---

## Future Enhancements

- [ ] Add more prompt topics and categories
- [ ] Support custom agent configurations
- [ ] Batch generation with progress tracking
- [ ] A/B testing of generated prompts
- [ ] Integration with prompt testing framework
- [ ] Automatic pattern enrichment from generated prompts
- [ ] Export to multiple formats (JSON, CSV, Markdown)

---

**Last Updated:** November 5, 2025  
**Maintained By:** Engify.ai Team
