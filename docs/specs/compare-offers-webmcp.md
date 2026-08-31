# Spec: compare_offers WebMCP tool

## Objective

Add a globally registered `compare_offers` WebMCP tool so an agent can open a transient right-side drawer with its comparative analysis of 2–5 job offers. Each offer may carry a free-text badge (for example, “najlepsza”, “rozwojowa”) and an optional note. The drawer is presentation-only: it does not change search filters, saved jobs, or applications.

## Tech Stack

- Angular 22 standalone components and signals
- Zod-backed Angular WebMCP descriptors
- Shared `FilterDrawerComponent` shell (wide variant)
- Vitest through Angular CLI

## Commands

- Test: `npm test -- --watch=false`
- Lint: `npm run lint`
- Type-check: `npx tsc --noEmit -p tsconfig.app.json`
- Build: `npm run build`

## Project Structure

- `docs/intent/compare-offers.md` — confirmed product intent
- `src/app/features/jobs/domain/job-compare.model.ts` — presentation types
- `src/app/features/jobs/state/job-compare.store.ts` — transient drawer state
- `src/app/features/jobs/webmcp/tools/compare-offers/` — schema, tool, tests
- `src/app/features/jobs/ui/job-compare-panel/` — dumb drawer body
- `src/app/features/jobs/shell/job-compare-drawer-host.component.ts` — app-level wiring
- `webmcp-evals/tools.json` — static tool catalog

## Tool Contract

### Input

```ts
{
  title?: string;          // drawer heading, max 120 chars; default "Offer comparison"
  summary: string;         // overall agent analysis, max 2000 chars, required
  offers: Array<{
    jobId: string;         // any known catalog id
    badge?: string;        // free-text label, max 64 chars
    note?: string;         // per-offer note, max 500 chars
  }>;                      // min 2, max 5, unique jobIds
}
```

### Success

```ts
{
  success: true,
  changed: true,
  displayed: true,
  title: string,
  summary: string,
  offerCount: number,
  offers: Array<{
    jobId: string,
    badge?: string,
    note?: string,
    title: string,
    company: string,
    location?: string,
  }>,
  missingJobIds?: string[]   // present when some ids were unknown but >= 2 resolved
}
```

### Errors

| Code | When |
|------|------|
| `INVALID_ARGUMENTS` | Schema validation failed (count, duplicates, empty strings) |
| `NOT_FOUND` | Fewer than 2 requested jobs resolved in the catalog |

## UI Behavior

- Drawer mounts at app root via `JobCompareDrawerHostComponent`.
- Uses wide drawer (`36rem`) for readable stacked cards.
- Summary block at top with subtle AI accent styling.
- Each offer: badge pill, compact job facts, optional note, full-row link to `/jobs/:id`.
- Escape, backdrop click, or close button dismisses and clears store state.
- A new tool call replaces the previous presentation.

## Boundaries

- Always: validate input, resolve jobs through `JobDetailsStore`, require at least two valid offers, keep presentation ephemeral.
- Ask first: persisting comparisons, user-triggered compare UI, structured column layouts.
- Never: mutate saved jobs, applications, or search criteria from this tool.

## Success Criteria

- `compare_offers` opens the drawer from any route when at least two jobs resolve.
- Unknown ids are reported in `missingJobIds` without blocking display when enough jobs remain.
- Fewer than two resolved jobs returns `NOT_FOUND` and leaves UI unchanged.
- Drawer closes on user dismiss or offer navigation.
- Contract, tool, store, and UI tests pass; lint and type-check remain clean.
