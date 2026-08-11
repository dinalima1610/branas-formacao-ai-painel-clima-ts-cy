## TC-CFR-006: Production Parity for Weather Panel QA

**Priority:** P0 (Critical)  
**Type:** CFR  
**Status:** Not Run  
**Estimated Time:** 15 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**CFR Category:** Production-Parity  
**Persona:** New User  
**Surface:** Weather Panel  
**Journey:** J-01 Search an ambiguous city and load the correct forecast  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Production-parity validation is an environment/session check for task_05; no browser E2E harness exists.

---

### Objective

Verify the Weather Panel QA session uses production-realistic browser and service conditions so the evidence can be trusted.

---

### Preconditions

- [ ] QA build is reachable through the same route users would open.
- [ ] Frontend is configured to call the project backend, not Open-Meteo directly.
- [ ] Browser profile can be normal, with cookies enabled.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | wifi-fast and 3g spot check |
| Device | laptop |
| Browser | Chrome latest |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | realistic default |
| Modality | mouse-keyboard |

---

### Checklist

- [ ] Tested in a build that matches the intended deploy artifact as closely as available.
- [ ] Tested with cookies enabled.
- [ ] Tested in a normal browser profile, not incognito-only.
- [ ] Tested with a realistic extension set or documented clean-profile deviation.
- [ ] Tested against the project backend services, not local mocked weather data.
- [ ] Browser frontend makes no direct Open-Meteo weather/geocoding calls.
- [ ] Network conditions include at least one realistic worst-case spot check.

---

### Targets

| Observable | Target | Acceptable | Actual |
|---|---|---|---|
| Backend-only weather data | All weather calls go to project backend | Any deviation documented as blocker | |
| Browser profile | Normal profile with cookies | Deviation documented | |
| Network parity | wifi plus slow network spot check | One documented network profile if constrained | |

---

### Test Steps

1. Open the QA build in a normal browser profile.
   **Expected:** Cookies and normal browser state are available; the run is not incognito-only.

2. Load weather for `Sao Paulo` and inspect browser network evidence.
   **Expected:** Weather/geocoding requests go to the project backend routes, not directly to Open-Meteo from the browser.

3. Repeat a core search under a slower network profile.
   **Expected:** The same user-facing flow remains observable and recovery/timing limitations are documented.

4. Record any environment deviations in the task_05 verification report.
   **Expected:** Deviations are explicit enough for stakeholders to judge whether evidence is production-representative.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Extension interference | Run with one common extension if available | Any UI/network impact is documented. |
| Clean profile only | If no normal profile is available, run clean profile | Deviation is recorded and not hidden. |
| Alternate API base URL | Run with configured non-default backend | UI still calls backend-only weather routes. |

---

### Pass Criteria

- No production-parity gap invalidates the QA session.
- Any unavoidable deviation is disclosed in the verification report before conclusions are made.

---

### Related Test Cases

- `SMOKE-001`
- `TC-JOURNEY-001`
- `TC-FUNC-003`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
