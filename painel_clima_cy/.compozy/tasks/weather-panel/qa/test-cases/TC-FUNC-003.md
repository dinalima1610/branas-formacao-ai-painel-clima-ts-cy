## TC-FUNC-003: Upstream or Availability Failure Offers Retry

**Priority:** P0 (Critical)  
**Type:** Functional  
**Status:** Not Run  
**Estimated Time:** 12 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Persona:** Recovering User  
**Module:** Weather Panel  
**Journey:** J-05 Recover from no results or unavailable weather  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** No browser E2E harness exists. Failure can be induced by a QA proxy, unavailable backend, or documented test environment control.

---

### Objective

From the Recovering User's perspective, verify transient weather/search failures are explained in PT-BR and offer a visible retry path.

---

### Preconditions

- [ ] QA environment can simulate backend or upstream unavailability without changing application code.
- [ ] A known valid city query such as `Sao Paulo` is available.
- [ ] Tester can restore availability to validate retry recovery.

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

### Test Steps

1. Configure the QA environment so the weather request or backend availability fails, then search `Sao Paulo`.
   **Expected:** The panel shows loading feedback, then a PT-BR availability/upstream error without developer-only codes or stack traces.

2. Inspect the failure state.
   **Expected:** A retry affordance or clear next action is visible, and any previous weather is not presented as fresh data.

3. Restore availability and activate retry.
   **Expected:** The same intended request runs again and loading feedback appears.

4. Review the recovered state.
   **Expected:** Weather loads for the intended place with current conditions, 24-hour forecast, and daily forecast visible.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Retry still fails | Keep backend unavailable and retry | User receives stable recovery guidance, not duplicate or worsening messages. |
| Search different city after failure | Enter `Curitiba` instead of retrying | New search is allowed and does not remain stuck on prior error. |
| Refresh in error state | Refresh before retry | Panel returns to a sensible initial or recoverable state. |

---

### Post-conditions

- Restore QA environment availability.
- File a `Trust-Damage` or higher bug if retry is missing or failure copy is not actionable.

---

### Related Test Cases

- `TC-FUNC-002`
- `TC-CFR-003`
- `TC-CFR-005`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
