# Missing Features - Need to Add

## 1. MCP Content Section

**Status**: ❌ NOT ADDED
**What**: Explain Model Context Protocol, show examples, integration guides
**Where**: `/mcp` page or section on homepage
**Priority**: HIGH

## 2. AI-Assisted Coding Section

**Status**: ❌ NOT ADDED  
**What**: Tips, tricks, best practices for AI-assisted development
**Topics**:

- Cursor tips
- Windsurf workflows
- Claude/ChatGPT prompting for code
- GitHub Copilot patterns
- Code review with AI
  **Where**: `/ai-coding` or `/tips` page
  **Priority**: HIGH

## 3. Chatbot with RAG

**Status**: ❌ NOT ADDED
**What**: Interactive chatbot that uses RAG to answer questions about:

- Prompt patterns
- Our library content
- AI coding best practices
  **Tech**:
- Vector embeddings (OpenAI/Anthropic)
- Vector DB (Pinecone/Supabase)
- Chat interface
  **Where**: Widget on every page or `/chat` page
  **Priority**: MEDIUM

## 4. Learning Hub

**Status**: ❌ NOT ADDED (discussed but not built)
**What**: Curated external articles and resources
**Content**: Links to Pragmatic Engineer, Wade Foster, etc.
**Where**: `/learn/hub` or `/resources`
**Priority**: MEDIUM

## 5. Pattern Detail Drawer

**Status**: ✅ CREATED (PatternDetailDrawer.tsx exists)
**What**: Detailed pattern explanations with examples
**Status**: Component exists but not integrated into patterns page
**Priority**: HIGH - Need to wire it up!

## Quick Wins (Can do now):

1. ✅ Add MCP section to homepage
2. ✅ Create `/ai-coding` tips page
3. ✅ Wire up Pattern Detail Drawer to patterns page
4. 🔄 Chatbot with RAG (Phase 2 - needs vector DB setup)

## Current Commit: 468/500 (32 to go)
