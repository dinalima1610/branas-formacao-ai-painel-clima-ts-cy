# TechSpec: Weather Panel

## Executive Summary

The weather panel extends the existing React + Vite frontend and Express backend with a **two-step read API** (`/places/*` then `/weather`) that proxies Open-Meteo Geocoding and Forecast services. The backend owns all external I/O in a `controllers → services → data` layout; the frontend implements a self-contained feature module under `frontend/src/features/weather-panel/` and replaces the placeholder center of `App.tsx`.

**Primary trade-off:** Simplicity and teaching clarity (no cache, no auth, no persistence) over demo resilience under upstream latency or repeated searches. Live upstream calls on every place/weather request keep behavior predictable at the cost of extra latency and Open-Meteo dependency during presentations.

## System Architecture

### Component Overview

```text
Browser (geolocation opt-in)
    │
    ▼
frontend/src/features/weather-panel/
  ├── api/          fetch → backend only
  ├── hooks/        search / disambiguation / weather state
  └── components/   search, lists, current, hourly strip, daily cards
    │
    ▼
backend/src/
  controllers/   places.controller, weather.controller
  services/      places.service, weather.service
  data/clients/  open-meteo-geocoding.client, open-meteo-forecast.client
    │
    ▼
Open-Meteo Geocoding API + Forecast API (no API key)
```

| Component | Responsibility |
|-----------|----------------|
| `PlacesController` | Validate query params; map HTTP status codes; delegate to `PlacesService` |
| `PlacesService` | Orchestrate forward/reverse geocoding; cap results at 5; normalize `PlaceCandidate` |
| `WeatherController` | Validate lat/lon and `temperatureUnit`; delegate to `WeatherService` |
| `WeatherService` | Request forecast with correct units; map upstream codes to panel DTO |
| `OpenMeteoGeocodingClient` | HTTP to geocoding API (`search`, `reverse`) |
| `OpenMeteoForecastClient` | HTTP to forecast API (current, hourly, daily) |
| `WeatherPanel` (feature) | UI flow, PT-BR copy, loading/error states, unit toggle |
| `App.tsx` | Compose `WeatherPanel` as main content; retain health pill (secondary) |

**Data flow (happy path):**

1. User submits city → `GET /places/search?q=…` → 0/1/2–5 candidates.
2. If multiple → user selects → `GET /weather?latitude=&longitude=&temperatureUnit=`.
3. If single match → skip list UI → same weather call.
4. Geolocation chip → browser coords → `GET /places/reverse` → same as steps 1–2.

## Implementation Design

### Core Interfaces

```typescript
// backend/src/services/weather.service.ts (contract surface)
export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface WeatherQuery {
  latitude: number;
  longitude: number;
  temperatureUnit: TemperatureUnit;
}

export interface PlaceCandidate {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  label: string; // "São Paulo, São Paulo, Brazil" for UI
}

export interface WeatherPanelPayload {
  place: PlaceCandidate;
  current: CurrentConditions;
  hourly: HourlyForecastSlot[]; // length 24, 1h step
  daily: DailyForecastSlot[];   // length 3–5
  meta: { fetchedAt: string; temperatureUnit: TemperatureUnit };
}
```

```typescript
// frontend/src/features/weather-panel/api/weather-api.ts
export async function searchPlaces(query: string): Promise<PlaceCandidate[]>;
export async function reversePlace(lat: number, lon: number): Promise<PlaceCandidate[]>;
export async function fetchWeather(
  latitude: number,
  longitude: number,
  temperatureUnit: TemperatureUnit
): Promise<WeatherPanelPayload>;
```

**Error convention:** Services throw typed errors (`PlaceNotFoundError`, `UpstreamWeatherError`, `InvalidQueryError`). Controllers map to 400 / 404 / 422 / 502 with JSON `{ code, message }` (`message` in English for logs; frontend maps to PT-BR user strings).

### Data Models

**`PlaceCandidate`** (backend + shared frontend type)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Stable string from geocoding result (e.g. `id` or composite key) |
| `name` | string | City/locality name |
| `admin1` | string? | Region/state |
| `country` | string | Country name |
| `latitude` | number | WGS84 |
| `longitude` | number | WGS84 |
| `label` | string | Preformatted disambiguation line |

**`CurrentConditions`**

| Field | Type |
|-------|------|
| `temperature` | number |
| `apparentTemperature` | number |
| `humidity` | number (0–100) |
| `windSpeed` | number |
| `windSpeedUnit` | `'kmh' \| 'mph'` |
| `weatherCode` | number |
| `conditionLabel` | string (PT-BR mapped from WMO code) |
| `isDay` | boolean |

**`HourlyForecastSlot`** (24 entries, 1-hour step from “now”)

| Field | Type |
|-------|------|
| `time` | string (ISO 8601) |
| `temperature` | number |
| `weatherCode` | number |

**`DailyForecastSlot`** (3–5 entries)

| Field | Type |
|-------|------|
| `date` | string (ISO date) |
| `temperatureMin` | number |
| `temperatureMax` | number |
| `weatherCode` | number |

**Open-Meteo mapping (data layer):**

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search` and reverse mode on same API.
- Forecast: `https://api.open-meteo.com/v1/forecast` with `current`, `hourly`, `daily` variables.
- `temperature_unit`: `celsius` | `fahrenheit`.
- `wind_speed_unit`: `kmh` when celsius; `mph` when fahrenheit (ADR-004).
- Hourly: next 24 hours at `hourly` resolution; daily: `forecast_days=5` (trim to 3–5 in service if needed).

**WMO weather codes:** Centralize mapping table `data/weather-code-labels.pt.ts` (or `lib/`) → PT-BR `conditionLabel` + icon key for frontend (`sunny`, `cloudy`, `rain`, etc.).

### API Endpoints

Base URL: `http://localhost:3000` (frontend via `import.meta.env.VITE_API_BASE_URL` defaulting to same; align with existing health check pattern).

#### `GET /places/search`

| | |
|--|--|
| **Query** | `q` (required, min 2 chars), `count` (optional, default 5, max 5) |
| **200** | `{ places: PlaceCandidate[] }` |
| **404** | No matches — `{ code: 'PLACE_NOT_FOUND', message: '...' }` |
| **400** | Missing/invalid `q` |
| **502** | Open-Meteo failure |

#### `GET /places/reverse`

| | |
|--|--|
| **Query** | `latitude`, `longitude` (required, validated ranges) |
| **200** | `{ places: PlaceCandidate[] }` (0–5; 404 if empty) |
| **400** | Invalid coordinates |
| **502** | Upstream failure |

#### `GET /weather`

| | |
|--|--|
| **Query** | `latitude`, `longitude`, `temperatureUnit` (`celsius` \| `fahrenheit`) |
| **200** | `WeatherPanelPayload` |
| **400** | Invalid query |
| **502** | Upstream failure |

**OpenAPI:** Add `backend/openapi.yaml` (or extend existing) documenting the three endpoints, query params, response schemas, and status codes per project REST rules.

**Security:** MVP routes are public (course demo, no accounts). Wire routes through a shared `router` module so auth middleware can be added later without reshaping handlers. Do not call Open-Meteo from the frontend.

## Integration Points

| Service | Purpose | Auth |
|---------|---------|------|
| Open-Meteo Geocoding | Forward/reverse place resolution | None |
| Open-Meteo Forecast | Current + hourly + daily | None |

**Client behavior:**

- Native `fetch` with `AbortSignal.timeout` (e.g. 8s).
- No retry loop in MVP; single attempt, surface failure to UI with retry button (frontend re-invokes same endpoint).
- Log upstream status and latency at `warn`/`error` with `{ endpoint, status, durationMs }`.

**Browser geolocation:** Used only in frontend; coordinates passed to `/places/reverse` only after chip click.

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|---------------------|-----------------|
| `backend/src/index.ts` | Modified | Register new routers | Import and mount place/weather routes |
| `backend/src/controllers/*` | New | HTTP layer | Add places + weather controllers |
| `backend/src/services/*` | New | Business orchestration | Implement place + weather services |
| `backend/src/data/clients/*` | New | Open-Meteo integration | Implement clients + mappers |
| `frontend/src/App.tsx` | Modified | Host weather panel | Replace placeholder with feature export |
| `frontend/src/features/weather-panel/` | New | Full UI flow | Scaffold per repo-architecture |
| `frontend/src/index.css` / `tailwind.config.js` | Modified | DESIGN.md tokens | Map coral/cream/serif tokens for panel |
| `frontend/package.json` | Modified | Vitest + test script | Add devDependencies |
| `backend/package.json` | Modified | Vitest + test script | Replace stub test script |
| `DESIGN.md` | Reference | Visual contract | Apply to all panel components |
| `.compozy/tasks/weather-panel/_prd.md` | Reference | Business scope | No change |

## Testing Approach

### Unit Tests

**Backend (Vitest):**

- `PlacesService`: maps geocoding JSON to `PlaceCandidate[]`, enforces max 5, builds `label`.
- `WeatherService`: maps forecast JSON to `WeatherPanelPayload`, 24 hourly slots, 3–5 daily slots, wind unit mapping.
- Controllers: query validation → status codes (mock services).
- Clients: mock `fetch` responses; assert correct Open-Meteo query strings (`temperature_unit`, `wind_speed_unit`).

**Frontend (Vitest + React Testing Library):**

- `WeatherPanel`: empty state hint; disambiguation list render; loading states.
- Unit toggle: updates displayed temperatures (client-side conversion from stored payload when avoiding refetch — see Technical Considerations).
- Error mapping: 404 search → PT-BR “no results” message.
- Geolocation: chip does not call API until click (mock `navigator.geolocation`).

### Integration Tests

**Backend:**

- Supertest against Express app with `fetch` mocked at client boundary: `GET /places/search?q=São Paulo` → 200 with array; `GET /weather` → 200 payload shape.

**Frontend (optional MVP):**

- Mock `fetch` in api module; render panel and complete search → weather visible.

**Fixtures:** Recorded Open-Meteo JSON snippets under `backend/src/data/fixtures/` for deterministic tests.

## Development Sequencing

### Build Order

1. **Shared types and Open-Meteo clients** (`backend/src/types`, `data/clients/*`) — no dependencies.
2. **PlacesService + WeatherService** — depends on step 1.
3. **Controllers + route registration + OpenAPI** — depends on step 2.
4. **Backend Vitest unit/integration tests** — depends on step 3.
5. **Frontend API module + types** — depends on step 3 (API contract stable).
6. **Weather panel hooks and state machine** — depends on step 5.
7. **UI components** (search, disambiguation, current, hourly, daily, unit toggle, geolocation chip) — depends on step 6; apply `DESIGN.md` tokens.
8. **`App.tsx` integration + `VITE_API_BASE_URL`** — depends on step 7.
9. **Frontend tests + manual QA script** (3 cities, ambiguous name, geolocation deny/allow) — depends on step 8.

### Technical Dependencies

- Open-Meteo public availability (no API key provisioning).
- Vitest added to both packages before test steps.
- CORS already enabled on backend for `localhost` Vite dev server.
- Node 18+ for native `fetch` and `AbortSignal.timeout`.

## Monitoring and Observability

| Signal | Implementation |
|--------|----------------|
| Upstream latency | Log `openMeteo.durationMs` per request at info level |
| Upstream errors | Log status + URL path (no full query PII) at error |
| 5xx rate | Manual during demo; no metrics stack in MVP |
| Health check | Existing `GET /health` remains for API status pill |

No alerting in MVP. Phase 2 may add in-memory cache metrics if caching is introduced.

## Technical Considerations

### Key Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| Two-step REST (ADR-002) | Clear contracts for search vs weather | Minimum two round-trips |
| No server cache (ADR-003) | Fastest MVP | Demo sensitive to upstream |
| Wind coupled to temp unit (ADR-004) | Coherent metric/imperial UX | Refetch or conversion on toggle |
| Reverse geocoding for GPS (ADR-005) | Same disambiguation UX as text | Extra hop after geolocation |
| 5 disambiguation results | Reduces choice overload | May omit valid matches |
| 1h × 24 hourly points | Matches PRD precision | Horizontal scroll on mobile |
| Client-side °C/°F toggle (recommended) | Avoid second `/weather` call when cache absent | Requires conversion helpers for temps; wind per ADR-004 or refetch |

**Unit toggle implementation:** Store last `WeatherPanelPayload` in celsius (or store both units from server). On toggle, convert temperatures in the client using standard formulas; update wind label and value via conversion table (km/h ↔ mph) to honor ADR-004 without refetch. Document in feature `lib/units.ts`.

**API health badge:** Remains visible bottom-right in `App.tsx` (secondary); no debug-only move in MVP.

**Authentication:** Not required for MVP; align with `/health` public access. Document exception to “auth on all routes” rule for course scope.

### Known Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Open-Meteo slow/down | Medium | Timeouts, PT-BR error + retry button |
| Wrong city after disambiguation | Low | Show `label` with region/country |
| Geolocation denied | Medium | Neutral message; manual search |
| DESIGN.md vs shadcn zinc tokens | Medium | Extend `tailwind.config.js` with semantic colors early in step 7 |
| No Vitest yet | Certain | Add in build steps 4 and 9 |

## Architecture Decision Records

- [ADR-001: Current Conditions Panel with Hourly and Daily Mini-Forecast](adrs/adr-001.md) — MVP scope: current metrics, 24h hourly strip, 3–5 day daily, disambiguation, geolocation chip, °C/°F, no saved cities.
- [ADR-002: Two-Step REST API for Place Search and Weather](adrs/adr-002.md) — `GET /places/search`, `GET /places/reverse`, aggregated `GET /weather`.
- [ADR-003: No Server-Side Cache for Open-Meteo in MVP](adrs/adr-003.md) — Fresh upstream call on every request; cache deferred to Phase 2.
- [ADR-004: Wind Speed Units Coupled to Temperature Unit Toggle](adrs/adr-004.md) — km/h with °C, mph with °F via Open-Meteo parameters and UI labels.
- [ADR-005: Geolocation Resolves Places via Reverse Geocoding Endpoint](adrs/adr-005.md) — Browser coords → `/places/reverse` → optional pick → `/weather`.
