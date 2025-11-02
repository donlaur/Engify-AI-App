# GitHub PR Workflow Guide

## Creating a Pull Request

### Step 1: Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Step 2: Make Changes and Commit
```bash
# Make your changes
git add .
git commit -m "feat: your feature description"
# Keep commits atomic and descriptive
```

### Step 3: Push Branch to Remote
```bash
git push origin feature/your-feature-name
# First push: git push -u origin feature/your-feature-name
```

### Step 4: Create PR on GitHub

**Option A: Via GitHub CLI (if installed)**
```bash
gh pr create --title "feat: your feature" --body "Description of changes"
```

**Option B: Via GitHub Web UI**
1. Go to: https://github.com/donlaur/Engify-AI-App/pulls
2. Click "New Pull Request"
3. Select: `base: main` ← `compare: feature/your-feature-name`
4. Add title and description
5. Click "Create Pull Request"

### Step 5: Review and Merge

**PR Title Format:**
- `feat: add performance analysis reports`
- `fix: remove hardcoded fallback values`
- `docs: add database indexes audit`
- `refactor: consolidate admin CLI tools`

**PR Description Template:**
```markdown
## Summary
Brief description of changes

## Changes Made
- Added performance analysis report
- Created mock data audit
- Fixed authentication helper

## Testing
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] No breaking changes

## Related Issues
Closes #123

## Screenshots (if applicable)
```

### Step 6: Merge PR

**After approval, merge via GitHub:**
- Click "Merge pull request"
- Choose merge strategy:
  - **Create a merge commit** (recommended - preserves all commits)
  - **Squash and merge** (combines into one commit)
  - **Rebase and merge** (linear history)

**To preserve commit stats:**
- Use "Create a merge commit" ✅
- This keeps all your individual commits visible

### Step 7: Cleanup

**After merge:**
```bash
# Delete local branch
git checkout main
git pull origin main
git branch -d feature/your-feature-name

# Delete remote branch (or GitHub will ask)
git push origin --delete feature/your-feature-name
```

---

## Best Practices

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Keep commits atomic (one logical change per commit)
- Write clear, descriptive messages

### PR Etiquette
- **Small PRs** are easier to review (< 500 lines)
- **Self-review** before requesting review
- **Update PR** if you make changes after opening
- **Link related issues** in PR description

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Test additions

---

## Current Status

**Already Merged (via direct merge):**
- ✅ `feature/day-7-qa-improvements` - Merged, remote branch deleted

**Active Feature Branches:**
- `feature/dry-improvements` - Already merged
- `feature/mongodb-integration` - Check if needs PR

---

## Quick Reference

```bash
# Create PR from current branch
gh pr create

# View PR status
gh pr view

# List open PRs
gh pr list

# Merge PR via CLI (if approved)
gh pr merge --merge

# Or use GitHub web UI for better control
```

