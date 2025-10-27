# Branch Protection Rules

## Main Branch Protection

**To enable (GitHub Settings → Branches → Add rule):**

### Rule: `main`

**Protect matching branches:**
- ✅ Require a pull request before merging
  - Required approvals: 0 (solo dev, but shows process)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Required checks:
    - `lint`
    - `type-check`
    - `build`

- ✅ Require conversation resolution before merging

- ✅ Do not allow bypassing the above settings
  - ⚠️ Allow force pushes: NO
  - ⚠️ Allow deletions: NO

### Why This Matters:

1. **Shows discipline** - Even solo devs can have process
2. **CI must pass** - Can't merge broken code
3. **No force pushes** - Git history is sacred
4. **Professional standard** - Enterprise-grade practices

### For Solo Development:

Since you're the only developer, you can:
- Merge your own PRs (no approval needed)
- But CI MUST pass first
- Shows you value quality over speed

---

**Quick Setup:**
1. Go to: https://github.com/donlaur/Engify-AI-App/settings/branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Check the boxes above
5. Save

**Status:** ⏳ To be enabled after repo is public
