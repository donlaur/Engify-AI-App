# Feature Flags - MVP Development

**Purpose**: Control feature rollout, A/B testing, and gradual releases.

---

## 🎯 Why Feature Flags?

### Benefits

1. **Deploy Without Releasing**: Ship code to production without enabling features
2. **Gradual Rollout**: Enable features for 10% → 50% → 100% of users
3. **A/B Testing**: Test different implementations
4. **Kill Switch**: Disable problematic features instantly
5. **MVP Focus**: Hide incomplete features from users

---

## 🏗️ Implementation

### Simple Feature Flag System

```typescript
// src/lib/features/flags.ts

/**
 * Feature Flags Configuration
 * 
 * Control which features are enabled in different environments.
 * 
 * Naming Convention:
 * - Use snake_case for flag names
 * - Prefix with feature area: auth_, billing_, ai_, etc.
 * - Be descriptive: enable_sso_login, show_team_dashboard
 */

export type FeatureFlag =
  // Phase 1: Education Platform (MVP)
  | 'enable_prompt_library'
  | 'enable_learning_pathways'
  | 'enable_basic_workbench'
  | 'enable_user_profiles'
  | 'enable_favorites'
  | 'enable_ratings'
  
  // Phase 2: Assisted Execution (Future)
  | 'enable_ai_execution'
  | 'enable_conversation_history'
  | 'enable_api_key_management'
  | 'enable_usage_analytics'
  
  // Phase 3: Code Intelligence (Future)
  | 'enable_github_integration'
  | 'enable_code_scanning'
  | 'enable_automated_reviews'
  
  // Team Features
  | 'enable_team_workspace'
  | 'enable_shared_prompts'
  | 'enable_team_analytics'
  
  // Enterprise Features
  | 'enable_sso_login'
  | 'enable_admin_dashboard'
  | 'enable_audit_logs'
  | 'enable_rbac'
  
  // Experimental
  | 'enable_ai_chatbot'
  | 'enable_prompt_suggestions'
  | 'enable_dark_mode';

/**
 * Feature flag configuration by environment
 */
const featureFlags: Record<string, Record<FeatureFlag, boolean>> = {
  // Development: All features enabled for testing
  development: {
    // Phase 1 (MVP)
    enable_prompt_library: true,
    enable_learning_pathways: true,
    enable_basic_workbench: true,
    enable_user_profiles: true,
    enable_favorites: true,
    enable_ratings: true,
    
    // Phase 2 (Future)
    enable_ai_execution: false,
    enable_conversation_history: false,
    enable_api_key_management: false,
    enable_usage_analytics: false,
    
    // Phase 3 (Future)
    enable_github_integration: false,
    enable_code_scanning: false,
    enable_automated_reviews: false,
    
    // Team Features
    enable_team_workspace: false,
    enable_shared_prompts: false,
    enable_team_analytics: false,
    
    // Enterprise Features
    enable_sso_login: false,
    enable_admin_dashboard: false,
    enable_audit_logs: true, // Always on for testing
    enable_rbac: false,
    
    // Experimental
    enable_ai_chatbot: false,
    enable_prompt_suggestions: false,
    enable_dark_mode: true,
  },
  
  // Production: Only stable features enabled
  production: {
    // Phase 1 (MVP) - ENABLED
    enable_prompt_library: true,
    enable_learning_pathways: true,
    enable_basic_workbench: true,
    enable_user_profiles: true,
    enable_favorites: true,
    enable_ratings: true,
    
    // Phase 2 (Future) - DISABLED
    enable_ai_execution: false,
    enable_conversation_history: false,
    enable_api_key_management: false,
    enable_usage_analytics: false,
    
    // Phase 3 (Future) - DISABLED
    enable_github_integration: false,
    enable_code_scanning: false,
    enable_automated_reviews: false,
    
    // Team Features - DISABLED
    enable_team_workspace: false,
    enable_shared_prompts: false,
    enable_team_analytics: false,
    
    // Enterprise Features - DISABLED
    enable_sso_login: false,
    enable_admin_dashboard: false,
    enable_audit_logs: true, // Always on for compliance
    enable_rbac: false,
    
    // Experimental - DISABLED
    enable_ai_chatbot: false,
    enable_prompt_suggestions: false,
    enable_dark_mode: true,
  },
};

/**
 * Check if a feature is enabled
 * 
 * @param flag - Feature flag to check
 * @returns true if feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const env = process.env.NODE_ENV || 'development';
  return featureFlags[env]?.[flag] ?? false;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  const env = process.env.NODE_ENV || 'development';
  const flags = featureFlags[env] || {};
  
  return (Object.keys(flags) as FeatureFlag[]).filter(
    flag => flags[flag] === true
  );
}

/**
 * Feature flag hook for React components
 */
export function useFeature(flag: FeatureFlag): boolean {
  return isFeatureEnabled(flag);
}
```

---

## 🎨 Usage in Components

### React Components

```typescript
// src/components/features/PromptLibrary.tsx
import { useFeature } from '@/lib/features/flags';

export function PromptLibrary() {
  const isEnabled = useFeature('enable_prompt_library');
  
  if (!isEnabled) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Coming Soon</h2>
        <p className="text-muted-foreground">
          This feature is currently under development.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Prompt library implementation */}
    </div>
  );
}
```

### Conditional Rendering

```typescript
import { useFeature } from '@/lib/features/flags';

export function Dashboard() {
  const showTeamFeatures = useFeature('enable_team_workspace');
  const showAnalytics = useFeature('enable_usage_analytics');
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Always show */}
      <PromptLibrary />
      
      {/* Conditional */}
      {showTeamFeatures && <TeamWorkspace />}
      {showAnalytics && <UsageAnalytics />}
    </div>
  );
}
```

---

## 🔧 Usage in API Routes

### Server-Side Checks

```typescript
// src/app/api/ai/execute/route.ts
import { isFeatureEnabled } from '@/lib/features/flags';
import { fail } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  // Check if feature is enabled
  if (!isFeatureEnabled('enable_ai_execution')) {
    return fail('This feature is not yet available', 403);
  }
  
  // Continue with implementation...
}
```

### Middleware

```typescript
// src/lib/middleware/withFeature.ts
import { isFeatureEnabled, FeatureFlag } from '@/lib/features/flags';
import { fail } from '@/lib/api/response';

export function withFeature(flag: FeatureFlag) {
  return function (
    handler: (req: NextRequest, context: any) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context: any) => {
      if (!isFeatureEnabled(flag)) {
        return fail('Feature not available', 403);
      }
      
      return handler(req, context);
    };
  };
}

// Usage
export const POST = withFeature('enable_ai_execution')(
  withAuth(async (req, { user }) => {
    // Implementation...
  })
);
```

---

## 📊 Feature Rollout Strategy

### Phase 1: MVP (Week 1-4)

**Enabled Features**:
- ✅ `enable_prompt_library` - Core feature
- ✅ `enable_learning_pathways` - Core feature
- ✅ `enable_basic_workbench` - Core feature
- ✅ `enable_user_profiles` - Core feature
- ✅ `enable_favorites` - Nice to have
- ✅ `enable_ratings` - Nice to have
- ✅ `enable_audit_logs` - Always on
- ✅ `enable_dark_mode` - User preference

**Disabled Features**:
- ❌ All Phase 2, 3, Team, and Enterprise features

### Phase 2: Assisted Execution (Month 2-3)

**Enable Gradually**:
1. Week 1: `enable_ai_execution` (10% of users)
2. Week 2: `enable_ai_execution` (50% of users)
3. Week 3: `enable_ai_execution` (100% of users)
4. Week 4: `enable_conversation_history`
5. Week 5: `enable_api_key_management`
6. Week 6: `enable_usage_analytics`

### Phase 3: Team Features (Month 4-6)

**Enable for Beta Users**:
1. `enable_team_workspace` (beta users only)
2. `enable_shared_prompts` (beta users only)
3. `enable_team_analytics` (beta users only)
4. Gradual rollout to all users

---

## 🧪 A/B Testing

### Test Different Implementations

```typescript
// src/lib/features/experiments.ts

export type Experiment = 'prompt_layout_v2' | 'onboarding_flow_v2';

/**
 * Check if user is in experiment
 * Uses user ID for consistent assignment
 */
export function isInExperiment(
  userId: string,
  experiment: Experiment
): boolean {
  // Simple hash-based assignment (50/50 split)
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return hash % 2 === 0;
}

// Usage
export function PromptCard({ userId }: { userId: string }) {
  const useNewLayout = isInExperiment(userId, 'prompt_layout_v2');
  
  if (useNewLayout) {
    return <PromptCardV2 />;
  }
  
  return <PromptCardV1 />;
}
```

---

## 🔄 Gradual Rollout

### Percentage-Based Rollout

```typescript
// src/lib/features/rollout.ts

/**
 * Check if feature is enabled for user based on rollout percentage
 * 
 * @param userId - User ID
 * @param percentage - Rollout percentage (0-100)
 * @returns true if user is in rollout group
 */
export function isInRollout(userId: string, percentage: number): boolean {
  if (percentage >= 100) return true;
  if (percentage <= 0) return false;
  
  // Hash user ID to get consistent assignment
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return (hash % 100) < percentage;
}

// Usage
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Enable for 10% of users
  if (!isInRollout(session.user.id, 10)) {
    return fail('Feature not available', 403);
  }
  
  // Continue...
}
```

---

## 🎯 MVP Feature Checklist

### Must-Have (Phase 1)

- [x] `enable_prompt_library` - Display and search prompts
- [x] `enable_user_profiles` - Basic user accounts
- [x] `enable_favorites` - Save favorite prompts
- [x] `enable_ratings` - Rate prompts
- [x] `enable_learning_pathways` - Guided learning
- [x] `enable_basic_workbench` - Prompt templates
- [x] `enable_audit_logs` - Track important actions
- [x] `enable_dark_mode` - User preference

### Nice-to-Have (Phase 1.5)

- [ ] `enable_ai_chatbot` - In-app chat (experimental)
- [ ] `enable_prompt_suggestions` - AI-powered suggestions

### Future (Phase 2+)

- [ ] `enable_ai_execution` - Run prompts in-app
- [ ] `enable_conversation_history` - Save conversations
- [ ] `enable_team_workspace` - Team collaboration
- [ ] `enable_admin_dashboard` - Organization admin
- [ ] `enable_sso_login` - Enterprise SSO

---

## 📊 Monitoring

### Track Feature Usage

```typescript
// src/lib/analytics/features.ts

export async function trackFeatureUsage(
  userId: string,
  feature: FeatureFlag
): Promise<void> {
  // Log to analytics
  await analytics.track({
    userId,
    event: 'feature_used',
    properties: {
      feature,
      timestamp: new Date().toISOString(),
    },
  });
}

// Usage
export function PromptLibrary() {
  const userId = useUser().id;
  
  useEffect(() => {
    trackFeatureUsage(userId, 'enable_prompt_library');
  }, [userId]);
  
  return <div>...</div>;
}
```

---

## 🚨 Kill Switch

### Disable Features Instantly

```typescript
// In production, if a feature is causing issues:

// 1. Update feature flag
const featureFlags = {
  production: {
    enable_ai_execution: false, // DISABLED due to performance issues
    // ... other flags
  },
};

// 2. Deploy immediately (no code changes needed)

// 3. Feature is disabled for all users

// 4. Fix issue

// 5. Re-enable feature
```

---

## 📝 Best Practices

### 1. Naming Convention

```typescript
// ✅ GOOD - Descriptive, prefixed
enable_sso_login
enable_team_workspace
show_admin_dashboard

// ❌ BAD - Vague, no prefix
sso
teams
admin
```

### 2. Default to Disabled

```typescript
// ✅ GOOD - Explicitly enable
enable_new_feature: false, // Default off

// ❌ BAD - Implicitly enabled
enable_new_feature: true, // Risky!
```

### 3. Document Flags

```typescript
/**
 * enable_ai_execution
 * 
 * Enables in-app AI execution (Phase 2 feature)
 * 
 * Requirements:
 * - SOC2 compliance
 * - User API key or Pro subscription
 * 
 * Rollout:
 * - Week 1: 10% of users
 * - Week 2: 50% of users
 * - Week 3: 100% of users
 */
enable_ai_execution: false,
```

### 4. Clean Up Old Flags

```typescript
// Remove flags after full rollout (100% for 2+ weeks)
// Don't let flags accumulate

// ❌ BAD - Flag no longer needed
enable_user_profiles: true, // Been 100% for 6 months

// ✅ GOOD - Remove flag, feature is permanent
// Just implement directly without flag
```

---

## ✅ Summary

**Feature flags enable**:
- ✅ Deploy without releasing
- ✅ Gradual rollout (10% → 50% → 100%)
- ✅ A/B testing
- ✅ Kill switch for issues
- ✅ MVP focus (hide incomplete features)

**MVP flags (enabled)**:
- Prompt library
- Learning pathways
- Basic workbench
- User profiles
- Favorites and ratings

**Future flags (disabled)**:
- AI execution (Phase 2)
- Team features (Phase 2)
- Enterprise features (Phase 3)

**This allows us to ship code to production without releasing features. Deploy fast, release gradually.** 🚀

**Last Updated**: 2025-10-27  
**Status**: Active - Use for All New Features
