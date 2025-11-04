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

  warp: {
    tool: 'Warp Terminal',
    baseUrl: 'https://www.warp.dev',
    referralUrl: undefined, // TODO: Get Warp referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Contact Warp for affiliate program',
  },

  lovable: {
    tool: 'Lovable (GPT Engineer)',
    baseUrl: 'https://lovable.dev',
    referralUrl: undefined, // TODO: Get Lovable referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Contact Lovable for affiliate program',
  },

  bolt: {
    tool: 'Bolt.new',
    baseUrl: 'https://bolt.new',
    referralUrl: undefined, // TODO: Get Bolt referral link
    status: 'requested',
    commission: 'TBD',
    notes: 'Contact Bolt for affiliate program',
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
    referralUrl: undefined, // TODO: Check for Anthropic affiliate program
    status: 'requested',
    commission: 'TBD',
    notes: 'Anthropic Claude Code - check for partnership opportunities',
  },

  geminiStudio: {
    tool: 'Gemini AI Studio (Simple Vibe Coder)',
    baseUrl: 'https://aistudio.google.com',
    referralUrl: undefined, // TODO: Check for Google affiliate program
    status: 'requested',
    commission: 'TBD',
    notes: 'Google Gemini AI Studio with Simple Vibe Coder - check for partnership opportunities',
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
  if (typeof window !== 'undefined') {
    // TODO: Implement analytics tracking
    // Example: Google Analytics
    // gtag('event', 'affiliate_click', {
    //   tool: toolKey,
    //   url: getToolLink(toolKey)
    // });
    
    // Example: Send to API endpoint for server-side logging
    // fetch('/api/analytics/track', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ event: 'affiliate_click', tool: toolKey })
    // }).catch(() => {}); // Silent fail - don't block UI
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
    // Rating removed per ADR-009 (no fake metrics)
    traffic: 'High intent - developers actively comparing',
  },
  {
    company: 'Codeium (Windsurf)',
    priority: 'high',
    contact: 'partnerships@codeium.com',
    // Rating removed per ADR-009
    traffic: 'Highest rated - strong conversion potential',
  },
  {
    company: 'Tabnine',
    priority: 'medium',
    contact: 'partnerships@tabnine.com',
    // Rating removed per ADR-009
    traffic: 'Enterprise focus - higher value conversions',
  },
  {
    company: 'Replit',
    priority: 'medium',
    contact: 'partnerships@replit.com',
    // Rating removed per ADR-009
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
