---
status: completed
title: Weather panel frontend feature
type: frontend
complexity: high
dependencies:
  - task_01
---

# Task 02: Weather panel frontend feature

## Overview

Build the self-contained weather panel feature module under `frontend/src/features/weather-panel/`, including API wrappers, state hooks, unit conversion helpers, and all UI components for search, disambiguation, geolocation, current conditions, hourly strip, daily cards, and the °C/°F toggle. Apply DESIGN.md tokens to Tailwind configuration so the panel matches the warm editorial design system. All weather data MUST flow through the project backend only.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement `frontend/src/features/weather-panel/` with `api/`, `hooks/`, `lib/`, `components/`, and a public barrel export per TechSpec "System Architecture"
- MUST call only project backend endpoints (`/places/search`, `/places/reverse`, `/weather`); MUST NOT fetch Open-Meteo from the browser
- MUST use `import.meta.env.VITE_API_BASE_URL` defaulting to `http://localhost:3000` for all API requests
- MUST implement the search → optional disambiguation → weather fetch flow per ADR-002
- MUST show up to 5 disambiguation candidates with region/country context (`label` field) before loading weather
- MUST display current conditions: temperature, condition label, weather indicator, feels-like, humidity, and wind speed with unit label
- MUST render a horizontally scrollable 24-hour strip (time, temperature, condition indicator per slot)
- MUST render 3–5 daily forecast cards/rows (day label, min/max temperature, condition indicator)
- MUST provide °C/°F toggle that updates all visible temperatures without refetching weather per ADR-003; wind values and labels MUST follow ADR-004 via client-side conversion in `lib/units.ts`
- MUST offer an opt-in "Use my location" chip that calls `navigator.geolocation.getCurrentPosition` only on click, never on page load per ADR-005 and PRD
- MUST on geolocation success call `/places/reverse` and continue the same disambiguation flow as text search
- MUST show PT-BR user-facing copy for empty state, loading, errors (no results, location denied, upstream unavailable), and retry affordances
- MUST map backend `{ code, message }` errors to friendly PT-BR strings in the UI
- MUST align Tailwind/CSS tokens with `DESIGN.md` (coral primary `#cc785c`, canvas `#faf9f5`, serif display headings)
- MUST add Vitest, React Testing Library, and a `test` script to the frontend package
- SHOULD use existing shadcn `Button` from `frontend/src/components/ui/button.tsx` where appropriate
- SHOULD keep keyboard accessibility for search, list selection, and unit toggle
</requirements>

## Subtasks
- [x] 2.1 Scaffold feature module structure and shared frontend types mirroring backend DTOs
- [x] 2.2 Implement API module (`searchPlaces`, `reversePlace`, `fetchWeather`) with env-based base URL
- [x] 2.3 Implement unit conversion helpers for temperatures and wind (°C/°F, km/h ↔ mph)
- [x] 2.4 Implement panel state hooks (search, disambiguation, weather loading, geolocation flow)
- [x] 2.5 Build search input, disambiguation list, and opt-in geolocation chip components
- [x] 2.6 Build current conditions, hourly strip, daily cards, and unit toggle components
- [x] 2.7 Map DESIGN.md tokens into `index.css` and `tailwind.config.js`; compose exported `WeatherPanel` shell
- [x] 2.8 Configure Vitest + RTL and write component and hook tests

## Implementation Details

Create the feature module per TechSpec "System Architecture" and repo-architecture skill. See TechSpec sections **Core Interfaces** (frontend API surface), **Technical Considerations** (client-side unit toggle), and **Testing Approach** (frontend unit tests).

The current `App.tsx` is a placeholder with hardcoded health fetch — this task builds the feature module but does NOT wire it into `App.tsx` (that is task_03):

```41:45:frontend/src/App.tsx
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative">
      <h1 className="text-6xl font-bold text-foreground">
        IA para Devs
      </h1>
```

UI currently uses default shadcn zinc tokens; extend `frontend/src/index.css` and `frontend/tailwind.config.js` with DESIGN.md semantic colors (primary coral, canvas cream, ink body text, serif display font stack).

Geolocation flow per ADR-005: chip click → browser coords → `reversePlace` → optional pick → `fetchWeather`.

Unit toggle per ADR-003/004: store payload (prefer celsius baseline from server); convert displayed temperatures and wind client-side on toggle to avoid duplicate `/weather` calls.

### Relevant Files
- `frontend/src/features/weather-panel/` — New feature root (api, hooks, lib, components, index barrel)
- `frontend/src/components/ui/button.tsx` — Existing shadcn Button for CTAs (search, geolocation chip, retry)
- `frontend/src/lib/utils.ts` — Existing `cn()` helper for Tailwind class merging
- `frontend/src/index.css` — Extend CSS variables with DESIGN.md palette
- `frontend/tailwind.config.js` — Map semantic color and font tokens for panel components
- `frontend/vite.config.ts` — Add Vitest test configuration block
- `frontend/src/vite-env.d.ts` — Type `VITE_API_BASE_URL`
- `frontend/package.json` — Add Vitest, RTL, coverage, and `test` script (no test script exists today)
- `DESIGN.md` — Visual contract for colors, typography, spacing, and component tone
- `.compozy/tasks/weather-panel/_techspec.md` — Frontend API function signatures and component responsibilities

### Dependent Files
- `frontend/src/App.tsx` — Will import and render `WeatherPanel` in task_03
- `backend/src/` — API contract from task_01 must be stable; coordinate on `{ code, message }` error codes consumed by error mapping

### Related ADRs
- [ADR-001: Current Conditions Panel with Hourly and Daily Mini-Forecast](../adrs/adr-001.md) — MVP UI scope: current metrics, 24h strip, 3–5 day daily, disambiguation, geolocation chip, unit toggle
- [ADR-002: Two-Step REST API for Place Search and Weather](../adrs/adr-002.md) — Frontend must complete disambiguation before `/weather`
- [ADR-003: No Server-Side Cache for Open-Meteo in MVP](../adrs/adr-003.md) — Client-side unit conversion to avoid refetch on toggle
- [ADR-004: Wind Speed Units Coupled to Temperature Unit Toggle](../adrs/adr-004.md) — Wind display and conversion tied to active temperature unit
- [ADR-005: Geolocation Resolves Places via Reverse Geocoding Endpoint](../adrs/adr-005.md) — Geolocation chip → `/places/reverse` → optional pick → `/weather`

## Deliverables
- `frontend/src/features/weather-panel/api/weather-api.ts` with `searchPlaces`, `reversePlace`, `fetchWeather`
- `frontend/src/features/weather-panel/types.ts` mirroring backend DTOs
- `frontend/src/features/weather-panel/lib/units.ts` for temperature and wind conversion
- `frontend/src/features/weather-panel/hooks/` for panel state machine (search, disambiguation, weather, geolocation)
- `frontend/src/features/weather-panel/components/` for search, disambiguation list, geolocation chip, current panel, hourly strip, daily cards, unit toggle, loading/error views
- `frontend/src/features/weather-panel/index.ts` exporting `WeatherPanel`
- Updated `frontend/src/index.css` and `frontend/tailwind.config.js` with DESIGN.md tokens
- `frontend/vitest.config.ts` (or Vitest block in `vite.config.ts`) and test setup
- Unit tests with 80%+ coverage **(REQUIRED)**
- Component integration tests with mocked API **(REQUIRED)**

## Tests
- Unit tests:
  - [x] `searchPlaces` calls `GET /places/search?q=` with encoded query and returns parsed `PlaceCandidate[]`
  - [x] `reversePlace` calls `GET /places/reverse` with latitude and longitude query params
  - [x] `fetchWeather` calls `GET /weather` with latitude, longitude, and `temperatureUnit`
  - [x] API module maps 404 response with `PLACE_NOT_FOUND` to a typed error consumable by hooks
  - [x] `lib/units.ts` converts 0°C to 32°F and 100°F to 37.8°C (rounded) correctly
  - [x] `lib/units.ts` converts 10 km/h to ~6.2 mph and back within rounding tolerance
  - [x] Unit toggle hook updates all displayed temperatures without invoking `fetchWeather` again
  - [x] Unit toggle updates wind speed value and label (km/h ↔ mph) per active temperature unit
- Integration tests (RTL + mocked fetch):
  - [x] `WeatherPanel` renders empty-state hint ("Search for a city…") before first search
  - [x] Submitting a search with multiple mocked candidates renders disambiguation list with `label` text
  - [x] Selecting a candidate triggers weather fetch and renders current temperature
  - [x] Loading spinner or skeleton visible while search or weather request is in flight
  - [x] 404 search response displays PT-BR "no results" message with actionable guidance
  - [x] Upstream 502 displays PT-BR error with retry button that re-invokes the failed request
  - [x] Geolocation chip does not call `navigator.geolocation` on initial render
  - [x] Clicking geolocation chip with granted permission calls `reversePlace` then weather flow
  - [x] Denied geolocation shows neutral PT-BR message; manual search input remains usable
  - [x] °C/°F toggle re-renders hourly strip and daily min/max with converted values
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Exported `WeatherPanel` renders full MVP flow in isolation (Storybook not required)
- No direct Open-Meteo URLs in frontend source
- All user-facing strings in Brazilian Portuguese
- UI follows DESIGN.md warm editorial palette and typography hierarchy
- Geolocation is never auto-requested on mount
