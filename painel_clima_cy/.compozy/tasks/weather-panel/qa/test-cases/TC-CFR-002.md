## TC-CFR-002: Accessibility Quick Check on Weather Panel

**Priority:** P0 (Critical)  
**Type:** CFR  
**Status:** Not Run  
**Estimated Time:** 20 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**CFR Category:** Accessibility  
**Persona:** Accessibility-Reliant  
**Surface:** Weather Panel  
**Journey:** J-01 Search an ambiguous city and load the correct forecast  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Requires keyboard and screen-reader observation; no browser E2E harness exists.

---

### Objective

Verify keyboard, screen-reader, and visual accessibility quick checks hold for the Weather Panel P0 journey.

---

### Preconditions

- [ ] Weather panel is reachable in a production-parity QA build.
- [ ] Screen reader is available: NVDA on Windows, VoiceOver on macOS/iOS, or TalkBack on Android.
- [ ] Browser zoom and OS text scaling can be adjusted for visual checks.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | wifi-fast |
| Device | laptop |
| Browser | Chrome latest or Safari latest |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | empty |
| Modality | screen-reader and keyboard-only |

---

### Checklist

Keyboard:
- [ ] Every interactive element is reachable with Tab.
- [ ] Tab order matches visual order.
- [ ] Visible focus indicator appears on search, submit, candidate, geolocation, unit toggle, and retry controls.
- [ ] Enter activates primary actions.
- [ ] No keyboard trap in candidate list or error states.

Screen reader:
- [ ] Page has a logical heading hierarchy.
- [ ] Search field has an associated label.
- [ ] Buttons have accessible names that describe their action.
- [ ] Weather icons have meaningful alt text or are decorative.
- [ ] Dynamic loading, error, and forecast updates are announced appropriately.

Visual:
- [ ] Color is not the only signal.
- [ ] Text contrast is acceptable.
- [ ] Layout does not break at 200% zoom.
- [ ] Reduce-motion preference is respected where motion exists.

---

### Targets

| Observable | Target | Acceptable | Actual |
|---|---|---|---|
| Keyboard reachability | 100% interactive controls reachable | No P0 control unreachable | |
| Dynamic status announcement | Loading/error/result announced | Error/result announcement at minimum | |
| Zoom | 200% without overlap | Critical actions still usable | |

---

### Test Steps

1. Navigate from the browser address bar through the panel using only Tab, Shift+Tab, Enter, and arrow keys where relevant.
   **Expected:** Focus order is logical and every P0 control is reachable and visibly focused.

2. Search `Springfield` and choose a candidate using keyboard and screen reader.
   **Expected:** The search field, submit action, candidate buttons, and selected-place transition have understandable accessible names or announcements.

3. Trigger no-results with `zzzznotaplace`.
   **Expected:** The error message is announced or reachable and gives a specific next step.

4. Increase browser zoom to 200% and inspect current, hourly, daily, and unit toggle areas.
   **Expected:** Text and controls remain readable and usable without overlapping critical content.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| Keyboard-only retry | Trigger unavailable state and activate retry by keyboard | Retry is reachable and announced. |
| Candidate list length | Use ambiguous query with multiple options | Screen reader conveys each option's place context. |
| Mobile screen reader | Repeat geolocation journey with VoiceOver/TalkBack | Location and forecast states remain understandable. |

---

### Pass Criteria

- All keyboard, screen-reader, and visual checklist items pass or are filed.
- Any inaccessible P0 control is `Blocks-Completion` for Accessibility-Reliant users.

---

### Related Test Cases

- `TC-JOURNEY-001`
- `TC-JOURNEY-002`
- `TC-FUNC-003`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
