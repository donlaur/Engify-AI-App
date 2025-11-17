# Prompt Customization Feature

## Overview

Added a premium feature-flagged prompt customization system that allows users to:
1. Edit prompts before copying
2. Detect and highlight placeholder sections (e.g., `--- MY DESCRIPTION ---`)
3. Save customized versions to their personal collection
4. Requires login for saving (authentication required)

## Feature Flag

**Feature Flag**: `NEXT_PUBLIC_ENABLE_PROMPT_CUSTOMIZATION`

- **Default**: `false` (disabled)
- **Enable**: Set `NEXT_PUBLIC_ENABLE_PROMPT_CUSTOMIZATION=true` in `.env.local` or Vercel environment variables
- **Location**: `src/lib/features/flags.ts`

## Entitlement System

**Location**: `src/lib/entitlements/customization.ts`

### Current Behavior (Beta Mode)
- **Feature Flag**: Must be enabled
- **Entitlement**: Requires login (any authenticated user gets access during beta)
- **Save to Collection**: Requires full account and login

### Future (Production Mode)
- Can be gated by subscription tier (`pro`, `enterprise`)
- Currently returns `true` for all authenticated users (beta mode)

## Components

### 1. PromptCustomizer (`src/components/features/PromptCustomizer.tsx`)

**Features**:
- Feature flag check (returns fallback UI if disabled)
- Entitlement check (shows upgrade message if not logged in)
- Placeholder detection and highlighting
- Editable textarea for customization
- Copy customized prompt
- Save to collection (requires login)
- Reset to original

**Placeholder Detection**:
- Lines starting with `---`
- Contains `[Your description here]`, `[Your input here]`, etc.
- Pattern: `--- MY DESCRIPTION ---` style headers

### 2. API Endpoint (`src/app/api/prompts/collections/route.ts`)

**POST `/api/prompts/collections`**:
- Saves customized prompt to user's collection
- Requires authentication
- Stores: `userId`, `originalPromptId`, `title`, `content`, `originalContent`
- Updates existing if title matches

**GET `/api/prompts/collections`**:
- Retrieves user's customized prompts
- Requires authentication
- Returns up to 100 most recent

### 3. Database Collection

**Collection**: `prompt_collections`

**Schema**:
```typescript
{
  userId: string;
  promptId: string; // Custom ID
  originalPromptId: string; // Reference to original prompt
  title: string;
  content: string; // Customized content
  originalContent: string; // Snapshot of original
  category?: string;
  role?: string;
  pattern?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Integration

### Prompt Detail Page (`src/app/prompts/[id]/page.tsx`)

- Replaced static `<pre>` display with `<PromptCustomizer>` component
- Component handles all feature flag and entitlement checks internally
- Falls back to static display if feature disabled

### Version Display

- Added version badge (`v{currentRevision}`) to prompt detail page header
- Library page already shows version badges correctly
- Both pages now show consistent version information

## User Flow

1. **Feature Disabled**: Shows static prompt with copy button
2. **Feature Enabled, Not Logged In**: Shows premium upgrade message with sign-in link
3. **Feature Enabled, Logged In**:
   - Shows editable prompt customizer
   - Can edit any part of the prompt
   - Placeholders are highlighted
   - Can copy customized version
   - Can save to collection (requires login)

## Terminology

**"Collection"** is the chosen terminology for saved customized prompts:
- More appropriate than "favorites" (which implies bookmarking)
- Implies ownership and customization
- Clear distinction: "Favorites" = bookmark original, "Collection" = save customized version

## Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_ENABLE_PROMPT_CUSTOMIZATION=true
```

## Future Enhancements

1. **Subscription Gating**: Gate by subscription tier (`pro`, `enterprise`)
2. **Collection Management**: UI to view/manage saved customized prompts
3. **Version History**: Track changes to customized prompts
4. **Sharing**: Share customized prompts with team
5. **Templates**: Create templates from customized prompts

## Testing

1. **Feature Disabled**: Verify static prompt display
2. **Not Logged In**: Verify upgrade message appears
3. **Logged In**: Verify customization UI works
4. **Placeholder Detection**: Test with prompts containing `--- MY DESCRIPTION ---` sections
5. **Save to Collection**: Verify API endpoint works and saves correctly
6. **Version Display**: Verify both library and detail pages show correct versions


