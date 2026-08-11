---
status: completed
title: Backend weather API (Open-Meteo proxy)
type: backend
complexity: high
dependencies: []
---

# Task 01: Backend weather API (Open-Meteo proxy)

## Overview

Implement the complete backend slice for the weather panel: shared DTOs, Open-Meteo HTTP clients, place and weather services, Express controllers and routes, OpenAPI documentation, and Vitest coverage. The backend becomes the sole source of weather and geocoding data for the frontend, proxying Open-Meteo without an API key and exposing the two-step REST contract defined in the TechSpec.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST expose `GET /places/search`, `GET /places/reverse`, and `GET /weather` as public read-only routes per TechSpec "API Endpoints" and ADR-002
- MUST access Open-Meteo Geocoding and Forecast APIs only from the backend data layer; the browser MUST NOT call Open-Meteo directly
- MUST return `{ places: PlaceCandidate[] }` with at most 5 candidates and a preformatted `label` for disambiguation UI
- MUST return `WeatherPanelPayload` with current conditions, 24 hourly slots (1-hour step), and 3–5 daily slots per TechSpec "Core Interfaces"
- MUST map `temperatureUnit` to Open-Meteo `temperature_unit` and coupled `wind_speed_unit` (km/h with celsius, mph with fahrenheit) per ADR-004
- MUST NOT implement server-side caching; every request triggers a fresh upstream call per ADR-003
- MUST use native `fetch` with `AbortSignal.timeout` (~8s), single attempt, no retry loop in MVP
- MUST throw typed domain errors (`PlaceNotFoundError`, `UpstreamWeatherError`, `InvalidQueryError`) and map controllers to 400 / 404 / 422 / 502 with JSON `{ code, message }`
- MUST centralize WMO weather code → PT-BR `conditionLabel` and icon key mapping
- MUST document all three endpoints in OpenAPI per project REST conventions
- MUST add Vitest to the backend package and replace the stub `test` script
- SHOULD export the Express `app` from a testable module so integration tests can invoke handlers without Supertest
- SHOULD log upstream latency and errors with `{ endpoint, status, durationMs }` at warn/error level
</requirements>

## Subtasks
- [x] 1.1 Define shared types, temperature unit enum, and typed domain errors
- [x] 1.2 Implement Open-Meteo geocoding and forecast HTTP clients with timeout and response mappers
- [x] 1.3 Add WMO weather code label map (PT-BR) and test fixtures for deterministic responses
- [x] 1.4 Implement PlacesService (forward/reverse search, max 5, label formatting) and WeatherService (aggregate payload, wind unit coupling)
- [x] 1.5 Implement thin controllers with query validation and HTTP status mapping; register routes on Express
- [x] 1.6 Add OpenAPI documentation for the three endpoints
- [x] 1.7 Configure Vitest and write unit plus HTTP integration tests

## Implementation Details

Scaffold the layered backend per TechSpec "System Architecture" and repo-architecture skill: `controllers → services → data/clients`. Refactor `backend/src/index.ts` to mount new routers while preserving existing `/health` and CORS middleware.

See TechSpec sections: **Core Interfaces**, **Data Models**, **API Endpoints**, **Integration Points**, and **Testing Approach** for DTO shapes, Open-Meteo query parameters, and error conventions.

Current entry point only exposes `/health`:

```14:19:backend/src/index.ts
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
```

### Relevant Files
- `backend/src/index.ts` — Mount place and weather routers; preserve CORS, JSON middleware, and `/health`
- `backend/package.json` — Add Vitest devDependencies and a real `test` script (currently stub exits with error)
- `backend/tsconfig.json` — Follow existing CommonJS/strict TypeScript settings for new modules
- `.compozy/tasks/weather-panel/_techspec.md` — Authoritative API contracts, DTO shapes, and Open-Meteo mapping rules
- `.compozy/tasks/weather-panel/_prd.md` — Business scope: search, disambiguation, forecast metrics, backend-only data access

### Dependent Files
- `frontend/src/features/weather-panel/api/` — Will consume the three GET endpoints once task_02 starts (contract must remain stable)
- `backend/openapi.yaml` — New file documenting public weather routes alongside existing health pattern

### Related ADRs
- [ADR-002: Two-Step REST API for Place Search and Weather](../adrs/adr-002.md) — Defines the three-endpoint surface and two-step frontend flow
- [ADR-003: No Server-Side Cache for Open-Meteo in MVP](../adrs/adr-003.md) — Prohibits caching layer in this task
- [ADR-004: Wind Speed Units Coupled to Temperature Unit Toggle](../adrs/adr-004.md) — Wind unit mapping in WeatherService and forecast client
- [ADR-005: Geolocation Resolves Places via Reverse Geocoding Endpoint](../adrs/adr-005.md) — `/places/reverse` contract for coordinates → candidates

## Deliverables
- `backend/src/types/` (or colocated DTO modules) with `PlaceCandidate`, `WeatherPanelPayload`, and related interfaces
- `backend/src/data/clients/open-meteo-geocoding.client.ts` and `open-meteo-forecast.client.ts`
- `backend/src/data/weather-code-labels.pt.ts` (or equivalent) for WMO → PT-BR labels
- `backend/src/services/places.service.ts` and `weather.service.ts`
- `backend/src/controllers/places.controller.ts` and `weather.controller.ts`
- Route registration wired from `backend/src/index.ts` (or dedicated router module)
- `backend/openapi.yaml` documenting query params, response schemas, and status codes
- `backend/src/data/fixtures/` with recorded Open-Meteo JSON snippets for tests
- `backend/vitest.config.ts` (or equivalent Vitest configuration)
- Unit tests with 80%+ coverage **(REQUIRED)**
- HTTP integration tests for place search and weather endpoints **(REQUIRED)**

## Tests
- Unit tests:
  - [x] `PlacesService.search` with mocked geocoding client returns up to 5 `PlaceCandidate` entries with correct `label` formatting
  - [x] `PlacesService.search` with zero upstream matches throws or returns path mapped to 404 `PLACE_NOT_FOUND`
  - [x] `PlacesService.reverse` with valid coordinates returns same candidate shape as forward search
  - [x] `WeatherService` maps forecast JSON to exactly 24 hourly slots and 3–5 daily slots
  - [x] `WeatherService` passes `temperature_unit=celsius` and `wind_speed_unit=kmh` when unit is celsius
  - [x] `WeatherService` passes `temperature_unit=fahrenheit` and `wind_speed_unit=mph` when unit is fahrenheit
  - [x] WMO code mapper returns PT-BR `conditionLabel` for representative codes (clear, cloudy, rain)
  - [x] Open-Meteo geocoding client builds correct query string for `search` and reverse modes
  - [x] Open-Meteo forecast client builds correct query string including `current`, `hourly`, and `daily` variables
  - [x] Places controller returns 400 when `q` is missing or shorter than 2 characters
  - [x] Weather controller returns 400 when `latitude`, `longitude`, or `temperatureUnit` is invalid
  - [x] Controllers map `UpstreamWeatherError` to 502 with `{ code, message }` body
- Integration tests:
  - [x] `GET /places/search?q=São Paulo` with mocked upstream returns 200 and `{ places: [...] }` array shape
  - [x] `GET /places/search?q=zzzznotaplace` returns 404 with `PLACE_NOT_FOUND` code
  - [x] `GET /places/reverse?latitude=-23.55&longitude=-46.63` returns 200 with candidate array
  - [x] `GET /weather?latitude=-23.55&longitude=-46.63&temperatureUnit=celsius` returns 200 `WeatherPanelPayload` with `current`, `hourly`, `daily`, and `meta`
  - [x] `GET /health` continues to return 200 after new routes are registered
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Three weather endpoints respond with documented status codes and JSON shapes
- Open-Meteo is never callable from frontend code; all external I/O lives in backend clients
- OpenAPI file accurately describes the public API surface
- No server-side cache layer introduced
