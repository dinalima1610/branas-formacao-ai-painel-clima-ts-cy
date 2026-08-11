# Task Memory: task_03.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Integrate the already-exported `WeatherPanel` into `frontend/src/App.tsx` as the home view primary content.
- Preserve `/health` polling as a secondary bottom health pill and move API base URL resolution into shared frontend configuration.
- Add app-level integration tests and a manual QA checklist covering PRD MVP scenarios before marking tracking complete.

## Important Decisions
- Use a shared `frontend/src/lib/api-config.ts` helper so `App.tsx` and `features/weather-panel/api/weather-api.ts` resolve `VITE_API_BASE_URL` consistently.
- Keep App layout focused on composing the feature and health pill; avoid changing task_02 feature internals unless integration tests expose a gap.
- Live backend smoke exposed that Open-Meteo `/v1/reverse` returns 404; added a backend coordinate fallback for reverse lookups and made the frontend preserve the user-selected place in weather results.

## Learnings
- Pre-change signal: `App.tsx` still has hardcoded `http://localhost:3000/health`, does not import `WeatherPanel`, and only renders the old centered "IA para Devs" placeholder.
- The existing weather feature already covers empty state, PT-BR errors, geolocation allow/deny, unit toggle, and feature-level component behavior; task_03 needs app composition and shared config coverage.
- Open-Meteo's current public geocoding documentation lists `/v1/search`; live calls to `/v1/reverse` returned 404, so reverse geocoding must be resilient to upstream absence.

## Files / Surfaces
- Planned: `frontend/src/App.tsx`, `frontend/src/lib/api-config.ts`, `frontend/src/features/weather-panel/api/weather-api.ts`, app/API config tests, manual QA documentation, task tracking files.
- Touched during implementation: `backend/src/services/places.service.ts`, `backend/src/services/places.service.test.ts`, `backend/openapi.yaml`, and `frontend/src/features/weather-panel/hooks/useWeatherPanel.ts` for reverse-geocoding fallback resilience.

## Errors / Corrections
- No `AGENTS.md` or `CLAUDE.md` files exist at workspace root; `AGENTS.md` exists and was read as local guidance.
- The provided workspace path is not currently inside a Git worktree (`git rev-parse --show-toplevel` fails).
- Initial live backend smoke failed because `/weather` depended on unavailable reverse geocoding; after fallback changes, live smoke returned 200 weather payloads with 24 hourly and 5 daily entries for Sao Paulo, Curitiba, and Springfield.
- Final verification passed after tracking updates: frontend lint, frontend tests with coverage, frontend build, backend tests with coverage, and backend build all exited 0. Vite build still reports stale Browserslist data as a non-blocking warning.
- Automatic commit could not be created because the workspace is not inside a Git repository.

## Ready for Next Run
- Task 03 tracking is marked completed in `task_03.md` and `_tasks.md`.
- Dev servers were started for local review: backend health on `http://localhost:3000/health` and frontend on `http://127.0.0.1:5173`.
