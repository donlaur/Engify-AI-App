# Git Workflow Guide

**Philosophy**: Commit often, push immediately, keep work safe.

---

## 🎯 Core Principles

### 1. Commit Often
- Commit after every logical change
- Small, atomic commits are better than large ones
- Each commit should have a single purpose

### 2. Push Immediately
- Push after every commit (or small group of commits)
- Don't wait until "everything works"
- Remote is your backup

### 3. No Deployment on Push
- Pushing to `main` does NOT trigger deployment
- We deploy manually when ready
- This allows us to commit freely without fear

---

## 📝 Commit Message Format

### Use Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `security`: Security fixes

### Examples

```bash
# Good commit messages
git commit -m "feat(auth): add NextAuth.js configuration"
git commit -m "docs: create security guide"
git commit -m "fix(db): add organizationId to conversation queries"
git commit -m "security: prevent hardcoded secrets in pre-commit hook"
git commit -m "chore: update dependencies"

# Bad commit messages
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "asdf"
```

---

## 🔄 Daily Workflow

### Morning: Start Work

```bash
# Pull latest changes (if working with others)
git pull origin main

# Check status
git status

# See what you're working on
git log --oneline -5
```

### During Work: Commit Frequently

```bash
# After adding a file
git add src/components/PromptLibrary.tsx
git commit -m "feat(prompts): create PromptLibrary component"
git push origin main

# After updating documentation
git add docs/SECURITY_GUIDE.md
git commit -m "docs(security): add input validation section"
git push origin main

# After fixing a bug
git add src/lib/db/queries.ts
git commit -m "fix(db): include organizationId in getConversations query"
git push origin main

# After adding tests
git add tests/unit/db/queries.test.ts
git commit -m "test(db): add tests for data isolation"
git push origin main
```

### Group Related Changes

```bash
# If you made several related changes, commit them together
git add src/app/api/auth/[...nextauth]/route.ts
git add src/lib/auth/config.ts
git add docs/strategy/AUTH_AND_BILLING_STRATEGY.md
git commit -m "feat(auth): implement NextAuth.js with MongoDB adapter"
git push origin main
```

### End of Day: Make Sure Everything is Pushed

```bash
# Check if anything is uncommitted
git status

# Check if anything is unpushed
git log origin/main..HEAD

# If you see commits, push them
git push origin main
```

---

## 🚀 Quick Commands

### Commit and Push (Single Command)

```bash
# Add all changes, commit, and push
git add .
git commit -m "feat(prompts): add search and filter functionality"
git push origin main

# Or create an alias
git config --global alias.acp '!git add . && git commit -m "$1" && git push origin main && :'
# Usage: git acp "feat(prompts): add search"
```

### Check What's Changed

```bash
# See what files changed
git status

# See what changed in files
git diff

# See what's staged
git diff --staged

# See recent commits
git log --oneline -10
```

### Undo Mistakes (Before Push)

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Unstage files
git reset HEAD <file>

# Discard changes in file
git restore <file>
```

---

## 📦 Commit Grouping Strategies

### Strategy 1: Feature-Based

```bash
# Commit each part of a feature separately
git commit -m "feat(auth): add NextAuth.js configuration"
git push origin main

git commit -m "feat(auth): create login page component"
git push origin main

git commit -m "feat(auth): add authentication middleware"
git push origin main

git commit -m "docs(auth): document authentication flow"
git push origin main
```

### Strategy 2: File-Based

```bash
# Commit related files together
git add src/components/PromptCard.tsx
git add src/components/PromptList.tsx
git add src/components/PromptSearch.tsx
git commit -m "feat(prompts): create prompt display components"
git push origin main
```

### Strategy 3: Checkpoint-Based

```bash
# Commit when you reach a working state
git add .
git commit -m "feat(workbench): implement basic prompt template generator"
git push origin main

# Continue working...
git add .
git commit -m "feat(workbench): add prompt customization options"
git push origin main

# Continue working...
git add .
git commit -m "feat(workbench): add copy to clipboard functionality"
git push origin main
```

---

## 🔒 Security Checks (Automatic)

Every commit runs these checks automatically:

```bash
# Pre-commit hook runs:
1. Lint-staged (formatting, linting)
2. git-secrets (scan for secrets)
3. security-check.js (custom security checks)

# If any check fails, commit is blocked
```

### If Pre-Commit Fails

```bash
# See what failed
# Fix the issues
# Try committing again

# Example: If secrets detected
# 1. Remove the secret
# 2. Add to .env.local
# 3. Use process.env.SECRET_NAME
# 4. Try committing again
```

---

## 🌿 Branch Strategy (Simple)

### For Solo Development

```bash
# Work directly on main
git checkout main
git add .
git commit -m "feat: add new feature"
git push origin main
```

### For Experimental Work

```bash
# Create a branch for experiments
git checkout -b experiment/new-feature
git add .
git commit -m "experiment: try new approach"
git push origin experiment/new-feature

# If it works, merge to main
git checkout main
git merge experiment/new-feature
git push origin main

# If it doesn't work, delete branch
git branch -D experiment/new-feature
git push origin --delete experiment/new-feature
```

### For Collaboration (Future)

```bash
# Create feature branch
git checkout -b feature/prompt-library
git add .
git commit -m "feat(prompts): add prompt library"
git push origin feature/prompt-library

# Create pull request on GitHub
# After review, merge to main
```

---

## 📊 Commit Frequency Guidelines

### Commit After

- ✅ Adding a new file
- ✅ Completing a function
- ✅ Fixing a bug
- ✅ Updating documentation
- ✅ Adding tests
- ✅ Refactoring code
- ✅ Reaching a working state

### Don't Wait For

- ❌ "Everything to be perfect"
- ❌ "All features to be done"
- ❌ "All tests to pass" (commit broken tests with WIP message)
- ❌ "End of day"

### Ideal Frequency

**Solo Development**: 5-20 commits per day  
**Pair Programming**: 10-30 commits per day  
**Minimum**: 3 commits per day

---

## 🎯 Example Day of Commits

```bash
# 9:00 AM - Start work
git commit -m "docs: update implementation plan with today's tasks"
git push origin main

# 9:30 AM - Create component
git commit -m "feat(prompts): create PromptCard component"
git push origin main

# 10:00 AM - Add styling
git commit -m "style(prompts): add Tailwind styling to PromptCard"
git push origin main

# 10:30 AM - Add tests
git commit -m "test(prompts): add tests for PromptCard component"
git push origin main

# 11:00 AM - Fix bug
git commit -m "fix(prompts): handle missing rating in PromptCard"
git push origin main

# 11:30 AM - Update docs
git commit -m "docs(prompts): document PromptCard props and usage"
git push origin main

# 1:00 PM - New feature
git commit -m "feat(prompts): add search functionality"
git push origin main

# 2:00 PM - Refactor
git commit -m "refactor(prompts): extract search logic to custom hook"
git push origin main

# 3:00 PM - Add feature
git commit -m "feat(prompts): add filter by category"
git push origin main

# 4:00 PM - Fix issue
git commit -m "fix(prompts): fix filter reset on search"
git push origin main

# 5:00 PM - End of day
git commit -m "chore: update progress notes"
git push origin main

# Total: 11 commits (good day!)
```

---

## 🚫 What NOT to Commit

### Never Commit

```bash
# ❌ Secrets (blocked by pre-commit)
.env
.env.local

# ❌ Dependencies
node_modules/
.pnp/

# ❌ Build artifacts
.next/
out/
dist/

# ❌ IDE files
.vscode/
.idea/

# ❌ OS files
.DS_Store
Thumbs.db

# ❌ Logs
*.log
npm-debug.log*
```

### These are in .gitignore

---

## 🔧 Git Configuration

### Recommended Settings

```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch to main
git config --global init.defaultBranch main

# Set default editor
git config --global core.editor "code --wait"

# Enable color
git config --global color.ui auto

# Set pull strategy
git config --global pull.rebase false

# Set push strategy
git config --global push.default current

# Enable auto-correct
git config --global help.autocorrect 1
```

### Useful Aliases

```bash
# Status
git config --global alias.s "status -s"

# Log
git config --global alias.l "log --oneline -10"
git config --global alias.lg "log --graph --oneline --all -10"

# Commit
git config --global alias.c "commit -m"
git config --global alias.ca "commit -am"

# Add and commit
git config --global alias.ac "!git add . && git commit -m"

# Add, commit, and push
git config --global alias.acp "!git add . && git commit -m '$1' && git push origin main #"

# Undo last commit (keep changes)
git config --global alias.undo "reset --soft HEAD~1"

# Amend last commit
git config --global alias.amend "commit --amend --no-edit"
```

### Usage

```bash
# Instead of: git status
git s

# Instead of: git log --oneline -10
git l

# Instead of: git add . && git commit -m "message"
git ac "message"

# Instead of: git add . && git commit -m "message" && git push origin main
git acp "message"
```

---

## 📝 Commit Message Templates

### Feature

```bash
git commit -m "feat(scope): add feature description

- Bullet point 1
- Bullet point 2

Closes #123"
```

### Bug Fix

```bash
git commit -m "fix(scope): fix bug description

Root cause: Explain what caused the bug
Solution: Explain how you fixed it

Fixes #456"
```

### Documentation

```bash
git commit -m "docs(scope): update documentation

- Added section on X
- Updated section on Y
- Fixed typos in Z"
```

### Security

```bash
git commit -m "security(scope): fix security issue

Issue: Describe the security issue
Fix: Describe how you fixed it

BREAKING CHANGE: If this breaks anything"
```

---

## 🎯 Best Practices

### Do

- ✅ Commit often (5-20 times per day)
- ✅ Push immediately after commit
- ✅ Write clear commit messages
- ✅ Use conventional commit format
- ✅ Group related changes
- ✅ Commit working code (even if incomplete)
- ✅ Commit broken code with WIP message
- ✅ Review changes before committing (`git diff`)

### Don't

- ❌ Wait until end of day to commit
- ❌ Commit everything at once
- ❌ Use vague commit messages
- ❌ Commit secrets (blocked by pre-commit)
- ❌ Commit node_modules or build artifacts
- ❌ Force push to main (unless you know what you're doing)
- ❌ Commit commented-out code (delete it)

---

## 🚨 Emergency Procedures

### If You Committed a Secret

```bash
# 1. Immediately revoke the secret
# 2. Remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (DANGEROUS - coordinate with team)
git push origin --force --all

# 4. Generate new secret
# 5. Update all systems
# 6. Document incident
```

### If You Pushed Broken Code

```bash
# Option 1: Fix forward (preferred)
git add .
git commit -m "fix: resolve issue from previous commit"
git push origin main

# Option 2: Revert commit
git revert HEAD
git push origin main

# Option 3: Reset (if no one else pulled)
git reset --hard HEAD~1
git push origin --force main
```

---

## 📊 Tracking Your Progress

### See Your Commits

```bash
# Today's commits
git log --since="midnight" --oneline --author="$(git config user.name)"

# This week's commits
git log --since="1 week ago" --oneline --author="$(git config user.name)"

# Count commits
git rev-list --count HEAD --since="midnight" --author="$(git config user.name)"
```

### Commit Stats

```bash
# Lines changed today
git diff --stat $(git log --since="midnight" --format="%H" | tail -1) HEAD

# Files changed today
git log --since="midnight" --name-only --pretty=format: | sort | uniq
```

---

## ✅ Summary

### Workflow

1. **Make a change** (add file, fix bug, update docs)
2. **Review changes** (`git diff`)
3. **Stage changes** (`git add .` or `git add <file>`)
4. **Commit** (`git commit -m "type(scope): message"`)
5. **Push** (`git push origin main`)
6. **Repeat** (5-20 times per day)

### Key Points

- ✅ Commit often (after every logical change)
- ✅ Push immediately (remote is your backup)
- ✅ No deployment on push (commit freely)
- ✅ Clear commit messages (conventional commits)
- ✅ Security checks automatic (pre-commit hooks)

### This Approach

- **Keeps work safe** (pushed to remote)
- **Enables easy rollback** (small commits)
- **Provides clear history** (good messages)
- **Reduces stress** (no big commits)
- **Improves quality** (frequent checkpoints)

---

**Commit often. Push immediately. Keep your work safe.** 🚀

**Last Updated**: 2025-10-27  
**Status**: Active - Use This Workflow Daily  
**Maintainer**: Engineering Leadership
