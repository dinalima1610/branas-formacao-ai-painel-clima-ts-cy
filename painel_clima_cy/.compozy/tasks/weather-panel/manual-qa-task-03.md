# Task 03 Manual QA Checklist

## Scope

Validate the integrated weather panel home view against the PRD MVP scenarios. This file records the runnable manual script plus the evidence gathered in this CLI environment.

## Prerequisites

- Backend: from `backend/`, run `npm run dev`.
- Frontend: from `frontend/`, run `npm run dev`.
- Use the default API base URL (`http://localhost:3000`) unless validating an alternate `VITE_API_BASE_URL`.

## Scenarios

| # | Scenario | Expected result | Result |
|---|---|---|---|
| 1 | Search `São Paulo`. | Weather loads with current conditions, 24-hour strip, and daily forecast. | PASS: live backend smoke with `Sao Paulo` returned search 200, weather 200, 24 hourly, 5 daily; UI render covered by App tests. |
| 2 | Search `Curitiba`. | Weather loads with current conditions, 24-hour strip, and daily forecast. | PASS: live backend smoke returned search 200, weather 200, 24 hourly, 5 daily; UI render covered by App tests. |
| 3 | Search ambiguous `Springfield`, choose `Springfield, Illinois, United States`. | Disambiguation appears first; selected region loads weather without wrong-city result. | PASS: live backend smoke returned 5 candidates and weather 200; `frontend/src/App.test.tsx` verifies disambiguation and Illinois selection. |
| 4 | Search `zzzznotaplace`. | PT-BR no-results message is understandable without devtools. | PASS: live backend smoke returned 404 `PLACE_NOT_FOUND`; feature tests verify PT-BR copy. |
| 5 | Click `Usar minha localização` and allow permission. | Reverse lookup returns a candidate and weather loads. | PASS: feature test covers browser permission allow path; live `/places/reverse` smoke returns coordinate fallback 200 when Open-Meteo reverse is unavailable. |
| 6 | Click `Usar minha localização` and deny permission. | Neutral PT-BR message appears and manual search remains usable. | PASS: feature test covers denied permission message and enabled manual search. |
| 7 | Toggle `°C` / `°F` after weather loads. | Current, hourly, daily temperatures and wind unit update without a page reload. | PASS: feature test verifies current, hourly, daily temperatures and no extra weather fetch. |
| 8 | Stop backend or point `VITE_API_BASE_URL` to an unavailable URL, then retry a search. | PT-BR upstream/unavailable error appears with retry affordance where appropriate. | PASS: feature tests cover upstream retry copy; App tests cover health pill offline state. |
| 9 | Observe initial load on mobile width. | Empty-state hint is visible; hourly strip scrolls horizontally; daily section stacks. | PASS by code/test review: App test verifies empty state; `HourlyForecast` uses horizontal overflow and `DailyForecast` stacks before `md`. No screenshot captured in CLI-only environment. |
| 10 | Observe bottom health pill while backend is online/offline. | API Status remains secondary and changes green/red based on `/health`. | PASS: `frontend/src/App.test.tsx` verifies label, online green indicator, offline red indicator, and shared base URL. |

## Automated Evidence

- `frontend/src/App.test.tsx` covers integrated initial empty state, health pill label, health online/offline indicators, shared API base URL, successful search-to-weather render, and ambiguous-city selection.
- Existing weather feature tests cover geolocation allow/deny, PT-BR no-results/upstream copy, and unit toggling across visible sections.
- Live backend smoke after task_03 changes covered `/health`, three city searches, `/weather`, no-results, and `/places/reverse` fallback without leaving a server running.
