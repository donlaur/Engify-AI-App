/**
 * Affiliate and Referral Links
 * Monetization through AI tool referrals
 */

// Analytics type declarations
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      eventParams?: Record<string, unknown>
    ) => void;
    posthog?: {
      capture: (eventName: string, properties?: Record<string, unknown>) => void;
    };
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, unknown> }
    ) => void;
  }
}

export interface AffiliateLink {
  tool: string;
  baseUrl: string;
  referralUrl?: string;
  affiliateCode?: string;
  commission?: string;
  status: 'active' | 'pending' | 'requested';
  notes?: string;
}

export const affiliateLinks: Record<string, AffiliateLink> = {
  cursor: {
    tool: 'Cursor',
    baseUrl: 'https://cursor.sh',
    referralUrl: undefined, // Cursor confirmed no referral program
    status: 'pending',
    commission: 'N/A',
    notes: 'Cursor confirmed - no referral/affiliate program available',
  },

  windsurf: {
    tool: 'Windsurf (Codeium)',
    baseUrl: 'https://windsurf.com',
    referralUrl: 'https://windsurf.com/refer?referral_code=9e4uju62dcni2vev',
    affiliateCode: '9e4uju62dcni2vev',
    status: 'active',
    commission: '250 bonus credits per referral',
    notes: 'Windsurf referral program - 250 bonus credits when referred friends subscribe to Pro. Note: Windsurf website is now at windsurf.com (not codeium.com/windsurf)',
  },

  copilot: {
    tool: 'GitHub Copilot',
    baseUrl: 'https://github.com/features/copilot',
    referralUrl: undefined, // GitHub doesn't have public affiliate program
    status: 'pending',
    commission: 'N/A',
    notes: 'GitHub/Microsoft - likely no affiliate program',
  },

  tabnine: {
    tool: 'Tabnine',
    baseUrl: 'https://www.tabnine.com',
    referralUrl: undefined, // No public affiliate/referral program
    status: 'pending',
    commission: 'N/A',
    notes: 'No public affiliate program - has B2B partner program at tabnine.com/partners/ for enterprise partnerships only',
  },

  replit: {
    tool: 'Replit AI',
    baseUrl: 'https://replit.com',
    referralUrl: 'https://replit.com/refer/donlaur',
    affiliateCode: 'donlaur',
    status: 'active',
    commission: 'TBD',
    notes: 'Active affiliate link via donlaur',
  },

  warp: {
    tool: 'Warp Terminal',
    baseUrl: 'https://www.warp.dev',
    referralUrl: 'https://app.warp.dev/referral/QPG4E6',
    affiliateCode: 'QPG4E6',
    status: 'active',
    commission: 'TBD',
    notes: 'Active Warp referral link via QPG4E6',
  },

  lovable: {
    tool: 'Lovable (GPT Engineer)',
    baseUrl: 'https://lovable.dev',
    referralUrl: 'https://lovable.dev/?via=donnie',
    affiliateCode: 'donnie',
    status: 'active',
    commission: 'TBD',
    notes: 'Active affiliate link via donnie',
  },

  bolt: {
    tool: 'Bolt.new',
    baseUrl: 'https://bolt.new',
    referralUrl: undefined, // No affiliate program - has user referral program only
    status: 'pending',
    commission: 'N/A',
    notes: 'No affiliate/sponsorship program available - only has user referral program (200k tokens per referral, 5M if upgrade to Pro within 30 days)',
  },

  v0: {
    tool: 'v0.dev by Vercel',
    baseUrl: 'https://v0.dev',
    referralUrl: undefined, // Vercel doesn't have public affiliate program
    status: 'pending',
    commission: 'N/A',
    notes: 'Vercel product - no affiliate program',
  },

  claudeCode: {
    tool: 'Claude Code',
    baseUrl: 'https://claude.ai/code',
    referralUrl: undefined, // No public affiliate - has enterprise referral partner program
    status: 'pending',
    commission: 'N/A',
    notes: 'Anthropic has enterprise referral partner program (anthropic.com/referral/) and VC Partner Program - no public affiliate program for individuals',
  },

  geminiStudio: {
    tool: 'Gemini AI Studio (Simple Vibe Coder)',
    baseUrl: 'https://aistudio.google.com',
    referralUrl: 'https://cloud.google.com/affiliate-program',
    status: 'active',
    commission: 'Cash reward per eligible referral (no annual cap)',
    notes: 'Google Cloud affiliate program via CJ Affiliate - earn rewards for referrals, referred users get $350 free trial credits ($300 + $50 bonus)',
  },

  perplexity: {
    tool: 'Perplexity AI',
    baseUrl: 'https://www.perplexity.ai',
    referralUrl: 'https://partners.dub.co/perplexity',
    status: 'active',
    commission: 'Up to $15 per lead',
    notes: 'Active affiliate program via Dub - earn per signup from eligible countries. Also has Pro referral program (both get 1 month free, capped at 12 redemptions)',
  },

  // AI Providers
  openai: {
    tool: 'OpenAI',
    baseUrl: 'https://platform.openai.com',
    referralUrl: undefined, // OpenAI doesn't have public affiliate
    status: 'pending',
    commission: 'N/A',
    notes: 'No public affiliate program',
  },

  anthropic: {
    tool: 'Anthropic Claude',
    baseUrl: 'https://console.anthropic.com',
    referralUrl: 'https://anthropic.com/referral/',
    status: 'pending',
    commission: 'Enterprise referral program',
    notes: 'Enterprise referral partner program available (contact required). Also has VC Partner Program and Development Partner Program - no self-serve affiliate program',
  },

  groq: {
    tool: 'Groq',
    baseUrl: 'https://console.groq.com',
    referralUrl: undefined, // No public affiliate - invite-only partner program
    status: 'pending',
    commission: 'N/A',
    notes: 'Invite-only Groq Partner Program for select scaling companies (groq.com/groq-partner-program) - contact support@groq.com. No traditional affiliate program available',
  },
};

/**
 * Get the appropriate link for a tool (referral if available, otherwise base)
 */
export function getToolLink(toolKey: string): string {
  const link = affiliateLinks[toolKey];
  if (!link) return '#';

  return link.referralUrl || link.baseUrl;
}

/**
 * Track affiliate click for analytics
 * Now with server-side tracking for persistent storage
 */
export function trackAffiliateClick(toolKey: string, source?: string) {
  const link = affiliateLinks[toolKey];
  if (!link) return;

  if (typeof window !== 'undefined') {
    const eventData = {
      toolKey,
      toolName: link.tool,
      url: getToolLink(toolKey),
      hasReferral: !!link.referralUrl,
      status: link.status,
      commission: link.commission,
      source,
    };

    // Track with server-side API for persistent storage
    fetch('/api/affiliate/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
      // Don't wait for response - fire and forget
    }).catch((error) => {
      // Silent fail - don't break user experience
      console.error('Server-side affiliate tracking failed:', error);
    });

    // Track with Google Analytics (gtag)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        event_category: 'Affiliate',
        event_label: toolKey,
        ...eventData,
      });
    }

    // Track with PostHog (if available)
    if (typeof window.posthog !== 'undefined') {
      window.posthog.capture('affiliate_click', eventData);
    }

    // Track with Plausible Analytics (if available)
    if (typeof window.plausible === 'function') {
      window.plausible('Affiliate Click', { props: eventData });
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Affiliate click tracked:', eventData);
    }
  }
}

/**
 * Partnership outreach template
 */
export const partnershipTemplate = {
  subject: 'Partnership Opportunity - Engify.ai AI Tools Comparison',

  body: `Hi [Company] Team,

I'm reaching out from Engify.ai, a comprehensive prompt engineering platform that helps developers master AI-assisted coding.

We've created an in-depth comparison guide for AI coding tools, and [Tool Name] is featured prominently with a [Rating]⭐ rating.

Our platform receives [X] monthly visitors who are actively evaluating AI coding tools. We'd love to explore:

1. **Affiliate/Referral Partnership**: Earn commission on conversions
2. **Sponsored Content**: Featured placement in our comparison
3. **Co-Marketing**: Joint webinars, content, or case studies

Our AI Tools Guide: https://engify.ai/ai-coding

Would you be open to a brief call to discuss partnership opportunities?

Best regards,
Don Laurie
Founder, Engify.ai
hello@engify.ai → donlaur@engify.ai`,
};

/**
 * Companies to reach out to (in priority order)
 */
export const partnershipOutreach = [
  {
    company: 'Cursor',
    priority: 'high',
    contact: 'partnerships@cursor.sh', // Find actual contact
    rating: 4.5,
    traffic: 'High intent - developers actively comparing',
  },
  {
    company: 'Windsurf (formerly Codeium)',
    priority: 'high',
    contact: 'partnerships@windsurf.com',
    rating: 4.8,
    traffic: 'Highest rated - strong conversion potential',
  },
  {
    company: 'Tabnine',
    priority: 'medium',
    contact: 'partnerships@tabnine.com',
    rating: 3.8,
    traffic: 'Enterprise focus - higher value conversions',
  },
  {
    company: 'Replit',
    priority: 'medium',
    contact: 'partnerships@replit.com',
    rating: 3.7,
    traffic: 'Education/prototyping segment',
  },
  {
    company: 'Groq',
    priority: 'high',
    contact: 'partnerships@groq.com',
    rating: 'N/A',
    traffic: 'Featured in workbench - high visibility',
  },
  {
    company: 'Anthropic',
    priority: 'high',
    contact: 'partnerships@anthropic.com',
    rating: 'N/A',
    traffic: 'Featured in workbench - enterprise audience',
  },
];
