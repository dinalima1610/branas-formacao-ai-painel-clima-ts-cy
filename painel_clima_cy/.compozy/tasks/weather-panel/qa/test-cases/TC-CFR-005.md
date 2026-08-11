## TC-CFR-005: Error Recoverability on Weather Panel

**Priority:** P0 (Critical)  
**Type:** CFR  
**Status:** Not Run  
**Estimated Time:** 20 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**CFR Category:** Error-Recoverability  
**Persona:** Recovering User  
**Surface:** Weather Panel  
**Journey:** J-05 Recover from no results or unavailable weather  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Recovery quality requires observing failure states and user next actions; no browser E2E harness exists.

---

### Objective

Verify denied location, no results, upstream unavailable, and generic failure states keep the user oriented and able to continue.

---

### Preconditions

- [ ] Browser location permission can be denied.
- [ ] No-results query is available.
- [ ] Upstream or backend failure can be simulated or documented as blocked.
- [ ] Tester can restore the happy path after failure.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | flaky |
| Device | laptop |
| Browser | Chrome latest |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | empty |
| Modality | mouse-keyboard |

---

### Checklist

- [ ] Failure uses plain-language PT-BR explanation.
- [ ] Failure offers a specific next step: retry, refine, or search manually.
- [ ] User input is preserved where possible.
- [ ] Transient vs permanent failure is understandable.
- [ ] No stale weather is presented as fresh data after a failure.
- [ ] Data-loss situations, if any, name what was lost.

---

### Targets

| Observable | Target | Acceptable | Actual |
|---|---|---|---|
| Retry visibility | Visible in transient failure | Clear next action visible | |
| Manual fallback after denied location | Always enabled | Enabled after message dismissal | |
| Stale data protection | Old data clearly replaced or separated | No misleading old data | |

---

### Test Steps

1. Deny geolocation and inspect the recovery state.
   **Expected:** The app explains the denial neutrally and manual search remains available.

2. Search `zzzznotaplace`.
   **Expected:** No-results guidance suggests refining the query and the input remains editable.

3. Simulate upstream/weather unavailable and search a valid city.
   **Expected:** A PT-BR availability error appears with retry or a clear next action.

4. Restore availability and retry or search again.
   **Expected:** The user can reach a loaded weather forecast without refreshing the whole app.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Retry fails twice | Retry while failure remains active | Message stays understandable and does not duplicate confusing content. |
| Back in error state | Press browser Back after failure | User can return to a useful search state. |
| New search after error | Search another valid city | New search is not blocked by prior failure. |

---

### Pass Criteria

- All failure paths remain recoverable without restarting the app.
- No `Trust-Damage`, `Data-Loss`, or `Blocks-Completion` recovery finding remains unfiled.

---

### Related Test Cases

- `TC-JOURNEY-003`
- `TC-FUNC-002`
- `TC-FUNC-003`
- `CH-03`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
