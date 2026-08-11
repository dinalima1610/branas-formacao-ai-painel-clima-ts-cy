## SMOKE-001: Weather Panel Critical Journey Sanity

**Priority:** P0 (Critical)  
**Type:** Smoke  
**Status:** Not Run  
**Estimated Time:** 10 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Persona:** New User  
**Journey:** J-01 Search an ambiguous city and load the correct forecast  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** No browser E2E harness exists in the repository. Execute through qa-execution browser/manual evidence.

---

### Objective

Validate that the Weather Panel MVP is not catastrophically broken: a first-time user can search, resolve ambiguity, and see current, hourly, and daily weather.

---

### Preconditions

- [ ] Frontend home view is reachable in a production-parity QA build.
- [ ] Backend weather routes are reachable through the frontend's configured API base URL.
- [ ] Use a normal browser profile, not incognito.
- [ ] Test data includes ambiguous query `Springfield`.

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

1. Open the app home view.
   **Expected:** The weather panel is the primary content, the search input is visible, and no weather request starts before user action.

2. Search for `Springfield`.
   **Expected:** The panel shows loading feedback, then a short disambiguation list with region/country context.

3. Select `Springfield, Illinois, United States` or the closest matching Illinois candidate.
   **Expected:** Weather loading feedback appears for the selected place and the selected label remains understandable.

4. Review the loaded forecast.
   **Expected:** Current conditions, a 24-hour forecast strip, and a 3-5 day forecast are all visible with PT-BR labels.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Back after goal | Press browser Back after forecast appears | User can return or remain in a sensible panel state without duplicate weather requests. |
| Repeat search | Search `Curitiba` after Springfield loads | New weather replaces old place context clearly. |
| Slow response | Repeat on slow network | Loading feedback appears quickly and avoids blank-screen ambiguity. |

---

### Post-conditions

- Smoke pass only if no `Blocks-Completion` issue prevents reaching the forecast.
- Screenshots should be captured by task_05 at entry, disambiguation, and loaded forecast.

---

### Related Test Cases

- `TC-JOURNEY-001`
- `TC-FUNC-001`
- `TC-CFR-001`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
