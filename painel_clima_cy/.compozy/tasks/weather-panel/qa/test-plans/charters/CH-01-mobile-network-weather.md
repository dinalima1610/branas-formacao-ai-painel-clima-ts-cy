# CH-01: Mobile Network Weather Recovery

## Charter

**Mode:** Charter-With-Tour  
**Persona:** Mobile User  
**Surface:** Weather panel on home view  
**Entry URL:** Frontend home route in the production-parity QA build  
**Tour:** Network Tour  
**Time-box:** 60 minutes

## Mission

Verify a mobile user on slow or flaky network can search, opt into geolocation, and recover from delayed weather responses without assuming the app is frozen.

## Out of Scope

- Backend unit tests or direct Open-Meteo contract inspection.
- Security testing, load testing, or synthetic performance budgets.
- Saved-city or offline-mode behavior, which is outside the MVP.

## Must Try

- Search `Sao Paulo`, then throttle to Slow 3G before the weather response.
- Search ambiguous `Springfield`, select an intended candidate, and observe whether the correct place is still clear after the delay.
- Tap the geolocation chip, allow permission, and observe reverse lookup plus weather loading feedback.
- Drop and restore network during a retry after an upstream/unavailable state.

## Must Avoid

- Do not use direct backend URLs as evidence for a user-facing pass.
- Do not treat mocked responses as production-parity evidence unless the blocker is documented.

## Debrief Template

- Started: <ISO>
- Ended: <ISO>
- Findings:
  - <finding>
- Bugs filed: [BUG-NNN]
- Surprises: <unexpected observations>
- Suggested next charter: <one-line proposal>
