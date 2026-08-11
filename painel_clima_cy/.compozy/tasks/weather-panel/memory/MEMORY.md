# Workflow Memory

Keep only durable, cross-task context here. Do not duplicate facts that are obvious from the repository, PRD documents, or git history.

## Current State
- Task 01 backend API is implemented and verified: public `GET /places/search`, `GET /places/reverse`, `GET /weather`, and existing `GET /health` are wired in Express.
- Task 02 frontend feature is implemented and verified in isolation: `WeatherPanel` is exported from `frontend/src/features/weather-panel/index.ts`, but `App.tsx` integration remains for task 03.
- Task 04 QA planning artifacts are available under `.compozy/tasks/weather-panel/qa/` for task 05 to execute.
- Task 05 real-user QA artifacts are available under `.compozy/tasks/weather-panel/qa/`, including `verification-report.md`, screenshots, and `BUG-001` / `BUG-002`.

## Shared Decisions
- The backend `WeatherPanelPayload` contract uses `conditionIconKey` on current/hourly/daily forecast items, matching `backend/src/types/weather.ts` and `backend/openapi.yaml`.
- `GET /weather` performs a fresh reverse geocoding lookup as part of payload assembly so the response can include `place` while keeping the endpoint query to latitude/longitude/unit.

## Shared Learnings
- `rg` is not installed in this workspace; use PowerShell `Get-ChildItem ... | Select-String` for repository scans.
- Open-Meteo's public geocoding documentation currently documents `/v1/search`; live `/v1/reverse` calls returned 404. Backend reverse geocoding now has a coordinate fallback so geolocation and weather payload assembly can continue without adding another provider.
- Repo scan found Vitest tests but no Playwright, Cypress, WebDriver, Puppeteer, or equivalent browser E2E harness; task 05 should collect real-user browser/manual evidence rather than assume existing E2E coverage.

## Open Risks
- Coordinate fallback labels are less precise than true reverse geocoding for geolocation; future tasks should treat improved place naming as follow-up UX/API polish.
- Task 05 filed `BUG-001` for body-level horizontal overflow after mobile forecast load and `BUG-002` for geolocation showing coordinate fallback instead of a locality; rerun `TC-JOURNEY-002` and `TC-CFR-004` after fixes.

## Handoffs
- Frontend task should consume only backend routes; a scan after Task 01 found no direct Open-Meteo URL references under `frontend/`.
