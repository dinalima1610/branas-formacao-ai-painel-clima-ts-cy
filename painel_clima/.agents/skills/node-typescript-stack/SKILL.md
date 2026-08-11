---
name: node-typescript-stack
description: Applies Node.js, JavaScript, and TypeScript coding conventions from the bundled rules—TypeScript-first source, npm for dependencies and scripts, strict typing without any, ESM import/export syntax, async/await over callbacks, and functional collection methods over imperative loops. Use when implementing, refactoring, or reviewing Node or TypeScript application or library code. Not intended for non-Node language stacks, documentation-only edits with no code impact, or repositories that mandate a package manager other than npm.
---

# Node TypeScript Stack

## When to load context

Read `references/nodejs-ts-rules.md` at the start of substantive Node.js or TypeScript work, or when unsure whether a pattern matches project standards. Treat that file as the authoritative rule set; this file only orients the workflow.

## Procedures

**Step 1: Align with the rule set**

1. Read `references/nodejs-ts-rules.md` and apply every listed constraint to new and changed code.
2. Prefer `const`, arrow functions, array methods (`find`, `filter`, `map`, `reduce`), and `async`/`await` as specified there.
3. Keep classes’ fields `private` or `readonly`; avoid `public` fields unless an existing codebase already standardizes otherwise.

**Step 2: Tooling and validation**

1. Use npm only for installs and script execution (`npm install`, `npm run build`, and task-specific scripts).
2. Add `@types/<package>` when a dependency lacks bundled types and DefinitelyTyped provides them.
3. Before considering a task complete, confirm TypeScript types check cleanly (project `build` or `tsc` as appropriate).

**Step 3: Metadata maintenance (skill authors)**

1. When editing the YAML frontmatter of this skill, run validation from the skill root:

   `python ../skill-best-practices/scripts/validate-metadata.py --name "node-typescript-stack" --description "<paste description field>"`

2. If the script prints errors to stderr, adjust `name` or `description` and re-run until it exits successfully.

## Error Handling

* If type-checking fails, fix types or narrow interfaces; do not introduce `any` or `require` / `module.exports` as shortcuts.
* If a dependency lacks types, search for `@types/<package>` before adding ad-hoc declarations.
* If `../skill-best-practices/scripts/validate-metadata.py` reports STYLE WARNING on description text, rewrite the description in third person and remove first- or second-person pronouns from the checked vocabulary set.
