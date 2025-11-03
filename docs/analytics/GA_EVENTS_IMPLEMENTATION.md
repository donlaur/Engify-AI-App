# Google Analytics Events - Implementation Guide

**Date:** November 3, 2025  
**Status:** ✅ Implemented

---

## Overview

Comprehensive Google Analytics 4 (GA4) event tracking has been added to track key user interactions and improve product insights.

---

## Events Implemented

### 1. Multi-Agent Workflow Events ⭐

**Event:** `multi_agent_workflow`

**Actions Tracked:**
- `started` - User starts a multi-agent workflow
- `completed` - Workflow completes successfully
- `failed` - Workflow fails with error

**Metadata:**
- `situation_length` - Length of situation input
- `context_length` - Length of context input
- `turn_count` - Number of agent turns completed
- `duration_ms` - Total execution time
- `error` - Error message (if failed)

**Location:** `src/components/agents/ScrumMeetingAgent.tsx`

---

### 2. Prompt Interaction Events

**Event:** `prompt_interaction`

**Actions Tracked:**
- `view` - User views a prompt (modal/page)
- `copy` - User copies prompt to clipboard
- `favorite` - User favorites a prompt
- `unfavorite` - User unfavorites a prompt
- `execute` - User executes a prompt (future)

**Metadata:**
- `prompt_id` - Prompt ID
- `prompt_title` - Prompt title
- `prompt_category` - Prompt category
- `prompt_pattern` - Pattern name

**Location:** `src/components/features/PromptCard.tsx`

---

### 3. Search & Filter Events

**Event:** `search_action`

**Actions Tracked:**
- `search` - User searches prompts (debounced 500ms)
- `filter` - User applies a filter (category, role, etc.)
- `clear` - User clears search/filters (future)

**Metadata:**
- `query` - Search query text
- `filter_type` - Type of filter (category, role, pattern, tags, favorites)
- `filter_value` - Filter value selected
- `result_count` - Number of results displayed

**Location:** `src/components/features/LibraryClient.tsx`

---

### 4. Error Tracking

**Event:** `error`

**Metadata:**
- `error_type` - Type of error
- `error_message` - Error message
- `page` - Page where error occurred
- `component` - Component where error occurred
- `stack` - Error stack trace (optional)

**Location:** Used in error handlers throughout app

---

## Events Available (Not Yet Implemented)

### Authentication Events
- `signup` - User signs up
- `login` - User logs in
- `logout` - User logs out
- `signup_started` - User starts signup flow

### Conversion Events
- `purchase` - User makes purchase
- `signup` - User signs up (conversion)
- `subscribe` - User subscribes
- `trial_start` - User starts trial

### Engagement Events
- `scroll_25`, `scroll_50`, `scroll_75`, `scroll_100` - Scroll depth
- `time_on_page` - Time spent on page

### RAG Chat Events
- `message_sent` - User sends message
- `response_received` - Chat response received
- `error` - Chat error occurred

### API Key Events
- `created` - API key created
- `deleted` - API key deleted
- `tested` - API key tested
- `updated` - API key updated

### Feature Discovery
- `feature_discovery` - User discovers new feature

### Navigation Events
- `navigation` - User navigates to new page

---

## Implementation Details

### Utility Functions

All tracking functions are in `src/lib/utils/ga-events.ts`:

```typescript
import { trackMultiAgentEvent } from '@/lib/utils/ga-events';

// Track workflow start
trackMultiAgentEvent('started', {
  situation_length: situation.length,
  context_length: context.length,
});
```

### Google Analytics Component

The base GA component is in `src/components/analytics/GoogleAnalytics.tsx` and provides:
- `trackEvent(eventName, params)` - Send custom event
- `trackPageView(url)` - Track page view

---

## GA4 Event Structure

All events follow GA4 naming conventions:
- **Event Name:** `multi_agent_workflow`, `prompt_interaction`, etc.
- **Event Category:** `workflow`, `prompt`, `search`, etc.
- **Event Label:** Action taken (`started`, `completed`, `copy`, etc.)
- **Custom Parameters:** Additional metadata

---

## Viewing Events in GA4

1. **Go to GA4 Dashboard:** https://analytics.google.com
2. **Navigate to:** Reports → Engagement → Events
3. **Look for:**
   - `multi_agent_workflow`
   - `prompt_interaction`
   - `search_action`
   - `error`

4. **Create Custom Reports:**
   - Most popular prompts (by `prompt_interaction` events)
   - Multi-agent workflow success rate
   - Search query analysis
   - Error frequency by page

---

## Next Steps

### Recommended Additions

1. **Authentication Events** (High Priority)
   - Track signup/login/logout
   - Measure conversion funnel

2. **Scroll Depth Tracking** (Medium Priority)
   - Track how far users scroll on pages
   - Identify bounce points

3. **RAG Chat Events** (Medium Priority)
   - Track chat usage
   - Measure engagement with RAG feature

4. **Conversion Events** (High Priority)
   - Track signup conversions
   - Track trial starts
   - Track subscription events

5. **Error Boundary Tracking** (High Priority)
   - Wrap app in error boundary
   - Track all unhandled errors

---

## Testing

### Test Events Locally

1. Open browser DevTools → Network tab
2. Filter by `google-analytics.com` or `gtag`
3. Trigger events (copy prompt, search, etc.)
4. Verify events are sent

### Test in GA4 Real-Time

1. Go to GA4 → Reports → Realtime
2. Trigger events on site
3. Verify events appear in real-time dashboard

---

## Privacy & Compliance

- ✅ No PII (Personally Identifiable Information) tracked
- ✅ User IDs are hashed (if implemented)
- ✅ Compliant with GDPR/CCPA (respects cookie consent)
- ✅ Events are contextual, not personal

---

## Related Files

- `src/lib/utils/ga-events.ts` - Event tracking utilities
- `src/components/analytics/GoogleAnalytics.tsx` - GA4 initialization
- `src/components/agents/ScrumMeetingAgent.tsx` - Multi-agent tracking
- `src/components/features/PromptCard.tsx` - Prompt interaction tracking
- `src/components/features/LibraryClient.tsx` - Search/filter tracking

---

**Status:** ✅ Core events implemented and tracking!
**Next:** Add authentication and conversion events

