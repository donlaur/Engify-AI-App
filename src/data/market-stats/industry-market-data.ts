/**
 * Industry Market Statistics and Benchmarks
 *
 * This file contains important market data, pricing benchmarks, and industry statistics
 * collected from various sources including vendor emails, market research reports, and
 * industry publications.
 *
 * Sources are documented for each data point.
 * Last Updated: 2025-11-18
 */

export interface MarketStatistic {
  category: string;
  metric: string;
  value: string | number;
  unit?: string;
  year?: number;
  source: string;
  sourceUrl?: string;
  dateRecorded: string;
  notes?: string;
}

export interface PricingBenchmark {
  category: string;
  product: string;
  vendor: string;
  tier: string;
  price: number;
  unit: string;
  specs?: Record<string, string | number>;
  additionalCosts?: Array<{
    description: string;
    price: number;
    unit: string;
  }>;
  source: string;
  dateRecorded: string;
  notes?: string;
}

/**
 * Log Management Market Statistics
 */
export const logManagementMarketStats: MarketStatistic[] = [
  {
    category: 'Log Management',
    metric: 'Global Market Size',
    value: 3.27,
    unit: 'billion USD',
    year: 2024,
    source: 'Precedence Research',
    sourceUrl: 'https://www.precedenceresearch.com/log-management-market',
    dateRecorded: '2025-11-18',
    notes: 'Via DigitalOcean OpenSearch marketing email'
  },
  {
    category: 'Log Management',
    metric: 'Projected Market Size',
    value: 10.08,
    unit: 'billion USD',
    year: 2034,
    source: 'Precedence Research',
    sourceUrl: 'https://www.precedenceresearch.com/log-management-market',
    dateRecorded: '2025-11-18',
    notes: 'Via DigitalOcean OpenSearch marketing email'
  },
  {
    category: 'Log Management',
    metric: 'CAGR (2024-2034)',
    value: 11.92,
    unit: 'percent',
    year: 2024,
    source: 'Precedence Research',
    sourceUrl: 'https://www.precedenceresearch.com/log-management-market',
    dateRecorded: '2025-11-18',
    notes: 'Compound Annual Growth Rate - indicates strong market growth'
  }
];

/**
 * OpenSearch Pricing Benchmarks (DigitalOcean)
 */
export const openSearchPricing: PricingBenchmark[] = [
  {
    category: 'Log Management & Search',
    product: 'Managed OpenSearch',
    vendor: 'DigitalOcean',
    tier: 'Single-Node (Entry)',
    price: 19,
    unit: 'USD/month',
    specs: {
      nodes: 1,
      ram: '2 GiB',
      storage: '40 GiB',
      useCase: 'Development or low-traffic applications'
    },
    additionalCosts: [
      {
        description: 'Additional Storage',
        price: 0.21,
        unit: 'USD/GiB/month'
      }
    ],
    source: 'DigitalOcean Marketing Email',
    dateRecorded: '2025-11-18',
    notes: 'Storage available in 10 GB increments. No per-query fees, no data egress costs between DigitalOcean resources.'
  },
  {
    category: 'Log Management & Search',
    product: 'Managed OpenSearch',
    vendor: 'DigitalOcean',
    tier: '3-Node (Production)',
    price: 0, // Pricing not specified in source
    unit: 'USD/month',
    specs: {
      nodes: 3,
      useCase: 'Production workloads with high availability'
    },
    source: 'DigitalOcean Marketing Email',
    dateRecorded: '2025-11-18',
    notes: 'Recommended for production. Exact pricing not specified in source material.'
  }
];

/**
 * AI Developer Tool Metrics (from LinearB)
 */
export const aiDeveloperToolMetrics = {
  category: 'AI Developer Tools',
  subcategory: 'GitHub Copilot & Cursor',

  /**
   * Key metrics that engineering teams should track for AI coding assistants
   */
  trackableMetrics: [
    {
      name: 'Adoption Rate',
      description: 'Percentage of developers using AI tools across organization',
      importance: 'high',
      category: 'adoption'
    },
    {
      name: 'Daily Active Users',
      description: 'Number of developers actively using AI tools daily',
      importance: 'high',
      category: 'adoption'
    },
    {
      name: 'Daily Engaged Users',
      description: 'Number of developers meaningfully engaging with AI tools',
      importance: 'high',
      category: 'adoption'
    },
    {
      name: 'Code Suggestions Generated',
      description: 'Volume of AI-generated code suggestions',
      importance: 'medium',
      category: 'usage'
    },
    {
      name: 'Acceptance Rate',
      description: 'Percentage of AI-generated code that developers accept',
      importance: 'high',
      category: 'quality'
    },
    {
      name: 'Cycle Time',
      description: 'Time from commit to production, correlated with AI usage',
      importance: 'high',
      category: 'productivity'
    },
    {
      name: 'PR Size',
      description: 'Pull request size trends, benchmarked against AI usage',
      importance: 'medium',
      category: 'productivity'
    },
    {
      name: 'Refactor Rates',
      description: 'Frequency of code refactoring, correlated with AI usage',
      importance: 'medium',
      category: 'code-quality'
    }
  ],

  source: 'LinearB',
  sourceUrl: 'https://linearb.io/blog/measuring-the-impact-of-copilot-and-cursor-on-engineering-productivity',
  dateRecorded: '2025-11-18',
  notes: 'LinearB provides unified dashboard for these metrics across GitHub Copilot and Cursor'
};

/**
 * Key Market Drivers (Log Management)
 */
export const logManagementDrivers = [
  {
    driver: 'Expanding complexity of IT environments',
    impact: 'high',
    category: 'technical'
  },
  {
    driver: 'Increasing security threats',
    impact: 'high',
    category: 'security'
  },
  {
    driver: 'Stringent compliance requirements',
    impact: 'high',
    category: 'regulatory'
  }
];

/**
 * OpenSearch Use Cases (from DigitalOcean)
 */
export const openSearchUseCases = [
  {
    useCase: 'Centralized Log Management',
    description: 'Forward logs from multiple sources to single searchable location',
    benefits: [
      'No more scattered logs across systems',
      'No SSH sessions to check individual servers',
      'Single place for search, filter, and analyze'
    ]
  },
  {
    useCase: 'Real-time Search and Analytics',
    description: 'Query logs instantly with sub-second response times',
    benefits: [
      'Handle millions of log entries',
      'Powerful query language',
      'Fast troubleshooting'
    ]
  },
  {
    useCase: 'Enhanced AI Observability',
    description: 'Monitor AI agents, track model performance, analyze API usage',
    benefits: [
      'Track AI application performance',
      'Identify most common knowledge base queries',
      'Identify slow agent responses',
      'Understand user interaction patterns'
    ],
    relevanceToEngify: 'HIGH - Directly applicable to AI agent monitoring'
  },
  {
    useCase: 'Customizable Dashboards and Visualizations',
    description: 'Build custom dashboards and set up alerts',
    benefits: [
      'Monitor business-critical metrics',
      'Automated alerting',
      'Trend tracking',
      'Team collaboration'
    ]
  }
];

/**
 * Helper function to get market stats by category
 */
export function getMarketStatsByCategory(category: string): MarketStatistic[] {
  return logManagementMarketStats.filter(stat => stat.category === category);
}

/**
 * Helper function to get pricing benchmarks by vendor
 */
export function getPricingByVendor(vendor: string): PricingBenchmark[] {
  return openSearchPricing.filter(price => price.vendor === vendor);
}

/**
 * Helper function to calculate market growth
 */
export function calculateMarketGrowth(): {
  startValue: number;
  endValue: number;
  growth: number;
  cagr: number;
  period: string;
} {
  const start = logManagementMarketStats.find(
    stat => stat.metric === 'Global Market Size' && stat.year === 2024
  );
  const end = logManagementMarketStats.find(
    stat => stat.metric === 'Projected Market Size' && stat.year === 2034
  );
  const cagrStat = logManagementMarketStats.find(
    stat => stat.metric === 'CAGR (2024-2034)'
  );

  if (!start || !end || !cagrStat) {
    throw new Error('Market growth data incomplete');
  }

  return {
    startValue: Number(start.value),
    endValue: Number(end.value),
    growth: Number(end.value) - Number(start.value),
    cagr: Number(cagrStat.value),
    period: '2024-2034'
  };
}

/**
 * Export summary for quick reference
 */
export const marketDataSummary = {
  logManagement: {
    marketSize2024: '$3.27B',
    marketSize2034: '$10.08B',
    cagr: '11.92%',
    growth: '$6.81B increase over 10 years'
  },
  openSearchPricing: {
    entryPoint: '$19/month',
    storageIncrement: '$0.21/GiB/month',
    minimumConfig: '2 GiB RAM, 40 GiB storage'
  },
  aiToolMetrics: {
    platform: 'LinearB',
    supportedTools: ['GitHub Copilot', 'Cursor'],
    keyMetrics: 8,
    categories: ['adoption', 'usage', 'quality', 'productivity', 'code-quality']
  }
};

/**
 * Data validation
 */
export function validateMarketData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate log management stats
  if (logManagementMarketStats.length === 0) {
    errors.push('No log management market stats found');
  }

  // Validate pricing benchmarks
  if (openSearchPricing.length === 0) {
    errors.push('No OpenSearch pricing benchmarks found');
  }

  // Validate AI metrics
  if (!aiDeveloperToolMetrics.trackableMetrics || aiDeveloperToolMetrics.trackableMetrics.length === 0) {
    errors.push('No AI developer tool metrics found');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
