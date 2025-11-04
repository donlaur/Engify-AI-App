# Gemini BI Research Generator

A reusable framework for generating AI-powered research reports using Gemini. Connects to MongoDB, analyzes data, and generates comprehensive research insights.

## Overview

This script provides a standardized way to generate business intelligence research reports using Gemini AI. It abstracts the common patterns of:
1. Collecting data from MongoDB
2. Building research prompts
3. Querying Gemini with retry logic
4. Formatting and saving results

## Usage

```bash
# Default: Prompt suggestions research
tsx scripts/bi/gemini-research-generator.ts

# Specify research type
tsx scripts/bi/gemini-research-generator.ts --type=prompt-suggestions

# With additional options (future)
tsx scripts/bi/gemini-research-generator.ts --type=content-gaps --category=patterns
```

## Available Research Types

### `prompt-suggestions` (Default)
Analyzes gaps in prompt library and suggests new prompts and patterns.

**Output includes:**
- Suggested new patterns (5-10)
- Suggested new prompts (10-20)
- Missing roles
- Missing categories
- Level distribution analysis
- Research insights

## Output

Research results are saved to:
```
docs/bi/research/{research-type}-{date}.json
```

Each result includes:
- **Metadata**: Timestamp, model used, cost, latency
- **Data**: Formatted research results (JSON)
- **Raw Response**: Original Gemini response (for debugging)

## Adding New Research Types

To add a new research type, extend `RESEARCH_TYPES` in the script:

```typescript
const RESEARCH_TYPES: Record<string, ResearchTypeConfig> = {
  'prompt-suggestions': { ... },
  'your-new-type': {
    name: 'Your Research Name',
    description: 'What it does',
    dataCollector: async () => {
      // Collect data from MongoDB
      return data;
    },
    promptBuilder: (data) => {
      // Build Gemini prompt
      return prompt;
    },
    outputFormatter: (response) => {
      // Parse and format response
      return formattedData;
    },
  },
};
```

## Scheduling

For regular BI research, schedule this script to run:

**Cron example (weekly):**
```bash
0 0 * * 0 cd /path/to/project && tsx scripts/bi/gemini-research-generator.ts --type=prompt-suggestions
```

**GitHub Actions example:**
```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  bi-research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: tsx scripts/bi/gemini-research-generator.ts --type=prompt-suggestions
      - uses: actions/upload-artifact@v3
        with:
          name: research-results
          path: docs/bi/research/
```

## Model Selection

The script automatically:
- Queries the AI model registry for Gemini models
- Filters for active, non-deprecated models
- Prefers free-tier models (flash/exp)
- Falls back to first available model
- Displays model info (name, context window, status)

## Error Handling

- **Rate Limits**: Automatic retry with exponential backoff (3 retries)
- **Invalid Models**: Clear error message if no valid models found
- **Parse Errors**: Saves raw response if JSON parsing fails
- **Network Errors**: Retries with backoff

## Cost Tracking

Each research run tracks:
- Input tokens
- Output tokens
- Total cost (USD)
- Latency (ms)

This is saved in the metadata for cost analysis.

## Version History

- **v1.0.0**: Initial release with prompt-suggestions research type

## Future Research Types

Planned research types:
- `content-gaps`: Analyze gaps in content (patterns, learning resources)
- `user-needs`: Analyze user needs by role/category
- `competitive-analysis`: Compare with industry standards
- `trend-analysis`: Identify emerging trends in prompt engineering

