## TC-PERSONA-001: Power User Presenter Runs Repeated Weather Demo

**Priority:** P1 (High)  
**Type:** Persona  
**Status:** Not Run  
**Estimated Time:** 15 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**Persona:** Power User  
**Surface:** Weather Panel  
**Journey:** J-06 Run a reliable live demo with repeated cities  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Presenter pacing, keyboard flow, and state clarity require manual/browser observation. No E2E harness exists.

---

### Persona Attributes

| Attribute | Value |
|---|---|
| Name | Power User |
| Familiarity | expert |
| Motivation | ship-work-fast |
| Device | laptop |
| Network | wifi-fast |
| Modality | keyboard-only |
| Locale | pt-BR |
| Patience (seconds) | 10 |

---

### Objective

Verify a demo presenter can run three weather searches, including one ambiguous city, without stale state, keyboard friction, or confusing transitions.

---

### Preconditions

- [ ] Frontend and backend are reachable.
- [ ] Queries `Sao Paulo`, `Curitiba`, and `Springfield` are available.
- [ ] Browser window is sized as it would be during a live demo.

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
| Modality | keyboard-only |

---

### Friction Hypotheses

1. Candidate selection may require mouse interaction and slow the presenter.
2. Previous weather may remain visible during a new search and confuse the audience.
3. Repeated city searches may leave stale error, loading, or selected-place state.

---

### Test Steps

1. Search `Sao Paulo` using only keyboard input and submit controls.
   **Expected:** Weather loads and the presenter can describe current, hourly, and daily sections without hidden content.

2. Search `Curitiba` immediately after the first result.
   **Expected:** The panel clearly transitions to the new city and does not show stale Sao Paulo weather as current.

3. Search `Springfield` and select an Illinois candidate using keyboard navigation.
   **Expected:** Candidate selection is reachable and the selected place loads correctly.

4. Toggle units after the third city loads.
   **Expected:** The presenter can show Celsius/Fahrenheit behavior without layout shift or inconsistent units.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Rapid repeated submit | Press Enter twice during a search | App does not duplicate or corrupt the visible state. |
| Typo correction | Enter a typo, correct it, and submit | Corrected query is the one represented in results. |
| Health indicator offline | Backend health changes during demo | Health status remains secondary and does not cover the weather journey. |

---

### Pass Criteria

- All friction hypotheses are cleared or filed as bugs.
- Presenter reaches the third city forecast within the planned demo window.
- No `Blocks-Completion` or `Trust-Damage` observation appears in the repeated-run flow.

---

### Related Test Cases

- `TC-JOURNEY-001`
- `TC-FUNC-001`
- `SMOKE-001`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
