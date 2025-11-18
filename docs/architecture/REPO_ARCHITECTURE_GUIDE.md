# Repository Architecture Guide
## Using Private MCP Platform with Public Engify-AI-App

**Created**: 2025-11-17
**Purpose**: Guide for structuring public/private repos with shared MCP test infrastructure

---

## 🎯 Your Current Situation

**Public Repo (Job Prospects)**: `Engify-AI-App`
- Full-stack Next.js app with admin dashboard
- Public-facing code for portfolio/interviews
- Needs to demonstrate code quality

**Private Repo (Product)**: `Engify-MCP-Platform`
- Monorepo with MCP server implementation
- 30+ validators and guardrails
- Air-tight code quality
- Full test suite for MCP servers
- Cannot be public (proprietary product)

**Goal**: Use the MCP test suite from your private repo to test the public repo

---

## 🏗️ Architecture Options

### **Option A: Git Submodules (Recommended for Your Case)**

Link the private MCP platform as a git submodule in the public repo.

#### **Pros**:
- ✅ Keeps repos separate (privacy maintained)
- ✅ Easy to exclude from public commits (.gitmodules + .gitignore)
- ✅ Claude Code can access both repos in single workspace
- ✅ Can use MCP test suite on public repo
- ✅ Clear separation of concerns

#### **Cons**:
- ⚠️ Need to be careful not to commit submodule to public repo
- ⚠️ Must exclude from .gitignore properly

#### **Setup**:
```bash
cd ~/Engify-AI-App

# Add private repo as submodule (won't be committed if in .gitignore)
git submodule add /path/to/Engify-MCP-Platform .mcp-platform

# Add to .gitignore to NEVER commit it
echo ".mcp-platform/" >> .gitignore
echo ".gitmodules" >> .gitignore

# Commit the .gitignore change
git add .gitignore
git commit -m "chore: ignore MCP platform submodule (private repo)"
```

**Result**:
- Your public repo now has `.mcp-platform/` directory with all MCP code
- It's ignored by git, so never gets pushed publicly
- Claude Code can access both repos simultaneously

---

### **Option B: Monorepo Workspace (Best for Development)**

Use a parent directory with both repos and a workspace config for Claude Code.

#### **Directory Structure**:
```
~/Engify-Workspace/
├── Engify-AI-App/           # Public repo (git)
├── Engify-MCP-Platform/     # Private monorepo (git)
└── .code-workspace          # VSCode/Claude Code workspace file
```

#### **Setup**:
```bash
# Create workspace directory
mkdir -p ~/Engify-Workspace
cd ~/Engify-Workspace

# Clone both repos
git clone git@github.com:donlaur/Engify-AI-App.git
git clone <your-private-repo-url> Engify-MCP-Platform

# Create workspace file
cat > Engify.code-workspace <<'EOF'
{
  "folders": [
    {
      "path": "Engify-AI-App",
      "name": "🌐 Public App (Job Prospects)"
    },
    {
      "path": "Engify-MCP-Platform",
      "name": "🔒 Private MCP Platform"
    }
  ],
  "settings": {
    "typescript.tsdk": "Engify-AI-App/node_modules/typescript/lib",
    "eslint.workingDirectories": [
      "Engify-AI-App",
      "Engify-MCP-Platform"
    ]
  }
}
EOF
```

#### **Open in Claude Code**:
```bash
code Engify.code-workspace
# or
cursor Engify.code-workspace
```

**Result**:
- Claude Code has context from BOTH repos
- Can run MCP tests on public repo code
- Clear separation (can't accidentally commit private code to public repo)

---

### **Option C: NPM Workspace / Turborepo (Overkill but Powerful)**

Create a true monorepo setup with shared tooling.

```json
// package.json (root)
{
  "name": "engify-workspace",
  "private": true,
  "workspaces": [
    "Engify-AI-App",
    "Engify-MCP-Platform"
  ],
  "scripts": {
    "test:public": "cd Engify-AI-App && pnpm test",
    "test:mcp": "cd Engify-MCP-Platform && pnpm test",
    "test:all": "pnpm test:public && pnpm test:mcp"
  }
}
```

---

## 🧪 Using MCP Test Suite on Public Repo

### **Approach 1: Symlink Test Infrastructure**

Link the MCP test utilities into your public repo:

```bash
cd ~/Engify-AI-App

# Create test infrastructure directory
mkdir -p tests/mcp-validators

# Symlink the validators from private repo
ln -s ~/Engify-MCP-Platform/packages/validators tests/mcp-validators/validators
ln -s ~/Engify-MCP-Platform/packages/test-utils tests/mcp-validators/test-utils

# Add to .gitignore
echo "tests/mcp-validators/" >> .gitignore
```

**Usage**:
```typescript
// tests/admin/prompts.test.ts
import { validateSchema } from '../mcp-validators/validators';
import { runMCPTest } from '../mcp-validators/test-utils';

describe('Admin Prompts API', () => {
  it('should pass MCP validation', async () => {
    const result = await validateSchema(promptData);
    expect(result.valid).toBe(true);
  });
});
```

---

### **Approach 2: Shared Test Config**

Create a test config in the public repo that imports from private:

```typescript
// tests/setup.ts (public repo)
import { setupMCPValidators } from '../.mcp-platform/packages/test-utils';

export const mcpConfig = setupMCPValidators({
  rules: [
    'no-sql-injection',
    'xss-protection',
    'rate-limiting',
    'authentication',
    'zod-validation',
    // ... all 30 validators
  ]
});
```

```typescript
// tests/api/admin/prompts.test.ts
import { mcpConfig } from '../../setup';

it('should pass all MCP security validations', async () => {
  const endpoint = '/api/admin/prompts';
  const results = await mcpConfig.validateEndpoint(endpoint);

  expect(results).toMatchSnapshot();
  expect(results.passed).toBe(30); // All 30 validators pass
  expect(results.failed).toBe(0);
});
```

---

## 📝 Directions for New Claude Code Instance

Save this as a prompt/instructions for future Claude instances:

### **Quick Start Instructions for Claude Code**

```markdown
# Project Context: Engify Multi-Repo Setup

## Repositories
1. **Public Repo**: ~/Engify-AI-App (git@github.com:donlaur/Engify-AI-App.git)
   - Purpose: Job prospects, public portfolio
   - Stack: Next.js 15, TypeScript, MongoDB, NextAuth
   - Contains: Admin dashboard (OpsHub), user-facing app

2. **Private Repo**: ~/Engify-MCP-Platform (symlinked in .mcp-platform/)
   - Purpose: Proprietary MCP server product
   - Contains: 30 validators, guardrails, test infrastructure
   - NEVER commit to public repo

## Running Tests

### Public Repo Tests
```bash
cd ~/Engify-AI-App
pnpm test                    # Run all tests
pnpm test:unit              # Unit tests only
pnpm test:api               # API tests only
```

### MCP Validation Tests (using private repo infrastructure)
```bash
cd ~/Engify-AI-App
pnpm test:mcp               # Runs 30 MCP validators on public code
```

## Important Rules
1. ✅ ALWAYS check you're in correct repo before commits
2. ✅ .mcp-platform/ is gitignored - NEVER commit it
3. ✅ Use MCP validators for all new API routes
4. ✅ Public repo must maintain A-grade code quality

## Code Quality Standards
- Security: RBAC, rate limiting, input validation (Zod), XSS protection
- Testing: 90%+ coverage, all endpoints tested
- Performance: Pagination on all list endpoints
- TypeScript: Strict mode, no any types
- Error Handling: User-friendly messages, proper logging

## Current Branch Strategy
- Main: Production-ready code
- claude/fix-broken-ops-*: Feature branches (auto-named by session ID)
- Always create PR before merging to main

## Before Each Session
1. Check current branch: `git branch --show-current`
2. Pull latest: `git pull origin main`
3. Review recent commits: `git log --oneline -5`
4. Check for uncommitted changes: `git status`
```

---

## 🎨 Claude Code Workspace Setup

### **.code-workspace File**

Create this file to maintain context across sessions:

```json
{
  "folders": [
    {
      "path": ".",
      "name": "🌐 Engify-AI-App (Public)"
    },
    {
      "path": ".mcp-platform",
      "name": "🔒 MCP Platform (Private - Do Not Commit)"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/.git": true,
      "**/.next": true,
      "**/node_modules": true
    },
    "search.exclude": {
      "**/.git": true,
      "**/.next": true,
      "**/node_modules": true,
      ".mcp-platform/.git": true
    },
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "typescript.tsdk": "node_modules/typescript/lib",
    "claude.context.alwaysInclude": [
      "OPSHUB_CODE_REVIEW.md",
      "REPO_ARCHITECTURE_GUIDE.md",
      "README.md"
    ]
  },
  "extensions": {
    "recommendations": [
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode"
    ]
  }
}
```

### **Opening the Workspace**:

```bash
# Option 1: Command line
code ~/Engify-AI-App/Engify.code-workspace

# Option 2: In Claude Code, File → Open Workspace
```

---

## 🔒 Security Checklist

Before committing to public repo:

```bash
# 1. Check what will be committed
git status
git diff --staged

# 2. Verify no private repo content
git ls-files | grep -E "(mcp-platform|\.mcp)" || echo "✅ No MCP platform files staged"

# 3. Check .gitignore is correct
cat .gitignore | grep -E "(mcp-platform|\.mcp)" || echo "⚠️ Add .mcp-platform/ to .gitignore!"

# 4. Verify no secrets
git diff --staged | grep -iE "(api_key|secret|password|token)" || echo "✅ No obvious secrets"

# 5. Run tests before commit
pnpm test
pnpm test:mcp  # Run MCP validators

# 6. Only then commit
git commit -m "your message"
git push
```

---

## 📦 Package.json Scripts

Add these to your public repo's `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --testPathPattern=__tests__/unit",
    "test:api": "vitest run --testPathPattern=__tests__/api",
    "test:mcp": "node scripts/run-mcp-validators.js",
    "test:all": "pnpm test && pnpm test:mcp",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "quality-check": "pnpm type-check && pnpm lint && pnpm test:all"
  }
}
```

Create `scripts/run-mcp-validators.js`:

```javascript
// Runs MCP validators from private repo on public repo code
const { execSync } = require('child_process');
const path = require('path');

const mcpPath = path.join(__dirname, '../.mcp-platform');

if (!require('fs').existsSync(mcpPath)) {
  console.error('❌ MCP Platform not found. Run: git submodule update --init');
  process.exit(1);
}

console.log('🔍 Running 30 MCP validators on public repo...');

try {
  execSync('node .mcp-platform/packages/cli/validate.js', {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  console.log('✅ All MCP validators passed!');
} catch (error) {
  console.error('❌ MCP validation failed');
  process.exit(1);
}
```

---

## 🚀 Recommended Workflow

### **Daily Development**:

```bash
# Morning routine
cd ~/Engify-AI-App
git pull origin main
pnpm install  # Update deps if needed

# Start new feature
git checkout -b feature/my-feature
code .  # Opens with .mcp-platform context

# Develop with MCP validation
pnpm test:mcp  # Run after each API route change

# Before committing
pnpm quality-check  # Runs type-check, lint, all tests

# Commit (only public repo changes)
git add src/
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### **Using Both Repos Simultaneously**:

```bash
# Terminal 1: Public repo
cd ~/Engify-AI-App
pnpm dev

# Terminal 2: Watch MCP validators
cd ~/Engify-AI-App
pnpm test:mcp --watch

# Terminal 3: Run private MCP server (if needed)
cd ~/Engify-AI-App/.mcp-platform
pnpm dev
```

---

## 💡 Pro Tips

1. **Use Git Worktrees for Multiple Branches**:
   ```bash
   cd ~/Engify-AI-App
   git worktree add ../engify-feature-branch feature/new-feature
   # Work on feature without affecting main workspace
   ```

2. **Alias for Quick MCP Validation**:
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   alias mcp-check='cd ~/Engify-AI-App && pnpm test:mcp'
   ```

3. **Pre-commit Hook** (prevents committing private code):
   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash

   if git diff --cached --name-only | grep -qE "mcp-platform|\.mcp"; then
     echo "❌ ERROR: Attempting to commit private MCP platform code!"
     echo "Files:"
     git diff --cached --name-only | grep -E "mcp-platform|\.mcp"
     exit 1
   fi

   echo "✅ No private code in commit"
   ```

4. **Claude Code Context File** (`.claude/context.md`):
   ```markdown
   # Project Context

   This is a dual-repo setup:
   - Main repo: Engify-AI-App (PUBLIC)
   - MCP platform: .mcp-platform/ (PRIVATE - never commit)

   Always check which repo you're working in before commits.
   Run `pnpm test:mcp` before committing API changes.
   ```

---

## ✅ Final Checklist

- [ ] Set up .gitignore to exclude .mcp-platform/
- [ ] Create .code-workspace file
- [ ] Add MCP validation scripts to package.json
- [ ] Create pre-commit hook
- [ ] Document setup in README.md
- [ ] Test that MCP validators work on public code
- [ ] Verify no private code can be committed
- [ ] Save workspace instructions for Claude Code

---

## 🎯 For Your Next Claude Code Session

**Prompt to give new Claude instance**:

```
I have a dual-repo setup:

1. Public repo (current directory): Engify-AI-App
   - Purpose: Job prospects portfolio
   - Location: ~/Engify-AI-App

2. Private repo (symlinked): Engify-MCP-Platform
   - Purpose: Proprietary MCP server with 30 validators
   - Location: .mcp-platform/ (gitignored, never commit)

Please:
1. Read REPO_ARCHITECTURE_GUIDE.md for full context
2. Read OPSHUB_CODE_REVIEW.md for code quality standards
3. Before any commits, verify with `git status` you're not committing .mcp-platform/
4. Use `pnpm test:mcp` to run MCP validators on any new API routes
5. Maintain A-grade code quality (see code review for standards)

Current focus: [describe your task]
```

---

**That's it! You now have air-tight code quality from your private MCP platform applied to your public portfolio repo.**
