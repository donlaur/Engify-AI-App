# Mobile Responsiveness Audit - November 6, 2025

## Test Devices
- iPhone 14 Pro (393x852, 3x DPR)
- iPhone SE (375x667, 2x DPR)
- Samsung Galaxy S21 (360x800, 3x DPR)
- Pixel 7 (412x915, 2.625x DPR)

## Issues Identified from Screenshots

### 1. Homepage - "Watch This Being Built" Section
**Issue**: Text "Watch This Being Built" is cut off on mobile
- Text appears truncated at "Watch This Being Buil"
- Heading needs better wrapping or smaller font size on mobile

### 2. Button Overlap
**Issue**: "See How It's Built" button has "engify.ai" text overlapping
- Purple button shows domain name bleeding through
- Z-index or positioning issue

### 3. Content Cards Bleeding
**Issue**: Content appears to run outside containers
- Philosophy box text may be overflowing
- Need to check padding and max-width constraints

### 4. Long Titles on Prompt Cards
**Issue**: "Cross-Functional Alignment Workshop Planner" wrapping poorly
- Title text needs better line-height and word-break
- Consider truncation with ellipsis for very long titles

## Pages to Audit
- [ ] Homepage (/)
- [ ] Prompts Library (/prompts)
- [ ] Patterns (/patterns)
- [ ] Learn (/learn)
- [ ] RAG Chat (/rag-chat)
- [ ] Signup (/signup)
- [ ] Built in Public (/built-in-public)

## Fixes Needed
1. Responsive typography scaling
2. Button sizing and spacing
3. Card title truncation
4. Container max-widths
5. Padding adjustments for mobile
