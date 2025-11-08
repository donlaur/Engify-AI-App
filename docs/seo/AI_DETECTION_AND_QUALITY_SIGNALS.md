# AI Detection & Quality Signals for SEO

**Date:** November 8, 2025  
**Question:** Does Google detect AI content? What should we look for?

---

## Google's Official Stance on AI Content

### What Google Says (2023-2025)

**Official Position:**
> "Our focus on the quality of content, rather than how content is produced, is a useful guide that has helped us deliver reliable, high quality results to users for years."
> — Google Search Central Blog

**Key Points:**
- ✅ AI-generated content is NOT against Google's guidelines
- ✅ Google cares about QUALITY, not how it's made
- ❌ Low-quality content (AI or human) will rank poorly
- ❌ "Content for search engines" (not humans) violates spam policies

**E-E-A-T Framework (Experience, Expertise, Authoritativeness, Trustworthiness):**
- Google's quality raters use this to evaluate content
- AI content CAN meet E-E-A-T if done right
- Human review and expertise signals are critical

---

## What Google Actually Detects

### Not "Is this AI?" but "Is this Quality?"

**Google's Quality Signals:**

1. **Originality**
   - Unique insights, not rehashed content
   - Original research, data, examples
   - Personal experience and perspective

2. **Expertise**
   - Author credentials and byline
   - Citations to authoritative sources
   - Technical accuracy and depth

3. **User Engagement**
   - Time on page (3+ minutes = good)
   - Bounce rate (<40% = good)
   - Scroll depth (80%+ = good)
   - Return visitors

4. **External Validation**
   - Backlinks from authoritative sites
   - Social shares
   - Brand mentions
   - Community discussion

5. **Content Structure**
   - Proper headings (H1, H2, H3)
   - Scannable format (bullets, lists)
   - Images with alt text
   - Internal/external links

---

## AI Content Detection Tools

### Commercial Detectors (How They Work)

**1. OpenAI's AI Classifier (Discontinued July 2023)**
- Accuracy: ~26% (terrible)
- Why discontinued: Too many false positives
- Lesson: AI detection is HARD

**2. GPTZero**
- Method: Perplexity + burstiness analysis
- Accuracy: ~85% (claims)
- False positive rate: ~15%

**3. Originality.ai**
- Method: Pattern matching + statistical analysis
- Accuracy: ~94% (claims)
- Cost: $0.01 per 100 words

**4. Turnitin**
- Method: Proprietary ML model
- Accuracy: ~90% (claims)
- Used by universities

### How They Work (Technical)

**Perplexity:**
- Measures how "surprised" a model is by the text
- AI text = low perplexity (predictable)
- Human text = higher perplexity (creative, unexpected)

**Burstiness:**
- Measures variation in sentence length/complexity
- AI text = uniform (consistent patterns)
- Human text = bursty (varied, irregular)

**N-gram Analysis:**
- Looks for common AI phrase patterns
- "It's important to note that..."
- "In today's fast-paced world..."
- "Delve into..."

**Stylometric Features:**
- Vocabulary diversity
- Sentence structure variation
- Punctuation patterns
- Paragraph length distribution

---

## AI Slop Indicators (What to Detect)

### Linguistic Patterns

**1. Overused AI Phrases:**
```
- "delve into"
- "it's important to note that"
- "in today's fast-paced world"
- "leverage"
- "utilize" (instead of "use")
- "robust"
- "seamless"
- "cutting-edge"
- "state-of-the-art"
- "revolutionary"
- "game-changing"
- "at the end of the day"
- "first and foremost"
- "it goes without saying"
```

**2. Generic Structures:**
```
- "There are several reasons why..."
- "Let's explore the key factors..."
- "Here are some important considerations..."
- "In conclusion, it's clear that..."
- "To summarize, we've discussed..."
```

**3. Hedging Language (AI is cautious):**
```
- "may", "might", "could", "possibly"
- "generally", "typically", "often"
- "in most cases", "usually"
- Overuse of qualifiers
```

**4. Lack of Specificity:**
```
- "many experts agree" (which experts?)
- "studies show" (which studies?)
- "it's widely known" (citation needed)
- "research indicates" (what research?)
```

### Structural Patterns

**1. Perfect Grammar (Too Perfect):**
- No typos, ever
- No informal language
- No sentence fragments
- No colloquialisms

**2. Uniform Sentence Length:**
- All sentences 15-25 words
- No variation in complexity
- No short punchy sentences
- No long complex sentences

**3. Predictable Structure:**
- Every section follows same pattern
- Introduction → 3 points → Conclusion
- Bullet points always in threes
- Perfectly balanced paragraphs

**4. Lack of Personality:**
- No humor
- No personal anecdotes
- No strong opinions
- No controversial takes

---

## Our AI Detection System

### Detection Algorithm

```python
def detect_ai_content(text: str) -> dict:
    """
    Detect AI-generated content using multiple signals
    
    Returns:
        {
            'ai_probability': float,  # 0-1 (0=human, 1=AI)
            'quality_score': float,   # 0-10 (10=best)
            'flags': list,            # Specific issues found
            'recommendations': list   # How to improve
        }
    """
    flags = []
    
    # 1. AI Slop Phrases
    slop_phrases = [
        'delve', 'leverage', 'utilize', 'robust', 'seamless',
        'cutting-edge', 'state-of-the-art', 'revolutionary',
        'game-changing', 'it\'s important to note',
        'in today\'s fast-paced world', 'at the end of the day'
    ]
    
    slop_count = 0
    for phrase in slop_phrases:
        count = text.lower().count(phrase)
        if count > 0:
            slop_count += count
            flags.append(f"AI slop: '{phrase}' ({count}x)")
    
    # 2. Sentence Length Uniformity
    sentences = text.split('.')
    sentence_lengths = [len(s.split()) for s in sentences if s.strip()]
    
    if len(sentence_lengths) > 5:
        avg_length = sum(sentence_lengths) / len(sentence_lengths)
        variance = sum((x - avg_length) ** 2 for x in sentence_lengths) / len(sentence_lengths)
        std_dev = variance ** 0.5
        
        # AI text has low variance (uniform sentences)
        if std_dev < 5:
            flags.append(f"Uniform sentences (std dev: {std_dev:.1f})")
    
    # 3. Hedging Language
    hedges = ['may', 'might', 'could', 'possibly', 'generally', 
              'typically', 'often', 'usually', 'in most cases']
    
    hedge_count = sum(text.lower().count(h) for h in hedges)
    word_count = len(text.split())
    hedge_ratio = hedge_count / word_count if word_count > 0 else 0
    
    if hedge_ratio > 0.02:  # >2% hedging
        flags.append(f"Excessive hedging ({hedge_ratio*100:.1f}%)")
    
    # 4. Lack of Specificity
    vague_phrases = [
        'many experts', 'studies show', 'research indicates',
        'it\'s widely known', 'it\'s well established'
    ]
    
    vague_count = sum(text.lower().count(p) for p in vague_phrases)
    if vague_count > 2:
        flags.append(f"Vague claims without citations ({vague_count}x)")
    
    # 5. Personal Experience Markers (good = human)
    personal_markers = [
        'i tried', 'i tested', 'in my experience', 'i found',
        'we built', 'we discovered', 'our team', 'i noticed'
    ]
    
    personal_count = sum(text.lower().count(p) for p in personal_markers)
    if personal_count == 0:
        flags.append("No personal experience markers")
    
    # 6. Specific Examples (good = human)
    # Check for code blocks, numbers, specific tool names
    has_code = '```' in text or '`' in text
    has_numbers = any(char.isdigit() for char in text)
    has_links = 'http' in text or '[' in text
    
    if not has_code:
        flags.append("No code examples")
    if not has_numbers:
        flags.append("No specific numbers/data")
    if not has_links:
        flags.append("No citations/links")
    
    # Calculate AI probability
    # More flags = higher AI probability
    ai_probability = min(1.0, len(flags) * 0.1)
    
    # Calculate quality score (inverse of AI probability)
    quality_score = max(0, 10 - (ai_probability * 10))
    
    # Recommendations
    recommendations = []
    if slop_count > 0:
        recommendations.append("Remove AI slop phrases, use natural language")
    if 'Uniform sentences' in str(flags):
        recommendations.append("Vary sentence length (short punchy + long complex)")
    if 'No personal experience' in str(flags):
        recommendations.append("Add personal anecdotes or team experiences")
    if 'No code examples' in str(flags):
        recommendations.append("Add real code examples with syntax highlighting")
    if 'No specific numbers' in str(flags):
        recommendations.append("Add specific data, metrics, or measurements")
    if 'No citations' in str(flags):
        recommendations.append("Add citations to sources (Reddit, GitHub, docs)")
    
    return {
        'ai_probability': round(ai_probability, 2),
        'quality_score': round(quality_score, 1),
        'flags': flags,
        'recommendations': recommendations,
        'word_count': word_count,
        'slop_count': slop_count,
        'personal_markers': personal_count,
        'has_code': has_code,
        'has_numbers': has_numbers,
        'has_links': has_links,
    }
```

### Usage Example

```python
# After generating article
article = generate_article(research, keywords)

# Run detection
detection = detect_ai_content(article)

print(f"AI Probability: {detection['ai_probability']*100:.0f}%")
print(f"Quality Score: {detection['quality_score']}/10")
print(f"\nFlags:")
for flag in detection['flags']:
    print(f"  - {flag}")

print(f"\nRecommendations:")
for rec in detection['recommendations']:
    print(f"  - {rec}")

# Auto-reject if too AI-like
if detection['ai_probability'] > 0.7:
    print("\n❌ Article rejected: Too AI-like")
    print("   Regenerating with stricter guidelines...")
    # Regenerate with enhanced prompts
elif detection['quality_score'] < 7:
    print("\n⚠️  Article needs review")
    # Manual review or regenerate specific sections
else:
    print("\n✅ Article passed quality check")
```

---

## E-E-A-T Signals to Add

### Experience Signals

**Add to Articles:**
- ✅ "I tested this with..." (personal testing)
- ✅ "Our team found..." (team experience)
- ✅ "After 3 weeks of using..." (time investment)
- ✅ Screenshots with annotations
- ✅ Real error messages encountered
- ✅ "This failed when..." (honest failures)

### Expertise Signals

**Add to Articles:**
- ✅ Author byline: "By Donnie Laur, AI Engineering Consultant"
- ✅ Author bio with credentials
- ✅ Citations to technical sources
- ✅ Code examples that actually work
- ✅ Technical depth (not surface-level)
- ✅ Industry-specific terminology used correctly

### Authoritativeness Signals

**Add to Articles:**
- ✅ Links to official documentation
- ✅ Citations to authoritative sources (Google, Microsoft, etc.)
- ✅ Community validation (Reddit threads, GitHub issues)
- ✅ External backlinks (earn them over time)
- ✅ Social proof (shares, mentions)

### Trustworthiness Signals

**Add to Articles:**
- ✅ "Last updated: [date]" (freshness)
- ✅ Transparent about limitations
- ✅ "Why we link out" callout (generous linking)
- ✅ Honest competitor comparisons
- ✅ Corrections/updates section
- ✅ Contact info for feedback

---

## Google's Helpful Content System

### What Google Rewards

**From Google's Guidelines:**

1. **Content created for people, not search engines**
   - ✅ Answers user questions directly
   - ✅ Provides unique value
   - ❌ Keyword stuffing
   - ❌ Thin content

2. **Demonstrates first-hand expertise**
   - ✅ Personal testing/experience
   - ✅ Original research
   - ✅ Real examples
   - ❌ Rehashed content

3. **Has a clear purpose**
   - ✅ Solves a specific problem
   - ✅ Helps user make decision
   - ❌ Exists just to rank

4. **Leaves readers satisfied**
   - ✅ Comprehensive answer
   - ✅ No need to search again
   - ❌ Clickbait
   - ❌ Incomplete information

### What Google Penalizes

**Spam Signals:**
- Mass-produced content (100s of thin pages)
- Auto-generated without review
- Scraped/copied content
- Keyword stuffing
- Hidden text/links
- Deceptive practices

**Our Strategy:**
- ✅ 18 high-quality articles (not 1000s)
- ✅ Human review + editing
- ✅ Original research (Gemini + ChatGPT)
- ✅ Natural keyword usage
- ✅ Transparent about AI assistance
- ✅ Honest, helpful content

---

## Our Quality Checklist

### Before Publishing Each Article

**AI Detection:**
- [ ] AI probability < 50%
- [ ] Quality score > 7/10
- [ ] No AI slop phrases (or <3 total)
- [ ] Varied sentence length (std dev > 5)
- [ ] Personal experience markers present
- [ ] Specific examples (code, numbers, data)

**E-E-A-T Signals:**
- [ ] Author byline present
- [ ] "Last updated" date
- [ ] Personal testing/experience mentioned
- [ ] Real screenshots/examples
- [ ] Citations to authoritative sources
- [ ] Honest about limitations

**User Experience:**
- [ ] Answers question in first 100 words
- [ ] Scannable (bullets, headings, code blocks)
- [ ] 2000+ words (comprehensive)
- [ ] Internal links (3-5)
- [ ] External links (5-10)
- [ ] "Share Your Experience" CTA

**Technical SEO:**
- [ ] Meta title (60 chars, keyword-optimized)
- [ ] Meta description (160 chars)
- [ ] H1, H2, H3 structure
- [ ] Schema markup (Article, FAQPage, HowTo)
- [ ] Alt text for images
- [ ] Keyword density 1-2%

---

## Testing Plan

### Phase 1: Generate 1 Article with Detection

```bash
# Generate article
pnpm tsx scripts/content/generate-seo-article.ts \
  --research=cursor-vs-windsurf.json \
  --detect-ai

# Output:
# ✅ Article generated: cursor-vs-windsurf-2025.md
# 📊 AI Detection Results:
#    - AI Probability: 35%
#    - Quality Score: 8.2/10
#    - Flags: 3
#      - AI slop: 'leverage' (2x)
#      - No personal experience markers
#      - Uniform sentences (std dev: 4.2)
#    - Recommendations:
#      - Remove AI slop phrases
#      - Add personal anecdotes
#      - Vary sentence length
```

### Phase 2: Manual Review + Edit

```bash
# Review article
code output/articles/cursor-vs-windsurf-2025.md

# Edit to fix flags
# - Remove "leverage" → "use"
# - Add "I tested both tools for 3 weeks..."
# - Vary sentence length (short + long)
```

### Phase 3: Re-test After Edits

```bash
# Re-run detection
pnpm tsx scripts/content/detect-ai-slop.ts \
  --file=output/articles/cursor-vs-windsurf-2025.md

# Output:
# ✅ Article passed quality check
#    - AI Probability: 15%
#    - Quality Score: 9.1/10
#    - Ready to publish
```

---

## Next Steps

1. **Wait for ChatGPT research** (you'll provide)
2. **Build TypeScript article generator** (with detection)
3. **Generate 1 test article** (Cursor vs Windsurf)
4. **Run AI detection** (our custom system)
5. **Manual review + edit** (fix any flags)
6. **Publish if quality score > 8.0**

**Ready when you provide the ChatGPT research!**
