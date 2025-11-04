# Vibrant Dark Mode Style Guide

## Overview

This document describes the new "Vibrant Dark Mode" design system implemented to improve readability and brand consistency across Engify.ai's secondary pages. The goal is to bridge the gap between the vibrant, energetic homepage and the previously desaturated dark secondary pages.

## Design Philosophy

Instead of using a low-saturation navy/black background, we've implemented a **deep, saturated indigo/purple** base that feels intentional and connected to the brand. Key improvements:

1. **Readability**: Softer, off-white text colors reduce eye strain (halation)
2. **Brand Cohesion**: Uses existing brand gradients and vibrant green accents
3. **Visual Hierarchy**: Frosted glass cards create depth and separate content from background

## Color Palette

### Backgrounds & Surfaces

| Use Case            | Color Name        | HEX / RGBA                  | CSS Variable                               |
| :------------------ | :---------------- | :-------------------------- | :----------------------------------------- |
| **Page Background** | `bg-deep-indigo`  | `#1A182D`                   | `--background`                             |
| **Content Card**    | `surface-frosted` | `rgba(255, 255, 255, 0.05)` | Applied via `.surface-frosted` class       |
| **Card Border**     | `border-subtle`   | `rgba(255, 255, 255, 0.1)`  | `--border`                                 |
| **Hover State**     | `surface-hover`   | `rgba(255, 255, 255, 0.1)`  | Applied via `.surface-frosted-hover:hover` |

### Typography

| Use Case        | Color Name       | HEX       | Class                   |
| :-------------- | :--------------- | :-------- | :---------------------- |
| **Headings**    | `text-primary`   | `#F0F0F5` | `.text-primary-light`   |
| **Body Text**   | `text-secondary` | `#C0C0D0` | `.text-secondary-light` |
| **Subtle Text** | `text-tertiary`  | `#80809A` | `.text-tertiary`        |

### Interactive & Brand Accents

| Use Case          | Color Name       | HEX / Gradient                                | Class                                   |
| :---------------- | :--------------- | :-------------------------------------------- | :-------------------------------------- |
| **Primary CTA**   | `brand-gradient` | `linear-gradient(to right, #9333EA, #EC4899)` | `.gradient-brand`                       |
| **Secondary CTA** | `brand-green`    | `#39FF14`                                     | `.bg-brand-green` / `.text-brand-green` |
| **Inline Links**  | `link-primary`   | `#BE93FD`                                     | `.link-primary`                         |
| **Link Hover**    | `link-hover`     | `#F472B6`                                     | `.link-primary:hover`                   |
| **Tags / Badges** | `tag-blue`       | `#3B82F6`                                     | `brand-blue`                            |

## Implementation

### CSS Variables

The color palette is defined in `src/app/globals.css` under the `.dark` selector:

```css
.dark {
  --background: 252 40% 14%; /* Deep indigo-purple #1A182D */
  --foreground: 240 25% 95%; /* Soft off-white #F0F0F5 */
  --secondary: 240 20% 75%; /* Body text #C0C0D0 */
  --muted: 240 15% 55%; /* Tertiary text #80809A */
  --brand-green: 120 100% 50%; /* Vibrant green #39FF14 */
  --brand-pink: 330 81% 60%; /* Pink from gradient #F472B6 */
  --brand-blue: 217 91% 60%; /* Tag blue #3B82F6 */
}
```

### Frosted Glass Effect

The frosted glass effect is applied via utility classes:

```css
.dark .surface-frosted {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari support */
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.dark .surface-frosted-hover:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
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
