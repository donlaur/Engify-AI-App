# RICE Scoring Framework for Engify.ai

**Purpose**: Data-driven feature prioritization  
**Formula**: `RICE Score = (Reach × Impact × Confidence) / Effort`  
**Updated**: October 29, 2025

---

## Scoring Guidelines

### Reach (Number)

How many users will this affect per month?

| Estimate   | Score        | Example              |
| ---------- | ------------ | -------------------- |
| All users  | 10,000+      | Core feature change  |
| Most users | 5,000-10,000 | New pattern category |
| Many users | 1,000-5,000  | Level 3-4 feature    |
| Some users | 100-1,000    | Level 5 feature      |
| Few users  | <100         | Edge case fix        |

### Impact (Scale)

How much will this move the needle on key metrics?

| Level   | Score | Definition                 | Example                 |
| ------- | ----- | -------------------------- | ----------------------- |
| Massive | 3.0   | Transforms core value prop | Agent mode (delegation) |
| High    | 2.0   | Significant improvement    | GitHub integration      |
| Medium  | 1.0   | Noticeable improvement     | New pattern category    |
| Low     | 0.5   | Minor improvement          | UI polish               |
| Minimal | 0.25  | Barely noticeable          | Small bug fix           |

### Confidence (Percentage)

How certain are we about Reach and Impact estimates?

| Level   | Score | Data Quality          | Example                        |
| ------- | ----- | --------------------- | ------------------------------ |
| High    | 100%  | User research + data  | Feature requested by 50+ users |
| Medium  | 80%   | Some data or research | Competitive analysis           |
| Low     | 50%   | Intuition/hypothesis  | Experimental feature           |
| Too Low | <50%  | Pure speculation      | Don't prioritize               |

### Effort (Person-Months)

Total work required from all teams (product, design, engineering)

| Estimate   | Score | Description                                     |
| ---------- | ----- | ----------------------------------------------- |
| Trivial    | 0.25  | Few hours, one person                           |
| Small      | 0.5   | Few days, one person                            |
| Medium     | 1.0   | One month, one person                           |
| Large      | 2.0   | Two months, one person OR one month, two people |
| Very Large | 4.0+  | Multiple months, multiple people                |

---

## Current Backlog Scoring

### High Priority (RICE > 50)

| Feature                     | Reach  | Impact | Confidence | Effort | RICE       | Status  |
| --------------------------- | ------ | ------ | ---------- | ------ | ---------- | ------- |
| Developer Workflow Patterns | 5,000  | 2.0    | 80%        | 1.0    | **8,000**  | Planned |
| Input Validation (Security) | 10,000 | 2.0    | 100%       | 0.5    | **40,000** | Planned |
| RICE Calculator Tool        | 100    | 1.0    | 100%       | 0.25   | **400**    | Backlog |

### Medium Priority (RICE 10-50)

| Feature               | Reach | Impact | Confidence | Effort | RICE      | Status   |
| --------------------- | ----- | ------ | ---------- | ------ | --------- | -------- |
| Prompt History/Memory | 8,000 | 1.0    | 80%        | 2.0    | **3,200** | Backlog  |
| Agent Mode Toggle     | 5,000 | 3.0    | 50%        | 4.0    | **1,875** | Research |
| GitHub Integration    | 3,000 | 2.0    | 80%        | 3.0    | **1,600** | Backlog  |

### Low Priority (RICE < 10)

| Feature            | Reach  | Impact | Confidence | Effort | RICE      | Status  |
| ------------------ | ------ | ------ | ---------- | ------ | --------- | ------- |
| Dark Mode          | 10,000 | 0.25   | 100%       | 0.5    | **5,000** | Backlog |
| Custom Themes      | 500    | 0.5    | 80%        | 1.0    | **200**   | Backlog |
| Advanced Analytics | 100    | 1.0    | 50%        | 2.0    | **25**    | Backlog |

---

## How to Use This Template

### For New Features

1. Fill out each component (Reach, Impact, Confidence, Effort)
2. Calculate RICE score
3. Add to appropriate priority tier
4. Review in weekly planning meeting

### For Quarterly Planning

1. Re-score all features (estimates change as we learn)
2. Sort by RICE score descending
3. Draw line at team capacity
4. Features above line = roadmap
5. Features below line = backlog

### Red Flags

- **High Effort + Low Confidence**: Research first, don't build
- **High Impact + Low Reach**: Might be wrong market
- **Low RICE but CEO wants it**: Document decision, track separately

---

## Example Calculation

**Feature**: Developer Workflow Patterns

```
Reach: 5,000 developers will use this per month
Impact: 2.0 (High - expands TAM, new market segment)
Confidence: 80% (Have user research, competitive analysis)
Effort: 1.0 person-month (Design patterns, test, document)

RICE = (5,000 × 2.0 × 0.80) / 1.0
RICE = 8,000 / 1.0
RICE = 8,000 ✅ HIGH PRIORITY
```

---

## Scoring History

| Date       | Feature            | RICE   | Decision | Outcome |
| ---------- | ------------------ | ------ | -------- | ------- |
| 2025-10-29 | Developer Patterns | 8,000  | Build    | TBD     |
| 2025-10-29 | Input Validation   | 40,000 | Build    | TBD     |

---

## Notes

- Review and update scores monthly
- Track actual vs. estimated impact
- Improve estimation over time
- Don't let RICE override critical security/compliance work
- Use alongside qualitative factors (strategic fit, technical debt, etc.)

---

**Owner**: Product Team  
**Review Cadence**: Monthly  
**Next Review**: November 29, 2025
