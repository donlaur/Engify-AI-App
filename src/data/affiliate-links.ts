/**
 * Affiliate and Referral Links
 * Monetization through AI tool referrals
 */

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
    referralUrl: undefined, // TODO: Get Cursor referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Reach out to Cursor team for partnership',
  },

  windsurf: {
    tool: 'Windsurf (Codeium)',
    baseUrl: 'https://codeium.com/windsurf',
    referralUrl: undefined, // TODO: Get Windsurf/Codeium referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Contact Codeium for affiliate program',
  },

  copilot: {
    tool: 'GitHub Copilot',
    baseUrl: 'https://github.com/features/copilot',
    referralUrl: undefined, // GitHub doesn't have public affiliate program
    status: 'pending',
    commission: 'N/A',
    notes: 'GitHub/Microsoft - likely no affiliate program',
  },

  codeium: {
    tool: 'Codeium',
    baseUrl: 'https://codeium.com',
    referralUrl: undefined, // TODO: Get Codeium referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Contact for referral program',
  },

  tabnine: {
    tool: 'Tabnine',
    baseUrl: 'https://www.tabnine.com',
    referralUrl: undefined, // TODO: Get Tabnine referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Reach out for partnership',
  },

  replit: {
    tool: 'Replit AI',
    baseUrl: 'https://replit.com',
    referralUrl: undefined, // TODO: Get Replit referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Contact Replit for affiliate program',
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
    referralUrl: undefined, // TODO: Check for partner program
    status: 'requested',
    commission: 'TBD',
    notes: 'Reach out to Anthropic partnerships',
  },

  groq: {
    tool: 'Groq',
    baseUrl: 'https://console.groq.com',
    referralUrl: undefined, // TODO: Get Groq referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Contact Groq for partnership',
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
 */
export function trackAffiliateClick(toolKey: string) {
  // TODO: Implement analytics tracking
  if (typeof window !== 'undefined') {
    // Track with your analytics service
    console.log(`Affiliate click: ${toolKey}`);

    // Example: Google Analytics
    // gtag('event', 'affiliate_click', {
    //   tool: toolKey,
    //   url: getToolLink(toolKey)
    // });
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
    company: 'Codeium (Windsurf)',
    priority: 'high',
    contact: 'partnerships@codeium.com',
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
