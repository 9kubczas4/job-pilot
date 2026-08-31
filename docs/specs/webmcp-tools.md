# WebMCP tools catalog

Job Pilot exposes **11 WebMCP tools** for Codex. Global tools register in `app.config.ts`. Route-scoped tools register as route `providers` in `app.routes.ts`.

Every tool description includes: *Use this tool instead of interacting with the page UI or DOM.*

## Global tools (9)

Callable from any route.

| Tool | Mutates state | Auth | Purpose |
|------|---------------|------|---------|
| `search_jobs` | Yes | No | Replace text, location, and radius; preserve structured filters; navigate to `/jobs` |
| `filter_jobs` | Yes | No | Patch structured filters and sort; preserve text/location |
| `get_job` | No | No | Read one full job offer by `jobId` |
| `compare_offers` | Yes (UI) | No | Open a transient drawer comparing 2–5 offers with badges, notes, and optional highlighted pick |
| `get_saved_jobs` | No | Yes | Read the signed-in user's saved shortlist |
| `save_job` | Yes | Yes | Add a job to favourites (idempotent) |
| `unsave_job` | Yes | Yes | Remove a job from favourites (idempotent) |
| `apply_job` | Yes | Yes | Submit a job application (idempotent) |
| `get_profile` | No | Yes | Read the signed-in candidate profile |

## Route-scoped tools (2)

Registered only while the matching route is active.

| Tool | Route | Mutates state | Auth | Purpose |
|------|-------|---------------|------|---------|
| `highlight_job` | `/jobs` | Yes (UI) | No | Focus one job from **current search results** on the map — marker, popover, AI animation |
| `update_profile` | `/profile` | Yes | Yes | Patch candidate profile fields (Signal Form implicit tool) |

## Typical agent flows

### Search and explore

1. `search_jobs` → filters, list, and map update on `/jobs`
2. `filter_jobs` → refine structured criteria
3. `get_job` → read full description before deciding

### Recommend and compare

1. `get_job` or `search_jobs` / `filter_jobs` to gather candidates
2. `compare_offers` → drawer with summary, per-offer badges, optional `highlighted: true` on the primary pick
3. On `/jobs`, `highlight_job` → point to one result on the map (must be in current results)

### Saved jobs and apply

1. `get_saved_jobs` → read shortlist
2. `save_job` / `unsave_job` → manage favourites
3. `apply_job` → submit application (requires profile)

### Profile

1. Navigate to `/profile`
2. `get_profile` (any route) or `update_profile` (on `/profile` only)

## Specs

- [`highlight-job-webmcp.md`](highlight-job-webmcp.md)
- [`compare-offers-webmcp.md`](compare-offers-webmcp.md)

## Eval fixtures

Static catalog for tool-selection evals: [`webmcp-evals/tools.json`](../../webmcp-evals/tools.json) (global tools + `update_profile`).

Live smoke journeys: [`webmcp-evals/public-journeys.evals.json`](../../webmcp-evals/public-journeys.evals.json) (`search_jobs`, `filter_jobs`, `highlight_job`, `get_job`).

Contract test: `src/app/webmcp-evals.contract.spec.ts` keeps fixtures synchronized with runtime descriptors.
