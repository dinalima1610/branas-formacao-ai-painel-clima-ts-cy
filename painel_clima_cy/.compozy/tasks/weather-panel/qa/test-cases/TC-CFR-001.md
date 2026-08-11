## TC-CFR-001: Usability on Weather Panel Search and Forecast

**Priority:** P0 (Critical)  
**Type:** CFR  
**Status:** Not Run  
**Estimated Time:** 15 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**CFR Category:** Usability  
**Persona:** Casual User  
**Surface:** Weather Panel  
**Journey:** J-01 Search an ambiguous city and load the correct forecast  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Usability judgment belongs to real-user QA evidence; no browser E2E harness exists.

---

### Objective

Verify the Weather Panel search, disambiguation, forecast display, unit toggle, and recovery affordances are understandable to a casual user.

---

### Preconditions

- [ ] Weather panel is reachable in a production-parity QA build.
- [ ] Test queries include `Springfield`, `Sao Paulo`, and `zzzznotaplace`.
- [ ] Tester can capture screenshots for usability findings.

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

### Checklist

- [ ] Visibility of system status within 1 second of search, candidate selection, geolocation, unit toggle, and retry.
- [ ] Match with real-world language in PT-BR; no raw status codes or developer labels.
- [ ] User control and freedom: search can be refined, retried, or replaced.
- [ ] Consistent nouns for city, place, forecast, and units.
- [ ] Error prevention for empty or too-short searches.
- [ ] Recognition over recall in disambiguation labels.
- [ ] Help users recover from no-results and unavailable weather.

---

### Targets

| Observable | Target | Acceptable | Actual |
|---|---|---|---|
| Feedback after submit | Visible within 1s | Visible within 2s | |
| Disambiguation clarity | Region/country visible | Country visible | |
| Error next action | Specific PT-BR next step | Generic retry/refine allowed | |

---

### Test Steps

1. Search `Springfield` and inspect the candidate list.
   **Expected:** The user can recognize each candidate by place context without memorizing prior state.

2. Select a candidate and inspect the forecast layout.
   **Expected:** Current, hourly, and daily sections have clear hierarchy and labels.

3. Toggle the unit control.
   **Expected:** The active unit is obvious and all affected values update without surprising movement.

4. Search `zzzznotaplace`.
   **Expected:** PT-BR no-results guidance explains how to refine and keeps search usable.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Back after results | Press browser Back after loading forecast | User does not lose the ability to search again. |
| Empty input | Submit an empty search | User gets actionable validation near the search control. |
| Repeat search | Search a new city from loaded state | Old weather does not masquerade as new weather. |

---

### Pass Criteria

- All checklist items pass or are filed as user-impact bugs.
- No `Friction`-class or higher usability finding remains unfiled.

---

### Related Test Cases

- `TC-JOURNEY-001`
- `TC-FUNC-001`
- `TC-FUNC-002`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
