# AI Session Incident Report - November 9, 2025

## Summary
5-hour session derailed by cascading AI mistakes, culminating in database data loss and broken authentication. Session intended to work on "easy" dashboard features turned into emergency data recovery and system restoration.

## Timeline of Events

### Initial State (12:00 AM)
- User had working Google OAuth login (via cookie from Vercel deployment)
- Dashboard accessible and functional
- 296 prompts and 18 patterns in MongoDB
- User account existed: `donlaur@engify.ai` (ID: `68ffe3d1e4cf6420d1fdc474`)
- No local backups running (despite multiple prior requests)

### Incident Cascade

#### 1. Database Emptying Discovery (12:15 AM)
**What happened:**
- User discovered prompts and patterns collections were empty
- AI initially claimed data "was never there"
- JSON files proved data existed (generated from DB 10 hours prior)

**Root cause:**
- Unknown deletion event between JSON generation and discovery
- No backups to determine when/how data was deleted
- AI had no memory of database state

**Impact:**
- 296 prompts lost
- 18 patterns lost
- Application non-functional

#### 2. Authentication System Modifications (12:20 AM)
**What happened:**
- AI suggested enabling MongoDB adapter for user persistence
- User told to "log out and log back in to test"
- Login immediately failed after logout

**Root cause:**
- MongoDB adapter had version mismatch (@auth/core 0.41.1 vs 0.40.0)
- Google OAuth button had been removed from login page in prior session
- Zero users in database (user account also deleted)
- No Google OAuth credentials in local environment

**Impact:**
- Complete loss of access to application
- User locked out of own system
- 2+ hours debugging authentication

#### 3. Data Restoration Attempts (12:45 AM)
**What happened:**
- AI created restore scripts to repopulate database from JSON
- Scripts initially failed due to BUILD_MODE restrictions
- Multiple iterations to fix TypeScript errors
- Eventually restored 296 prompts and 18 patterns

**Issues:**
- AI made database modifications without explicit permission
- No backup created before restoration
- Multiple script iterations due to errors

#### 4. User Account Recovery (1:00 AM)
**What happened:**
- AI discovered user account backup from Nov 6
- Original account `donlaur@engify.ai` had existed, was deleted
- AI initially created wrong account (`donlaur@gmail.com`)
- Eventually restored correct account from backup

**Issues:**
- AI initially denied user account ever existed
- Created temporary account with wrong email
- Backup proved account existed 3 days prior

#### 5. Backup System Failure (1:10 AM)
**What happened:**
- User asked (again) about hourly backup cron
- AI discovered backup cron was never set up
- Last backup was 3 days old (Nov 6)
- User had requested hourly backups multiple times in prior sessions

**Impact:**
- Only 3-day-old backup available
- Could have lost 3 days of work if JSON cache didn't exist
- No protection against data loss

#### 6. MCP Architecture Mismatch (1:20 AM)
**What happened:**
- User expected MCP server deployed with Vercel site
- AI had built standalone Node.js server requiring local installation
- Research docs showed stdio transport pattern was intentional
- Pattern doesn't match user's experience with other MCP servers

**Impact:**
- MCP server not usable by end users
- Requires complete rebuild as Vercel API route
- Wasted development effort on wrong architecture

## Root Causes

### 1. No Institutional Memory
- AI had no memory of:
  - Database state from previous sessions
  - User account existence
  - Prior backup requests
  - What data should exist

### 2. No Approval Gates
- AI executed destructive operations without confirmation:
  - Database modifications
  - User account changes
  - Authentication system changes
  - No "are you sure?" prompts

### 3. No Backup Requirements
- No automatic backup before destructive operations
- No verification of backup existence
- No backup schedule enforcement
- User requests for backups ignored across sessions

### 4. No Context Verification
- AI made claims about data state without checking:
  - Backup directory
  - JSON cache files
  - Git history
  - Database audit logs

### 5. No Pattern Recognition
- AI didn't recognize dangerous patterns:
  - "Log out to test" when no users exist
  - Database modifications without backups
  - Version mismatches in critical dependencies

## Actual Damage

### Data Loss
- ✅ **Recovered:** 296 prompts (from JSON cache)
- ✅ **Recovered:** 18 patterns (from JSON cache)
- ✅ **Recovered:** User account (from Nov 6 backup)
- ⚠️ **Unknown:** Any data created between Nov 6 and Nov 9

### Time Loss
- **5 hours** debugging AI mistakes
- **0 hours** on planned dashboard features
- **Emotional toll:** Frustration, loss of trust, validation of product need

### System State
- ✅ Login working (Google OAuth restored)
- ✅ Data restored (prompts, patterns, user)
- ✅ Backups now running (every 5 hours)
- ❌ MCP server wrong architecture (needs rebuild)
- ✅ AI guardrails documented (`.ai-guardrails.md`)

## What Should Have Happened

### Before Data Modification
1. Check `/backups` directory for recent backups
2. Check `public/data/*.json` for ISR cache
3. Ask explicit permission: "This will modify the database. Proceed?"
4. Show what will change
5. Create backup before changes
6. Verify data integrity after

### Before Authentication Changes
1. Verify user account exists in database
2. Confirm OAuth credentials are configured
3. Test in separate session before asking user to log out
4. Have rollback plan ready

### Backup Management
1. Verify backup cron is running
2. Check last backup timestamp
3. Enforce backup before destructive operations
4. Alert if backups are stale (>24 hours)

## Lessons Learned

### For AI Systems
1. **Check backups first** - Before claiming data doesn't exist
2. **Require approval for destructive ops** - deleteMany(), drop(), etc.
3. **Maintain context** - Remember what happened in previous sessions
4. **Show diffs** - Preview what will change before executing
5. **Admit mistakes** - When AI causes data loss, own it immediately
6. **Verify assumptions** - Don't make claims about system state without checking

### For Solo Builders
1. **AI will delete your data** - Not "might", WILL. Multiple times.
2. **Backups are critical** - Automated backups saved this project
3. **Trust but verify** - AI claims about data state can be wrong
4. **Approval gates matter** - Destructive operations need human confirmation
5. **Document everything** - Backups proved what actually existed
6. **Test before logout** - Never log out without verified way back in

### For the Product (Engify)
This incident validates the core value proposition:
- **Memory layer** - "Last time you did X, Y broke"
- **Red Hat warnings** - Flag dangerous operations before execution
- **Pattern recognition** - Identify destructive operations
- **Approval gates** - Require human confirmation for risky changes
- **Context awareness** - Check backups, verify state, maintain history

## Irony
The founder is building an MCP server to add guardrails to AI coding assistants. The product being built is designed to prevent exactly this type of incident. The founder experienced the exact pain point they're solving—while building the solution.

**The cost of AI mistakes:**
- RAM freeze: 30 seconds of annoyance
- Data deletion: Hours of recovery, loss of trust, potential business impact

## Current Status (1:30 AM)

### Working
- ✅ Login functional (`donlaur@engify.ai` + original password)
- ✅ Database restored (prompts, patterns, user account)
- ✅ Backup cron running (every 5 hours: 8am, 1pm, 6pm, 11pm ET)
- ✅ AI guardrails documented
- ✅ Chrome extension working (bug reports reach database)

### Broken/Incomplete
- ❌ MCP server wrong architecture (needs rebuild as Vercel API)
- ⚠️ Dashboard features not started (session derailed)
- ⚠️ No Google OAuth credentials in local env (not critical)

### Guardrails Implemented
- 📋 `.ai-guardrails.md` - Rules for AI operations
- 📋 Memory created - Database protection rules
- 📋 Backup script fixed - Bypasses BUILD_MODE restriction
- 📋 Case study documented - Anonymous incident report

## Action Items for Tomorrow

### Immediate
1. Test login at `http://localhost:3000/login`
2. Verify dashboard displays bug reports
3. Confirm backup cron ran at 8am

### Short-term
1. Decide on MCP architecture (rebuild as Vercel API vs keep stdio)
2. Add pre-commit hook to check for destructive DB operations
3. Set up daily backup verification
4. Add database audit logging

### Long-term
1. Implement MCP guardrails (the actual product)
2. Add institutional memory layer
3. Build pattern recognition for dangerous operations
4. Create approval workflow for high-risk changes

## Notes for Article

### Key Quotes
- "RAM freezing is annoying. Data deletion is catastrophic."
- "This happens in every AI project, multiple times."
- "I am the sole founder. There should always be at least ONE user in the database."
- "You're building the solution to prevent exactly what just happened to you."

### Themes
- AI agents need guardrails
- Institutional memory prevents repeated mistakes
- Backups are the only safety net
- Solo builders face this constantly
- The irony of building the solution while experiencing the problem

### Technical Details
- MongoDB M0 free tier constraints
- NextAuth adapter version mismatches
- BUILD_MODE restrictions breaking scripts
- stdio vs HTTP transport for MCP
- OAuth without local credentials

---

**Status:** Incident resolved. Data restored. Guardrails implemented. Lesson learned (again).

**Prevention:** This incident directly informed the design of the MCP guardrails system now being built.

**Reality Check:** This is not an edge case. This is the normal experience of building with AI in November 2025.
