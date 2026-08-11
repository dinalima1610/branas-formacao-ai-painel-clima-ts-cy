---
name: rest-api-express
description: "Applies REST and HTTP conventions for Express-backed services: Express-only HTTP layer; plural English resources with nested paths where relationships warrant; kebab-case compound segments; POST with action paths for mutations rather than generic resource PUT; JSON bodies unless another format is specified; authentication and authorization middleware on every route; standard status codes (200, 400, 401, 403, 404, 422, 500); OpenAPI documentation; limit/offset pagination and fields-based partial responses; native fetch with async/await for outbound HTTP. Use when designing, implementing, or reviewing Express REST APIs. Not intended for non-Express HTTP frameworks, GraphQL-only backends, or documentation-only work with no API code."
---

# REST API (Express)

## When to load context

Read `references/http-api-rules.md` at the start of substantive Express REST or HTTP API work, or when unsure whether routing, status codes, or payloads match project standards. Treat that file as the authoritative rule set; this file only orients the workflow.

## Procedures

**Step 1: Align with the rule set**

1. Read `references/http-api-rules.md` and apply every listed constraint to new and changed routes, handlers, and HTTP client code.
2. Map HTTP with Express only; do not introduce alternate HTTP server frameworks for the same responsibility.
3. Keep resource names plural and in English; nest paths only when the relationship justifies it; cap path depth as specified there; use kebab-case for compound segments.
4. Use POST with explicit action paths for mutations; avoid generic `PUT` on whole resources where the rules forbid it.
5. Return JSON bodies for requests and responses unless a different format is explicitly required; map success and errors to the documented status codes.

**Step 2: Security, documentation, and data shape**

1. Register authentication and authorization middleware so no route is exposed without the same protections as the rest of the service; mirror existing route layout when extending the API.
2. Maintain OpenAPI coverage for methods, paths, and response codes.
3. Add `limit` and `offset` query parameters for heavier list endpoints; support `fields` (or equivalent) for partial representations when returning large collections.
4. Call external HTTP APIs with the global `fetch` API using `async`/`await`, check `response.ok`, and parse bodies per contract; avoid extra HTTP client libraries unless already mandated elsewhere.

**Step 3: Metadata maintenance (skill authors)**

1. When editing the YAML frontmatter of this skill, run validation from the skill root:

   `python scripts/validate-metadata.py --name "rest-api-express" --description "<paste description field>"`

2. If the script prints errors to stderr, adjust `name` or `description` and re-run until it exits successfully.

## Error Handling

* If a rule in `references/http-api-rules.md` conflicts with local code, prefer aligning new work to the reference; escalate ambiguous security or URL structure with the maintainer before shipping.
* If `scripts/validate-metadata.py` reports a style warning on the description, rewrite the description in third person and remove first- or second-person pronouns from the checked vocabulary set.
