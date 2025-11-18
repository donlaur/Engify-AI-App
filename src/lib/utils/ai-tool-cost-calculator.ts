/**
 * AI Tool Cost Calculator
 * 
 * Calculates costs for AI tools based on usage tiers and token consumption
 * Supports tools with subscription + token-based pricing models
 */

export type UsageTier = 'light' | 'mid' | 'power';

export interface UsageTierDefinition {
  name: string;
  description: string;
  monthlyRequests: number;
  avgTokensPerRequest: {
    input: number;
    output: number;
  };
  monthlyTokens: {
    input: number;
    output: number;
  };
}

export const USAGE_TIERS: Record<UsageTier, UsageTierDefinition> = {
  light: {
    name: 'Light User',
    description: 'Occasional use, small projects',
    monthlyRequests: 500,
    avgTokensPerRequest: {
      input: 2000, // ~1,500 words input
      output: 1000, // ~750 words output
    },
    monthlyTokens: {
      input: 1_000_000, // 500 requests * 2,000 tokens
      output: 500_000, // 500 requests * 1,000 tokens
    },
  },
  mid: {
    name: 'Mid-Level User',
    description: 'Regular use, medium projects',
    monthlyRequests: 2000,
    avgTokensPerRequest: {
      input: 4000, // ~3,000 words input
      output: 2000, // ~1,500 words output
    },
    monthlyTokens: {
      input: 8_000_000, // 2,000 requests * 4,000 tokens
      output: 4_000_000, // 2,000 requests * 2,000 tokens
    },
  },
  power: {
    name: 'Power User',
    description: 'Heavy use, large codebases, frequent refactoring',
    monthlyRequests: 5000,
    avgTokensPerRequest: {
      input: 8000, // ~6,000 words input (large context)
      output: 4000, // ~3,000 words output
    },
    monthlyTokens: {
      input: 40_000_000, // 5,000 requests * 8,000 tokens
      output: 20_000_000, // 5,000 requests * 4,000 tokens
    },
  },
};

export interface ToolPricing {
  free: boolean;
  paid?: {
    monthly?: number;
    annual?: number;
    tier?: string;
    creditsPerMonth?: number;
    creditsUnit?: string;
    unlimited?: boolean;
  };
  alternativePricing?: {
    model?: 'acu' | 'lines-of-code' | 'requests' | 'compute-units' | 'other';
    unitName?: string;
    costPerUnit?: number;
    baseMinimum?: number;
    includedUnits?: number;
  };
}

export interface TokenPricing {
  inputCostPer1M?: number; // Cost per 1M input tokens
  outputCostPer1M?: number; // Cost per 1M output tokens
  model?: string; // Which model this pricing applies to
}

export interface CostCalculationResult {
  tier: UsageTier;
  tierDefinition: UsageTierDefinition;
  baseCost: number; // Monthly subscription
  tokenCost: number; // Cost for tokens used
  totalCost: number; // Base + token cost
  costPerRequest: number; // Average cost per request
  tokensUsed: {
    input: number;
    output: number;
  };
  creditsUsed?: number; // If tool uses credits
  creditsRemaining?: number; // If tool includes credits
  overageCost?: number; // Cost for usage beyond included credits
}

/**
 * Calculate cost for a tool based on usage tier
 */
export function calculateToolCost(
  toolPricing: ToolPricing,
  tokenPricing?: TokenPricing,
  tier: UsageTier = 'mid'
): CostCalculationResult | null {
  const tierDef = USAGE_TIERS[tier];
  const baseCost = toolPricing.paid?.monthly || 0;

  // If tool is free, return free tier calculation
  if (toolPricing.free && !toolPricing.paid) {
    return {
      tier,
      tierDefinition: tierDef,
      baseCost: 0,
      tokenCost: 0,
      totalCost: 0,
      costPerRequest: 0,
      tokensUsed: tierDef.monthlyTokens,
    };
  }

  // Calculate token costs if token pricing is provided
  let tokenCost = 0;
  let alternativeCost = 0;
  
  // Handle alternative pricing models (ACU, lines-of-code, etc.)
  if (toolPricing.alternativePricing) {
    const altPricing = toolPricing.alternativePricing;
    
    if (altPricing.model === 'acu') {
      // ACU pricing (e.g., Devin)
      // Estimate ACU consumption based on usage tier
      // This is approximate - actual ACU consumption varies by task complexity
      const estimatedACUs = {
        light: 10,   // ~10 ACUs for light usage
        mid: 50,    // ~50 ACUs for mid usage
        power: 150, // ~150 ACUs for power usage
      };
      
      const acusUsed = estimatedACUs[tier] || 50;
      const costPerACU = altPricing.costPerUnit || 2.25;
      alternativeCost = acusUsed * costPerACU;
      
      // Apply base minimum if applicable
      if (altPricing.baseMinimum && alternativeCost < altPricing.baseMinimum) {
        alternativeCost = altPricing.baseMinimum;
      }
      
      // Subtract included units if applicable
      if (altPricing.includedUnits && acusUsed <= altPricing.includedUnits) {
        alternativeCost = 0; // Covered by included units
      } else if (altPricing.includedUnits) {
        const overageACUs = acusUsed - altPricing.includedUnits;
        alternativeCost = overageACUs * costPerACU;
      }
    } else if (altPricing.model === 'requests') {
      // Request-based pricing
      const requests = tierDef.monthlyRequests;
      const costPerRequest = altPricing.costPerUnit || 0;
      alternativeCost = requests * costPerRequest;
    }
    // Add other alternative pricing models as needed
  } else if (tokenPricing) {
    // Traditional token-based pricing
    const inputCost =
      (tierDef.monthlyTokens.input / 1_000_000) *
      (tokenPricing.inputCostPer1M || 0);
    const outputCost =
      (tierDef.monthlyTokens.output / 1_000_000) *
      (tokenPricing.outputCostPer1M || 0);
    tokenCost = inputCost + outputCost;
  }

  // Handle tools with included credits
  let creditsUsed = 0;
  let creditsRemaining = 0;
  let overageCost = 0;

  if (toolPricing.paid?.creditsPerMonth) {
    // Estimate credits based on tokens (rough conversion)
    // This is tool-specific and may need adjustment
    const creditsPer1MTokens = 100; // Rough estimate: 100 credits per 1M tokens
    creditsUsed =
      ((tierDef.monthlyTokens.input + tierDef.monthlyTokens.output) /
        1_000_000) *
      creditsPer1MTokens;

    if (creditsUsed <= (toolPricing.paid.creditsPerMonth || 0)) {
      creditsRemaining = (toolPricing.paid.creditsPerMonth || 0) - creditsUsed;
    } else {
      const overageCredits = creditsUsed - (toolPricing.paid.creditsPerMonth || 0);
      // Estimate overage cost (varies by tool)
      const overageCostPerCredit = 0.01; // $0.01 per credit overage
      overageCost = overageCredits * overageCostPerCredit;
    }
  }

  // If unlimited, token cost is 0 (covered by subscription)
  if (toolPricing.paid?.unlimited) {
    tokenCost = 0;
  }

  const totalCost = baseCost + tokenCost + alternativeCost + overageCost;
  const costPerRequest = totalCost / tierDef.monthlyRequests;

  return {
    tier,
    tierDefinition: tierDef,
    baseCost,
    tokenCost: tokenCost + alternativeCost, // Combine for display
    totalCost,
    costPerRequest,
    tokensUsed: tierDef.monthlyTokens,
    creditsUsed: creditsUsed > 0 ? creditsUsed : undefined,
    creditsRemaining: creditsRemaining > 0 ? creditsRemaining : undefined,
    overageCost: overageCost > 0 ? overageCost : undefined,
  };
}

/**
 * Calculate costs for all tiers
 */
export function calculateAllTiers(
  toolPricing: ToolPricing,
  tokenPricing?: TokenPricing
): CostCalculationResult[] {
  return (['light', 'mid', 'power'] as UsageTier[]).map((tier) =>
    calculateToolCost(toolPricing, tokenPricing, tier)!
  );
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost === 0) return 'Free';
  if (cost < 0.01) return '< $0.01';
  return `$${cost.toFixed(2)}`;
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

