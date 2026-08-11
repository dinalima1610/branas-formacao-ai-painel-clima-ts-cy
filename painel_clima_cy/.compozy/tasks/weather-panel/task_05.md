---
status: completed
title: Real-user QA execution (qa-execution skill)
type: chore
complexity: medium
dependencies:
  - task_04
---

# Task 05: Real-user QA execution (qa-execution skill)

## Overview

Execute real-user QA for the Weather Panel MVP using the **qa-execution** skill: read artifacts produced in task_04 under `.compozy/tasks/weather-panel/qa/`, assign personas and journeys, run exploratory charters with defined tours, exercise primary web flows (search, disambiguation, forecast, units, geolocation, errors), capture evidence under `qa/screenshots/`, file user-impact bug reports under `qa/issues/` when needed, and produce `qa/verification-report.md`. This task validates release readiness from a user perspective and complements automated Vitest coverage from prior tasks.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for behavioral boundaries — do not duplicate contracts here
- FOCUS ON "WHAT" — sessions, evidence, and reporting outcomes, not implementation detail
- MINIMIZE CODE — only note code changes if a bug fix emerges from QA
- TESTS REQUIRED — evidence is session results, screenshots, verification report, and bug traceability (not Vitest)
</critical>

<requirements>
- MUST use **`qa-output-path`** **`.compozy/tasks/weather-panel`** (same path as task_04) so reads land in `.compozy/tasks/weather-panel/qa/`
- MUST run the **qa-execution** skill workflow end-to-end per `.agents/skills/qa-execution/SKILL.md`
- MUST read `references/user-personas.md`, `references/journey-maps.md`, `references/exploratory-charters.md`, and `references/test-tours.md` **in full** before assigning sessions (per skill router)
- MUST confirm frontend and backend are reachable for manual or browser-driven QA (typical: `npm run dev` in `frontend/` and `backend/` or production build); if CI status is unknown, document the gap per skill (do not substitute `agent-output-audit`)
- MUST prioritize execution using TC-* cases from `qa/test-cases/` and charters from `qa/test-plans/charters/` created in task_04
- MUST assign at least three personas for the pass per skill Step 2; include Mobile User when the panel is responsive; include Accessibility-Reliant or document skip rationale
- MUST run CFR checks per `references/cfr-checks.md` on at least two journeys when no critical CFR failures remain open
- MUST classify any defect using user-impact rubric in `references/bug-severity-by-user-impact.md` and write `qa/issues/BUG-*.md` per `qa-report` Step 7 / qa-execution reporting expectations
- MUST save **verification-report.md** to `qa/verification-report.md` (skill output contract)
- MUST capture representative screenshots for failures and key pass evidence under `qa/screenshots/`
- SHOULD use viewport coverage aligned with PRD mobile-first UX (e.g. narrow width for hourly strip scroll) per `references/web-ui-qa.md` when browser tooling is available
- MUST NOT use this task to reconcile Compozy task YAML status or run CI gates—use `agent-output-audit` for those
</requirements>

## Subtasks
- [x] 5.1 Read task_04 artifacts (`qa/test-plans/`, `qa/test-cases/`, charters) and resolve runtime URL for the app
- [x] 5.2 Assign personas × journeys; order sessions by risk (P0 weather journeys first)
- [x] 5.3 Execute planned TC-* flows in the browser (or structured manual protocol if tooling unavailable); record Pass/Fail/Blocked
- [x] 5.4 Run exploratory charters (time-boxed) including at least one network or recovery variation for error/retry
- [x] 5.5 Run CFR pass on two journeys; document findings
- [x] 5.6 File `BUG-*.md` for failures; link to TC-ID and journey step when applicable
- [x] 5.7 Write `qa/verification-report.md` summarizing coverage, open issues, and ship recommendation

## Implementation Details

Consumes **qa-report** output only—do not regenerate the full test plan here. Skill entry: `.agents/skills/qa-execution/SKILL.md`. Key inputs: TC files under `qa/test-cases/`, charters under `qa/test-plans/charters/`.

Exit criteria should mirror **task_04** test plan exit criteria where applicable: zero open **Blocks-Completion** or **Data-Loss** on P0 journeys before declaring MVP demo-ready.

### Relevant Files
- `.agents/skills/qa-execution/SKILL.md` — Execution procedure, reporting, checklist
- `.agents/skills/qa-execution/references/web-ui-qa.md` — Browser session loop when `agent-browser` or equivalent is used
- `.agents/skills/qa-execution/references/cfr-checks.md` — CFR pass structure
- `.agents/skills/qa-execution/references/bug-severity-by-user-impact.md` — Impact classification for `BUG-*.md`
- `.agents/skills/qa-execution/references/checklist.md` — Final coverage verification
- `.compozy/tasks/weather-panel/qa/test-plans/weather-panel-test-plan.md` — Entry/exit criteria
- `.compozy/tasks/weather-panel/qa/test-cases/TC-*.md` — Executable cases from task_04

### Dependent Files
- `.compozy/tasks/weather-panel/qa/verification-report.md` — Created/updated by this task; stakeholders read this for QA sign-off
- `.compozy/tasks/weather-panel/qa/issues/BUG-*.md` — Defects discovered during execution
- `.compozy/tasks/weather-panel/qa/screenshots/**` — Evidence attachments referenced by the verification report

### Related ADRs
- [ADR-001](../adrs/adr-001.md) — Confirms expected user-visible forecast scope during sessions
- [ADR-003](../adrs/adr-003.md) — Sessions may observe upstream latency; no cache expected in MVP

## Deliverables
- Executed TC-* results (Pass/Fail/Blocked with build ID or date noted in `verification-report.md` or per-case execution history blocks)
- `qa/verification-report.md` with summary, coverage vs plan, unresolved risks, and ship/no-ship recommendation
- Screenshot evidence for key flows and failures under `qa/screenshots/`
- `qa/issues/BUG-*.md` for each confirmed user-impacting defect (or explicit statement that zero bugs filed)
- CFR pass notes captured in the verification report or linked annex

## Tests
- Unit tests:
  - N/A
- Integration tests (automated):
  - N/A — Vitest remains owned by tasks 01–03
- Execution verification (must all pass before marking task completed):
  - [x] `qa/verification-report.md` exists at `.compozy/tasks/weather-panel/qa/verification-report.md`
  - [x] Every **P0** TC-JOURNEY or TC-FUNC case planned for this release is executed or explicitly **Blocked** with reason in the report
  - [x] At least three personas reflected in executed sessions (per skill Step 2)
  - [x] CFR pass recorded for at least two journeys with no open critical CFR blockers—or documented waivers with owner
  - [x] Each **Fail** links to a `BUG-*.md` with Impact, Severity, Priority, Reproduction steps, Environment—or reclassified as environment/setup issue in the report
  - [x] Screenshot or written evidence exists for each **Fail** and for the primary **Pass** of the core “search → weather” journey
  - [x] Final outcomes cross-checked against `qa-execution/references/checklist.md` categories
   
## Success Criteria
- Verification report states clear recommendation (ship MVP demo / ship with known issues / no-ship) with rationale tied to user impact
- Zero undocumented P0 journey failures: each is either Pass or tracked as a bug with priority
- Artifact tree under `.compozy/tasks/weather-panel/qa/` is consistent for audit handoff
- `compozy tasks validate --name weather-panel` exits 0
