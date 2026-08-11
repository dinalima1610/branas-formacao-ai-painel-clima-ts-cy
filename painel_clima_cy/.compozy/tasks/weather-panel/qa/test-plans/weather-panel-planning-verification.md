# Weather Panel Planning Verification Checklist

**Date:** 2026-05-22  
**Scope:** qa-report planning artifacts only; no browser execution performed.

## Required Artifact Checks

- [x] `qa/test-plans/weather-panel-test-plan.md` exists and includes Executive Summary, Personas Covered, Journeys Mapped, Charters Planned, CFR Scope, Test Strategy, Automation Strategy, Entry Criteria, Exit Criteria, Retesting vs Regression, and Risk Assessment.
  - Evidence: `weather-panel-test-plan.md`.
- [x] At least one `TC-FUNC-*` or `TC-JOURNEY-*` documents ambiguous city name to disambiguation to correct place weather.
  - Evidence: `TC-JOURNEY-001`.
- [x] At least one `TC-*` covers geolocation allowed path and one covers denied path with manual search still usable.
  - Evidence: `TC-JOURNEY-002`, `TC-JOURNEY-003`.
- [x] At least one `TC-*` covers Celsius/Fahrenheit toggle affecting current, hourly, and daily displayed values.
  - Evidence: `TC-FUNC-001`.
- [x] At least one `TC-*` covers no search results and one covers upstream/availability failure with retry affordance.
  - Evidence: `TC-FUNC-002`, `TC-FUNC-003`.
- [x] Every generated `TC-*` and `SMOKE-*` includes Priority, Persona, numbered steps with `Expected:`, and Automation Target/Status.
  - Evidence: custom completeness check passed for 14 test cases.
- [x] At least one `TC-CFR-*` exists for each CFR category declared in scope.
  - Evidence: `TC-CFR-001` through `TC-CFR-006`.
- [x] Directory structure exists under `.compozy/tasks/weather-panel/qa/`.
  - Evidence: `test-plans/`, `test-plans/charters/`, `test-cases/`, `issues/`, `screenshots/`.

## Traceability Checks

- [x] Every persona referenced in the plan has at least one `TC-*`.
  - New User: `SMOKE-001`, `TC-JOURNEY-001`, `TC-CFR-006`.
  - Casual User: `TC-FUNC-001`, `TC-FUNC-002`, `TC-CFR-001`.
  - Mobile User: `TC-JOURNEY-002`, `TC-CFR-003`, `TC-CFR-004`.
  - Accessibility-Reliant: `TC-CFR-002`.
  - Recovering User: `TC-JOURNEY-003`, `TC-FUNC-003`, `TC-CFR-005`.
  - Power User: `TC-PERSONA-001`.
- [x] Every mapped journey has at least one `TC-*`.
  - J-01: `SMOKE-001`, `TC-JOURNEY-001`.
  - J-02: `TC-JOURNEY-002`.
  - J-03: `TC-JOURNEY-003`.
  - J-04: `TC-FUNC-001`.
  - J-05: `TC-FUNC-002`, `TC-FUNC-003`.
  - J-06: `TC-PERSONA-001`.
- [x] Documentation review found no `TC-INT`, `TC-SEC`, `TC-PERF`, or `TC-API` files or references as generated test-case types.

## Automation Annotation Check

- [x] No case is marked as existing E2E coverage.
- [x] Browser journey cases are marked `Manual-only` / `N/A` because repository scan found Vitest tests but no Playwright, Cypress, WebDriver, Puppeteer, or equivalent browser E2E harness.

## Handoff Notes for task_05

- Execute qa-execution against `.compozy/tasks/weather-panel/qa/`.
- Produce browser evidence and verification report at `.compozy/tasks/weather-panel/qa/verification-report.md`.
- File any findings under `.compozy/tasks/weather-panel/qa/issues/`.
