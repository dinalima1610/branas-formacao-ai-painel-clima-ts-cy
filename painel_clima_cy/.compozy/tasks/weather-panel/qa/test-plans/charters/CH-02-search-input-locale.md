# CH-02: Search Input and Locale Stress

## Charter

**Mode:** Charter-With-Tour  
**Persona:** Casual User  
**Surface:** Weather search, disambiguation, and forecast display  
**Entry URL:** Frontend home route in the production-parity QA build  
**Tour:** Garbage Tour  
**Time-box:** 60 minutes

## Mission

Stress weather search with ambiguous, pasted, localized, long, and corrected city queries to find wrong-place, empty-state, or layout failures.

## Out of Scope

- SQL injection, XSS, or vulnerability classification.
- Provider-side correctness beyond labels and weather data visible to the user.
- Multi-city persistence and search history, which are non-goals.

## Must Try

- Paste city names with accents and without accents, including `Sao Paulo`, `São Paulo`, `Curitiba`, and `München`.
- Paste a long non-city string, then correct it to a valid city without refreshing.
- Submit `Springfield`, inspect the candidate labels, and choose a specific region.
- Toggle between Celsius and Fahrenheit after changing cities.

## Must Avoid

- Do not expand into API schema validation; use the visible UI as the source of QA evidence.
- Do not file provider data variation as a bug unless the app labels or recovery UX misleads the user.

## Debrief Template

- Started: <ISO>
- Ended: <ISO>
- Findings:
  - <finding>
- Bugs filed: [BUG-NNN]
- Surprises: <unexpected observations>
- Suggested next charter: <one-line proposal>
