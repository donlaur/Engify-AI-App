# Prompt as MCP Tools - Feature Design

**Date:** 2025-11-06  
**Status:** 🎯 Design Phase

---

## Overview

Expose Engify.ai prompts as MCP (Model Context Protocol) tools/servers. This allows AI assistants (Claude Desktop, Cursor, etc.) to discover and use prompts from our library directly, creating a standardized, AI-native integration experience.

Instead of REST API endpoints, prompts become MCP tools that AI assistants can dynamically discover and invoke.

---

## Use Cases

1. **Developer Integration**: Integrate prompts into applications without manual copy-paste
2. **Automation**: Use prompts in scripts, workflows, CI/CD pipelines
3. **API-First Development**: Build apps that consume prompts as services
4. **Prompt Sharing**: Share prompt endpoints with team members
5. **Testing**: A/B test different prompt versions via API

---

## Architecture

### MCP Approach

MCP (Model Context Protocol) is a standardized protocol for connecting AI models to external tools and data sources. By exposing prompts as MCP tools, we enable:

1. **Native AI Integration**: AI assistants discover prompts automatically
2. **Standardized Interface**: No custom API documentation needed
3. **Tool Discovery**: Assistants can browse available prompts dynamically
4. **Dynamic Invocation**: Prompts are invoked as tools with parameters

### Components Needed

1. **MCP Server for Prompts**
   - Expose prompts as MCP tools
   - Implement MCP protocol (stdin/stdout or HTTP)
   - Tool discovery and listing
   - Tool invocation with parameter handling

2. **Prompt Tool Registry**
   - Map prompts to MCP tool definitions
   - Generate tool schemas from prompt parameters
   - Store tool metadata and descriptions

3. **Tool Execution Engine**
   - Execute prompts using AI providers
   - Handle parameter substitution
   - Return results in MCP format

4. **Authentication & Rate Limiting**
   - MCP server authentication (API keys)
   - Per-user rate limiting
   - Usage tracking and analytics

---

## Database Schema

### New Collection: `prompt_deployments`

```typescript
interface PromptDeployment {
  id: string;
  userId: string; // Owner
  promptId: string; // Reference to prompts collection
  customPrompt?: string; // If custom prompt, store here

  // API Configuration
  apiKey: string; // Secret API key (hashed)
  endpointSlug: string; // Unique URL slug (e.g., "code-review-assistant")

  // Parameter Configuration
  parameters: {
    name: string;
    description: string;
    required: boolean;
    defaultValue?: string;
    validationSchema?: string; // Zod schema JSON
  }[];

  // AI Provider Configuration
  defaultModel?: string; // e.g., "gpt-4o"
  defaultProvider?: string; // "openai", "anthropic", etc.
  allowUserModelOverride?: boolean;

  // Usage & Limits
  totalRequests: number;
  lastUsedAt?: Date;
  rateLimit: {
    requests: number;
    window: string; // "1h", "1d", etc.
  };

  // Metadata
  isActive: boolean;
  isPublic: boolean; // Can others see this deployment?
  description?: string;
  tags?: string[];

  createdAt: Date;
  updatedAt: Date;
}
```

### New Collection: `prompt_deployment_usage`

```typescript
interface PromptDeploymentUsage {
  id: string;
  deploymentId: string;
  apiKey: string; // For tracking which key was used
  userId?: string; // If authenticated request

  // Request Details
  parameters: Record<string, unknown>;
  model?: string;
  provider?: string;

  // Response Details
  success: boolean;
  responseTime: number; // ms
  tokensUsed?: number;
  cost?: number;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  error?: string;

  createdAt: Date;
}
```

---

## MCP Implementation

### MCP Server Configuration

Users configure the Engify.ai MCP server in their AI assistant (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "engify-prompts": {
      "command": "npx",
      "args": ["@engify/mcp-server"],
      "env": {
        "ENGIFY_API_KEY": "user-api-key",
        "ENGIFY_SERVER_URL": "https://api.engify.ai/mcp"
      }
    }
  }
}
```

### MCP Protocol Implementation

#### 1. Tool Discovery

**initialize** → Lists available prompts as tools

```typescript
// MCP Response
{
  "tools": [
    {
      "name": "code-review-assistant",
      "description": "Review code for bugs, security issues, and best practices",
      "inputSchema": {
        "type": "object",
        "properties": {
          "code": {
            "type": "string",
            "description": "The code to review"
          },
          "language": {
            "type": "string",
            "description": "Programming language",
            "enum": ["typescript", "python", "javascript"]
          }
        },
        "required": ["code"]
      }
    },
    {
      "name": "generate-unit-tests",
      "description": "Generate unit tests for code",
      "inputSchema": {
        "type": "object",
        "properties": {
          "code": { "type": "string" },
          "testFramework": { "type": "string" }
        },
        "required": ["code"]
      }
    }
    // ... all prompts from library
  ]
}
```

#### 2. Tool Invocation

**tools/call** → Execute prompt with parameters

```typescript
// MCP Request
{
  "name": "code-review-assistant",
  "arguments": {
    "code": "function add(a, b) { return a + b }",
    "language": "javascript"
  }
}

// MCP Response
{
  "content": [
    {
      "type": "text",
      "text": "Code review:\n\n✅ Strengths:\n- Simple, clear function\n...\n\n⚠️ Issues:\n- No input validation\n..."
    }
  ],
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 245,
    "responseTime": 1250
  }
}
```

#### 3. Tool Listing (Filtered)

**tools/list** → List tools by category, role, pattern

```typescript
// MCP Request
{
  "filters": {
    "role": "engineer",
    "category": "testing"
  }
}

// Returns filtered list of tools
```

---

## Implementation Details

### 1. Parameter Extraction

When deploying a prompt, users can:

- Manually define parameters
- Auto-detect parameters from prompt template variables (e.g., `{name}`, `{{variable}}`)
- Use AI to extract parameters from prompt content

### 2. Prompt Template Processing

```typescript
function processPromptTemplate(
  promptContent: string,
  parameters: Record<string, string>
): string {
  let processed = promptContent;

  // Replace template variables
  Object.entries(parameters).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    processed = processed.replace(regex, value);
  });

  return processed;
}
```

### 3. API Key Generation

```typescript
function generateApiKey(): string {
  // Generate cryptographically secure random string
  // e.g., "s9tcpTr5bc61GiZb5Cmk"
  return crypto.randomBytes(16).toString('base64url');
}
```

### 4. Rate Limiting

Per-deployment rate limiting using Redis:

```typescript
async function checkRateLimit(
  apiKey: string,
  deploymentId: string,
  limit: number,
  window: string
): Promise<boolean> {
  const key = `ratelimit:deployment:${deploymentId}:${apiKey}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, parseWindow(window));
  }

  return current <= limit;
}
```

### 5. AI Provider Integration

Use existing `AIProviderFactory` to execute prompts:

```typescript
const provider = AIProviderFactory.create(deployment.defaultProvider);
const result = await provider.execute({
  prompt: processedPrompt,
  model: deployment.defaultModel,
});
```

---

## Security Considerations

1. **API Key Storage**: Hash API keys (never store plaintext)
2. **Rate Limiting**: Enforce per-deployment limits
3. **Input Validation**: Validate all parameters using Zod schemas
4. **Prompt Injection**: Sanitize user inputs to prevent prompt injection
5. **Authentication**: Require auth for deployment management
6. **CORS**: Configure CORS for API endpoints
7. **IP Whitelisting**: Optional feature for enterprise users

---

## Usage Examples

### Claude Desktop Configuration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "engify-prompts": {
      "command": "npx",
      "args": ["-y", "@engify/mcp-server"],
      "env": {
        "ENGIFY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Using in Claude Desktop

Once configured, users can:

1. **Ask Claude**: "Use the code review assistant to review this code: [code]"
2. **Browse Tools**: Claude automatically discovers all Engify prompts
3. **Invoke Tools**: Claude uses prompts as tools with parameters

### Programmatic Usage (via MCP Client)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@engify/mcp-server'],
  env: { ENGIFY_API_KEY: 'your-key' },
});

const client = new Client(
  {
    name: 'my-app',
    version: '1.0.0',
  },
  {
    capabilities: {},
  }
);

await client.connect(transport);

// List available prompts
const tools = await client.listTools();
console.log(
  'Available prompts:',
  tools.tools.map((t) => t.name)
);

// Invoke a prompt
const result = await client.callTool({
  name: 'code-review-assistant',
  arguments: {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
  },
});

console.log('Review:', result.content[0].text);
```

---

## UI Components Needed

1. **MCP Setup Guide**
   - Instructions for Claude Desktop
   - Instructions for Cursor
   - Copy-paste configuration snippets
   - API key management

2. **MCP Tool Browser**
   - Browse all prompts as MCP tools
   - Filter by role, category, pattern
   - Preview tool schemas
   - Test tool invocation

3. **Usage Dashboard**
   - MCP tool usage statistics
   - Most-used prompts
   - Usage analytics
   - API key management

---

## Pricing Model

### Free Tier

- 10 deployments
- 100 requests/month per deployment
- Public deployments only

### Pro Tier ($19/month)

- Unlimited deployments
- 1,000 requests/month per deployment
- Private deployments
- Custom rate limits
- Usage analytics

### Enterprise

- Custom limits
- IP whitelisting
- SSO integration
- Dedicated support

---

## Implementation Phases

### Phase 1: MVP - REST API (2-3 weeks) ⭐ RECOMMENDED START

- ✅ REST API endpoints (`POST /api/prompts/:id/execute`)
- ✅ API key generation and authentication
- ✅ Simple parameter replacement
- ✅ Rate limiting
- ✅ Basic usage tracking

**Why REST First:**

- Universal compatibility
- Faster to market
- Lower complexity
- Maximum addressable market
- Easy to test and debug

### Phase 2: Enhanced REST Features (2-3 weeks)

- ✅ Usage analytics dashboard
- ✅ API key management UI
- ✅ Code example generation (Python, JS, cURL)
- ✅ Parameter validation (Zod schemas)
- ✅ Webhook support

### Phase 3: MCP Server (Optional - Only if validated) (3-4 weeks)

- ✅ MCP protocol implementation
- ✅ MCP server package (`@engify/mcp-server`)
- ✅ Claude Desktop integration guide
- ✅ Cursor integration guide
- ✅ MCP-specific UI components

**Validation Criteria for Phase 3:**

- ✅ User demand data (surveys, support tickets)
- ✅ REST API adoption metrics
- ✅ MCP ecosystem maturity
- ✅ Competitive analysis showing MCP is needed

---

## Critical Analysis: MCP vs REST API

### ⚠️ Concerns with MCP-Only Approach

#### 1. **Limited Adoption**

- **Problem**: MCP is still emerging (2024). How many users actually use Claude Desktop or Cursor?
- **Risk**: Building for a niche audience
- **Question**: Do we have data showing MCP demand vs REST API demand?

#### 2. **User Friction**

- **Problem**: Users must configure MCP servers in their IDE/AI assistant
- **Reality**: Most developers just want `curl` or `fetch()` - not configuration files
- **Question**: Will users abandon at setup step?

#### 3. **Protocol Lock-in**

- **Problem**: MCP ties us to MCP-compatible tools only
- **Reality**: Many integrations (webhooks, CI/CD, scripts) need REST APIs
- **Question**: Are we limiting our addressable market?

#### 4. **Complexity Overhead**

- **Problem**: MCP protocol implementation + server maintenance + documentation
- **Reality**: REST API is simpler, well-understood, universally supported
- **Question**: Is the complexity worth it for a prompt execution service?

#### 5. **Developer Experience**

- **Problem**: MCP requires understanding the protocol
- **Reality**: Every developer knows REST APIs
- **Question**: Are we making it harder for developers?

#### 6. **Future-Proofing**

- **Problem**: What if MCP doesn't become the standard?
- **Reality**: REST APIs have been the standard for 20+ years
- **Question**: Are we betting on the wrong horse?

### 💡 Alternative: Hybrid Approach

**Why not both?**

1. **REST API** - For universal access, scripts, webhooks, CI/CD
2. **MCP Server** - For AI-native tools (Claude Desktop, Cursor)

**Benefits:**

- ✅ Maximum addressable market
- ✅ Users choose their preferred integration
- ✅ Future-proof (REST) + cutting-edge (MCP)
- ✅ Same backend, different interfaces

**Cost:**

- More implementation work (but shared backend logic)
- Maintain two APIs (but REST is simple)

### 🤔 Key Questions to Answer

1. **Market Research**: Do users actually want MCP, or do they want REST APIs?
2. **User Testing**: Would users prefer configuring MCP vs using REST endpoints?
3. **Adoption Data**: How many Engify users use Claude Desktop/Cursor?
4. **Competitive Analysis**: Do competitors offer MCP or REST (or both)?
5. **Cost-Benefit**: Is MCP complexity justified by user demand?

### 💭 Recommendation: Start with REST, Add MCP Later

**Rationale:**

- REST API is:
  - ✅ Universally accessible
  - ✅ Easy to implement
  - ✅ Well-documented patterns
  - ✅ Familiar to developers
  - ✅ Works everywhere (web, mobile, scripts, CI/CD)

- MCP can be added later:
  - ✅ If user demand exists
  - ✅ If MCP adoption grows
  - ✅ As a premium feature
  - ✅ Without disrupting REST API users

**MVP Should Be:**

- REST API endpoints first
- Simple, documented, tested
- MCP can be Phase 2 if validated

---

## Competitive Advantages

1. **Integrated with Library**: Access to all 179+ curated prompts
2. **Role-Based Prompts**: Pre-configured prompts for engineers, PMs, etc.
3. **Pattern-Based**: Leverages proven prompt patterns
4. **Universal Access**: REST API works everywhere (vs MCP's limited ecosystem)
5. **Developer-Friendly**: Standard REST APIs that every developer knows
6. **Future-Proof**: REST has been standard for 20+ years (vs MCP's emerging status)

---

## Next Steps

1. ✅ Document design (this file)
2. ⏭️ Create database schema migrations
3. ⏭️ Implement deployment API endpoints
4. ⏭️ Build execution API endpoint
5. ⏭️ Create UI components
6. ⏭️ Add usage tracking
7. ⏭️ Write documentation

---

## Related Files

- `src/app/api/prompts/route.ts` - Existing prompt API
- `src/lib/services/ApiKeyService.ts` - API key management
- `src/lib/ai/v2/factory/AIProviderFactory.ts` - AI provider integration
