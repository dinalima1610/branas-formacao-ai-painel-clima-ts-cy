---
status: completed
title: Real-user QA plan (qa-report skill)
type: docs
complexity: medium
dependencies:
  - task_03
---

# Task 04: Real-user QA plan (qa-report skill)

## Overview

Produce the real-user QA planning deliverables for the Weather Panel MVP by following the **qa-report** agent skill end-to-end: journey-centric test plan, personas and journeys coverage, exploratory charter drafts, prioritized test cases (TC-FUNC, TC-JOURNEY, TC-CFR, SMOKE, etc.), and a journey-driven regression tier outline. Artifacts must land under the shared `qa/` tree so **qa-execution** can consume them unchanged. This task is documentation and planning only—no browser execution yet.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — verification uses checklist-style evidence (artifact completeness, traceability), not application unit tests
</critical>

<requirements>
- MUST invoke the **qa-report** skill workflow with **`qa-output-path`** set to **`.compozy/tasks/weather-panel`** (creates `.compozy/tasks/weather-panel/qa/` per skill)
- MUST create the directory layout under that path: `qa/test-plans/`, `qa/test-plans/charters/`, `qa/test-cases/`, `qa/issues/`, `qa/screenshots/` (empty dirs acceptable until execution)
- MUST read **in full** before writing deliverables: `references/journey_test_plans.md`, `references/test_case_templates.md`, and (as required by the skill router) persona and journey reference files under `qa-execution/references/` when producing persona/journey content
- MUST write a journey-centric test plan to `qa/test-plans/weather-panel-test-plan.md` with mandatory sections per `references/journey_test_plans.md` (executive summary, personas covered, journeys mapped, charters planned, CFR scope, test strategy, automation strategy, entry/exit criteria, retesting vs regression, risk assessment, timeline)
- MUST generate individual test case files under `qa/test-cases/` using TC-* IDs and required fields per `references/test_case_templates.md` (Priority, Persona, Objective, Preconditions, Real-User Conditions, numbered steps with **Expected:** per step, Edge Cases, Automation Target/Status/Notes)
- MUST cover PRD P0 flows: city search, disambiguation, current + 24h + daily forecast, °C/°F toggle, opt-in geolocation → reverse → weather, loading/error/retry in PT-BR
- MUST include at least one **TC-CFR-*** per CFR category affected by the panel (per qa-report Step 3 CFR scope and skill completeness checks)
- MUST map automation annotations honestly: mark E2E only if the repo has a harness; otherwise `Manual-only` or `Blocked` with reason per skill
- SHOULD include a smoke/regression slice document or section referencing journey tiers per `references/regression_testing.md` when building a regression outline
- MUST NOT file integration-only (TC-INT), security (TC-SEC), or performance (TC-PERF) cases—those stay in code/CI per skill routing
- SHOULD cross-check completeness against `qa-execution/references/checklist.md` before handoff to task_05
</requirements>

## Subtasks
- [x] 4.1 Resolve `qa-output-path`, create `qa/` subtree, and read qa-report reference templates in full
- [x] 4.2 Draft `weather-panel-test-plan.md` with journey-level risks and entry/exit criteria for MVP
- [x] 4.3 Author prioritized TC-* files for P0 journeys (search → disambiguation → forecast, geolocation, errors, unit toggle)
- [x] 4.4 Add charter draft(s) under `qa/test-plans/charters/` for exploratory coverage (mobile, network, recovery)
- [x] 4.5 Run completeness validation per qa-report Step 8 (persona, journey, CFR, automation traceability)

## Implementation Details

Execute **only** the **qa-report** skill procedure—not **qa-execution**. Ground scenarios in `.compozy/tasks/weather-panel/_prd.md` (user stories, edge cases, success metrics), `_techspec.md` (API contract, two-step flow), and ADRs 001–005.

Shared layout contract (from qa-report SKILL.md):

```text
.compozy/tasks/weather-panel/qa/
├── test-plans/
│   └── charters/
├── test-cases/
├── issues/
└── screenshots/
```

Reference skill path: `.agents/skills/qa-report/SKILL.md`. Template sources: `.agents/skills/qa-report/references/`.

### Relevant Files
- `.agents/skills/qa-report/SKILL.md` — Procedure router, output structure, completeness rules
- `.agents/skills/qa-report/references/journey_test_plans.md` — Test plan document structure and entry/exit criteria
- `.agents/skills/qa-report/references/test_case_templates.md` — TC variant fields and Automation Metadata
- `.agents/skills/qa-report/references/regression_testing.md` — Suite tiers when documenting regression scope
- `.agents/skills/qa-execution/references/user-personas.md` — Canonical personas for TC-PERSONA / plan narrative
- `.agents/skills/qa-execution/references/journey-maps.md` — Journey anatomy for TC-JOURNEY and plan mapping
- `.compozy/tasks/weather-panel/_prd.md` — MVP scope and acceptance language for test objectives
- `.compozy/tasks/weather-panel/_techspec.md` — Behavioral constraints (backend-only weather, two-step API)

### Dependent Files
- `.compozy/tasks/weather-panel/qa/test-cases/*.md` — Consumed by task_05 (qa-execution) for session execution order
- `.compozy/tasks/weather-panel/qa/test-plans/weather-panel-test-plan.md` — Entry criteria reference for QA execution

### Related ADRs
- [ADR-001](../adrs/adr-001.md) — MVP UX scope for journey selection
- [ADR-002](../adrs/adr-002.md) — Two-step API influences journey branches (search vs weather)
- [ADR-005](../adrs/adr-005.md) — Geolocation journey must use reverse flow before weather

## Deliverables
- `.compozy/tasks/weather-panel/qa/test-plans/weather-panel-test-plan.md` (journey-centric test plan)
- Minimum set of `qa/test-cases/TC-*.md` files covering P0 Weather Panel journeys and CFRs
- Optional `qa/test-plans/weather-panel-smoke-regression.md` or embedded regression tier section per regression reference
- `qa/test-plans/charters/CH-*.md` charter draft(s) for exploratory sessions
- Verification checklist completed (see Tests) **(REQUIRED)**

## Tests
- Unit tests:
  - N/A — this task produces QA documentation, not application code
- Integration tests:
  - N/A — browser execution belongs to task_05
- Planning verification (must all pass before marking task completed):
  - [ ] `qa/test-plans/weather-panel-test-plan.md` exists and includes Executive Summary, Personas Covered, Journeys Mapped, Charters Planned, CFR Scope, Test Strategy, Automation Strategy, Entry Criteria, Exit Criteria, Retesting vs Regression, Risk Assessment
  - [ ] At least one **TC-FUNC-*** or **TC-JOURNEY-*** documents ambiguous city name → disambiguation → correct place weather
  - [ ] At least one **TC-*** covers geolocation allowed path and one covers denied path with manual search still usable
  - [ ] At least one **TC-*** covers °C/°F toggle affecting current, hourly, and daily displayed values
  - [ ] At least one **TC-*** covers no search results and one covers upstream/availability failure with retry affordance
  - [ ] Every generated TC-* includes Priority, Persona, numbered steps with **Expected:** per step, and Automation Target/Status
  - [ ] At least one **TC-CFR-*** exists for each CFR category declared in scope (or explicit waiver in the plan with reason)
  - [ ] Directory structure `qa/test-plans/`, `qa/test-cases/`, `qa/issues/`, `qa/screenshots/` exists under the chosen `qa-output-path`
- Traceability target: every persona referenced in the plan has ≥1 TC-*; every mapped journey has ≥1 TC-*
- Documentation review: no TC-INT / TC-SEC / TC-PERF templates used

## Success Criteria
- All planning verification checkboxes above are satisfied
- Artifacts are ready for handoff: task_05 can read `<qa-output-path>/qa/` without generating missing plan content
- Entry/exit criteria in the test plan align with PRD MVP success metrics
- `compozy tasks validate --name weather-panel` exits 0 after task files are updated
