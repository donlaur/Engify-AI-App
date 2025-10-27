# Authentication & Billing Strategy

**Goal**: Simple, robust authentication and billing system similar to Claude, Cursor, and other modern AI SaaS products.

---

## 🎯 Design Principles

### Inspired by Best-in-Class SaaS
- **Claude (Anthropic)**: Email/password, Google OAuth, simple profile, usage-based billing
- **Cursor**: GitHub OAuth, email/password, team management, subscription tiers
- **Vercel**: Email magic links, GitHub OAuth, clean billing UI
- **Linear**: Email/password, Google OAuth, workspace-based pricing

### Our Approach
- ✅ **Simple authentication** - Email/password + Google OAuth (no complexity)
- ✅ **Clean user profiles** - Name, email, avatar, API keys, usage stats
- ✅ **Stripe integration** - Standard subscription billing
- ✅ **Usage tracking** - Monitor prompts, tokens, costs
- ✅ **Team support** - Future: workspace-based billing

---

## 🔐 Authentication Strategy

### Why NextAuth.js v5 (Auth.js) over Clerk

| Feature | Clerk | NextAuth.js v5 | Winner |
|---------|-------|----------------|--------|
| **Cost** | $25/month (1000 MAU) | Free | NextAuth |
| **Control** | Limited customization | Full control | NextAuth |
| **Vendor Lock-in** | High | None | NextAuth |
| **Learning Curve** | Moderate | Low (standard patterns) | NextAuth |
| **Database** | Clerk's DB | Your MongoDB | NextAuth |
| **Customization** | Limited UI/UX | Fully customizable | NextAuth |
| **Stripe Integration** | Built-in (but opinionated) | Full control | NextAuth |
| **Resume Value** | Vendor-specific | Industry standard | NextAuth |

**Decision**: NextAuth.js v5 (Auth.js)
- Industry-standard authentication
- Full control over user data
- Free and open-source
- Perfect for SaaS with Stripe

### Authentication Methods

#### Phase 1 (Week 1)
1. **Email/Password** - Standard credentials
2. **Google OAuth** - Social login

#### Phase 2 (Week 2-3)
3. **Magic Links** - Passwordless email login
4. **GitHub OAuth** - For developer audience

#### Phase 3 (Week 4+)
5. **SSO/SAML** - Enterprise customers
6. **2FA/MFA** - Security enhancement

---

## 👤 User Profile Schema

### MongoDB User Collection

```javascript
{
  _id: ObjectId,
  email: String,                    // Primary identifier
  emailVerified: Date,              // Email verification timestamp
  name: String,                     // Display name
  image: String,                    // Avatar URL (from OAuth or uploaded)
  
  // Authentication
  password: String,                 // Hashed (bcrypt) - only for email/password
  accounts: [{                      // OAuth accounts
    provider: String,               // 'google', 'github'
    providerAccountId: String,
    access_token: String,
    refresh_token: String,
    expires_at: Number
  }],
  
  // Profile
  role: String,                     // 'engineer', 'manager', 'director', 'vp'
  company: String,
  jobTitle: String,
  bio: String,
  timezone: String,
  
  // Subscription & Billing
  subscription: {
    plan: String,                   // 'free', 'pro', 'team', 'enterprise'
    status: String,                 // 'active', 'canceled', 'past_due', 'trialing'
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: Boolean,
    trialEndsAt: Date
  },
  
  // Settings
  settings: {
    theme: String,                  // 'light', 'dark', 'system'
    defaultProvider: String,        // 'gemini', 'openai', 'anthropic'
    notifications: {
      email: Boolean,
      usage: Boolean,
      billing: Boolean
    },
    apiKeys: {                      // User's own API keys (BYOK)
      gemini: {
        encrypted: String,
        isActive: Boolean,
        lastUsed: Date
      },
      openai: {
        encrypted: String,
        isActive: Boolean,
        lastUsed: Date
      },
      anthropic: {
        encrypted: String,
        isActive: Boolean,
        lastUsed: Date
      }
    }
  },
  
  // Usage & Analytics
  usage: {
    totalPrompts: Number,
    totalTokens: Number,
    totalCost: Number,              // In cents
    currentMonthPrompts: Number,
    currentMonthTokens: Number,
    currentMonthCost: Number,
    lastActive: Date,
    monthlyUsage: [{                // Historical data
      month: String,                // 'YYYY-MM'
      prompts: Number,
      tokens: Number,
      cost: Number
    }]
  },
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  onboardingCompleted: Boolean,
  onboardingStep: Number
}
```

---

## 💳 Billing Strategy (Stripe)

### Pricing Tiers

#### Free Tier
- **Price**: $0/month
- **Features**:
  - BYOK (Bring Your Own Keys) - unlimited usage
  - Access to all prompt templates
  - Basic learning pathways
  - Community support
- **Limitations**:
  - Must provide own API keys
  - No team features
  - No priority support

#### Pro Tier
- **Price**: $20/month
- **Features**:
  - Everything in Free
  - **We provide AI API keys** - no setup needed
  - 500 prompts/month included
  - $0.05 per additional prompt
  - Priority support
  - Advanced analytics
  - Export conversations
- **Target**: Individual engineers and managers

#### Team Tier
- **Price**: $50/user/month (min 3 users)
- **Features**:
  - Everything in Pro
  - Unlimited prompts
  - Team workspace
  - Shared prompt templates
  - Usage analytics dashboard
  - Role-based access control
  - Slack integration
- **Target**: Engineering teams (5-20 people)

#### Enterprise Tier
- **Price**: Custom
- **Features**:
  - Everything in Team
  - SSO/SAML
  - Dedicated support
  - Custom integrations
  - On-premise deployment option
  - SLA guarantees
  - Audit logs
- **Target**: Large organizations (50+ people)

### Stripe Integration Architecture

```typescript
// Subscription lifecycle
User signs up (Free)
  ↓
User upgrades to Pro
  ↓
Create Stripe Customer
  ↓
Create Stripe Subscription
  ↓
Webhook: subscription.created
  ↓
Update user.subscription in MongoDB
  ↓
User gets access to Pro features
  ↓
Monthly billing cycle
  ↓
Webhook: invoice.paid
  ↓
Reset monthly usage counters
  ↓
(Optional) Webhook: subscription.canceled
  ↓
Downgrade to Free at period end
```

---

## 🔧 Implementation Details

### NextAuth.js v5 Configuration

```typescript
// src/lib/auth/config.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db/mongodb';
import { compare } from 'bcryptjs';
import { getDb } from '@/lib/db/mongodb';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = await getDb();
        const user = await db.collection('users').findOne({
          email: credentials.email
        });

        if (!user?.password) {
          return null;
        }

        const isValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.subscription = user.subscription;
      }
      
      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.subscription = token.subscription;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
```

### Stripe Integration

```typescript
// src/lib/stripe/config.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: ['BYOK', 'All templates', 'Community support'],
  },
  pro: {
    name: 'Pro',
    price: 20,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Everything in Free',
      'We provide API keys',
      '500 prompts/month',
      'Priority support',
      'Advanced analytics',
    ],
  },
  team: {
    name: 'Team',
    price: 50,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      'Everything in Pro',
      'Unlimited prompts',
      'Team workspace',
      'Shared templates',
      'RBAC',
    ],
  },
};

// Create checkout session
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: {
      userId,
    },
  });

  return session;
}

// Create customer portal session
export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
```

### Stripe Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { getDb } from '@/lib/db/mongodb';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = await getDb();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription as string;

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Update user in database
      await db.collection('users').updateOne(
        { _id: userId },
        {
          $set: {
            'subscription.plan': 'pro',
            'subscription.status': subscription.status,
            'subscription.stripeCustomerId': session.customer as string,
            'subscription.stripeSubscriptionId': subscriptionId,
            'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': false,
          },
        }
      );
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      // Reset monthly usage counters
      await db.collection('users').updateOne(
        { 'subscription.stripeSubscriptionId': subscriptionId },
        {
          $set: {
            'usage.currentMonthPrompts': 0,
            'usage.currentMonthTokens': 0,
            'usage.currentMonthCost': 0,
          },
        }
      );
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      await db.collection('users').updateOne(
        { 'subscription.stripeSubscriptionId': subscription.id },
        {
          $set: {
            'subscription.status': subscription.status,
            'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
          },
        }
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await db.collection('users').updateOne(
        { 'subscription.stripeSubscriptionId': subscription.id },
        {
          $set: {
            'subscription.plan': 'free',
            'subscription.status': 'canceled',
          },
        }
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## 🎨 User Interface Design

### Profile Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Profile                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Avatar]  John Doe                                         │
│            john@example.com                                  │
│            [Edit Profile]                                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Subscription                                                │
│                                                              │
│  Pro Plan - $20/month                                       │
│  Next billing: Dec 1, 2025                                  │
│  [Manage Subscription] [Cancel]                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Usage This Month                                            │
│                                                              │
│  Prompts: 234 / 500                                         │
│  [████████░░] 47%                                           │
│                                                              │
│  Tokens: 125,430                                            │
│  Cost: $2.34                                                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  API Keys (BYOK)                                            │
│                                                              │
│  Google Gemini    [●] Active    [Edit]                     │
│  OpenAI           [○] Inactive  [Add]                      │
│  Anthropic        [○] Inactive  [Add]                      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Settings                                                    │
│                                                              │
│  Theme: [Dark ▼]                                            │
│  Default Provider: [Gemini ▼]                              │
│  Email Notifications: [✓]                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Billing Page (Stripe Customer Portal)

Users click "Manage Subscription" → Redirected to Stripe Customer Portal
- Update payment method
- View invoices
- Cancel subscription
- Update billing information

---

## 📊 Usage Tracking & Limits

### Free Tier (BYOK)
- **Limits**: None (user pays for their own API usage)
- **Tracking**: Log prompts and tokens for analytics only

### Pro Tier
- **Included**: 500 prompts/month
- **Overage**: $0.05 per prompt
- **Tracking**: 
  - Count prompts per month
  - Track token usage
  - Calculate costs
  - Send warning at 80% usage
  - Send alert at 100% usage

### Implementation

```typescript
// src/lib/usage/tracker.ts
import { getDb } from '@/lib/db/mongodb';

export async function trackUsage(
  userId: string,
  provider: string,
  tokens: number,
  cost: number
) {
  const db = await getDb();
  
  await db.collection('users').updateOne(
    { _id: userId },
    {
      $inc: {
        'usage.totalPrompts': 1,
        'usage.totalTokens': tokens,
        'usage.totalCost': cost,
        'usage.currentMonthPrompts': 1,
        'usage.currentMonthTokens': tokens,
        'usage.currentMonthCost': cost,
      },
      $set: {
        'usage.lastActive': new Date(),
      },
    }
  );
  
  // Check if user exceeded limits
  const user = await db.collection('users').findOne({ _id: userId });
  
  if (user?.subscription?.plan === 'pro') {
    const limit = 500;
    const usage = user.usage.currentMonthPrompts;
    
    if (usage === Math.floor(limit * 0.8)) {
      // Send 80% warning email
      await sendUsageWarning(user.email, usage, limit);
    }
    
    if (usage >= limit) {
      // Charge overage or block usage
      await handleOverage(userId, usage - limit);
    }
  }
}

async function handleOverage(userId: string, overageCount: number) {
  // Create invoice item for overage
  const overageCost = overageCount * 5; // $0.05 per prompt = 5 cents
  
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: userId });
  
  if (user?.subscription?.stripeCustomerId) {
    await stripe.invoiceItems.create({
      customer: user.subscription.stripeCustomerId,
      amount: overageCost,
      currency: 'usd',
      description: `Overage: ${overageCount} prompts`,
    });
  }
}
```

---

## 🚀 Implementation Timeline

### Week 1: Authentication
- [x] NextAuth.js v5 setup
- [x] Email/password authentication
- [x] Google OAuth
- [x] User profile page
- [x] Settings page

### Week 2: Billing Foundation
- [ ] Stripe account setup
- [ ] Create products and prices in Stripe
- [ ] Implement checkout flow
- [ ] Webhook handler
- [ ] Customer portal integration

### Week 3: Usage Tracking
- [ ] Usage tracking system
- [ ] Monthly usage reset
- [ ] Overage handling
- [ ] Usage alerts
- [ ] Analytics dashboard

### Week 4: Polish
- [ ] Billing UI/UX
- [ ] Email notifications
- [ ] Documentation
- [ ] Testing
- [ ] Launch

---

## 💰 Revenue Projections

### Conservative Estimates

| Month | Free Users | Pro Users | Team Users | MRR | ARR |
|-------|-----------|-----------|------------|-----|-----|
| 1 | 100 | 5 | 0 | $100 | $1,200 |
| 3 | 500 | 25 | 1 | $650 | $7,800 |
| 6 | 2,000 | 100 | 5 | $2,750 | $33,000 |
| 12 | 10,000 | 500 | 20 | $11,000 | $132,000 |

**Assumptions**:
- 5% free → pro conversion
- 10% pro → team conversion
- $20/month pro, $50/user/month team (avg 5 users)

---

## 🔒 Security Considerations

### API Key Storage
- Encrypt with AWS KMS or similar
- Never log or expose in responses
- Rotate encryption keys regularly

### Payment Security
- PCI compliance via Stripe (no card data touches our servers)
- Use Stripe Elements for card input
- Implement webhook signature verification

### User Data
- Hash passwords with bcrypt (cost factor 12)
- Implement rate limiting on auth endpoints
- Use HTTPS everywhere
- Enable CORS properly

---

## 📝 Next Steps

1. **Review this strategy** - Approve the approach
2. **Set up Stripe account** - Create products and prices
3. **Implement authentication** - Follow Week 1 plan
4. **Add billing** - Follow Week 2 plan
5. **Launch** - Start with Free + Pro tiers

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-27  
**Status**: Ready for Implementation
