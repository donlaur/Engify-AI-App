# Internal Linking Guidelines

**Purpose:** Establish systematic internal linking architecture following hub-and-spoke model for SEO and user experience.

**Last Updated:** November 2025  
**Status:** Active

---

## Overview

Internal linking is crucial for SEO and user experience. We follow a **hub-and-spoke model** where:

- **Pillar Pages** (hubs) are comprehensive, authoritative pages on major topics
- **Cluster Content** (spokes) are related prompts, patterns, articles, and role pages
- Links flow both ways: cluster → pillar and pillar → cluster

---

## Hub-and-Spoke Model

### Pillar Pages (Hubs)

**Current Pillar Pages:**

- `/learn/prompt-engineering-masterclass` - Comprehensive guide to prompt engineering

**Characteristics:**

- 8,000+ words of comprehensive content
- Covers broad topic comprehensively
- Links to multiple cluster content pieces
- High authority and SEO value

### Cluster Content (Spokes)

**Types of Cluster Content:**

- Individual prompt pages (`/prompts/[id]`)
- Individual pattern pages (`/patterns/[slug]`)
- Role landing pages (`/for-[role]`)
- Learning articles (`/learn/[slug]`)

**Characteristics:**

- Focused on specific topics
- Links back to relevant pillar pages
- Links to related cluster content

---

## Linking Rules

### 1. Cluster Content → Pillar Pages

**When to Link:**

- When content is related to a pillar page topic
- When content mentions concepts covered in pillar pages
- When content would benefit from deeper context

**How to Link:**

- Use `CrossContentLinks` component (automatically includes pillar links)
- Use descriptive anchor text: "Master Prompt Engineering" or "Learn Prompt Engineering Patterns"
- Place links in "Related Content" sections

**Example:**

```tsx
<CrossContentLinks
  tags={['prompt-engineering']}
  category="intermediate"
  excludeId={currentPromptId}
/>
```

### 2. Pillar Pages → Cluster Content

**When to Link:**

- When pillar page mentions specific patterns, prompts, or topics
- When pillar page references related articles
- When pillar page would benefit from practical examples

**How to Link:**

- Use `CrossContentLinks` component at end of pillar page
- Link to specific patterns mentioned in content
- Link to related prompts and articles

**Example:**

```tsx
<CrossContentLinks
  tags={['prompt-engineering', 'ai-patterns']}
  category="intermediate"
  excludeId="prompt-engineering-masterclass"
/>
```

### 3. Cluster Content → Cluster Content

**When to Link:**

- When content is semantically related (same tags, category, or role)
- When content complements each other
- When users would benefit from related resources

**How to Link:**

- Use `CrossContentLinks` component (automatically finds related content)
- Use keyword-rich anchor text
- Limit to 3-6 related items per section

---

## Anchor Text Best Practices

### Good Anchor Text Examples

✅ **Descriptive and Keyword-Rich:**

- "Learn the Chain-of-Thought prompting pattern"
- "Use code review prompts for better quality"
- "Master Prompt Engineering with our comprehensive guide"

✅ **Action-Oriented:**

- "Try this debugging prompt"
- "Explore related patterns"
- "Read about prompt engineering best practices"

### Bad Anchor Text Examples

❌ **Generic:**

- "Click here"
- "Read more"
- "See this"

❌ **Non-Descriptive:**

- "Link"
- "Article"
- "Page"

---

## Component Usage

### CrossContentLinks Component

**Location:** `src/components/features/CrossContentLinks.tsx`

**Features:**

- Automatically finds related prompts, patterns, and articles
- Includes pillar page links (hub-and-spoke)
- Uses keyword-rich anchor text
- Responsive grid layout

**Usage:**

```tsx
<CrossContentLinks
  tags={['prompt-engineering', 'ai-patterns']}
  category="intermediate"
  excludeId={currentContentId}
/>
```

### RelatedPrompts Component

**Location:** `src/components/features/RelatedPrompts.tsx`

**Features:**

- Shows related prompts on prompt pages
- Sortable by views, favorites, or relatedness
- Client-side component with API fetching

**Usage:**

```tsx
<RelatedPrompts currentPrompt={prompt} allPrompts={prompts} />
```

---

## Internal Linking Checklist

When creating or updating content, ensure:

- [ ] Related content sections are present
- [ ] Links use descriptive anchor text
- [ ] Pillar page links are included (if applicable)
- [ ] Related prompts/patterns/articles are linked
- [ ] Links are contextual and add value
- [ ] No broken links
- [ ] Links open in same tab (internal links)

---

## SEO Benefits

**Internal linking provides:**

1. **Crawlability:** Helps search engines discover all pages
2. **Page Authority:** Distributes link equity from high-authority pages
3. **User Experience:** Helps users find related content
4. **Dwell Time:** Keeps users on site longer
5. **Keyword Context:** Reinforces topic relevance

---

## Technical Implementation

### Finding Related Content

**Utility:** `src/lib/seo/internal-linking.ts`

**Functions:**

- `findRelatedContent()` - Finds related content by tags/category
- `findPillarPageLink()` - Returns pillar page link
- `findPillarClusterLinks()` - Finds pillar/cluster relationships
- `extractContentLinks()` - Extracts links from content text

### Schema Markup

Internal links don't require special schema markup, but related content sections can benefit from:

- `ItemList` schema for collections
- `BreadcrumbList` schema for navigation
- `RelatedArticle` relationships (future enhancement)

---

## Future Enhancements

- [ ] Automatic link extraction from content text
- [ ] Link suggestions based on semantic similarity
- [ ] Link analytics to measure effectiveness
- [ ] A/B testing of anchor text variations
- [ ] RelatedArticle schema markup

---

## Questions?

For questions about internal linking strategy, contact the SEO team or refer to:

- `docs/seo/SEO_STRATEGY_COMPREHENSIVE.md`
- `docs/seo/SEO_ACTION_PLAN.md`
