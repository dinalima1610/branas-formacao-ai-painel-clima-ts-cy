## TC-FUNC-002: No Search Results Shows PT-BR Refinement Guidance

**Priority:** P0 (Critical)  
**Type:** Functional  
**Status:** Not Run  
**Estimated Time:** 8 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Persona:** Casual User  
**Module:** Weather Panel  
**Journey:** J-05 Recover from no results or unavailable weather  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** No browser E2E harness exists; execute through visible browser behavior.

---

### Objective

From the Casual User's perspective, verify no-results searches provide understandable PT-BR guidance and keep the search flow recoverable.

---

### Preconditions

- [ ] Frontend and backend are reachable.
- [ ] Query `zzzznotaplace` or equivalent returns no place matches.
- [ ] Manual search input is visible.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | wifi-fast |
| Device | laptop |
| Browser | Safari latest or Chrome latest |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | empty |
| Modality | mouse-keyboard |

---

### Test Steps

1. Open the app and submit `zzzznotaplace`.
   **Expected:** Loading feedback appears and then a PT-BR no-results message explains that the user should refine the city/place.

2. Inspect the panel after the no-results message.
   **Expected:** No stale weather is presented as if it belonged to the invalid query.

3. Replace the query with `Curitiba` and submit.
   **Expected:** Manual search recovers without refresh and proceeds to weather or candidate selection.

4. Review the loaded valid result.
   **Expected:** Current, hourly, and daily weather appears for the valid city.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Empty submit | Submit an empty or one-character query | Inline validation or guidance prevents a confusing request. |
| Paste weird input | Paste emoji or a very long non-city query | Error remains user-friendly and the input remains editable. |
| Back after no results | Press browser Back after no-results | User can still refine or search again. |

---

### Post-conditions

- The panel remains usable after no-results.
- No bug should be filed for provider absence alone unless recovery copy or state is misleading.

---

### Related Test Cases

- `TC-JOURNEY-003`
- `TC-FUNC-003`
- `TC-CFR-005`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
