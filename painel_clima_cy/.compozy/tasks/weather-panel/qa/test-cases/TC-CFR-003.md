## TC-CFR-003: Perceived Performance on Weather Panel

**Priority:** P0 (Critical)  
**Type:** CFR  
**Status:** Not Run  
**Estimated Time:** 15 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**CFR Category:** Perceived-Performance  
**Persona:** Mobile User  
**Surface:** Weather Panel  
**Journey:** J-02 Use current location after explicit opt-in  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Perceived timing and responsiveness require browser observation; no browser E2E harness exists.

---

### Objective

Verify the user receives timely feedback while the weather panel performs live search, reverse geocoding, weather loading, and retry actions.

---

### Preconditions

- [ ] QA browser can throttle to 3G or flaky network.
- [ ] Frontend and backend are reachable.
- [ ] Valid city and geolocation paths are available.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | 3g |
| Device | phone-small |
| Browser | Android Chrome latest or iOS Safari latest |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | empty |
| Modality | touch |

---

### Checklist

- [ ] First meaningful weather panel content appears quickly enough that the page does not feel blank.
- [ ] Search submit gives visible feedback within 100ms when the request lasts longer than 300ms.
- [ ] Candidate selection gives visible feedback before weather arrives.
- [ ] Geolocation reverse lookup gives status feedback after permission is allowed.
- [ ] Retry gives immediate feedback and does not appear ignored.
- [ ] Long-running requests provide a clear "still working" state or recoverable failure.

---

### Targets

| Observable | Target | Acceptable | Actual |
|---|---|---|---|
| First meaningful panel content | < 2s on wifi | < 4s on 3G | |
| Spinner/status after action | < 100ms | < 300ms | |
| Time to interactive | < 3s on wifi | < 6s on 3G | |
| Button feedback | < 50ms | < 150ms | |

---

### Test Steps

1. Open the app under 3G throttling.
   **Expected:** The weather panel becomes visible within the acceptable target and the page does not remain blank.

2. Search `Sao Paulo`.
   **Expected:** Submit feedback appears quickly, and the user can tell the app is working before results arrive.

3. Tap geolocation and allow permission under throttled network.
   **Expected:** Reverse lookup and weather loading states are visible and do not look frozen.

4. Trigger or simulate unavailable weather, then tap retry.
   **Expected:** Retry feedback appears immediately and the next state is clear.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Double tap submit | Tap submit twice while network is slow | UI avoids duplicate or confusing loading states. |
| Network drop | Toggle offline mid-request, then restore | User receives recoverable failure or successful retry path. |
| Scroll during loading | Scroll hourly/daily area while new data loads | Layout remains stable and user understands data freshness. |

---

### Pass Criteria

- All timing observables are within acceptable targets or filed as user-impact bugs.
- No perceived stall causes a P0 journey abandonment without recoverable guidance.

---

### Related Test Cases

- `TC-JOURNEY-002`
- `TC-FUNC-003`
- `CH-01`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
