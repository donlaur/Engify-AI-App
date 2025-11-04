# Vibrant Dark Mode Style Guide

## Overview

This document describes the new "Vibrant Dark Mode" design system implemented to improve readability and brand consistency across Engify.ai's secondary pages. The goal is to bridge the gap between the vibrant, energetic homepage and the previously desaturated dark secondary pages.

## Design Philosophy

Instead of using a low-saturation navy/black background, we've implemented a **lighter, vibrant blue** base (not navy) that feels energetic and modern. Key improvements:

1. **Readability**: Lighter background reduces eye strain while maintaining dark mode aesthetic
2. **Brand Cohesion**: Vibrant blue tones complement brand gradients and vibrant green accents
3. **Visual Hierarchy**: Frosted glass "ice floating cards" create depth and separate content from background
4. **Accessibility**: Lighter tones improve contrast while maintaining dark mode benefits

## Color Palette

### Backgrounds & Surfaces

| Use Case            | Color Name        | HEX / RGBA                       | CSS Variable                                               |
| :------------------ | :---------------- | :------------------------------- | :--------------------------------------------------------- |
| **Page Background** | `bg-vibrant-blue` | `#1E2A3F` (lighter vibrant blue) | `--background`                                             |
| **Content Card**    | `surface-frosted` | `rgba(255, 255, 255, 0.08)`      | Applied via `.surface-frosted` class (ice floating effect) |
| **Card Border**     | `border-subtle`   | `rgba(255, 255, 255, 0.15)`      | `--border`                                                 |
| **Hover State**     | `surface-hover`   | `rgba(255, 255, 255, 0.12)`      | Applied via `.surface-frosted-hover:hover`                 |
| **Hover Title**     | `title-hover`     | `#FFFFFF` (bright white)         | Applied via `.group-hover:text-white`                      |

### Typography

| Use Case         | Color Name       | HEX       | Class                                       |
| :--------------- | :--------------- | :-------- | :------------------------------------------ |
| **Headings**     | `text-primary`   | `#F8F9FA` | `.text-primary-light` (brighter white)      |
| **Body Text**    | `text-secondary` | `#D1D5DB` | `.text-secondary-light` (lighter gray)      |
| **Subtle Text**  | `text-tertiary`  | `#9CA3AF` | `.text-tertiary`                            |
| **Hover Titles** | `text-hover`     | `#FFFFFF` | `.group-hover:text-white` (bright on hover) |

### Interactive & Brand Accents

| Use Case          | Color Name       | HEX / Gradient                                | Class                                   |
| :---------------- | :--------------- | :-------------------------------------------- | :-------------------------------------- |
| **Primary CTA**   | `brand-gradient` | `linear-gradient(to right, #3B82F6, #8B5CF6)` | `.gradient-brand` (blue to purple) |
| **Secondary CTA** | `brand-green`    | `#39FF14`                                     | `.bg-brand-green` / `.text-brand-green` |
| **Inline Links**  | `link-primary`   | `#60A5FA` (vibrant blue)                       | `.link-primary`                         |
| **Link Hover**    | `link-hover`     | `#93C5FD` (lighter blue)                       | `.link-primary:hover`                   |
| **Tags / Badges** | `tag-blue`       | `#3B82F6`                                     | `brand-blue`                            |

## Implementation

### CSS Variables

The color palette is defined in `src/app/globals.css` under the `.dark` selector:

```css
.dark {
  --background: 215 40% 22%; /* Lighter vibrant blue #1E2A3F (not navy) */
  --foreground: 0 0% 98%; /* Brighter white #F8F9FA */
  --secondary: 215 20% 85%; /* Lighter body text #D1D5DB */
  --muted: 215 15% 65%; /* Lighter tertiary text #9CA3AF */
  --brand-green: 120 100% 50%; /* Vibrant green #39FF14 */
  --brand-pink: 330 81% 60%; /* Pink from gradient #F472B6 */
  --brand-blue: 217 91% 60%; /* Tag blue #3B82F6 */
}
```

### Frosted Glass Effect

The frosted glass effect is applied via utility classes:

```css
/* Ice Floating Cards Effect */
.dark .surface-frosted {
  background: rgba(255, 255, 255, 0.08) !important; /* Slightly more opaque */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari support */
  border-color: rgba(255, 255, 255, 0.15) !important; /* More visible borders */
}

.dark .surface-frosted-hover:hover {
  background: rgba(255, 255, 255, 0.12) !important; /* More visible on hover */
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* Fix rollover titles - bright white on hover */
.dark .group:hover .group-hover\:text-white {
  color: #ffffff !important; /* Bright white */
}
```

### Card Component

The Card component automatically applies the frosted glass effect in dark mode:

```tsx
<Card className="dark:surface-frosted dark:hover:surface-frosted-hover dark:transition-all">
  {/* Content */}
</Card>
```

## Usage Examples

### Pattern Card

```tsx
<Card className="dark:surface-frosted dark:hover:surface-frosted-hover dark:transition-all">
  <CardHeader>
    <CardTitle className="text-primary-light dark:text-primary-light">
      Pattern Name
    </CardTitle>
    <CardDescription className="text-secondary-light dark:text-secondary-light leading-relaxed">
      Pattern description
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Link
      href="/patterns/pattern-id"
      className="link-primary dark:link-primary"
    >
      Learn More →
    </Link>
  </CardContent>
</Card>
```

### Badges

```tsx
<Badge className="border-brand-blue/30 bg-brand-blue/20 text-brand-blue">
  Intermediate
</Badge>
```

### Buttons

```tsx
<Button className="gradient-brand text-white hover:opacity-90">
  Get Started
</Button>
```

### Code Blocks

Code blocks use a darker background with bright text for optimal readability:

```tsx
<pre className="whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-sm font-mono text-slate-100 dark:bg-slate-950 dark:text-slate-50">
  {codeContent}
</pre>
```

**Color Scheme:**
- **Background:** `bg-slate-900` (light mode) / `bg-slate-950` (dark mode)
- **Text:** `text-slate-100` (light mode) / `text-slate-50` (dark mode)
- **Font:** `font-mono` for code readability

This ensures high contrast (WCAG AA compliant) and prevents the "too gray" contrast issue that makes code hard to read on muted backgrounds.

## Typography Guidelines

### Headings (H1, H2, H3)

- **Font:** 36px (H1), 24px (H2), 20px (H3)
- **Weight:** Bold (700)
- **Color:** `text-primary-light` (#F0F0F5)

### Body Text

- **Font:** 16px
- **Weight:** Regular (400)
- **Color:** `text-secondary-light` (#C0C0D0)
- **Line Height:** 1.6 (critical for readability)

### Links

- **Font:** 16px
- **Weight:** Medium (500)
- **Color:** `link-primary` (#BE93FD)
- **Hover:** `link-hover` (#F472B6)

## Updated Pages

- ✅ `/patterns` - Pattern listing page
- 🔄 `/patterns/[pattern]` - Pattern detail page (pending)
- 🔄 Other secondary pages (pending)

## Testing Checklist

- [x] Frosted glass effect renders correctly
- [x] Text colors are readable on dark background
- [x] Links use brand colors
- [x] Badges use brand colors
- [x] Cards have proper hover states
- [ ] Test on Safari (backdrop-filter support)
- [ ] Test on mobile devices
- [ ] Verify contrast ratios meet WCAG AA standards

## Future Enhancements

1. Extend to other secondary pages (`/learn`, `/prompts`, etc.)
2. Add smooth transitions between light/dark mode
3. Consider adding subtle background gradients for more visual interest
4. Add animation to frosted glass cards on hover
