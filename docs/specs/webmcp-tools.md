# WebMCP tools catalog

Job Pilot exposes **10 WebMCP tools** for Codex. Global tools register in `app.config.ts`. Route-scoped tools register as route `providers` in `app.routes.ts`.

Tool descriptions are intentionally concise to reduce catalog overhead.

## Global tools (9)

Callable from any route.

| Tool | Mutates state | Auth | Purpose |
|------|---------------|------|---------|
| `search_jobs` | Yes | No | Replace complete search criteria and navigate to `/jobs` once |
| `get_jobs` | No | No | Read up to twenty full job offers by `jobIds` |
| `compare_offers` | Yes (UI) | No | Open a transient drawer comparing 2–5 offers with badges, notes, and optional highlighted pick |
| `get_saved_jobs` | No | Yes | Read the signed-in user's saved shortlist |
| `save_job` | Yes | Yes | Add a job to favourites (idempotent) |
| `unsave_job` | Yes | Yes | Remove a job from favourites (idempotent) |
| `apply_job` | Yes | Yes | Open the apply dialog with an optional pre-filled message; user submits manually |
| `get_profile` | No | Yes | Read the signed-in candidate profile |
| `update_profile` | Yes | Yes | Patch candidate profile fields |

## Route-scoped tools (1)

Registered only while the matching route is active.

| Tool | Route | Mutates state | Auth | Purpose |
|------|-------|---------------|------|---------|
| `highlight_job` | `/jobs` | Yes (UI) | No | Focus one job from **current search results** on the map when presenting or discussing a single offer, or when the user asks where it is located |

## Typical agent flows

### Search and explore

1. `search_jobs` → complete criteria, filters, list, and map update on `/jobs`
2. `get_jobs` → read full descriptions before deciding

### Recommend and compare

1. `get_jobs` or `search_jobs` to gather candidates
2. `compare_offers` → drawer with summary, per-offer badges, optional `highlighted: true` on the primary pick
3. On `/jobs`, call `highlight_job` whenever you present, discuss, or answer questions about **one** visible offer — including location or headquarters questions and follow-ups after `get_jobs` or `compare_offers`

### Saved jobs and apply

1. `get_saved_jobs` → read shortlist
2. `save_job` / `unsave_job` → manage favourites
3. `apply_job` → open the apply dialog with an optional pre-filled message; user clicks Submit

### Profile

1. Navigate to `/profile`
2. `get_profile` or `update_profile` from any route

## Specs

- [`highlight-job-webmcp.md`](highlight-job-webmcp.md)
- [`compare-offers-webmcp.md`](compare-offers-webmcp.md)

## Eval fixtures

Static catalog for tool-selection evals: [`webmcp-evals/tools.json`](../../webmcp-evals/tools.json) (global tools + `update_profile`).

Live smoke journeys: [`webmcp-evals/public-journeys.evals.json`](../../webmcp-evals/public-journeys.evals.json) (`search_jobs`, `highlight_job`, `get_jobs`).

Contract test: `src/app/webmcp-evals.contract.spec.ts` keeps fixtures synchronized with runtime descriptors.
