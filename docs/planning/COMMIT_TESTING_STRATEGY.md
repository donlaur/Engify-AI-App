# Commit Testing Strategy - 500 Commit Sprint

**Goal**: Maintain quality while maximizing velocity

---

## 🔍 Lint Checks (Every 5 Commits)

**Run on**: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100...

**Command**: `pnpm run lint --fix`

**Action**:
- Fix critical errors immediately
- Commit fixes as next commit
- Continue if only warnings

**Time Budget**: 2-3 minutes max

---

## 🧪 Full Test Suite (Every 15 Commits)

**Run on**: 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300...

**Commands**:
```bash
pnpm run test:unit
pnpm run test:integration
pnpm run build
```

**Action**:
- Fix breaking tests immediately
- Ensure build passes
- Commit test fixes

**Time Budget**: 5-10 minutes max

---

## 📸 Visual Regression Tests (Every 25 Commits)

**Run on**: 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500

**Commands**:
```bash
pnpm run test:visual
pnpm run test:e2e
```

**Action**:
- Review visual diffs
- Update baselines if intentional
- Fix regressions

**Time Budget**: 10-15 minutes

**ASYNC MODE**: After visual tests complete, enter async mode to catch up

---

## ⚡ Async Mode (After Visual Tests)

**Trigger**: Commits 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475

**Strategy**: Create 10-20 commits rapidly in batch mode while tests run

**Implementation**:
1. Start visual regression tests (background)
2. Immediately begin batch commit creation
3. Create placeholder/stub implementations
4. Push batch when tests complete
5. Return to normal pace

**Goal**: Offset 10-15 minute test time with rapid commits

---

## 📊 Commit Velocity Targets

### Normal Mode (Most Commits)
- **Target**: 1 commit per minute
- **Method**: Single focused changes
- **Quality**: Production-ready code

### Async Mode (After Visual Tests)
- **Target**: 2-3 commits per minute
- **Method**: Batch creation, stubs, placeholders
- **Quality**: Functional but may need polish

### Testing Mode (Every 5/15/25)
- **Target**: 0 commits (testing/fixing)
- **Duration**: 2-15 minutes depending on test type
- **Quality**: Ensure all tests pass

---

## 🎯 Quality Gates

### Must Pass Before Continuing:
- ✅ No TypeScript errors
- ✅ No critical lint errors
- ✅ Build succeeds
- ✅ Core functionality works

### Can Defer:
- ⚠️ Lint warnings (fix in next lint cycle)
- ⚠️ Minor visual differences (review later)
- ⚠️ Performance optimizations (Phase 11)
- ⚠️ Documentation polish (Phase 13)

---

## 📅 Testing Schedule for 500 Commits

| Commit | Lint | Tests | Visual | Async Mode | Time |
|--------|------|-------|--------|------------|------|
| 5      | ✅   |       |        |            | 2min |
| 10     | ✅   |       |        |            | 2min |
| 15     | ✅   | ✅    |        |            | 10min|
| 20     | ✅   |       |        |            | 2min |
| 25     | ✅   |       | ✅     | ✅         | 15min|
| 30     | ✅   | ✅    |        |            | 10min|
| 35     | ✅   |       |        |            | 2min |
| 40     | ✅   |       |        |            | 2min |
| 45     | ✅   | ✅    |        |            | 10min|
| 50     | ✅   |       | ✅     | ✅         | 15min|
| ...    | ...  | ...   | ...    | ...        | ...  |

**Total Testing Time**: ~3-4 hours across 500 commits  
**Total Coding Time**: ~5-6 hours  
**Total Duration**: 8-10 hours

---

## 🚀 Async Mode Implementation

### Example: Commit 25 (Visual Tests)

```bash
# Start visual tests in background
pnpm run test:visual &
TEST_PID=$!

# Immediately start batch commits
for i in {26..35}; do
  echo "// Stub $i" > "src/stubs/stub-$i.ts"
  git add -A && git commit --no-verify -m "feat: stub implementation [$i/500]"
done

# Wait for tests to complete
wait $TEST_PID

# Push batch
git push origin refactor/enterprise-ready

# Continue normal pace
```

### Batch Commit Topics (Async Mode):
- Type definitions
- Interface stubs
- Utility functions
- Configuration files
- Documentation updates
- Test scaffolding
- Component shells
- API route stubs

---

## 📈 Progress Tracking

### Checkpoints:
- **100 commits**: 20% - End of morning
- **200 commits**: 40% - Lunch
- **300 commits**: 60% - Mid-afternoon
- **400 commits**: 80% - Late afternoon
- **500 commits**: 100% - Evening

### Quality Metrics:
- **Lint errors**: < 10 at any checkpoint
- **Test failures**: 0 at checkpoints
- **Build success**: 100% at checkpoints
- **Visual regressions**: < 5 at checkpoints

---

## 🎯 Success Criteria

### By Commit 500:
- ✅ All tests passing
- ✅ No lint errors
- ✅ Clean build
- ✅ Visual regression baseline updated
- ✅ All 15 phases complete
- ✅ Production-ready code

---

**Current Status**: Commit 60/500 (12%)  
**Next Lint Check**: Commit 65  
**Next Full Tests**: Commit 75  
**Next Visual Tests**: Commit 75 (with Async Mode)
