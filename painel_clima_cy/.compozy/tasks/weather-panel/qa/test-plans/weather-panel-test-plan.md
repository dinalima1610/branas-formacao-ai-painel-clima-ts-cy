# Journey Test Plan: Weather Panel MVP

## Executive Summary

- **User value delivered:** Course learners, presenters, and visitors can open the IA para Devs app, search for a city or opt into geolocation, choose the correct place when names collide, and read current conditions plus 24-hour and 3-5 day forecasts in Brazilian Portuguese.
- **Personas affected:** New User, Casual User, Mobile User, Accessibility-Reliant, Recovering User, Power User.
- **Journeys exercised:** 6.
- **Highest user-impact risk:** If disambiguation or upstream recovery fails, users may either see weather for the wrong place or be stranded with no clear next step, causing `Blocks-Completion` or `Trust-Damage` on the P0 weather journey.

## Personas Covered

- **New User** - Maps to the course learner or first-time demo viewer. Covered by `SMOKE-001` and `TC-JOURNEY-001` because the first impression depends on finding weather quickly without prior context.
- **Casual User** - Maps to a visitor who wants a quick city or travel check. Covered by `TC-FUNC-001`, `TC-FUNC-002`, and `TC-CFR-001` because they rely on recognizable controls and clear empty/error states.
- **Mobile User** - Maps to users on small touch screens and variable networks. Covered by `TC-JOURNEY-002`, `TC-CFR-003`, and `TC-CFR-004` because geolocation, scrolling forecasts, and network feedback are mobile-sensitive.
- **Accessibility-Reliant** - Covered by `TC-CFR-002` because the panel includes interactive search, disambiguation, toggle, retry, and dynamic result updates.
- **Recovering User** - Maps to users returning after denial, failure, or unavailable weather. Covered by `TC-JOURNEY-003`, `TC-FUNC-003`, and `TC-CFR-005` because recovery quality determines whether they trust the app again.
- **Power User** - Maps to the live demo presenter who repeatedly drives the same flow under time pressure. Covered by `TC-PERSONA-001` because demo reliability depends on efficient repeated searches and keyboard-friendly operation.

## Journeys Mapped

- **J-01: Search an ambiguous city and load the correct forecast**
  - **Value statement:** A user can avoid wrong-city weather by choosing the intended place before weather loads.
  - **Primary persona:** New User.
  - **Secondary persona:** Casual User.
  - **Charters planned:** `CH-01`, `CH-02`.
  - **TC-JOURNEY cases:** `TC-JOURNEY-001`.
  - **Cross-feature touchpoints:** Home view, weather panel search, backend `/places/search`, disambiguation list, backend `/weather`, current/hourly/daily render.
  - **Abandonment paths:** User submits an ambiguous name and does not recognize options; user selects a wrong candidate and must retry; backend search is slow or unavailable.
- **J-02: Use current location after explicit opt-in**
  - **Value statement:** A mobile user can skip typing and still receive human-readable local weather after consenting.
  - **Primary persona:** Mobile User.
  - **Secondary persona:** New User.
  - **Charters planned:** `CH-01`.
  - **TC-JOURNEY cases:** `TC-JOURNEY-002`.
  - **Cross-feature touchpoints:** Browser geolocation permission, backend `/places/reverse`, optional place selection, backend `/weather`.
  - **Abandonment paths:** Permission prompt is ignored; reverse lookup returns multiple candidates; network drops after permission succeeds.
- **J-03: Deny location and continue with manual search**
  - **Value statement:** A privacy-conscious user remains fully able to complete the weather journey after denying location.
  - **Primary persona:** Recovering User.
  - **Secondary persona:** Casual User.
  - **Charters planned:** `CH-03`.
  - **TC-JOURNEY cases:** `TC-JOURNEY-003`.
  - **Cross-feature touchpoints:** Browser geolocation denial, neutral PT-BR guidance, manual search, backend `/places/search`, backend `/weather`.
  - **Abandonment paths:** Denial message feels punitive; search input is disabled after denial; retry/location action loops without manual escape.
- **J-04: Read forecast in the preferred unit**
  - **Value statement:** A user can switch between Celsius and Fahrenheit and trust every visible temperature and wind label.
  - **Primary persona:** Casual User.
  - **Secondary persona:** Power User.
  - **Charters planned:** `CH-02`.
  - **TC-JOURNEY cases:** `TC-FUNC-001`.
  - **Cross-feature touchpoints:** Current conditions, hourly strip, daily forecast, unit conversion, wind unit label.
  - **Abandonment paths:** Only current temperature changes; hourly/daily values stay in the old unit; wind label contradicts the active unit.
- **J-05: Recover from no results or unavailable weather**
  - **Value statement:** A user who cannot get data immediately understands what happened and has a clear next action.
  - **Primary persona:** Recovering User.
  - **Secondary persona:** New User.
  - **Charters planned:** `CH-01`, `CH-03`.
  - **TC-JOURNEY cases:** `TC-FUNC-002`, `TC-FUNC-003`.
  - **Cross-feature touchpoints:** Search validation, backend 404/502 handling, PT-BR error copy, retry affordance.
  - **Abandonment paths:** No-results copy gives no refinement hint; retry is missing after transient upstream failure; old results remain visible as if current.
- **J-06: Run a reliable live demo with repeated cities**
  - **Value statement:** A presenter can show three city runs, including one ambiguous city, without keyboard or state friction derailing the session.
  - **Primary persona:** Power User.
  - **Secondary persona:** New User.
  - **Charters planned:** `CH-02`.
  - **TC-JOURNEY cases:** `TC-PERSONA-001`.
  - **Cross-feature touchpoints:** Search reset, candidate list state, previous result replacement, health indicator as secondary context.
  - **Abandonment paths:** Previous city data appears during a new request; repeated submits cause stale result state; keyboard navigation cannot select a candidate.

## Charters Planned

- **CH-01: Mobile User x Network Tour x 60 minutes**
  - **Mission:** Verify a mobile user on slow or flaky network can search, opt into geolocation, and recover from delayed weather responses without assuming the app is frozen.
  - **Surface:** Weather panel on the home view.
  - **Out-of-scope:** Backend unit assertions, OpenAPI contract inspection, and implementation code review.
- **CH-02: Casual User x Garbage Tour x 60 minutes**
  - **Mission:** Stress weather search with ambiguous, pasted, localized, long, and corrected city queries to find wrong-place, empty-state, or layout failures.
  - **Surface:** Search input, disambiguation list, current/hourly/daily weather display.
  - **Out-of-scope:** Security testing, SQL injection classification, and provider data correctness outside user-visible labels.
- **CH-03: Recovering User x Back-Button Tour x 30 minutes**
  - **Mission:** Verify users can recover from denied location, no results, upstream failures, retry attempts, refreshes, and browser back navigation without losing the manual path.
  - **Surface:** Geolocation chip, error states, retry affordances, browser history around the weather panel.
  - **Out-of-scope:** Offline mode, saved city persistence, and browser permission settings outside the session.

## CFR Scope

| CFR Category | Affected by this change? | Why | TC-CFR generated |
|---|---|---|---|
| Usability | Yes | The MVP lives or dies on clear search, selection, forecast scanning, and recovery affordances. | `TC-CFR-001` |
| Accessibility | Yes | Search, candidate selection, unit toggle, dynamic forecast updates, and retry must be keyboard and screen-reader usable. | `TC-CFR-002` |
| Perceived-Performance | Yes | Weather and geocoding rely on live I/O; users need fast feedback during search and retry. | `TC-CFR-003` |
| Compatibility | Yes | The panel has responsive layout, horizontal hourly scrolling, geolocation, and browser permission behavior. | `TC-CFR-004` |
| Error-Recoverability | Yes | No-results, denied geolocation, upstream unavailable, and generic failures are P0 user flows. | `TC-CFR-005` |
| Production-Parity | Yes | Weather calls must use real backend services and realistic browser settings; local mocks would invalidate the QA pass. | `TC-CFR-006` |

## Test Strategy

- Execute the P0 journeys through the public home view as real users, not by direct API calls.
- Use the backend as the only weather data boundary; mocks stop before qa-execution begins unless a specific blocker is documented.
- Confirm at least three city runs during execution, including one ambiguous city such as `Springfield` and one Brazilian city such as `Sao Paulo` or `Curitiba`.
- Treat PT-BR copy quality as user-observable behavior: error and recovery messages must be understandable without developer tools.
- Capture screenshots in `qa/screenshots/` during task_05 for entry, decision point, error/recovery, and goal-observable states.
- Do not file integration-only, security, API, or performance-load cases from this plan. Those remain CI/code responsibilities.

## Automation Strategy

Repository scan found Vitest unit/integration tests but no Playwright, Cypress, WebDriver, Puppeteer, or equivalent browser E2E harness. Browser-facing journey cases are therefore tagged `Manual-only` with `Automation Status: N/A` and notes that task_05 should collect browser evidence rather than pretending an E2E suite exists.

| Journey | Persona | Automation annotation |
|---|---|---|
| J-01 ambiguous search and forecast | New User | Manual-only / N/A - no browser E2E harness exists. Candidate for future E2E after harness setup. |
| J-02 geolocation allowed | Mobile User | Manual-only / N/A - requires browser permission handling and real/controlled geolocation evidence. |
| J-03 geolocation denied and manual search | Recovering User | Manual-only / N/A - requires browser permission denial and recovery observation. |
| J-04 unit toggle | Casual User | Manual-only / N/A for real-user QA; existing Vitest coverage is implementation evidence, not a browser E2E harness. |
| J-05 no-results/upstream recovery | Recovering User | Manual-only / N/A - needs observable PT-BR recovery UX and retry evidence. |
| J-06 live demo repeated cities | Power User | Manual-only / N/A - presenter pacing and state clarity require human/browser observation. |

## Entry Criteria

- [ ] Build is reachable in a production-parity environment.
- [ ] CI gate has run separately and is green.
- [ ] Backend services are reachable through the same base URL the frontend uses.
- [ ] Test data includes at least one ambiguous city, one Brazilian city, one no-result query, and one upstream-unavailable simulation path.
- [ ] Personas, journeys, charters, and TC-* files are documented under `.compozy/tasks/weather-panel/qa/`.
- [ ] Browser tooling is available for task_05 evidence capture.

## Exit Criteria

- [ ] Every P0 journey reaches its goal observable or has a filed blocker with user-impact classification.
- [ ] Zero open `Blocks-Completion` or `Data-Loss` bugs remain on P0 journeys.
- [ ] Current conditions, 24-hour forecast, 3-5 day forecast, unit toggle, geolocation allow/deny, no-results, upstream failure, and retry are each covered by executed evidence.
- [ ] CFR pass covers at least two high-value journeys and all six declared CFR categories with no critical findings open.
- [ ] Automation follow-up is recorded for the absence of a browser E2E harness before any case is reclassified as `E2E`.
- [ ] Verification report is filed at `.compozy/tasks/weather-panel/qa/verification-report.md`.

## Retesting vs Regression

- **Retesting** re-validates a specific reported defect. Scope is a `BUG-*` file, its reproduction, and the narrow affected journey step.
- **Regression** validates that weather-panel changes did not break unrelated or adjacent journeys. Scope is the journey-driven suite in `weather-panel-smoke-regression.md`.
- For task_05, run smoke first, then P0 journeys, then CFR, then charters. If a blocker is found and fixed later, rerun the exact failing `BUG-*` reproduction first, then the targeted regression tier for the affected journey.

## Risk Assessment

| Risk | Probability | User Impact | Mitigation |
|---|---|---|---|
| User picks the wrong city from disambiguation and trusts wrong weather | Medium | Trust-Damage | `TC-JOURNEY-001` verifies region/country labels and correct selected-place weather. |
| Geolocation denial makes the panel feel broken or coercive | Medium | Blocks-Completion | `TC-JOURNEY-003` verifies neutral copy and manual search remains enabled. |
| Upstream slowness leaves a blank or stale panel | Medium | Friction / Trust-Damage | `TC-FUNC-003` and `TC-CFR-003` verify timely loading feedback and retry. |
| Unit toggle only updates part of the forecast | Medium | Trust-Damage | `TC-FUNC-001` checks current, hourly, daily, and wind label consistency. |
| Mobile layout hides hourly or daily forecast content | Medium | Friction | `CH-01` and `TC-CFR-004` cover 375px, touch, and horizontal scrolling. |
| Dynamic updates are not announced to assistive tech | Medium | Blocks-Completion for Accessibility-Reliant users | `TC-CFR-002` requires keyboard, focus, labels, and live-region observations. |
| QA evidence uses mocked services and misses production-like behavior | Low | Trust-Damage | `TC-CFR-006` requires normal profile, real backend, and documented environment deviations. |

## Timeline and Deliverables

- Charters drafted by: 2026-05-22.
- TC-* generated by: 2026-05-22.
- Execution window: task_05 after this planning handoff.
- Verification report due: task_05 completion.
- Deliverables in this plan: `weather-panel-test-plan.md`, `weather-panel-smoke-regression.md`, `CH-01` through `CH-03`, `SMOKE-001`, P0 journey/functional cases, persona case, and six `TC-CFR-*` cases.
