# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot
- Implement the self-contained React weather panel feature under `frontend/src/features/weather-panel/` without wiring it into `App.tsx` yet.
- Required scope includes backend-only API wrappers, state hook, client-side unit conversion, PT-BR UI components, DESIGN.md token mapping, Vitest/RTL setup, and coverage.

## Important Decisions
- Treat `DESIGN.md` as the UI source of truth over generic UI skill recommendations.
- Store weather payloads as a Celsius/kmh baseline in the hook and derive Fahrenheit/mph displays client-side so the unit toggle does not call `/weather` again.
- Use the existing shadcn `Button` and keep feature-specific UI under `frontend/src/features/weather-panel/`.

## Learnings
- `AGENTS.md` and `CLAUDE.md` are absent at the repo root; `AGENTS.md` is the available repo guidance file.
- The workspace root and `frontend/` are not Git repositories, so handoff must use file inspection rather than git diff/status.
- The frontend package had no `test` script before this task.
- `npm install` completed with Windows `TAR_ENTRY_ERROR` warnings and audit findings; subsequent typecheck/test/lint/build commands ran successfully.

## Files / Surfaces
- `frontend/src/features/weather-panel/`
- `frontend/src/index.css`
- `frontend/tailwind.config.js`
- `frontend/vite.config.ts`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/src/vite-env.d.ts`
- `frontend/src/test/setup.ts`

## Errors / Corrections
- Fixed the hook to fetch a Celsius baseline after review, avoiding Fahrenheit server payloads when the unit is toggled before search.
- Fixed geolocation test objects to satisfy DOM `toJSON` type requirements.
- `npm install` reported 11 dependency audit findings from the current frontend dependency tree; not fixed because audit remediation was outside this task.
- The final build passed and emitted the standard Browserslist/caniuse-lite age notice; no build failure.

## Ready for Next Run
- Task 02 final verification passed after tracking: `npm run test` (18 tests; 90.53% statements / 82.35% branches / 92.94% functions / 91.71% lines), `npm run lint`, `npm run build`, and a frontend source scan found no Open-Meteo references.
- `task_02.md` and `_tasks.md` are marked completed; auto-commit is blocked because this workspace is not a Git repository.
- `WeatherPanel` is exported from `frontend/src/features/weather-panel/index.ts`; task 03 should wire it into `App.tsx` and perform end-to-end validation with the backend.
