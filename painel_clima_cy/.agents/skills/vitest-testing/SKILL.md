---
name: vitest-testing
description: Defines how to author and run Vitest tests aligned with project testing rules. Use when adding or changing unit tests, integration tests, HTTP endpoint coverage, or domain logic tests under Vitest. Do not substitute Jest or Sinon for Vitest APIs; do not apply to non-Vitest stacks or narrative-only documentation.
---

# Vitest testing

## Procedures

**Step 1: Load rules and scope**

1. Read `references/testing-rules.md` before creating or modifying tests so every decision matches the consolidated rule set.
2. Confirm the change requires Vitest (describe/it/expect and `vi` for mocks, spies, stubs, fake timers). If the stack is not Vitest, do not apply this skill.

**Step 2: Place and structure tests**

1. Put tests in the folder pattern the project uses for that technology; use `.test.ts` or `.spec.ts` (or the extension the toolchain recommends).
2. Keep tests independent: no ordering or shared mutable state between cases.
3. Structure each case as Arrange–Act–Assert (or Given–When–Then); one main behavior per test with a clear description.

**Step 3: Choose test type and tooling**

1. For domain logic, cover rules and branches with unit tests only; no real HTTP, DB, messaging, filesystem, or external APIs.
2. For use cases, cover happy paths plus at least one alternative that throws; mock outbound dependencies with `vi.fn` or `vi.mock`.
3. For HTTP endpoints, write integration tests without supertest; focus on main and alternate flows (status codes and error messages); leave business-rule permutations to use-case tests.
4. When integration with externals is required, make the integration nature obvious from name or folder layout.
5. When `Date` affects behavior under test, use `vi.useFakeTimers` / `vi.setSystemTime` in `beforeEach` and restore real timers in `afterEach`.
6. Use `beforeEach` for setup and `afterEach` to release DB or messaging connections when needed.

**Step 4: Run and validate**

1. Execute tests with `npm run test` (must invoke Vitest) or `npx vitest`, per project configuration.
2. Ensure new or changed production code has matching coverage and assertions that check meaningful outcomes.

**Step 5: Skill metadata changes**

1. When editing the YAML `name` or `description` in this file, run `python scripts/validate-metadata.py --name "<name>" --description "<description>"` from `.agents/skills/vitest-testing/` and fix any reported errors before finishing.

## Error handling

* If Vitest is missing or scripts fail, align `package.json` test script with Vitest before adding tests.
* If timer- or mock-related flakes appear, re-read the Date and `vi` sections in `references/testing-rules.md` and tighten setup/teardown.
* If `scripts/validate-metadata.py` reports name, length, or style issues, adjust frontmatter and re-run until the script prints success.
