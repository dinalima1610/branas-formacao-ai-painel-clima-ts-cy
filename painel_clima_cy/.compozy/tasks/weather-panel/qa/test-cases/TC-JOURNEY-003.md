## TC-JOURNEY-003: Deny Location and Continue With Manual Search

**Priority:** P0 (Critical)  
**Type:** Journey  
**Status:** Not Run  
**Estimated Time:** 12 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Persona:** Recovering User  
**Journey:** J-03 Deny location and continue with manual search  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Browser permission denial and recovery behavior require browser/manual evidence; no E2E harness exists.

---

### Journey Value

A privacy-conscious user remains fully able to get weather manually after denying location access.

---

### Entry

- URL: Frontend home route in the QA build.
- Origin: direct.

---

### Preconditions

- [ ] Browser geolocation permission is reset to prompt.
- [ ] Manual search path is available.
- [ ] Query `Curitiba` or another unambiguous city can return weather.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | wifi-slow |
| Device | laptop |
| Browser | Firefox latest |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | empty |
| Modality | mouse-keyboard |

---

### Actions

| Step | Verb | Expected observable | Time budget (s) |
|---|---|---|---|
| 1 | Open | Manual search and location affordance are both available. | 3 |
| 2 | Deny | App shows neutral guidance after permission denial. | 3 |
| 3 | Search | Manual query still works after denial. | 10 |
| 4 | Read | Weather sections load for the searched city. | 10 |

---

### Test Steps

1. Open the app and tap/click the geolocation affordance.
   **Expected:** Browser permission prompt appears after the user action.

2. Deny the location permission.
   **Expected:** PT-BR guidance explains that manual search is still available without blaming the user.

3. Enter `Curitiba` and submit manual search.
   **Expected:** The search input remains enabled and the denial state does not block loading.

4. Review the loaded weather.
   **Expected:** Current conditions, 24-hour forecast, and 3-5 day forecast appear for Curitiba or the selected candidate.

---

### Goal

- **Observable:** User gets weather through manual search after denying location.
- **Side effects:** Browser permission may remain denied for the profile; app should not persist a broken state.

---

### Exit

- **Natural:** User reads forecast or searches another city.
- **Abandonment paths to test:** User denies and immediately retries location; user denies and uses browser back; user refreshes after denial.

---

### Branches

- At step 3: when search returns multiple candidates, user can select one normally.
- At step 3: when search returns no results, continue with `TC-FUNC-002`.

---

### Cross-feature

- Browser geolocation permission, PT-BR recovery copy, manual search, backend place/weather flow.

---

### Failure Modes

- The app disables manual search after denial.
- Denial copy sounds like an error or asks the user to change browser settings before manual search.
- Retrying location loops without a manual escape.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Refresh after denial | Refresh the page before manual search | Manual search is available in the refreshed state. |
| Back after denial | Press browser Back/Forward | Panel does not enter a stuck permission state. |
| Retry location | Click location again after denial | Guidance remains recoverable and manual search stays usable. |

---

### Related Test Cases

- `TC-JOURNEY-002`
- `TC-FUNC-002`
- `TC-CFR-005`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
