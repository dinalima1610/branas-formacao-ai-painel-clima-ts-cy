# CH-03: Error Recovery and Browser Back Behavior

## Charter

**Mode:** Charter-With-Tour  
**Persona:** Recovering User  
**Surface:** Geolocation chip, error states, retry, and browser navigation around the weather panel  
**Entry URL:** Frontend home route in the production-parity QA build  
**Tour:** Back-Button Tour  
**Time-box:** 30 minutes

## Mission

Verify users can recover from denied location, no results, upstream failures, retry attempts, refreshes, and browser back navigation without losing the manual weather path.

## Out of Scope

- Offline-first behavior or background sync.
- Browser permission settings outside the active session.
- Backend logs unless needed to file a user-impact bug.

## Must Try

- Deny geolocation, then immediately perform a manual city search.
- Search a no-result query, press back/forward, and refine the query.
- Trigger or simulate upstream unavailable, use retry, then search a different city.
- Refresh during loading and verify the panel lands in a sensible state.

## Must Avoid

- Do not classify CI, build, or unit-test failures as real-user bugs from this charter.
- Do not assume a retry passes without visible user evidence.

## Debrief Template

- Started: <ISO>
- Ended: <ISO>
- Findings:
  - <finding>
- Bugs filed: [BUG-NNN]
- Surprises: <unexpected observations>
- Suggested next charter: <one-line proposal>
