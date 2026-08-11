## TC-FUNC-001: Unit Toggle Updates Current, Hourly, and Daily Values

**Priority:** P0 (Critical)  
**Type:** Functional  
**Status:** Not Run  
**Estimated Time:** 10 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Persona:** Casual User  
**Module:** Weather Panel  
**Journey:** J-04 Read forecast in the preferred unit  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Existing Vitest coverage may cover conversion logic, but real-user QA must verify visible browser behavior. No browser E2E harness exists.

---

### Objective

From the Casual User's perspective, verify the Celsius/Fahrenheit toggle changes every visible weather value consistently.

---

### Preconditions

- [ ] Weather is loaded for a city with current, hourly, and daily data visible.
- [ ] The active unit starts in Celsius.
- [ ] Wind speed is visible with a unit label.

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

### Test Steps

1. Load weather for `Sao Paulo`.
   **Expected:** Current, hourly, and daily sections show Celsius values and wind in km/h.

2. Switch the unit control from Celsius to Fahrenheit.
   **Expected:** Current temperature, feels-like, hourly temperatures, daily min/max values, and wind label/value update to the imperial presentation.

3. Switch back from Fahrenheit to Celsius.
   **Expected:** All current, hourly, daily, and wind values return to metric presentation without changing the selected place.

4. Search a different city after toggling.
   **Expected:** The loaded forecast uses the active unit consistently for the new city.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Toggle during load | Start a new city search and toggle before weather completes | UI stays coherent and final weather uses one clear active unit. |
| Keyboard-only toggle | Tab to the toggle and activate it with keyboard | Unit changes without mouse interaction. |
| Narrow viewport | Repeat at 375px width | Toggle text and forecast values do not overlap or truncate critical data. |

---

### Post-conditions

- Active unit should be clear after the run.
- No saved preference is expected across sessions for MVP.

---

### Related Test Cases

- `TC-JOURNEY-001`
- `TC-CFR-001`
- `TC-CFR-004`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
