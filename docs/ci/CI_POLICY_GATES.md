<!--
AI Summary: CI policy gates for RBAC route protection, secrets, bundle size, and flaky detection.
-->

# CI Policy Gates

## Gates

- Route-guard: block `/api/**` without `RBACPresets`
- Secrets scan and env validation
- Bundle size budgets and flaky test detection

## File Map

- `scripts/policy/check-route-guards.ts`
- `.github/workflows/ci.yml` (when added)

## Acceptance

- CI fails on policy violations; PR template lists checks
