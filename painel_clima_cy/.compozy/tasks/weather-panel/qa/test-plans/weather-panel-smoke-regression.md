# Weather Panel Smoke and Regression Outline

## Purpose

This suite organizes Weather Panel MVP regression around user journeys, not isolated components. It is consumed by task_05 after the build is reachable and the QA execution session can capture browser evidence.

## Smoke Suite

**Duration:** 15-30 minutes  
**Frequency:** Every QA execution build before deeper testing  
**Pass rule:** Stop if any P0 journey cannot reach its goal observable.

| Order | Journey | Persona | Cases | Automation |
|---|---|---|---|---|
| 1 | J-01 Search ambiguous city and load correct forecast | New User | `SMOKE-001`, `TC-JOURNEY-001` | Manual-only / N/A, no browser E2E harness |
| 2 | J-04 Read forecast in preferred unit | Casual User | `TC-FUNC-001` | Manual-only / N/A |
| 3 | J-05 Recover from no results or unavailable weather | Recovering User | `TC-FUNC-002`, `TC-FUNC-003` | Manual-only / N/A |

## Targeted Regression Suite

**Duration:** 30-60 minutes  
**When:** Any change touching the weather panel, backend weather endpoints, API base URL handling, localization, geolocation, or layout.

| Priority | Journey | Why it is targeted |
|---|---|---|
| P0 | J-01 Search ambiguous city and load correct forecast | Covers the main product value and two-step `/places/search` to `/weather` behavior. |
| P0 | J-02 Use current location after explicit opt-in | Covers browser permission, `/places/reverse`, and normal weather rendering. |
| P0 | J-03 Deny location and continue with manual search | Covers privacy-conscious recovery and manual fallback. |
| P0 | J-05 Recover from no results or unavailable weather | Covers 404/502/generic failure and retry UX. |
| P1 canary | J-06 Run a reliable live demo with repeated cities | Detects stale state and presenter-facing regressions not obvious in a single happy path. |

## Full Regression Suite

**Duration:** 2-4 hours  
**When:** Release candidate or weekly demo-stability pass.

- Execute all P0 and P1 journeys from the test plan.
- Cover every persona listed in the plan at least once.
- Execute all six `TC-CFR-*` cases.
- Run all three exploratory charters if smoke and P0 journeys pass.
- Capture screenshots for entry, mid-flow decision points, errors, recovery, and goal states.

## Sanity Suite

**Duration:** 10-15 minutes  
**When:** Immediately after a hotfix.

- Rerun the fixed `BUG-*` reproduction first.
- Rerun the affected journey from the test plan.
- Rerun one adjacent journey:
  - Search/disambiguation fix: rerun J-04 unit toggle as canary.
  - Geolocation fix: rerun J-03 denial/manual fallback as canary.
  - Error/retry fix: rerun J-01 happy path as canary.

## Execution Order

1. Smoke suite.
2. P0 journeys.
3. P1 journey canary.
4. Exploratory charters.
5. CFR pass.

## Pass / Fail / Conditional Criteria

- **PASS:** Every P0 journey reaches its goal, at least 90% of P1 journeys reach goal, and no critical CFR finding remains open.
- **FAIL:** Any P0 journey fails to reach goal, any `Blocks-Completion` or `Data-Loss` bug is found, or a production-parity gap invalidates the session.
- **CONDITIONAL:** P1 friction has a documented workaround and a fix plan; cosmetic issues are batched outside release blocking.

## Automation Notes

No browser E2E harness exists in the repository. Do not mark these journeys as `E2E` until a browser runner is added and specs exist. Existing Vitest coverage is useful implementation evidence, but task_05 still needs real-user browser evidence for this plan.
