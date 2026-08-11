---
name: react-ui-conventions
description: Applies React UI conventions including functional components, TypeScript and TSX, local state, explicit props, Context API, Tailwind CSS, useMemo, hook naming, tests, and reuse of existing components. Use when implementing, refactoring, or reviewing React user interfaces. Don't use for Vue, Angular, or Svelte projects; non-UI Node scripts; or projects that standardize on CSS-in-JS libraries other than Tailwind.
---

# React UI Conventions

## Procedures

**Step 1: Load rules**
1. Read `references/react-rules.md` before changing or reviewing React UI code.
2. Apply every bullet there unless the repository explicitly documents an exception.

**Step 2: Implement or review**
1. Prefer functional components, TypeScript, `.tsx` for components, explicit props, local state, Context API when sharing across subtrees, Tailwind for styling, and `useMemo` for expensive derived values.
2. Keep components under roughly 100 lines; avoid both oversized files and unnecessary micro-components.
3. Before adding a complex component or a new dependency, confirm whether an existing library or in-repo component fits.
4. Add or update automated tests for components that change.
5. When introducing a custom hook, run `python scripts/validate-hook-name.py <HookName>` from this skill directory and fix the name if validation fails.

## Error Handling

* If `scripts/validate-hook-name.py` exits with an error, rename the hook to match `assets/hook-name.regex` (prefix `use` plus camelCase) and re-run the script.
* If project stack conflicts with these rules (for example, mandated styled-components), follow the repository’s documented standards and note the deviation in the change summary.
