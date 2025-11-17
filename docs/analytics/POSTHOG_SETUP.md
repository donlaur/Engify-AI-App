# PostHog Analytics Setup Guide

## Overview

Engify uses PostHog for privacy-focused, open-source analytics. PostHog provides powerful product analytics while respecting user privacy and offering GDPR compliance out of the box.

## Why PostHog?

- **Privacy-Focused**: Self-hostable, GDPR compliant, respects Do Not Track
- **Open Source**: Full transparency on data collection and processing
- **Feature-Rich**: Event tracking, user identification, feature flags, session replay
- **Developer-Friendly**: Great SDKs, API, and developer experience

## Setup Instructions

### 1. Create a PostHog Account

1. Go to [PostHog Cloud](https://app.posthog.com/signup) or self-host
2. Create a new project
3. Copy your Project API Key (starts with `phc_`)

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your-actual-api-key-here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

#### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog Project API Key | Yes | - |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog instance URL | No | `https://app.posthog.com` |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Master toggle for analytics | No | `true` |

### 3. Verify Installation

1. Start your development server: `pnpm dev`
2. Open your browser's console
3. Look for: `PostHog: Initialized successfully` (or opted out in development)
4. Navigate to PostHog dashboard > Events to see incoming data

## Usage

### Tracking Events in Components

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent('button_clicked', {
      button_name: 'signup',
      page: 'homepage',
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

### Tracking Prompt Interactions

```typescript
import { usePromptAnalytics } from '@/hooks/useAnalytics';

function PromptCard({ prompt }) {
  const { trackPromptView, trackPromptCopy } = usePromptAnalytics();

  useEffect(() => {
    trackPromptView(prompt.id, prompt.title);
  }, [prompt.id]);

  const handleCopy = () => {
    trackPromptCopy(prompt.id, prompt.title);
  };

  return <div>...</div>;
}
```

### Tracking Workbench Usage

```typescript
import { useWorkbenchAnalytics } from '@/hooks/useAnalytics';

function Workbench() {
  const { trackWorkbenchPromptRun } = useWorkbenchAnalytics();

  const handleRun = (model: string, prompt: string) => {
    trackWorkbenchPromptRun(model, prompt.length, {
      hasCustomInstructions: true,
    });
  };

  return <div>...</div>;
}
```

### Identifying Users

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function UserProfile({ user }) {
  const { identifyUser, setUserProperties } = useAnalytics();

  useEffect(() => {
    if (user) {
      identifyUser(user.id, {
        email: user.email,
        name: user.name,
        plan: user.plan,
      });
    }
  }, [user]);

  return <div>...</div>;
}
```

### Manual Event Tracking

For non-React code or API routes:

```typescript
import { trackEvent } from '@/lib/utils/analytics';

// Track a custom event
trackEvent({
  name: 'api_call',
  properties: {
    endpoint: '/api/prompts',
    method: 'POST',
    duration: 123,
  },
  userId: 'user-123',
});
```

## Privacy & GDPR Compliance

### Automatic Privacy Features

1. **Do Not Track**: Automatically respects browser DNT setting
2. **Opt-Out Storage**: User preferences stored in localStorage
3. **Development Mode**: Analytics disabled in development
4. **IP Anonymization**: Enabled by default
5. **Data Sanitization**: Automatically removes sensitive fields (email, phone, password)

### User Opt-Out

Allow users to opt out of analytics:

```typescript
import { optOutAnalytics, optInAnalytics, isAnalyticsEnabled } from '@/components/analytics/PostHogProvider';

function PrivacySettings() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(isAnalyticsEnabled());

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      optInAnalytics();
    } else {
      optOutAnalytics();
    }
    setAnalyticsEnabled(enabled);
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={analyticsEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
        />
        Enable Analytics
      </label>
    </div>
  );
}
```

## Available Hooks

### `useAnalytics()`

General-purpose analytics hook.

```typescript
const {
  trackEvent,        // Track custom event
  identifyUser,      // Identify user
  resetUser,         // Reset user identity
  setUserProperties, // Update user properties
} = useAnalytics();
```

### `usePromptAnalytics()`

Specialized hook for prompt interactions.

```typescript
const {
  trackPromptView,     // Track prompt view
  trackPromptCopy,     // Track prompt copy
  trackPromptFavorite, // Track favorite toggle
  trackPromptExecute,  // Track prompt execution
  trackPromptShare,    // Track prompt share
} = usePromptAnalytics();
```

### `useWorkbenchAnalytics()`

Specialized hook for workbench usage.

```typescript
const {
  trackWorkbenchOpen,        // Track workbench open
  trackWorkbenchPromptRun,   // Track prompt execution
  trackWorkbenchModelChange, // Track model switch
  trackWorkbenchExport,      // Track export action
} = useWorkbenchAnalytics();
```

### `useConversionAnalytics()`

Specialized hook for conversion events.

```typescript
const {
  trackSignup,       // Track user signup
  trackLogin,        // Track user login
  trackUpgrade,      // Track plan upgrade
  trackSubscription, // Track subscription
} = useConversionAnalytics();
```

### `useWorkflowAnalytics()`

Specialized hook for workflow interactions.

```typescript
const {
  trackWorkflowView,   // Track workflow view
  trackWorkflowClick,  // Track workflow click
  trackWorkflowFilter, // Track filter usage
} = useWorkflowAnalytics();
```

## Event Types

### Core Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `$pageview` | Page view (automatic) | `$current_url` |
| `page_view` | Manual page view | `path`, `userId` |

### Prompt Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `prompt_view` | User views a prompt | `prompt_id`, `prompt_title` |
| `prompt_copy` | User copies a prompt | `prompt_id`, `prompt_title` |
| `prompt_favorite` | User favorites a prompt | `prompt_id`, `prompt_title`, `favorited` |
| `prompt_execute` | User executes a prompt | `prompt_id`, `prompt_title`, `model` |
| `prompt_share` | User shares a prompt | `prompt_id`, `prompt_title`, `platform` |

### Workbench Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `workbench_open` | User opens workbench | - |
| `workbench_prompt_run` | User runs a prompt | `model`, `prompt_length` |
| `workbench_model_change` | User switches model | `from_model`, `to_model` |
| `workbench_export` | User exports results | `format` |

### Conversion Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `signup` | User signs up | `user_id`, `method` |
| `login` | User logs in | `user_id`, `method` |
| `upgrade` | User upgrades plan | `user_id`, `plan` |
| `subscription` | User subscribes | `user_id`, `plan`, `price` |

### Workflow Events

| Event Name | Description | Properties |
|------------|-------------|------------|
| `workflow_view` | User views workflow | `workflow_id`, `workflow_title` |
| `workflow_click` | User clicks workflow | `workflow_id`, `workflow_title` |
| `workflow_filter` | User filters workflows | `filter_type`, `filter_value` |

## Best Practices

### 1. Event Naming

- Use snake_case for event names: `prompt_view`, not `promptView`
- Use descriptive, action-oriented names: `button_clicked`, not `button`
- Group related events with prefixes: `prompt_*`, `workbench_*`

### 2. Event Properties

- Keep properties consistent across similar events
- Use snake_case for property names
- Include relevant context: `page`, `section`, `source`
- Avoid PII: Don't track emails, phone numbers, etc.

### 3. User Identification

- Identify users on login/signup
- Update properties on profile changes
- Reset identity on logout

### 4. Performance

- Track events asynchronously (handled automatically)
- Batch similar events when possible
- Don't track in tight loops

### 5. Testing

- Analytics is disabled in development by default
- Check browser console for debug logs
- Use PostHog's test mode for staging

## Self-Hosting (Optional)

For maximum privacy and control, you can self-host PostHog:

1. Follow the [PostHog deployment guide](https://posthog.com/docs/self-host)
2. Update `NEXT_PUBLIC_POSTHOG_HOST` to your instance URL
3. Configure your instance with appropriate security settings

## Troubleshooting

### Events Not Appearing in PostHog

1. Check environment variables are set correctly
2. Verify API key starts with `phc_`
3. Check browser console for errors
4. Ensure `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
5. Verify Do Not Track is not enabled
6. Check if user has opted out

### Development Mode

Analytics is automatically disabled in development to avoid polluting production data. To test analytics in development:

1. Set `NODE_ENV=production` temporarily, or
2. Comment out the opt-out logic in `PostHogProvider.tsx`, or
3. Check browser console for debug logs

### TypeScript Errors

If you see TypeScript errors:

1. Ensure `posthog-js` is installed: `pnpm add posthog-js`
2. Restart your TypeScript server
3. Clear `.next` cache: `rm -rf .next`

## Support

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Community](https://posthog.com/questions)
- [Engify Analytics Documentation](../analytics/ROLE_PERSONA_TRACKING.md)

## Security Considerations

1. **API Key**: The PostHog API key is safe to expose client-side (it's read-only)
2. **Data Sanitization**: Sensitive fields are automatically removed
3. **Privacy**: Users can opt out at any time
4. **GDPR**: PostHog provides GDPR compliance tools
5. **Data Retention**: Configure retention policies in PostHog settings

## Migration Notes

This implementation coexists with Google Analytics. You can:

1. Run both analytics providers simultaneously
2. Compare data between platforms
3. Gradually migrate to PostHog
4. Eventually remove Google Analytics if desired

The dual-provider setup allows for a smooth transition and validation period.
