---
status: completed
title: App integration and end-to-end validation
type: frontend
complexity: medium
dependencies:
  - task_02
---

# Task 03: App integration and end-to-end validation

## Overview

Integrate the completed `WeatherPanel` feature into the application home view, replacing the placeholder center content while preserving the secondary API health pill. Centralize the API base URL configuration shared by health checks and weather requests. Validate the MVP against PRD success criteria through feature-level integration tests and a documented manual QA checklist covering ambiguous cities, geolocation allow/deny, unit toggle, and error recovery.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST render `WeatherPanel` as the primary content of the home view per PRD "Primary flow" and TechSpec "App.tsx"
- MUST retain the existing API health status pill as secondary UI (bottom area); MUST NOT remove `/health` polling per TechSpec "Technical Considerations"
- MUST replace hardcoded `http://localhost:3000/health` in `App.tsx` with `VITE_API_BASE_URL` (default `http://localhost:3000`)
- MUST show the empty-state hint from `WeatherPanel` on first load before any search
- MUST verify end-to-end flow: search → optional disambiguation → current + hourly + daily display
- MUST verify geolocation chip works when permitted and manual search works when denied per PRD success criteria
- MUST verify °C/°F toggle updates all visible temperatures across current, hourly, and daily sections
- MUST verify PT-BR error messages are understandable without developer tools for: no results, location denied, upstream unavailable
- MUST include feature-level integration test completing search → weather render with mocked backend responses
- MUST document a manual QA script covering at least three distinct cities including one ambiguous name
- SHOULD use mobile-first layout: hourly strip scrolls horizontally; daily section stacks on narrow viewports per PRD UX
- SHOULD keep page title/branding ("IA para Devs" or "Weather" panel title) aligned with DESIGN.md hierarchy
</requirements>

## Subtasks
- [x] 3.1 Refactor `App.tsx` to compose `WeatherPanel` as main content and preserve health pill
- [x] 3.2 Introduce shared API base URL helper used by health check and weather feature
- [x] 3.3 Adjust page layout for mobile-first weather panel (centered panel, scrollable hourly strip)
- [x] 3.4 Write feature-level integration test for full search-to-weather flow
- [x] 3.5 Execute and document manual QA checklist against PRD MVP success criteria

## Implementation Details

Wire the exported `WeatherPanel` from task_02 into `App.tsx`. See TechSpec sections **Component Overview** (App.tsx composition), **Development Sequencing** (step 9), and PRD **Success Metrics**.

Current `App.tsx` structure to evolve:

```8:26:frontend/src/App.tsx
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/health')
        if (response.ok) {
          setApiStatus('online')
        } else {
          setApiStatus('offline')
        }
      } catch {
        setApiStatus('offline')
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 5000)

    return () => clearInterval(interval)
  }, [])
```

Recommended layout: weather panel centered as primary focus; health pill remains `absolute bottom-8` (or equivalent) as secondary status. Optionally extract `getApiBaseUrl()` to `frontend/src/lib/api-config.ts` for reuse by health polling and weather API module.

Manual QA script (minimum scenarios from PRD):
1. Search "São Paulo" → weather loads with current + hourly + daily
2. Search ambiguous name (e.g., "Springfield") → disambiguation list → pick correct region → weather loads
3. Search "zzzznotaplace" → PT-BR no-results message
4. Tap geolocation chip with permission granted → reverse → weather loads
5. Deny geolocation → neutral message; manual search still works
6. Toggle °C/°F → all temperatures and wind labels update without full page reload
7. Simulate backend offline → error message with retry

### Relevant Files
- `frontend/src/App.tsx` — Primary integration point: compose `WeatherPanel`, keep health pill, use env base URL
- `frontend/src/features/weather-panel/index.ts` — Import `WeatherPanel` export from task_02
- `frontend/src/features/weather-panel/api/weather-api.ts` — Should already use `VITE_API_BASE_URL`; align with shared helper if extracted
- `frontend/src/vite-env.d.ts` — Ensure `VITE_API_BASE_URL` is typed
- `backend/src/index.ts` — Backend must be running with task_01 routes for manual QA
- `.compozy/tasks/weather-panel/_prd.md` — MVP success criteria and demo reliability targets
- `DESIGN.md` — Final layout polish against design system

### Dependent Files
- `frontend/src/features/weather-panel/components/` — All panel UI consumed by App layout; no structural changes expected unless layout gaps found during QA
- `frontend/src/index.css` — Global canvas background should remain consistent with panel tokens from task_02

### Related ADRs
- [ADR-001: Current Conditions Panel with Hourly and Daily Mini-Forecast](../adrs/adr-001.md) — Validates full MVP scope is demo-ready after integration

## Deliverables
- Updated `frontend/src/App.tsx` with `WeatherPanel` as main content and secondary health pill
- Shared API base URL helper (e.g., `frontend/src/lib/api-config.ts`) or equivalent refactor eliminating hardcoded localhost
- Feature integration test file under `frontend/src/` exercising search → disambiguation → weather visible flow
- Manual QA checklist document or inline comment in task tracking confirming PRD scenarios passed
- Unit tests with 80%+ coverage on new/modified integration code **(REQUIRED)**
- Integration tests for App composition **(REQUIRED)**

## Tests
- Unit tests:
  - [x] `getApiBaseUrl()` (or equivalent) returns `import.meta.env.VITE_API_BASE_URL` when set
  - [x] `getApiBaseUrl()` falls back to `http://localhost:3000` when env var is unset
- Integration tests:
  - [x] Rendered `App` shows `WeatherPanel` empty-state hint on initial load
  - [x] Rendered `App` still displays API health pill with "API Status" label
  - [x] Mocked successful search + weather flow: user submits city, sees current temperature in panel
  - [x] Mocked ambiguous search: disambiguation list appears, selection loads weather sections
  - [x] Health check uses same base URL helper as weather API (spy on fetch URLs)
  - [x] Health pill shows green indicator when mocked `/health` returns 200
  - [x] Health pill shows red indicator when mocked `/health` fetch fails
- Manual QA (document results):
  - [x] Three distinct cities (including one ambiguous) show correct weather after disambiguation
  - [x] Geolocation allowed: chip resolves place and loads weather
  - [x] Geolocation denied: manual search remains fully functional
  - [x] Unit toggle updates current, hourly, and daily temperatures consistently
  - [x] Errors display understandable PT-BR copy without opening devtools
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Home view presents weather panel as primary experience with health pill secondary
- PRD MVP success criteria met: end-to-end demo completes in under ~10 seconds on typical connection after place selected
- Zero wrong-city results in scripted ambiguous-city test after user picks from disambiguation list
- 10 consecutive manual presenter runs complete without blocking errors (qualitative demo reliability target)
- No hardcoded `localhost:3000` URLs remain in `App.tsx`
