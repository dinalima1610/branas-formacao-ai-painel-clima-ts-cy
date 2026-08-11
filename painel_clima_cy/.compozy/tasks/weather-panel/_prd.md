# PRD: Weather Panel

## Overview

The **IA para Devs** application currently shows a placeholder landing page with API health status only. Learners and demo viewers need a practical weather panel: enter a city (or optionally use their location), pick the correct place when names collide, and see current conditions plus a short forward-looking forecast—all without exposing third-party weather APIs directly to the browser.

The weather panel serves **course participants and demo audiences** who want a tangible full-stack example (frontend + backend) grounded in real-world data. It replaces the empty center of the home experience with a focused, editorial weather experience aligned with the project design system.

## Goals

- Enable users to obtain **accurate weather for a chosen place** within one interaction flow (search → optional disambiguation → results).
- Show **current conditions and short-range forecast** (24 hours + 3–5 days) so users can plan the rest of the day and the week at a glance.
- Keep the frontend dependent **only on the project backend** for weather data (privacy, consistency, and teaching clarity).
- Ship an MVP that is **demo-ready** for the course without account management, favorites, or multi-city persistence.

**Target outcome (MVP):** A user can open the app, search “São Paulo”, confirm the correct city if needed, and read current weather plus hourly and daily forecast in under ~10 seconds on a typical connection, with clear feedback when something fails.

## User Stories

### Primary — Curious learner / demo viewer

- As a **learner**, I want to **type a city name and see current weather**, so that I can verify the full-stack integration works end to end.
- As a **user**, I want to **choose among similar city names**, so that I do not get weather for the wrong place.
- As a **user**, I want to **see how the weather evolves over the next 24 hours**, so that I can plan the rest of my day.
- As a **user**, I want to **see a 3–5 day outlook**, so that I can anticipate conditions later in the week.
- As a **user**, I want to **switch between Celsius and Fahrenheit**, so that I can read temperatures in my preferred unit.
- As a **user**, I want to **tap “use my location” when offered**, so that I can skip typing my city when I am willing to share location.

### Secondary — Privacy-conscious user

- As a **user who denies location access**, I want to **search by city manually without broken flows**, so that the app remains fully usable.

### Edge cases

- As a **user**, when **no city matches my search**, I want a **clear message** so that I know to refine my query.
- As a **user**, when **weather data is temporarily unavailable**, I want to **understand what went wrong** and **try again**, so that I am not stuck on a blank screen.

## Core Features

### 1. City search and disambiguation

- Free-text input for city (or place) name with explicit search/submit action.
- When the backend returns **multiple matching places**, show a **short list** (name, region/country context) so the user selects one before weather loads.
- When **no matches**, show a friendly, actionable error (e.g., try a more specific name).
- **Priority:** P0 (MVP).

### 2. Current conditions panel

Display for the selected place:

- Temperature (respecting unit toggle)
- Short natural-language condition (e.g., “Partly cloudy”)
- Visual weather indicator (icon or equivalent)
- Feels-like temperature
- Humidity
- Wind speed (with understandable units label)

- **Priority:** P0 (MVP).

### 3. Mini-forecast — next 24 hours

- Horizontal or similarly scannable **hourly strip** for the next 24 hours.
- Each interval shows at least **time**, **temperature**, and **condition indicator**.
- **Priority:** P0 (MVP).

### 4. Mini-forecast — 3–5 days

- **Daily cards or rows** for the next 3–5 days.
- Each day shows **day label**, **min and max temperature**, and **condition indicator**.
- **Priority:** P0 (MVP).

### 5. Temperature unit toggle

- Control to switch display between **°C** and **°F**.
- Toggle applies to **all numeric temperatures** in current, hourly, and daily sections for the active session.
- **Priority:** P0 (MVP).

### 6. Optional geolocation suggestion

- On supported browsers, offer a **chip or button** (e.g., “Use my location”).
- Only after **explicit acceptance**, resolve the user’s coordinates to a place and continue the normal flow (including disambiguation if needed).
- If permission is denied or location fails, **do not block** manual search; show neutral guidance.
- **Priority:** P0 (MVP).

### 7. Backend weather endpoint (product capability)

- The frontend retrieves **all weather-related data exclusively from the project backend** (single consumer contract).
- The backend is responsible for resolving places and assembling current + forecast payloads the panel needs.
- **Priority:** P0 (MVP).

### 8. Loading and error states

- Visible **loading** state while search, disambiguation, or weather fetch is in progress.
- Distinct messaging for: no results, user cancelled location, upstream unavailable, and generic failure—with **retry** where appropriate.
- **Priority:** P0 (MVP).

## User Experience

### Personas

| Persona | Goal |
|--------|------|
| Course learner | Validate stack; try different cities |
| Demo presenter | Reliable, readable panel during live demo |
| Casual visitor | Quick local or travel weather check |

### Primary flow

1. User lands on the home view; the **weather panel** is the main focus (health indicator may remain secondary).
2. User enters a city and submits search.
3. If multiple places match → user picks one from the list.
4. Panel shows **loading**, then **current conditions**.
5. Below, user sees **24-hour hourly strip**, then **3–5 day daily summary**.
6. User may toggle **°C / °F** at any time; all temperatures update.
7. Optionally, user taps **“Use my location”** → on success, flow continues from step 3 or 4 as needed.

### UI/UX considerations

- Follow **DESIGN.md**: warm canvas, serif display for headings, coral CTAs, clear hierarchy, accessible contrast.
- Mobile-first layout: hourly strip scrolls horizontally; daily section stacks vertically on narrow viewports.
- Typography large enough for temperature at a glance; secondary metrics de-emphasized but readable.
- Icons or visuals tied to condition codes for quick scanning.
- Keyboard-accessible search, list selection, and toggle.
- Do not auto-request geolocation on page load; only after chip interaction.

### Discoverability

- Placeholder headline area evolves into panel title (e.g., “Weather”) with search prominent above results.
- Empty state before first search: short hint (“Search for a city to see the weather”).

## High-Level Technical Constraints

- **Data source:** Open-Meteo Geocoding and Forecast services (free tier, no API key), accessed **only by the backend**, not by the browser for weather/geocoding.
- **Frontend boundary:** All weather reads go through the **project backend**; no direct calls from the UI to Open-Meteo.
- **Geolocation:** Browser geolocation may be used **only** to suggest or resolve the user’s place after explicit opt-in; coordinates are not a substitute for the backend contract from the product perspective.
- **Design system:** UI must conform to `DESIGN.md`.
- **Existing stack:** Extend the current React + Vite frontend and Express backend; no new user accounts or databases required for MVP.
- **Language:** User-facing copy in **Brazilian Portuguese**; place names may appear as returned by the geocoding provider (localized when available).

## Non-Goals (Out of Scope)

- User accounts, authentication, or saved profiles
- Favorite cities, search history, or cross-session persistence
- Weather maps, radar, or precipitation animations
- Severe weather alerts or push notifications
- Multi-city comparison dashboard
- Air quality, pollen, or specialized indices beyond the standard current metrics listed
- Offline mode or background refresh
- Replacing or removing the API health indicator (may coexist as secondary status)

## Phased Rollout Plan

### MVP (Phase 1) — Single release

Includes all Core Features (P0): search, disambiguation, current conditions, 24h hourly strip, 3–5 day daily summary, unit toggle, geolocation chip, backend-only data access, loading/error states.

**Success criteria to consider MVP complete:**

- End-to-end demo: three distinct cities (including one ambiguous name) show correct weather.
- Geolocation chip works when permitted; manual search works when denied.
- Unit toggle updates all visible temperatures.
- Errors are understandable in Portuguese without developer tools.

### Phase 2 — Enhancements (post-MVP)

- Remember last searched city in browser storage
- Favorite cities quick access
- Locale-aware date/time formatting refinements
- Improved empty states and skeleton loaders

### Phase 3 — Growth (optional)

- Extended forecast (7–10 days) or “feels like” in daily cards
- Shareable link to a city’s weather view
- Accessibility audit with screen-reader-optimized forecast tables

## Success Metrics

| Metric | Target (MVP) |
|--------|----------------|
| Successful city → weather completion rate | ≥ 90% in manual QA scenarios |
| Wrong-city reports (after disambiguation) | 0 in scripted ambiguous-city tests |
| Time to first meaningful paint of weather | Perceived < 5s on typical broadband after place selected |
| Geolocation opt-in usage | Tracked qualitatively; not a launch blocker |
| Demo reliability | 10 consecutive presenter runs without blocking errors |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Users pick wrong city from disambiguation list | Show region/country in list labels; default sort by relevance/population from provider |
| Geolocation perceived as intrusive | Opt-in chip only; no modal on first paint |
| Forecast clutter on small screens | Prioritize 24h strip; collapse daily section behind “next days” if needed in UX polish |
| Open-Meteo downtime or rate limits | User-visible error + retry; backend caching considered in TechSpec |
| Course scope creep | Non-goals list enforced; no favorites/history in MVP |

## Architecture Decision Records

- [ADR-001: Current Conditions Panel with Hourly and Daily Mini-Forecast](adrs/adr-001.md) — MVP includes standard current metrics, 24h hourly strip, 3–5 day daily summary, disambiguation, opt-in geolocation chip, and °C/°F toggle; no saved cities.

## Open Questions

- Should wind speed display in km/h, m/s, or follow user locale automatically?
- Maximum number of disambiguation results to show (e.g., 5 vs 10)?
- Exact hourly interval density for the 24h strip (every hour vs every 3 hours) — balance readability vs precision.
- Whether the API health badge stays visible during demo or moves to a debug-only area.
