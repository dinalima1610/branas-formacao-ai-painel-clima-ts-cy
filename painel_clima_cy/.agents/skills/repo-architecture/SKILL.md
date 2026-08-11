---
name: repo-architecture
description: Aligns repository layout for React frontends and layered Node backends per official project conventions. Use when adding or moving files under frontend/src or backend/src, scaffolding features, routes, controllers, services, or data layers, or auditing folder depth and colocation. Not for framework selection, build tooling setup, or API documentation unrelated to physical structure.
---

# Repository Architecture

## Procedures

**Step 1: Load the architecture reference**
1. Determine whether the task affects `frontend/src`, `backend/src`, or both.
2. Before creating, moving, or renaming any file under those roots, read `references/folder-structure.md` for the full tree, principles, mandatory flows, and anti-patterns.

**Step 2: Place frontend (React) files**
1. When editing under `frontend/src`, apply the hybrid layout documented in `references/folder-structure.md`: colocate feature-specific code under `src/features/<feature-name>/` (components, hooks, optional `lib/`, `api/`, types, barrel `index.ts`).
2. Keep generic UI and design-system primitives under `src/components/` (including `src/components/ui/`); avoid business rules there.
3. Wire URLs in `src/routes/`; compose screens that orchestrate features in `src/pages/`.
4. Put app bootstrap (providers, root router, root layout) under `src/app/` (or root entry files if already established per `references/folder-structure.md`).
5. Store shared hooks, utilities, global types, and static assets in `src/hooks/`, `src/lib/`, `src/types/`, and `src/assets/` respectively, as specified in `references/folder-structure.md`.
6. Limit folder depth; prefer `tsconfig` `baseUrl`/path aliases for clean imports instead of unnecessary nesting.

**Step 3: Place backend files**
1. When editing under `backend/src`, enforce the flow `HTTP → controllers/ → services/ → data/` from `references/folder-structure.md`.
2. Put route handlers and HTTP concerns in `controllers/`; keep them free of heavy business logic and direct external integrations.
3. Put domain rules, orchestration, and validations in `services/`; do not shape HTTP responses there.
4. Put databases, repositories, external HTTP clients, queues, and storage in `data/` (including optional `repositories/` and `clients/` subfolders only if already consistent with `references/folder-structure.md`).
5. Place shared DTOs/schemas/types where `references/folder-structure.md` allows, without import cycles that violate the layer direction.

**Step 4: Final checks**
1. Re-read the "O que não fazer" section and backend prohibitions in `references/folder-structure.md`.
2. Confirm new paths match neighboring files and the documented trees; choose the smallest consistent adjustment when the repo diverges slightly.

## Error Handling
- If `frontend/src` or `backend/src` is missing, read `references/folder-structure.md`, map the same roles to the closest existing directories, and pause for clarification if no mapping is possible.
- If a requested location breaks the controller/service/data separation, relocate per `references/folder-structure.md` and explain the constraint.
- If feature boundaries are unclear, default to a new `features/<feature-name>/` folder only when the domain is distinct; otherwise extend the nearest existing feature after checking `references/folder-structure.md`.
