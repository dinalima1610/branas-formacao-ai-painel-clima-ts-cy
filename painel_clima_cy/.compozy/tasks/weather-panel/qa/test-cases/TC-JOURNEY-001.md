## TC-JOURNEY-001: Search Ambiguous City and Load Correct Forecast

**Priority:** P0 (Critical)  
**Type:** Journey  
**Status:** Not Run  
**Estimated Time:** 15 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Persona:** New User  
**Journey:** J-01 Search an ambiguous city and load the correct forecast  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Candidate for future E2E after a browser harness exists; execute manually/browser-driven for task_05.

---

### Journey Value

A user can avoid wrong-city weather by choosing the intended place before current, hourly, and daily weather loads.

---

### Entry

- URL: Frontend home route in the QA build.
- Origin: direct.

---

### Preconditions

- [ ] Backend `/places/search` and `/weather` are reachable through the frontend.
- [ ] Ambiguous city query `Springfield` returns multiple candidates.
- [ ] Browser locale is set to pt-BR or user-facing copy is otherwise presented in Brazilian Portuguese.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | wifi-fast |
| Device | laptop |
| Browser | Chrome latest |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | empty |
| Modality | mouse-keyboard |

---

### Actions

| Step | Verb | Expected observable | Time budget (s) |
|---|---|---|---|
| 1 | Open | Weather panel and search input are visible without requiring developer tools. | 3 |
| 2 | Search | Query `Springfield` produces loading feedback followed by multiple place choices. | 10 |
| 3 | Select | Choosing an Illinois candidate keeps the selected label clear. | 3 |
| 4 | Read | Current conditions, 24 hourly slots, and 3-5 daily forecast entries are visible for the selected place. | 10 |

---

### Test Steps

1. Open the app home view as a first-time visitor.
   **Expected:** The empty state invites city search in PT-BR and the geolocation option is opt-in, not automatic.

2. Enter `Springfield` and submit the search.
   **Expected:** Loading feedback appears quickly, then a candidate list shows multiple Springfields with region and country context.

3. Select `Springfield, Illinois, United States` or the closest matching Illinois candidate.
   **Expected:** The panel starts weather loading for that candidate and does not silently choose another place.

4. Inspect the loaded current conditions.
   **Expected:** Temperature, condition label, icon/visual indicator, feels-like, humidity, and wind are visible and tied to the selected place.

5. Inspect the forecast sections.
   **Expected:** The next 24 hours and the daily 3-5 day summary are visible, scannable, and use the active temperature unit.

---

### Goal

- **Observable:** The user sees weather for the selected Springfield candidate with current conditions, 24-hour forecast, and 3-5 day forecast.
- **Side effects:** None expected beyond read-only backend requests.

---

### Exit

- **Natural:** User searches another city, toggles units, or closes the tab after reading.
- **Abandonment paths to test:** Candidate list does not distinguish places; user selects wrong candidate and retries; search is slow enough that the user considers it stuck.

---

### Branches

- At step 2: when only one candidate appears, the app may skip disambiguation and load weather directly.
- At step 2: when no candidate appears, continue with `TC-FUNC-002`.
- At step 4: when weather is unavailable, continue with `TC-FUNC-003`.

---

### Cross-feature

- Frontend home integration, weather-panel state, backend place search, backend weather aggregation, condition labels, responsive forecast sections.

---

### Failure Modes

- Wrong city weather is shown after the user selects a specific candidate.
- Candidate labels lack enough context for the user to choose correctly.
- Forecast sections partially render, hiding hourly or daily values.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Repeat after success | Search `Sao Paulo` after Springfield loads | New place replaces old place without stale Springfield data. |
| Keyboard selection | Use Tab and Enter to choose a candidate | Candidate can be selected without a mouse. |
| Refresh mid-load | Refresh while weather is loading | The app returns to a sensible initial or recoverable state. |

---

### Related Test Cases

- `SMOKE-001`
- `TC-FUNC-001`
- `TC-CFR-001`
- `TC-CFR-002`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
