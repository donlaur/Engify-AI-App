# Cursor Rules Guide - Official Documentation Summary

**Source**: https://cursor.com/docs/context/rules  
**Last Updated**: October 27, 2025

## Overview

Cursor supports multiple types of rules to configure persistent instructions for Agent (Chat) and Inline Edit. Rules help keep AI assistants focused, consistent, and aligned with project standards.

## Rule Types

### 1. Project Rules (`.cursor/rules/`)

**Location**: `.cursor/rules/` directory in your project  
**Format**: MDC (Markdown with metadata) `.mdc` files  
**Version Control**: Yes, committed to git  
**Scope**: Project-specific

**Rule Types:**

- **Always**: Always included in model context
- **Auto Attached**: Included when files matching glob patterns are referenced
- **Manual**: Only included when explicitly mentioned using `@ruleName`

**Anatomy of a Rule:**

```mdc
---
description: RPC Service boilerplate
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
```

**Key Properties:**

- `description`: Brief description of the rule
- `globs`: File patterns to match (for Auto Attached rules)
- `alwaysApply`: Boolean (true for Always rules)

### 2. Nested Rules

**Structure:**

```
project/
  .cursor/rules/        # Project-wide rules
  backend/
    .cursor/rules/      # Backend-specific rules
  frontend/
    .cursor/rules/      # Frontend-specific rules
```

**Behavior:**

- Nested rules automatically attach when files in their directory are referenced
- Allows for granular, context-specific instructions

### 3. Team Rules

**Location**: Cursor Dashboard (https://cursor.com/dashboard?tab=team-content)  
**Format**: Plain text (no MDC)  
**Scope**: Organization-wide  
**Access**: Team and Enterprise plans only

**Features:**

- Created and managed by team administrators
- Can be enforced (required for all team members)
- Can be optional (users can toggle off)
- Apply across all repositories and projects
- Take precedence over project and user rules

**Precedence**: Team Rules → Project Rules → User Rules

### 4. AGENTS.md

**Location**: Project root or subdirectories  
**Format**: Plain Markdown  
**Version Control**: Yes  
**Scope**: Project-specific

**Purpose:**

- Simple alternative to `.cursor/rules/` for straightforward use cases
- No metadata or complex configurations
- Perfect for readable, simple instructions

**Example:**

```markdown
# Project Instructions

## Code Style

- Use TypeScript for all new files
- Prefer functional components in React
- Use snake_case for database columns

## Architecture

- Follow the repository pattern
- Keep business logic in service layers
```

**Nested Support:**

```
project/
  AGENTS.md              # Global instructions
  frontend/
    AGENTS.md            # Frontend-specific
  backend/
    AGENTS.md            # Backend-specific
```

### 5. User Rules

**Location**: Cursor Settings → Rules  
**Format**: Plain text  
**Scope**: Global (all projects)  
**Use Case**: Personal preferences and coding conventions

**Example:**

```
Please reply in a concise style. Avoid unnecessary repetition or filler language.
```

### 6. `.cursorrules` (Legacy - Deprecated)

**Location**: Project root  
**Status**: Still supported but **will be deprecated**  
**Recommendation**: Migrate to Project Rules or AGENTS.md

## Creating Rules

### Via Command Palette

1. Use `New Cursor Rule` command
2. Creates new rule file in `.cursor/rules/`
3. Opens in editor for configuration

### Via Settings

1. Go to `Cursor Settings > Rules`
2. View all rules and their status
3. Create, edit, or delete rules

### Generate from Chat

1. Use `/Generate Cursor Rules` command in chat
2. AI generates rules based on conversation context
3. Useful for codifying decisions made during development

## Best Practices

### Keep Rules Focused

- ✅ Under 500 lines per rule
- ✅ Split large rules into multiple, composable rules
- ✅ One concern per rule

### Be Specific and Actionable

- ✅ Provide concrete examples
- ✅ Reference specific files when helpful
- ✅ Avoid vague guidance
- ✅ Write like clear internal documentation

### Use Appropriate Scope

- ✅ Project Rules: Project-specific standards
- ✅ Team Rules: Organization-wide standards
- ✅ User Rules: Personal preferences
- ✅ AGENTS.md: Simple, readable instructions

### Reuse and Iterate

- ✅ Reuse rules when repeating prompts in chat
- ✅ Update rules as patterns emerge
- ✅ Reference other rules and files with `@filename`

## Examples from Official Docs

### 1. Standards for Components and API Validation

**Use Case**: Enforce frontend and backend standards

```mdc
---
description: Frontend and API standards
globs: ["components/**/*.tsx", "api/**/*.ts"]
alwaysApply: false
---

When working in components directory:
- Always use Tailwind for styling
- Use Framer Motion for animations
- Follow component naming conventions

In API directory:
- Use zod for all validation
- Define return types with zod schemas
- Export types generated from schemas
```

### 2. Service and Component Templates

**Use Case**: Provide boilerplate templates

```mdc
---
description: Express service template
globs: ["**/*.ts"]
alwaysApply: false
---

Use this template when creating Express service:
- Follow RESTful principles
- Include error handling middleware
- Set up proper logging

@express-service-template.ts
```

### 3. Development Workflow Automation

**Use Case**: Automate analysis and documentation

```mdc
---
description: App analysis workflow
alwaysApply: false
---

When asked to analyze the app:
1. Run dev server with `npm run dev`
2. Fetch logs from console
3. Suggest performance improvements
```

## Rule Application

### Where Rules Apply

- ✅ Agent (Chat)
- ✅ Inline Edit
- ❌ Cursor Tab (not affected by rules)

### How to See Active Rules

- Check Agent sidebar
- Active rules show in context
- Hover to see rule content

### Rule Precedence

1. **Team Rules** (highest priority)
2. **Project Rules**
3. **User Rules** (lowest priority)

When rules conflict, earlier sources take precedence.

## Team Rules Management

### Creating Team Rules

1. Go to Cursor Dashboard
2. Navigate to Team Content tab
3. Click "Add New Rule"
4. Write rule content (plain text)
5. Configure options:
   - **Enable this rule immediately**: Activate on creation
   - **Enforce this rule**: Make required for all team members

### Enforcement Options

- **Not Enforced**: Users can toggle off in settings
- **Enforced**: Required for all team members, cannot be disabled

### Team Rule Format

- Plain text only (no MDC)
- No metadata support
- No glob patterns
- Applies globally across all projects

## Migration Guide

### From `.cursorrules` to Project Rules

1. Create `.cursor/rules/` directory
2. Create new rule file (e.g., `main.mdc`)
3. Add metadata:
   ```mdc
   ---
   description: Main project rules
   alwaysApply: true
   ---
   ```
4. Copy content from `.cursorrules`
5. Delete `.cursorrules` file

### From Legacy "Agent Applied" Rules

1. Use command: `Convert Legacy Agent Applied Rules`
2. Converts to plain markdown with table of contents
3. Store in `.cursor/rules/` or `AGENTS.md`
4. No special dynamic format required

## FAQ

### Why isn't my rule being applied?

- Check rule type (Always, Auto Attached, Manual)
- For Auto Attached, verify glob patterns match referenced files
- Check if rule is enabled in settings
- Verify rule syntax is correct

### Can rules reference other rules or files?

Yes! Use `@filename.ts` to include files in your rule's context.

### Can I create a rule from chat?

Yes, use the `/Generate Cursor Rules` command to generate rules from conversation context.

### Do rules impact Cursor Tab?

No. Rules only apply to Agent (Chat) and Inline Edit.

### How do I share rules with my team?

- **Project Rules**: Commit `.cursor/rules/` to git
- **Team Rules**: Create via Cursor Dashboard (Team/Enterprise plans)
- **AGENTS.md**: Commit to git

## Integration with Engify.ai

### How We'll Use This

1. **Rules Library**
   - Provide pre-built `.cursor/rules/` templates
   - Organized by tech stack and use case
   - Downloadable and customizable

2. **Rules Generator**
   - Interactive tool to create custom rules
   - Select tech stack, preferences, patterns
   - Generate properly formatted `.mdc` files

3. **Best Practices Guide**
   - Teach effective rule writing
   - Show examples from real projects
   - Explain when to use each rule type

4. **Team Standards**
   - Help teams create Team Rules
   - Templates for organization-wide standards
   - Governance and enforcement strategies

## Key Takeaways

1. **Multiple Rule Types**: Project, Team, User, AGENTS.md, .cursorrules (legacy)
2. **MDC Format**: Project rules use metadata + markdown
3. **Nested Support**: Rules can be scoped to directories
4. **Team Features**: Enterprise-grade rule management
5. **Simple Alternative**: AGENTS.md for straightforward cases
6. **Best Practices**: Keep focused, specific, and actionable
7. **Version Control**: Project rules and AGENTS.md are committed to git
8. **Precedence**: Team → Project → User

## Resources

- **Official Docs**: https://cursor.com/docs/context/rules
- **Cursor Dashboard**: https://cursor.com/dashboard
- **Community Examples**: Various GitHub repositories and collections
