# Quick Reference Card

**Keep this handy while developing.**

---

## 🚀 Daily Workflow

```bash
# 1. Start work
git pull origin main

# 2. Make changes
# ... edit files ...

# 3. Commit and push
git add .
git commit -m "feat(scope): description"
git push origin main

# 4. Repeat 5-20 times per day
```

---

## 📝 Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, security
```

**Examples**:
```bash
git commit -m "feat(auth): add NextAuth.js configuration"
git commit -m "fix(db): include organizationId in queries"
git commit -m "docs: update security guide"
git commit -m "security: prevent hardcoded secrets"
```

---

## 🔧 Common Commands

```bash
# Status
git status                    # See what changed
git diff                      # See changes in files
git log --oneline -10         # Recent commits

# Commit
git add .                     # Stage all changes
git add <file>                # Stage specific file
git commit -m "message"       # Commit with message
git push origin main          # Push to remote

# Undo (before push)
git reset --soft HEAD~1       # Undo last commit (keep changes)
git reset --hard HEAD~1       # Undo last commit (discard changes)
git restore <file>            # Discard changes in file

# Aliases (set these up)
git config --global alias.s "status -s"
git config --global alias.l "log --oneline -10"
git config --global alias.ac "!git add . && git commit -m"
git config --global alias.acp "!git add . && git commit -m '$1' && git push origin main #"
```

---

## 🔒 Security Checklist

**Never commit**:
- ❌ API keys (`sk-...`, `AKIA...`)
- ❌ Passwords or tokens
- ❌ MongoDB connection strings with credentials
- ❌ Private keys
- ❌ `.env` files

**Always**:
- ✅ Use `process.env.SECRET_NAME`
- ✅ Include `organizationId` in DB queries
- ✅ Validate user input with Zod
- ✅ Handle errors securely (no stack traces)

---

## 🛡️ Pre-Commit Checks (Automatic)

Every commit automatically checks for:
1. Hardcoded secrets
2. Missing organizationId
3. Unsafe patterns
4. Code formatting
5. Linting errors

**If blocked**: Fix the issue and commit again.

---

## 📊 Commit Frequency

**Target**: 5-20 commits per day

**Commit after**:
- Adding a file
- Completing a function
- Fixing a bug
- Updating docs
- Adding tests
- Reaching a working state

**Don't wait for**:
- Everything to be perfect
- All features done
- End of day

---

## 🎯 Quick Fixes

```bash
# Forgot to add a file
git add <file>
git commit --amend --no-edit
git push origin main --force

# Wrong commit message
git commit --amend -m "new message"
git push origin main --force

# Committed to wrong branch
git reset --soft HEAD~1
git stash
git checkout correct-branch
git stash pop
git add .
git commit -m "message"
git push origin correct-branch
```

---

## 📚 Documentation Quick Links

- **Security**: [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
- **Git Workflow**: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)
- **Development**: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **AI Context**: [AI_CONTEXT.md](./AI_CONTEXT.md)
- **Decisions**: [DECISION_LOG.md](./DECISION_LOG.md)

---

## 🚨 Emergency

**If you committed a secret**:
1. Immediately revoke it
2. Generate new secret
3. Remove from git history
4. Force push
5. Document incident

**If you pushed broken code**:
1. Fix forward (preferred)
2. Or revert commit
3. Or reset (if no one pulled)

---

## ✅ Daily Checklist

**Morning**:
- [ ] `git pull origin main`
- [ ] Review yesterday's commits
- [ ] Plan today's work

**During Work**:
- [ ] Commit after each logical change
- [ ] Push immediately
- [ ] Write clear commit messages
- [ ] Review changes before committing

**End of Day**:
- [ ] Check `git status` (nothing uncommitted)
- [ ] Check `git log origin/main..HEAD` (nothing unpushed)
- [ ] Update progress notes
- [ ] Plan tomorrow

---

## 💡 Pro Tips

1. **Commit often** - Small commits are easier to review and revert
2. **Push immediately** - Remote is your backup
3. **Clear messages** - Future you will thank you
4. **Review before commit** - `git diff` catches mistakes
5. **Use aliases** - Save time with shortcuts
6. **Don't fear commits** - No deployment on push

---

**Print this and keep it visible while coding!**

**Last Updated**: 2025-10-27
