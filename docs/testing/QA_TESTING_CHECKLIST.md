# QA Testing Checklist - Post SEO & Dark Mode Updates

## 🎯 Critical Path Testing

### 1. Dark Mode - Authentication Pages ✅

- [ ] **Login Page (`/login`)**
  - [ ] Background gradient switches to dark colors
  - [ ] Card background is dark gray
  - [ ] Input fields have dark backgrounds with light text
  - [ ] Labels are readable (light gray/white)
  - [ ] Links are visible (blue-400/blue-300)
  - [ ] Error messages display correctly
  - [ ] "Forgot password?" link is visible
  - [ ] "Sign up" link at bottom is visible

- [ ] **Signup Page (`/signup`)**
  - [ ] All same checks as login page
  - [ ] Success message (if shown) has dark mode styling
  - [ ] "Request Early Access" form (if public signup disabled) has dark mode
  - [ ] Terms checkbox and label are readable

### 2. SEO Metadata ✅

- [ ] **Prompt Pages (`/prompts/[slug]`)**
  - [ ] Browser tab title matches format: `[Prompt Name] | A Proven AI Prompt for [Use Case] | Engify.ai`
  - [ ] Meta description is 150-160 characters
  - [ ] Meta description includes prompt name and use case
  - [ ] Keywords are present and relevant

- [ ] **Pattern Pages (`/patterns/[id]`)**
  - [ ] Browser tab title matches format: `The [Pattern Name] Pattern | Master this Prompt Engineering Technique | Engify.ai`
  - [ ] Meta description is 150-160 characters
  - [ ] Description includes pattern name and learning angle

- [ ] **Role Landing Pages (`/for-[role]`)**
  - [ ] Title includes role name and "AI Prompts, Patterns & Solutions"
  - [ ] Description includes prompt/pattern counts
  - [ ] Keywords include role-specific terms

- [ ] **Pillar Page (`/learn/prompt-engineering-masterclass`)**
  - [ ] Title includes "Masterclass" and "Complete Guide"
  - [ ] Description mentions pattern count and learning outcomes

### 3. FAQ Sections ✅

- [ ] **Role Landing Pages**
  - [ ] FAQ section is visible at bottom of page
  - [ ] Questions are relevant to the role
  - [ ] Answers are informative and helpful
  - [ ] Accordion expands/collapses correctly
  - [ ] Schema markup validates (use Google Rich Results Test)

- [ ] **Pillar Page**
  - [ ] FAQ section is present
  - [ ] Questions cover prompt engineering basics
  - [ ] Answers are comprehensive
  - [ ] Schema markup validates

### 4. CollectionPage Schema ✅

- [ ] **Role Landing Pages**
  - [ ] Use Google Rich Results Test: `https://search.google.com/test/rich-results`
  - [ ] Enter URL: `https://engify.ai/for-[role]`
  - [ ] Verify `CollectionPage` schema is detected
  - [ ] Check `itemListElement` contains prompts and patterns
  - [ ] Verify `numberOfItems` matches displayed count

### 5. Internal Linking (Hub-and-Spoke) ✅

- [ ] **Pillar Page Links FROM Cluster Pages**
  - [ ] Visit a prompt page (e.g., `/prompts/chain-of-thought-prompt`)
  - [ ] Scroll to "Try These Resources" or "Related Content" section
  - [ ] Verify prominent link to "Prompt Engineering Masterclass" exists
  - [ ] Link text is descriptive (not just "Click here")
  - [ ] Link works and goes to `/learn/prompt-engineering-masterclass`

- [ ] **Cluster Page Links FROM Pillar Page**
  - [ ] Visit `/learn/prompt-engineering-masterclass`
  - [ ] Scroll to related content section
  - [ ] Verify links to related prompts, patterns, and articles
  - [ ] Links use descriptive anchor text
  - [ ] All links are functional

- [ ] **Cross-Linking Between Related Content**
  - [ ] Related prompts link to each other
  - [ ] Related patterns link to each other
  - [ ] Anchor text varies (not all identical)

### 6. Card Content Filling ✅

- [ ] **Prompt Cards (`/prompts`)**
  - [ ] All cards have consistent minimum height
  - [ ] Descriptions use 3 lines (line-clamp-3)
  - [ ] Cards fill available space evenly
  - [ ] No excessive white space in cards
  - [ ] Badges and buttons are properly positioned
  - [ ] Cards look consistent across grid

- [ ] **Pattern Cards (`/patterns`)**
  - [ ] Same checks as prompt cards
  - [ ] Pattern descriptions fill space appropriately

### 7. Visual Regression Checks ✅

- [ ] **Layout Consistency**
  - [ ] No unexpected layout shifts
  - [ ] Spacing is consistent
  - [ ] Cards align properly in grid
  - [ ] Footer stays at bottom

- [ ] **Responsive Design**
  - [ ] Mobile view (< 768px): Cards stack vertically
  - [ ] Tablet view (768px - 1024px): 2 columns
  - [ ] Desktop view (> 1024px): 3 columns
  - [ ] Navigation menu works on mobile
  - [ ] No horizontal scrolling

- [ ] **Dark Mode Consistency**
  - [ ] All pages respect dark mode toggle
  - [ ] Text contrast is sufficient (WCAG AA)
  - [ ] Interactive elements are visible
  - [ ] No "white on white" or "black on black" issues

## 🔍 Detailed Testing Scenarios

### Scenario 1: New User Journey

1. Visit homepage
2. Click "Sign up"
3. Fill out signup form (or request access)
4. Verify dark mode works on signup page
5. Complete signup/login
6. Browse prompts
7. Verify cards fill space properly
8. Click a prompt
9. Verify SEO metadata in browser tab
10. Scroll to FAQ section (if on role page)
11. Verify internal links work

### Scenario 2: SEO Validation

1. Use browser dev tools to inspect `<head>` section
2. Check `<title>` tag matches expected format
3. Check `<meta name="description">` is present and optimal length
4. Check `<meta name="keywords">` includes relevant terms
5. Use Google Rich Results Test for schema validation
6. Check OpenGraph tags for social sharing

### Scenario 3: Dark Mode Toggle

1. Toggle dark mode on/off multiple times
2. Verify all pages respect the setting
3. Check for any flash of unstyled content (FOUC)
4. Verify localStorage persists preference
5. Test on different pages (home, prompts, patterns, login, signup)

## 🐛 Known Issues to Verify Fixed

- [ ] Card content now fills full area (no excessive whitespace)
- [ ] Dark mode works on login/signup pages
- [ ] FAQ sections appear on all role landing pages
- [ ] Internal linking shows pillar page links from cluster pages
- [ ] SEO metadata matches new templates

## 📊 Performance Checks

- [ ] Page load times are acceptable (< 3s)
- [ ] No console errors
- [ ] No 404 errors for linked resources
- [ ] Images load properly
- [ ] Schema markup doesn't cause errors

## 🎨 Accessibility Checks

- [ ] Keyboard navigation works
- [ ] Screen reader can read FAQ accordions
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Alt text on images (if any)

---

**Last Updated:** After SEO & Dark Mode push
**Tested By:** [Your Name]
**Date:** [Date]
