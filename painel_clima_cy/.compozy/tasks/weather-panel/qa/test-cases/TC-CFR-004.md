## TC-CFR-004: Compatibility on Responsive Weather Panel

**Priority:** P1 (High)  
**Type:** CFR  
**Status:** Not Run  
**Estimated Time:** 25 minutes  
**Created:** 2026-05-22  
**Last Updated:** 2026-05-22  
**CFR Category:** Compatibility  
**Persona:** Mobile User  
**Surface:** Weather Panel  
**Journey:** J-04 Read forecast in the preferred unit  
**Automation Target:** Manual-only  
**Automation Status:** N/A  
**Automation Command/Spec:** N/A  
**Automation Notes:** Cross-browser and device smoke is manual/browser evidence because no E2E harness exists.

---

### Objective

Verify the weather panel remains usable across the minimum browser, device, viewport, and OS preference matrix.

---

### Preconditions

- [ ] QA has access to latest Chrome, Safari, Firefox, iOS Safari, or Android Chrome as available.
- [ ] Responsive viewport controls or devices are available for 1280, 768, and 375 widths.
- [ ] Valid weather data can be loaded.

---

### Real-User Conditions

| Dimension | Value |
|---|---|
| Network | wifi-fast |
| Device | desktop, tablet, phone-small |
| Browser | Chrome, Safari, Firefox, iOS Safari, Android Chrome |
| Locale | pt-BR |
| Timezone | America/Sao_Paulo |
| Autofill | empty |
| Modality | mouse-keyboard and touch |

---

### Checklist

- [ ] Latest Chrome, Safari, and Firefox smoke the main journey.
- [ ] iOS Safari and Android Chrome smoke the mobile journey when devices are available.
- [ ] Viewports 1280, 768, and 375 keep search, candidate list, current, hourly, daily, and toggle usable.
- [ ] Hourly strip scrolls horizontally on narrow viewports without covering content.
- [ ] Light and dark OS modes do not hide text or controls.
- [ ] Reduced motion preference does not remove critical feedback.

---

### Targets

| Observable | Target | Acceptable | Actual |
|---|---|---|---|
| Viewport coverage | 1280, 768, 375 | At least 1280 and 375 if constrained | |
| Browser coverage | Chrome, Safari, Firefox, iOS Safari, Android Chrome | Document unavailable browsers | |
| Mobile touch target usability | All P0 controls tappable | No P0 control blocked | |

---

### Test Steps

1. Load `Sao Paulo` weather at 1280px in Chrome.
   **Expected:** Search, current, hourly, daily, and unit toggle are visible and usable.

2. Resize or run at 768px and repeat the forecast review.
   **Expected:** Layout adapts without overlapping text or controls.

3. Resize or run at 375px and inspect hourly/daily sections.
   **Expected:** Hourly strip is horizontally scannable and daily forecast stacks without covering actions.

4. Repeat the smoke journey on available Safari/Firefox/mobile browsers.
   **Expected:** No browser-specific issue prevents the journey goal.

---

### Edge Cases & Variations

| Variation | Action | Expected Result |
|---|---|---|
| OS dark mode | Switch OS/browser to dark mode and reload | Text, controls, and weather indicators remain visible. |
| Reduced motion | Enable reduced motion | Critical loading/retry feedback remains observable. |
| Device rotation | Rotate mobile portrait to landscape during forecast | Layout remains coherent and state is preserved. |

---

### Pass Criteria

- No browser or viewport blocks a P0 weather journey.
- Any unavailable matrix item is documented in task_05 verification report.

---

### Related Test Cases

- `TC-FUNC-001`
- `TC-JOURNEY-002`
- `CH-01`

---

### Execution History

| Date | Tester | Build | Result | Bug ID | Notes |
|---|---|---|---|---|---|
| | | | | | |
