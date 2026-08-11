## TC-JOURNEY-002: Use Current Location After Explicit Opt-In

**Priority:** P0 (Critical)  
**Type:** Journey  
**Status:** Not Run  
**Estimated Time:** 15 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Persona:** Mobile User  
**Journey:** J-02 Use current location after explicit opt-in  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Requires browser geolocation permission behavior and evidence; no browser E2E harness exists.

---

### Journey Value

A mobile user can skip typing when they consent to location and still receive human-readable local weather through the backend reverse flow.

---

### Entry

- URL: Frontend home route in the QA build.
- Origin: direct.

---

### Preconditions

- [ ] Browser supports geolocation.
- [ ] Location permission is reset to prompt before the run.
- [ ] Backend `/places/reverse` and `/weather` are reachable.
- [ ] QA environment can provide or simulate a realistic coordinate.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | 4g |
| Device | phone-small |
| Browser | Android Chrome latest or iOS Safari latest |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | empty |
| Modality | touch |

---

### Actions

| Step | Verb | Expected observable | Time budget (s) |
|---|---|---|---|
| 1 | Open | Weather panel shows manual search and an opt-in location affordance. | 3 |
| 2 | Tap | Browser permission prompt appears only after tapping the location affordance. | 3 |
| 3 | Allow | App shows progress while resolving coordinates to place candidates. | 10 |
| 4 | Confirm | Weather loads directly or after a candidate selection, with place label visible. | 10 |

---

### Test Steps

1. Open the app on a mobile viewport with geolocation permission reset.
   **Expected:** The panel does not request location on load and manual search is immediately available.

2. Tap the `Usar minha localização` affordance.
   **Expected:** Browser permission prompt appears as a result of the tap, not before.

3. Allow location permission.
   **Expected:** The panel shows PT-BR loading feedback while reverse geocoding resolves the place.

4. If multiple places appear, select the candidate matching the current location.
   **Expected:** Candidate labels include enough context to choose a human-readable place.

5. Review the loaded weather.
   **Expected:** Current conditions, 24-hour forecast, and 3-5 day forecast appear for the resolved place.

---

### Goal

- **Observable:** User sees local weather with a readable place label after explicit geolocation acceptance.
- **Side effects:** Browser permission may be recorded by the browser profile; no app persistence is expected.

---

### Exit

- **Natural:** User reads local forecast, toggles units, or searches another city.
- **Abandonment paths to test:** Permission prompt ignored; reverse lookup returns unclear candidates; network drops after permission succeeds.

---

### Branches

- At step 3: when reverse lookup fails, the user gets recoverable guidance and manual search remains usable.
- At step 4: when one candidate appears, weather may load without a list.

---

### Cross-feature

- Browser geolocation, weather-panel state, backend `/places/reverse`, backend `/weather`, mobile layout, PT-BR copy.

---

### Failure Modes

- Geolocation prompt appears automatically on page load.
- Manual search is blocked while or after geolocation runs.
- Place label is missing and the user cannot tell where the weather came from.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Slow reverse lookup | Throttle network before allowing location | Loading feedback persists and does not look frozen. |
| Multiple candidates | Use coordinates near a border or dense area | User can choose before weather loads. |
| Unit toggle after location | Toggle to Fahrenheit | Current, hourly, daily, and wind labels update consistently. |

---

### Related Test Cases

- `TC-JOURNEY-003`
- `TC-CFR-003`
- `TC-CFR-004`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
