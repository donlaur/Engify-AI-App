# Gemini Deep Research Prompt: Enterprise Design System for Engify.ai

## Prompt for Gemini

```
I need you to create a comprehensive design system and brand guide for Engify.ai, an enterprise AI-powered prompt engineering education platform. The design must be:

1. PROFESSIONAL & ENTERPRISE-READY
   - Suitable for Fortune 500 companies
   - Inspires trust and credibility
   - Modern but not trendy (timeless)
   - Accessible (WCAG 2.1 AA compliant)

2. CUTTING-EDGE BUT READABLE
   - Uses latest design trends (glassmorphism, subtle gradients, depth)
   - Maintains excellent readability in both light and dark modes
   - Balances innovation with usability
   - Feels like a premium SaaS product (Linear, Stripe, Vercel quality)

3. DUAL-MODE SYSTEM (CRITICAL)
   - Light mode: For daytime work, presentations, screenshots
   - Dark mode: For extended coding sessions, low-light environments
   - BOTH modes must have:
     * Excellent contrast ratios (4.5:1 minimum for text)
     * Distinct visual identity (not just inverted colors)
     * Proper depth and hierarchy
     * Comfortable for 8+ hour work sessions

## SPECIFIC REQUIREMENTS:

### Color Palette
Please provide:
- Primary brand colors (3-5 colors with hex codes)
- Light mode palette:
  * Background colors (3 levels: page, card, elevated)
  * Text colors (4 levels: primary, secondary, tertiary, disabled)
  * Border colors (3 levels: subtle, default, strong)
  * Accent colors for CTAs, links, success, warning, error
- Dark mode palette:
  * Background colors (must be distinct from light mode, not just inverted)
  * Text colors (proper contrast on dark backgrounds)
  * Border colors (visible but not harsh)
  * Accent colors (adjusted for dark backgrounds)
- Semantic colors:
  * Success (green spectrum)
  * Warning (yellow/orange spectrum)
  * Error (red spectrum)
  * Info (blue spectrum)
  * Each with light/dark mode variants

### Typography
- Font families (primary for UI, secondary for headings, monospace for code)
- Font sizes (8-level scale from xs to 4xl)
- Line heights for each size
- Font weights (regular, medium, semibold, bold)
- Letter spacing adjustments

### Spacing & Layout
- Spacing scale (4px base, 8 levels: 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64)
- Container max-widths
- Grid system (12-column)
- Breakpoints (mobile, tablet, desktop, wide)

### Component Styling (Shadcn/UI Compatible)

For each component, specify light AND dark mode:

1. **Cards**
   - Background color
   - Border color and width
   - Shadow (multiple levels: sm, default, md, lg)
   - Hover state
   - Active/selected state
   - Padding standards

2. **Buttons**
   - Primary (gradient or solid)
   - Secondary (outline or ghost)
   - Destructive
   - Disabled state
   - Hover/active states
   - Focus ring

3. **Input Fields**
   - Background
   - Border (default, focus, error)
   - Placeholder text color
   - Label color
   - Helper text color

4. **Navigation**
   - Header background (with backdrop blur?)
   - Active link indicator
   - Hover states
   - Mobile menu styling

5. **Badges/Pills**
   - Background colors for different types
   - Text colors
   - Border radius

6. **Modals/Dialogs**
   - Overlay color and opacity
   - Modal background
   - Border/shadow

### Visual Effects

Specify for light AND dark mode:
- Glassmorphism parameters (blur, opacity, border)
- Gradient directions and stops
- Shadow depths and colors
- Backdrop blur values
- Border radius standards (sm, md, lg, xl, full)

### Accessibility Requirements
- All text must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- Focus indicators must be visible in both modes
- Color should not be the only indicator of state
- Provide alternative text color combinations for colorblind users

### Brand Personality
Engify.ai should feel:
- **Intelligent**: Uses AI, cutting-edge technology
- **Trustworthy**: Enterprise-grade, secure, reliable
- **Empowering**: Helps users grow their skills
- **Modern**: Up-to-date with latest design trends
- **Professional**: Suitable for C-level presentations

### Inspiration References
Please analyze and incorporate best practices from:
- Linear (clean, fast, modern)
- Stripe (professional, trustworthy, excellent dark mode)
- Vercel (cutting-edge, developer-focused)
- Notion (versatile, comfortable for long sessions)
- GitHub (excellent code-focused dark mode)

### Deliverables

Please provide:

1. **Complete Color Palette**
   - Tailwind CSS config format
   - CSS custom properties for both modes
   - Hex codes with semantic names

2. **Component Style Guide**
   - Detailed specifications for each component
   - Before/after examples (light vs dark)
   - Hover/active state definitions

3. **Usage Guidelines**
   - When to use light vs dark mode
   - How to maintain consistency
   - Common pitfalls to avoid

4. **Code Examples**
   - Tailwind CSS classes for common patterns
   - CSS custom properties implementation
   - Dark mode toggle logic

5. **Accessibility Checklist**
   - Contrast ratios for all color combinations
   - Focus state requirements
   - Screen reader considerations

## CRITICAL CONSTRAINTS:

1. Must work with Tailwind CSS and Shadcn/UI
2. Dark mode must use `class` strategy (not media query)
3. All colors must be defined as CSS custom properties
4. Must support smooth transitions between modes
5. No pure black (#000000) or pure white (#FFFFFF) - use near-black and near-white
6. Gradients should be subtle and purposeful, not decorative
7. Animations should be performant (GPU-accelerated)

## OUTPUT FORMAT:

Please structure your response as:

1. Executive Summary (design philosophy)
2. Color System (complete palette with rationale)
3. Typography System
4. Spacing & Layout System
5. Component Library (detailed specs)
6. Implementation Guide (code examples)
7. Accessibility Report (contrast ratios, compliance)
8. Brand Guidelines (usage rules)

Focus on creating a system that is:
- Easy to implement
- Consistent across all pages
- Scalable for future features
- Delightful to use for 8+ hours daily
```

---

## How to Use This Prompt

1. **Copy the entire prompt above**
2. **Paste into Gemini** (or Claude, GPT-4)
3. **Wait for comprehensive design system**
4. **Implement the color palette** in `tailwind.config.ts`
5. **Update components** with new color system
6. **Test both light and dark modes**

## Expected Output

You should receive:

- ✅ Complete color palette (50+ colors)
- ✅ Typography scale
- ✅ Spacing system
- ✅ Component specifications
- ✅ Tailwind config code
- ✅ CSS custom properties
- ✅ Usage guidelines
- ✅ Accessibility report

## Current Issues to Address

Based on your screenshots:

**Light Mode Issues:**

- Background too similar to cards (low contrast)
- Borders barely visible
- No depth or hierarchy

**Dark Mode Issues:**

- Looks identical to light mode (just inverted)
- No proper dark mode colors
- Text contrast insufficient

**What We Need:**

- Light mode: Clean, bright, professional (slate-50 bg, white cards)
- Dark mode: Rich, deep, comfortable (slate-900 bg, slate-800 cards)
- Both: Excellent contrast, clear hierarchy, distinct identity

---

## Quick Implementation Checklist

After receiving Gemini's design system:

- [ ] Update `tailwind.config.ts` with new color palette
- [ ] Add CSS custom properties to `globals.css`
- [ ] Implement dark mode toggle in header
- [ ] Update all components to use new color system
- [ ] Test contrast ratios with accessibility tools
- [ ] Create style guide documentation
- [ ] Get stakeholder approval
- [ ] Roll out to production

---

**Status**: Ready to send to Gemini  
**Priority**: High - Needed for professional enterprise appearance  
**Estimated Time**: 2-3 hours to implement after receiving design system
