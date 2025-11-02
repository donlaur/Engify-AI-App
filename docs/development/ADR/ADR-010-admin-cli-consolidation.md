# ADR 010: Admin CLI Consolidation

**Date:** 2025-11-02  
**Status:** ✅ Accepted  
**Deciders:** Engineering Team  
**Related:** Day 7 Phase 5, Code Quality Improvements

---

## Context

**Current State:**

- 10+ one-off admin scripts scattered across `scripts/admin/`
- Each script does one thing
- No unified interface
- Hard to discover commands
- Duplicate code patterns

**Example Scripts:**

```bash
scripts/admin/
├── check-prompts-count.js
├── check-today-content.js
├── check-content-length.js
├── check-beta-requests.js
├── review-prompts.ts
├── ensure-text-indexes.ts
└── ... (10+ more)
```

**Problem:**

- **Discoverability** - Hard to find what exists
- **Maintenance** - Duplicate code, hard to update
- **Consistency** - Each script has different patterns
- **Documentation** - Hard to document scattered scripts
- **UX** - No unified command interface

---

## Decision Drivers

1. **DRY Principle** - Don't Repeat Yourself
2. **Maintainability** - Easier to update one tool
3. **Discoverability** - Single entry point for all admin tasks
4. **Consistency** - Unified patterns and error handling
5. **Professionalism** - Enterprise-grade admin tooling

---

## Decision

**Consolidate admin scripts into unified CLI tool**

### Structure

```
scripts/admin/
├── index.ts          # Main CLI entry point
├── commands/
│   ├── stats.ts      # Database stats
│   ├── content.ts    # Content management
│   ├── users.ts      # User management
│   ├── prompts.ts    # Prompt management
│   └── audit.ts      # Audit log queries
└── utils/
    ├── db.ts         # Database helpers
    └── format.ts     # Output formatting
```

### Command Interface

```bash
# Unified interface
pnpm admin <command> [options]

# Examples
pnpm admin stats                  # Show all stats
pnpm admin stats --prompts        # Show prompt stats only
pnpm admin content list           # List all content
pnpm admin content review         # Review content
pnpm admin prompts count          # Count prompts
pnpm admin users list             # List users
pnpm admin audit recent           # Recent audit logs
```

---

## Implementation Strategy

### Phase 1: Create Unified CLI (Day 7)

**Main Entry Point:**

```typescript
// scripts/admin/index.ts
#!/usr/bin/env tsx

import { Command } from 'commander';
import { statsCommand } from './commands/stats';
import { contentCommand } from './commands/content';
import { usersCommand } from './commands/users';
import { promptsCommand } from './commands/prompts';
import { auditCommand } from './commands/audit';

const program = new Command();

program
  .name('admin')
  .description('Engify.ai Admin CLI')
  .version('1.0.0');

program.addCommand(statsCommand);
program.addCommand(contentCommand);
program.addCommand(usersCommand);
program.addCommand(promptsCommand);
program.addCommand(auditCommand);

program.parse();
```

**Commands:**

```typescript
// scripts/admin/commands/stats.ts
import { Command } from 'commander';
import { getStats } from '@/lib/stats-cache';

export const statsCommand = new Command('stats')
  .description('Show database statistics')
  .option('--prompts', 'Show prompt stats only')
  .option('--patterns', 'Show pattern stats only')
  .option('--users', 'Show user stats only')
  .action(async (options) => {
    const stats = await getStats();

    if (options.prompts) {
      console.log(`Total Prompts: ${stats.totalPrompts}`);
      console.log(`Categories: ${stats.categories}`);
      console.log(`Roles: ${stats.roles}`);
    } else {
      // Show all stats
      console.table(stats);
    }
  });
```

### Phase 2: Migrate Existing Scripts

**Migration Strategy:**

1. **Identify patterns** - Group similar scripts
2. **Extract common code** - Create shared utilities
3. **Create commands** - One command per script group
4. **Test thoroughly** - Ensure parity
5. **Deprecate old scripts** - Mark for deletion

**Example Migration:**

```typescript
// OLD: scripts/admin/check-prompts-count.js
// NEW: pnpm admin stats --prompts

// OLD: scripts/admin/review-prompts.ts
// NEW: pnpm admin prompts review
```

### Phase 3: Add New Commands

**Planned Commands:**

- `pnpm admin content` - Content management
- `pnpm admin users` - User management
- `pnpm admin audit` - Audit log queries
- `pnpm admin taxonomy` - Taxonomy management
- `pnpm admin seeds` - Database seeding

---

## Alternatives Considered

### Alternative 1: Keep Scattered Scripts (Status Quo)

**Pros:**

- Simple, no changes needed
- Scripts work independently

**Cons:**

- Hard to discover
- Duplicate code
- Inconsistent patterns
- Poor UX

**Verdict:** ❌ Rejected - Not scalable

### Alternative 2: Separate CLI Package

**Pros:**

- Better separation of concerns
- Can publish separately
- Version independently

**Cons:**

- More complex setup
- Overkill for current needs
- Extra maintenance

**Verdict:** ⚠️ Future Consideration - Not needed now

### Alternative 3: Web-Based Admin UI Only

**Pros:**

- Better UX for non-technical users
- Visual interface
- No CLI needed

**Cons:**

- Doesn't help automation
- Still need CLI for scripts
- More complex to build

**Verdict:** ⚠️ Complementary - Both needed

---

## Chosen Solution: Unified CLI

### Current Commands

**Stats Command:**

```bash
pnpm admin stats                    # All stats
pnpm admin stats --prompts          # Prompt stats only
pnpm admin stats --patterns         # Pattern stats only
pnpm admin stats --users            # User stats only
```

**Content Command:**

```bash
pnpm admin content list             # List all content
pnpm admin content review           # Review content
pnpm admin content generate         # Generate content
```

**Prompts Command:**

```bash
pnpm admin prompts count            # Count prompts
pnpm admin prompts review           # Review prompts
pnpm admin prompts audit            # Audit prompts
```

### Benefits

1. **Discoverability**

   ```bash
   pnpm admin --help  # Shows all commands
   ```

2. **Consistency**
   - Unified error handling
   - Consistent output format
   - Shared utilities

3. **DRY**
   - Common code extracted
   - Reusable patterns
   - Easier to maintain

4. **Documentation**
   - Single place to document
   - Auto-generated help
   - Clear examples

---

## Trade-offs

### Advantages

1. **Maintainability**
   - One place to update
   - Less duplicate code
   - Easier refactoring

2. **Discoverability**
   - `pnpm admin --help` shows all
   - Clear command structure
   - Better onboarding

3. **Consistency**
   - Unified patterns
   - Shared utilities
   - Better error handling

4. **Professionalism**
   - Enterprise-grade tooling
   - Better UX
   - Scalable architecture

### Disadvantages

1. **Migration Effort**
   - Need to migrate existing scripts
   - Testing required
   - Risk of breaking changes

2. **Complexity**
   - More complex than scripts
   - Requires CLI framework
   - More code to maintain

3. **Learning Curve**
   - Team needs to learn new interface
   - Different from simple scripts
   - Documentation required

### Mitigation

**Migration:**

- Migrate incrementally
- Keep old scripts during transition
- Test thoroughly
- Document migration path

**Complexity:**

- Use simple CLI framework (commander.js)
- Keep commands simple
- Extract common code

**Learning:**

- Good documentation
- Clear examples
- Help text in CLI
- Team training

---

## Decision Outcome

**Status:** ✅ Accepted and Partially Implemented

**Current State:**

- ✅ `pnpm admin:stats` - Unified stats tool
- ✅ `pnpm admin:review-prompts` - Prompt management
- ⏳ Migrate remaining scripts
- ⏳ Add new commands

**Success Criteria:**

- ≤ 5 admin commands (vs. 10+ scripts)
- All admin tasks accessible via CLI
- Zero duplicate code
- Documentation complete

**Review Date:** 2025-11-09 (1 week)

---

## References

- [Day 7 Plan](../../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)
- [Code Quality Review](../../architecture/CODE_QUALITY_REVIEW.md)
- [Git Workflow](./GIT_WORKFLOW.md)

---

## Notes

**Future Enhancements:**

1. Add interactive mode (`pnpm admin interactive`)
2. Add command aliases
3. Add command history
4. Add output formatting (JSON, CSV, table)
5. Add command completion (bash/zsh)

**Related ADRs:**

- ADR 009: Pattern-Based Bug Fixing
- ADR 011: Frontend Component Architecture

---

**Last Updated:** 2025-11-02  
**Authors:** Donnie Laur, AI Assistant  
**Tags:** #tooling #cli #admin #dry #day7
