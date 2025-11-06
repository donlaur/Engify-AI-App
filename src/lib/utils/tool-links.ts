/**
 * Tool Link Utilities
 * 
 * Helper functions to get the appropriate link for AI tools,
 * prioritizing affiliate links when available.
 */

import { AITool } from '@/lib/db/schemas/ai-tool';

/**
 * Get the best link for a tool (affiliate link first, then website URL)
 * @param tool - The AI tool object
 * @returns The URL to use for linking to the tool
 */
export function getToolLink(tool: AITool): string {
  // Prioritize affiliate link if available
  if (tool.affiliateLink) {
    return tool.affiliateLink;
  }
  
  // Fall back to website URL
  if (tool.websiteUrl) {
    return tool.websiteUrl;
  }
  
  // Default fallback
  return '#';
}

/**
 * Check if a tool has an affiliate link
 * @param tool - The AI tool object
 * @returns True if the tool has an affiliate link
 */
export function hasAffiliateLink(tool: AITool): boolean {
  return !!tool.affiliateLink && tool.affiliateLink !== tool.websiteUrl;
}

