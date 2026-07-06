---
name: api-sync
description: Sync frontend code to a changed backend API spec (docs/api_spec.json). Use when the user says the API spec changed, or asks to align schemas/hooks/mappers with the spec.
---

# API Spec Sync Protocol

Source of truth: `docs/api_spec.json`. Read only the changed sections (jq/Grep first, not the whole file if large).

## Domain map

- `trip` = 나들이/MAP (existing domain, `/trip` routes)
- `travel` = 여행/JOURNEY (separate domain, `/travels` API) — do not mix them.
- Backend pattern for travel: **no sub-resource endpoints**. All mutations are full-payload `PATCH /travels/{id}` with a complete `TravelUdo`; use `buildTravelUdoFromDetail` to reverse-map view models before applying a change.

## Order of work (per affected domain)

1. **Diff the spec**: list added/removed/changed endpoints and schema fields first; show the list before editing.
2. `api/*-schemas.ts` — zod schemas and DTO types (all responses must be zod-parsed).
3. `api/*-api.ts` — one method per spec endpoint, nothing extra.
4. `mappers/` — DTO ↔ view model, including reverse mappers for full-payload updates.
5. `hooks/` — TanStack Query hooks + cache invalidation keys.
6. Components/pages that consumed removed or renamed fields.
7. Tests — update MSW handlers in `src/test/helpers/` to the new spec, then fix affected tests.

## Done criteria

- `pnpm tsc --noEmit` clean, `npx @biomejs/biome check src/` clean, `pnpm test` green — outputs shown.
- `pnpm knip` reports no NEW unused exports (pre-existing baseline findings are OK).
- Report lists every endpoint in the spec mapped to its api method, and any spec endpoint intentionally not implemented.
