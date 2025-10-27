/**
 * Blog Posts
 * Real content, not "coming soon"
 */

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  published: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'From TypeScript Files to Production: Why We Ship Fast',
    slug: 'typescript-to-production',
    excerpt:
      "Most teams spend weeks planning. We spent 6 hours shipping. Here's why starting with TypeScript files instead of databases is the secret to rapid prototyping.",
    author: 'Donnie Laur',
    date: '2025-10-27',
    readTime: '5 min',
    category: 'Development',
    tags: ['rapid-prototyping', 'typescript', 'velocity'],
    published: true,
    content: `
# From TypeScript Files to Production: Why We Ship Fast

**The Problem:** Most teams spend 2-3 weeks building an MVP. Database schemas, migrations, API design, testing... all before shipping anything.

**The Solution:** Start with TypeScript files. Ship in hours, not weeks.

## The Philosophy

When we built Engify.ai, we made a controversial decision: **no database for the first 6 hours**.

Instead:
- 67+ prompts in TypeScript files
- 15 patterns in JSON
- Director insights in static data

**Why?** Because TypeScript files take 5 minutes to add 10 prompts. A database takes 2 hours for schema + migrations.

## The Results

- **Hour 1:** Foundation (Next.js, routing, basic UI)
- **Hour 2:** Real authentication (MongoDB, NextAuth)
- **Hour 3:** Modern UI (production-quality design)
- **Hour 4:** AI Integration (OpenAI, Google AI)
- **Hour 5:** Role-based pages
- **Hour 6:** Polish and deploy

**350+ commits in one day.** Not because we're sloppy - because we're not afraid to start over.

## When to Move to Database

We'll migrate prompts to MongoDB when:
1. Users need to create custom prompts
2. We need real-time collaboration
3. Search requires complex queries
4. Analytics need aggregation

Until then? TypeScript files work perfectly.

## The Lesson

**Premature optimization kills velocity.** 

Start simple. Ship fast. Validate with users. THEN optimize.

This is modern rapid prototyping.
    `,
  },
  {
    id: '2',
    title: "AI Adoption Challenges? We've Been There",
    slug: 'ai-adoption-challenges',
    excerpt:
      "Based on real conversations with engineering leaders. These are the challenges you're facing right now - and how to tackle them.",
    author: 'Donnie Laur',
    date: '2025-10-27',
    readTime: '7 min',
    category: 'Leadership',
    tags: ['ai-adoption', 'engineering-leadership', 'change-management'],
    published: true,
    content: `
# AI Adoption Challenges? We've Been There

**Based on real interviews with Directors of Engineering.**

## The Top 5 Challenges

### 1. "My team is afraid AI will replace them"

**The Reality:** AI won't replace engineers. Engineers who use AI will replace engineers who don't.

**The Solution:**
- Frame AI as a tool, not a threat
- Show how AI handles grunt work (boilerplate, docs, tests)
- Let engineers focus on architecture and problem-solving
- Celebrate AI wins publicly

### 2. "We don't have time to learn new tools"

**The Reality:** You don't have time NOT to learn.

**The Math:**
- Learning AI tools: 2-3 days
- Time saved per week: 5-10 hours
- ROI: Positive in week 1

**The Solution:**
- Start with one use case (code review, documentation)
- Measure time saved
- Share wins with the team
- Expand gradually

### 3. "How do we prevent misuse of company API keys?"

**The Reality:** Valid concern. Here's how we handle it.

**The Solution:**
- Topic classification (work-related only)
- Pattern compliance (follow documented patterns)
- Rate limiting by topic
- Educational rejection (teach, don't just block)

### 4. "Which AI tools should we use?"

**The Reality:** It doesn't matter. Pick one and start.

**Our Approach:**
- Google AI Studio for ideation
- Windsurf for development
- Cursor for refactoring
- Claude Sonnet 3.5 for code generation

**The Point:** Use the right tool for the job, not the trendy one.

### 5. "How do we measure success?"

**The Reality:** Track what matters.

**Metrics We Use:**
- Time saved per engineer per week
- Code review cycle time
- Documentation coverage
- Bug reduction rate
- Engineer satisfaction scores

## The Bottom Line

AI adoption isn't about tools. It's about culture.

Start small. Measure results. Share wins. Scale gradually.

**Want help?** Check out our [Director Insights](/for-directors) page.
    `,
  },
  {
    id: '3',
    title: '350+ Commits in One Day: Not Vibe Coding, Strategic Iteration',
    slug: '350-commits-one-day',
    excerpt:
      'How we shipped a production-ready platform in one evening - and why rapid iteration is the future of engineering.',
    author: 'Donnie Laur',
    date: '2025-10-27',
    readTime: '6 min',
    category: 'Development',
    tags: ['velocity', 'ai-development', 'rapid-iteration'],
    published: true,
    content: `
# 350+ Commits in One Day: Not Vibe Coding, Strategic Iteration

**391 total commits. 350+ today. Here's what that actually means.**

## What People Think

"350 commits? That's just sloppy vibe coding."

## What It Actually Is

**Strategic rapid iteration.**

Each commit:
- ✅ Functional and deployable
- ✅ Small enough to revert easily
- ✅ Shows thinking process
- ✅ Enables fast feedback

## The Breakdown

**Hour 0:** Google AI Studio (concept validation)
**Hour 1:** Foundation (Next.js, TypeScript, routing)
**Hour 2:** Real auth (MongoDB, NextAuth, bcrypt)
**Hour 3:** Modern UI (Jellyfish-inspired design)
**Hour 4:** AI integration (OpenAI, Google AI)
**Hour 5:** Role pages (Directors, Engineers)
**Hour 6:** Polish (remove mocks, add structure)

## The Tools

- **Google AI Studio:** Brand new vibe coder for ideation
- **Windsurf + Claude Sonnet 3.5:** Main development
- **Cursor:** Maybe tomorrow (use what works)

## The Philosophy

**Old way:**
Plan → Design → Build → Test → Ship (weeks)

**New way:**
Build → Ship → Test → Iterate (hours)

## Why So Many Commits?

1. **Small commits = easy to revert**
   - Wrong direction? Delete and start over
   - No ego, just results

2. **Commit often = never lose work**
   - Power goes out? Last commit was 5 minutes ago
   - Safe to experiment

3. **Shows thinking process**
   - Not just final result
   - Full journey visible

4. **Enables fast feedback**
   - Deploy every commit
   - See what works immediately

## The Results

**In one day:**
- Real authentication
- AI integration (OpenAI + Google)
- 67+ curated prompts
- Role-based pages
- Modern UI
- Production-ready code

**Not a toy. Not a demo. Production.**

## The Lesson

Modern development is about **velocity AND quality**, not one or the other.

AI tools enable this - but only if you embrace rapid iteration.

**No ego. Just ship.**
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug && post.published);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts
    .filter((post) => post.published && post.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts
    .filter((post) => post.published && post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
