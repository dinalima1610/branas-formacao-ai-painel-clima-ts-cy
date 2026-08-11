---
name: code-standards
description: Applies naming, structure, and style conventions aligned with project code standards (English source, casing, verb-led functions, CQS, guards over nesting). Use when writing or reviewing TypeScript or JavaScript-style code, refactoring for clarity, or checking complexity and parameter limits. Don't use for prose documentation, legal copy, or ESLint configuration not covered by the reference.
---

# Code standards

## Procedures

**Step 1: Load the rule set**
1. Read `references/naming-and-style.md` when implementing, renaming, or reviewing application source so every convention applies from the authoritative text (examples, thresholds, and anti-patterns).

**Step 2: Apply conventions**
1. Write source text and identifiers in English; use camelCase for methods, functions, and variables; PascalCase for classes and interfaces; kebab-case for files and directories.
2. Prefer clear full words over abbreviations; cap names around 30 characters; replace magic numbers with named constants.
3. Name functions and methods with verbs; keep separate commands and queries (CQS); cap positional parameters at three and prefer a single object when more fields are needed.
4. Prefer guard clauses and limit conditional nesting; split boolean-driven behavior into distinct functions instead of flag parameters.
5. Keep functions roughly within 50 lines and classes within 300 lines unless the surrounding codebase already documents a different standard.
6. Minimize comments; declare one variable per statement; bind variables close to first use.

## Error Handling

* If a local module already violates a rule, match the dominant pattern in that module unless the task explicitly migrates style; then align new edits with `references/naming-and-style.md` and leave unrelated legacy code unchanged.
* If a requirement conflicts with the reference (framework generator output, required API shapes), follow the external constraint and note the exception in the change description.
