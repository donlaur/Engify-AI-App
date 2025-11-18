# Reference Materials

This directory contains saved articles, emails, and other reference materials that contain important market data, industry trends, pricing benchmarks, and competitive intelligence.

## Purpose

These materials are saved to:
- Track market trends and opportunities
- Document pricing benchmarks from competitors and vendors
- Preserve important statistics and market research
- Provide context for product and business decisions
- Support content creation with factual data

## Structure

### Files
Each reference material is saved as a markdown file with frontmatter metadata:

```yaml
---
title: "Article Title"
source: "Source Name (e.g., Vendor Email, Blog Post, Report)"
receivedAt: YYYY-MM-DD
category: "Category Name"
tags: ["tag1", "tag2", "tag3"]
type: "reference-material"
relevance: "Why this is important"
keyStats:
  - metric: "Metric Name"
    value: "Value"
keyMetrics:
  - metric: "Metric Name"
    description: "Description"
links:
  - url: "https://..."
    description: "Link description"
---
```

## Current Materials

### 2025-11-18: DigitalOcean OpenSearch
- **File**: `2025-11-18-digitalocean-opensearch-log-management.md`
- **Category**: Infrastructure & Observability
- **Key Stats**:
  - Log management market: $3.27B (2024) → $10.08B (2034)
  - CAGR: 11.92%
  - OpenSearch pricing: Starting at $19/month
- **Relevance**: Market sizing, pricing benchmarks, AI observability trends

### 2025-11-18: LinearB AI Metrics
- **File**: `2025-11-18-linearb-ai-metrics-copilot-cursor.md`
- **Category**: AI Productivity & Metrics
- **Key Metrics**: Adoption rate, acceptance rate, cycle time, PR size, refactor rates
- **Relevance**: AI tool measurement frameworks, productivity metrics, ROI calculation

## Related Data Files

The structured data from these reference materials is also available in code:

### `/src/data/market-stats/industry-market-data.ts`

Programmatically accessible market data including:
- `logManagementMarketStats` - Market size and growth data
- `openSearchPricing` - Pricing benchmarks
- `aiDeveloperToolMetrics` - AI tool metrics framework
- Helper functions for data access and analysis

Example usage:
```typescript
import {
  marketDataSummary,
  calculateMarketGrowth,
  getMarketStatsByCategory
} from '@/data/market-stats/industry-market-data';

// Get market summary
console.log(marketDataSummary.logManagement);
// Output: { marketSize2024: '$3.27B', marketSize2034: '$10.08B', cagr: '11.92%' }

// Calculate growth
const growth = calculateMarketGrowth();
// Output: { startValue: 3.27, endValue: 10.08, growth: 6.81, cagr: 11.92 }
```

## How to Use

### Adding New Reference Materials

1. Save the article/email as a markdown file with the naming convention:
   ```
   YYYY-MM-DD-descriptive-title.md
   ```

2. Include comprehensive frontmatter with:
   - Title, source, date received
   - Category and tags
   - Key statistics or metrics
   - Relevance explanation
   - Source URLs

3. Format the content with:
   - Clear sections and headers
   - Extracted key data points
   - Analysis of why it matters
   - Potential applications for Engify

4. If the data is valuable for programmatic access, add it to:
   ```
   /src/data/market-stats/industry-market-data.ts
   ```

### Referencing Materials

When creating content or making product decisions:

1. Search this directory for relevant topics
2. Extract verified statistics with proper attribution
3. Link to original sources when possible
4. Use the structured data files for consistent data access

## Categories

Current categories:
- Infrastructure & Observability
- AI Productivity & Metrics
- Developer Tools
- Market Research
- Competitive Intelligence

## Maintenance

- Review materials quarterly for relevance
- Archive outdated information
- Update structured data files when new information is added
- Cross-reference with actual market data when available

## Notes

- **Attribution**: Always preserve source information and URLs
- **Date Recording**: Include when material was received/recorded
- **Verification**: Cross-reference statistics when possible
- **Updates**: Market data may change; track the date of information

---

**Last Updated**: 2025-11-18
**Maintained By**: Engify Team
