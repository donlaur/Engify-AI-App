# GitHub PR Workflow Guide

**For Future Reference:** Use Pull Requests for all merges into main

---

## Standard PR Workflow

### Step 1: Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Step 2: Make Commits

```bash
# Make your changes
git add .
git commit -m "feat: your descriptive commit message"
# Repeat as needed
```

### Step 3: Push Feature Branch

```bash
git push origin feature/your-feature-name
```

### Step 4: Create Pull Request on GitHub

1. Go to GitHub repository
2. Click "Pull requests" tab
3. Click "New pull request"
4. Select `feature/your-feature-name` → `main`
5. Add title and description
6. Request review if needed
7. Click "Create pull request"

### Step 5: Review & Merge

- Review the PR
- Address any feedback
- Merge via GitHub UI (choose merge strategy):
  - **Create a merge commit** (recommended - preserves all commits)
  - **Squash and merge** (single commit)
  - **Rebase and merge** (linear history)

### Step 6: Clean Up

```bash
# After PR is merged
git checkout main
git pull origin main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## PR Best Practices

### PR Title Format

```
type(scope): brief description

Examples:
- feat(admin): add new admin panel
- docs: update API documentation
- fix(auth): resolve RBAC issue
```

### PR Description Template

```markdown
## Summary
Brief description of changes

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Manual testing completed
- [ ] Tests added/updated
- [ ] Documentation updated

## Related Issues
Closes #123
```

### Commit Message Standards

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

---

## Merge Strategy Options

### Option 1: Create a Merge Commit (Recommended)

**Pros:**
- Preserves all commit history
- Shows feature branch in git log
- Easy to revert entire feature

**Cons:**
- Creates merge commit
- More complex history

**Use when:** You want to preserve all commits for stats/history

### Option 2: Squash and Merge

**Pros:**
- Clean linear history
- Single commit per feature

**Cons:**
- Loses individual commit history
- Harder to revert specific changes

**Use when:** Feature branch has many small commits

### Option 3: Rebase and Merge

**Pros:**
- Clean linear history
- All commits preserved

**Cons:**
- Rewrites commit history
- Can cause conflicts

**Use when:** You want linear history with all commits

---

## Current Status

✅ **Day 7 Documentation Work:** Already merged into main
- Commits preserved: `9855e88`, `47fb669`
- Feature branch: Deleted (no longer needed)
- All commits visible in main history

---

## For Future Features

**Always use PR workflow:**
1. Create feature branch
2. Make commits
3. Push branch
4. Create PR on GitHub
5. Review & merge via GitHub UI
6. Delete branch after merge

**Benefits:**
- Code review before merge
- CI/CD checks run automatically
- Better collaboration
- Clear history of changes
- Easy to revert if needed

---

**Last Updated:** 2025-11-02  
**Reference:** GitHub PR workflow best practices

