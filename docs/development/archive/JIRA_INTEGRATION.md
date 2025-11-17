# Jira Integration - Enterprise SDLC

**Project**: Engify AI  
**Board**: https://engify.atlassian.net/jira/software/projects/MBA/boards/1  
**Date Setup**: October 28, 2025

---

## Workflow

### Jira Board Columns

1. **TO DO** - Backlog items ready to start
2. **IN PROGRESS** - Active development
3. **IN REVIEW** - Code review / PR review
4. **DONE** - Completed and deployed

---

## Branch Naming Convention

### Format

```
<type>/<jira-ticket>-<short-description>
```

### Types

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation only
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### Examples

```bash
feature/MBA-4-two-factor-authentication
fix/MBA-8-fund-transfer-bug
refactor/MBA-5-transaction-history
docs/MBA-3-biometric-login-docs
```

---

## Development Workflow

### 1. Pick a Ticket

- Move ticket to "IN PROGRESS" in Jira
- Assign to yourself
- Note the ticket number (e.g., MBA-4)

### 2. Create Feature Branch

```bash
# From main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/MBA-4-two-factor-auth
```

### 3. Develop

- Make focused commits
- Reference Jira ticket in commits
- Keep branch up to date with main

### 4. Commit Messages

```bash
# Format: <type>(<ticket>): <description>
git commit -m "feat(MBA-4): add two-factor authentication setup"
git commit -m "test(MBA-4): add 2FA validation tests"
git commit -m "docs(MBA-4): update auth documentation"
```

### 5. Push and Create PR

```bash
git push origin feature/MBA-4-two-factor-auth
```

**PR Title Format**:

```
[MBA-4] Add Two-Factor Authentication
```

**PR Description Template**:

```markdown
## Jira Ticket

[MBA-4](https://engify.atlassian.net/browse/MBA-4)

## Changes

- Added 2FA setup flow
- Implemented TOTP verification
- Added backup codes

## Testing

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing complete

## Screenshots

[Add if UI changes]

## Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

### 6. Code Review

- Move ticket to "IN REVIEW" in Jira
- Request review from team
- Address feedback
- Update PR

### 7. Merge and Deploy

- Squash and merge to main
- Move ticket to "DONE" in Jira
- Delete feature branch
- Verify deployment

---

## Current Tickets

### MBA-3: Implement Biometric Login

**Status**: IN REVIEW  
**Type**: User Authentication  
**Branch**: `feature/MBA-3-biometric-login`

### MBA-4: Two-Factor Authentication Setup

**Status**: IN PROGRESS  
**Type**: User Authentication  
**Branch**: `feature/MBA-4-two-factor-auth`

### MBA-5: View Transaction History

**Status**: IN PROGRESS  
**Type**: Transaction Management  
**Branch**: `feature/MBA-5-transaction-history`

### MBA-8: Initiate Fund Transfer

**Status**: TO DO  
**Type**: Transaction Management  
**Branch**: Not created yet

---

## Git Workflow Best Practices

### Keep Branches Small

- One feature per branch
- Aim for < 500 lines changed
- Easier to review and merge

### Rebase Before PR

```bash
git checkout main
git pull origin main
git checkout feature/MBA-4-two-factor-auth
git rebase main
git push --force-with-lease
```

### Clean Commit History

```bash
# Interactive rebase to squash/reorder commits
git rebase -i main

# Or squash when merging via GitHub
```

### Delete Merged Branches

```bash
# Locally
git branch -d feature/MBA-4-two-factor-auth

# Remote (done automatically by GitHub after merge)
```

---

## Jira Automation

### Auto-transition on PR

- PR created → Move to "IN REVIEW"
- PR merged → Move to "DONE"

### Smart Commits

Use in commit messages to auto-update Jira:

```bash
# Transition ticket
git commit -m "MBA-4 #in-progress Add 2FA setup"
git commit -m "MBA-4 #done Complete 2FA implementation"

# Add comment
git commit -m "MBA-4 #comment Fixed validation bug"

# Log time
git commit -m "MBA-4 #time 2h Added 2FA tests"
```

---

## Integration with GitHub

### Link Jira to GitHub

1. Install Jira GitHub integration
2. Connect repository
3. Enable smart commits
4. Set up PR automation

### PR Checks

- [ ] All tests passing
- [ ] Code coverage maintained
- [ ] No linting errors
- [ ] Security scan passed
- [ ] Jira ticket linked

---

## Team Collaboration

### Daily Standup

- What did you work on? (Jira tickets)
- What are you working on today? (Move to IN PROGRESS)
- Any blockers? (Comment in Jira)

### Sprint Planning

- Review backlog in TO DO
- Estimate story points
- Assign tickets
- Set sprint goals

### Retrospective

- Review DONE tickets
- Discuss what went well
- Identify improvements
- Update process docs

---

## Current Phase 1 Mapping

### Existing Work → Jira Tickets

**Phase 1: AI Provider Interface** (COMPLETE)

- Could be: `MBA-10: Refactor AI Provider Architecture`
- Branch: `refactor/MBA-10-ai-provider-interface`
- Status: DONE ✅

**Next: Create Jira tickets for upcoming work**

---

## Action Items

### Immediate

- [ ] Create Jira ticket for Phase 2 (Repository Pattern)
- [ ] Set up GitHub-Jira integration
- [ ] Configure smart commits
- [ ] Create PR template with Jira link

### Short-term

- [ ] Train team on workflow
- [ ] Set up automation rules
- [ ] Create sprint board
- [ ] Define story point scale

### Long-term

- [ ] Integrate with CI/CD
- [ ] Set up release tracking
- [ ] Create custom dashboards
- [ ] Automate status updates

---

## Example: Phase 2 Ticket

**Title**: Implement Repository Pattern for Database Layer

**Type**: Epic / Story

**Description**:

```
As a developer
I want a clean database abstraction layer
So that we can easily test and maintain database operations

Acceptance Criteria:
- [ ] Create repository interfaces
- [ ] Implement MongoDB repositories
- [ ] Add dependency injection
- [ ] Write comprehensive tests
- [ ] Update documentation

Technical Details:
- Follow SOLID principles
- Use dependency injection
- Support multiple databases
- Include error handling
- Add performance monitoring

Subtasks:
- MBA-11: Create repository interfaces
- MBA-12: Implement UserRepository
- MBA-13: Implement PromptRepository
- MBA-14: Add dependency injection
- MBA-15: Write repository tests
```

---

## Benefits of This Workflow

### For Development

- Clear task tracking
- Better code organization
- Easier code reviews
- Cleaner git history

### For Management

- Visibility into progress
- Accurate time tracking
- Better sprint planning
- Clear deliverables

### For Team

- Reduced context switching
- Better collaboration
- Clear ownership
- Documented decisions

---

## Next Steps

1. **Create Phase 2 Epic in Jira**
2. **Break down into stories**
3. **Create feature branches**
4. **Follow new workflow**
5. **Track progress in Jira**

**Modern SDLC: ACTIVATED** ✅
