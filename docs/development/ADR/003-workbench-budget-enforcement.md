# ADR 003: Workbench Tool Budget Enforcement

**Status**: Accepted  
**Date**: 2025-10-31  
**Decision Makers**: Engineering Team  
**Related**: Day 5 Phase 5, `src/lib/workbench/contracts.ts`

---

## Context

Workbench tools execute AI models on user input, with costs ranging from $0.001 to $0.50+ per execution. Without budget controls:
- Users could accidentally trigger expensive multi-model comparisons
- Malicious actors could drain API budgets through repeated calls
- No visibility into per-tool cost attribution

---

## Decision

Implement **per-tool budget contracts** with deterministic cost/token limits enforced at the API layer.

### Architecture

```typescript
// Contract definition
interface WorkbenchToolContract {
  toolId: string;
  version: number;
  maxCostCents: number;        // Hard limit per execution
  maxTotalTokens: number;      // Secondary limit
  costPerTokenCents: number;   // Fallback pricing
  replayWindowMinutes: number; // Replay protection
}

// Enforcement in /api/v2/ai/execute
1. Check if toolId provided
2. Load contract for tool
3. Start WorkbenchRun record (status: pending)
4. Execute AI provider
5. Check cost THEN tokens against contract limits
6. Return 403 if budget exceeded
7. Complete WorkbenchRun (status: success/budget_exceeded/error)
```

### Contract Storage

Store in MongoDB `workbench_runs` collection:
- Enables audit trail of all executions
- Supports cost attribution per tool/user
- Allows replay detection via unique `runId`

---

## Alternatives Considered

### 1. No Budget Enforcement
**Pros**: Simpler implementation  
**Cons**: 
- Uncontrolled costs
- No accountability
- Vulnerable to abuse

**Rejected**: Too risky for production

### 2. Global Budget Pool
**Pros**: Flexible spending  
**Cons**:
- One expensive tool could drain entire budget
- No per-tool cost visibility
- Hard to identify cost anomalies

**Rejected**: Lacks granular control

### 3. Pre-Purchase Credits
**Pros**: Guaranteed budget caps  
**Cons**:
- Poor UX (users must buy credits first)
- Adds billing complexity
- Friction for experimentation

**Rejected**: Too much friction for free tier

### 4. Rate Limiting Only
**Pros**: Simple to implement  
**Cons**:
- Doesn't prevent expensive single calls
- No cost visibility
- Users hit limits unpredictably

**Rejected**: Doesn't address cost control

---

## Selected Approach: Per-Tool Contracts

**Pros**:
- ✅ Predictable costs per tool
- ✅ Budget enforcement before execution
- ✅ Full audit trail in database
- ✅ Replay protection prevents duplicate charges
- ✅ Cost/token dual limits (whichever hits first)
- ✅ Versioned contracts allow gradual rollout

**Cons**:
- ⚠️ Adds complexity to execute route
- ⚠️ Requires contract maintenance per tool
- ⚠️ Contract changes require code deployment

**Mitigations**:
- Contract definitions centralized in single file
- Tests verify budget enforcement
- Monitoring alerts on budget breaches

---

## Implementation Details

### Contract Limits (Initial Values)

```typescript
'prompt-optimizer': {
  maxCostCents: 75,      // $0.75 max
  maxTotalTokens: 3500,  // ~1500 input + 2000 output
}

'model-comparison': {
  maxCostCents: 150,     // $1.50 max (4 models @ $0.375 each)
  maxTotalTokens: 6000,
}

'multi-agent': {
  maxCostCents: 250,     // $2.50 max (complex multi-turn)
  maxTotalTokens: 8000,
}
```

### Replay Protection

- Replay detection via unique `runId` (UUID)
- Returns 409 Conflict if `runId` already exists
- Prevents duplicate charges from browser retries
- Time-based expiry not yet implemented (checks existence only)

### Cost Calculation Priority

1. **Primary**: Use provider-reported cost (`response.cost.total`)
2. **Fallback**: Calculate from tokens × `costPerTokenCents`
3. **Guard**: Reject if cost > `maxCostCents` OR tokens > `maxTotalTokens`

---

## Consequences

### Positive

- **Cost Predictability**: Each tool has known maximum cost
- **Attribution**: Track which tools drive costs
- **Security**: Prevents budget drain attacks
- **UX**: Users see budget limits upfront
- **Monitoring**: RED metrics track per-tool usage

### Negative

- **Maintenance**: Must update contracts when pricing changes
- **Rigidity**: Can't dynamically adjust limits per user tier (yet)
- **Complexity**: Added code in execution path

### Neutral

- **Database Growth**: WorkbenchRun records grow with usage
  - Mitigation: Add TTL or archival policy (90 days)

---

## Success Metrics

- ✅ Zero budget overruns in production
- ✅ <1% of executions hit budget limits (indicates limits are reasonable)
- ✅ Replay detection rate <5% (indicates good UX, not excessive retries)
- ✅ Cost attribution enables tool ROI analysis

---

## Future Enhancements

1. **Per-User Overrides**: Allow premium users higher budgets
2. **Dynamic Pricing**: Fetch real-time pricing from provider APIs
3. **Budget Pooling**: Shared budget across tools with priority queue
4. **Time-Based Replay**: Expire replay protection after `replayWindowMinutes`
5. **Contract Versioning**: A/B test different budget levels

---

## References

- Implementation: `src/lib/workbench/contracts.ts`
- Schema: `src/lib/db/schema.ts` (WorkbenchRunSchema)
- Enforcement: `src/app/api/v2/ai/execute/route.ts`
- Tests: `src/app/api/v2/ai/execute/__tests__/route.test.ts`
- Related ADR: [002 - AI Provider Factory Pattern](./002-ai-provider-factory-pattern.md)

