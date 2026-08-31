# Spec: Highlight job WebMCP tool

## Objective

Add a route-scoped `highlight_job` WebMCP tool on `/jobs` so an agent can visually point
to one offer from the current search results. A successful call selects the matching map
marker, focuses the map, opens its popover, and applies a subtle one-shot AI animation.
On the mobile layout, the results sheet collapses so the highlighted marker and popover
are visible.

The highlight is presentation-only. It is cleared by manual selection or when the jobs
page is left, and it never changes filters, URL state, saved jobs, or applications.

## Tech Stack

- Angular 22 standalone components and signals
- Zod-backed Angular WebMCP descriptors
- Google Maps JavaScript API through `@angular/google-maps`
- Native CSS animation with `prefers-reduced-motion`
- Vitest through Angular CLI

## Commands

- Test: `npm test -- --watch=false`
- Lint: `npm run lint`
- Type-check: `npx tsc --noEmit -p tsconfig.app.json`
- Build: `npm run build`
- Dev: `npm start`

## Project Structure

- `src/app/features/jobs/webmcp/tools/highlight-job/` — tool schema, descriptor, and tests
- `src/app/features/jobs/state/` — transient highlight request state
- `src/app/features/jobs/pages/job-search/` — responsive map reveal orchestration
- `src/app/features/jobs/ui/job-map/` — marker focus, popover opening, and animation hook
- `src/styles/_map-popup.scss` — global InfoWindow animation styles
- `webmcp-evals/` — static tool catalog and selection evaluation fixtures

## Code Style

Use readonly signal state with explicit actions and strict boundary validation:

```ts
private readonly requestState = signal<JobHighlightRequest | null>(null);
private nextRequestId = 0;
readonly request = this.requestState.asReadonly();

highlight(jobId: string): void {
  this.nextRequestId += 1;
  this.requestState.set({
    jobId,
    requestId: this.nextRequestId,
  });
}
```

## Testing Strategy

- Contract tests verify strict `jobId` input and route catalog registration.
- Tool tests verify success for a current result and `JOB_NOT_IN_RESULTS` otherwise.
- State tests verify repeated highlights produce distinct requests and clearing is ephemeral.
- Map popup tests verify the AI modifier is opt-in.
- Browser verification checks desktop selection/popover, mobile map reveal, animation hook,
  reduced-motion behavior, and an empty error console.

## Boundaries

- Always: validate `jobId`, restrict candidates to current results, preserve current filters,
  support repeated highlighting, and respect reduced-motion preferences.
- Ask first: changing the tool response contract, adding dependencies, or persisting highlight
  state in the URL or backend.
- Never: save/apply to a job, clear filters, highlight a hidden result, or expose the tool
  outside the `/jobs` search route.

## Success Criteria

- `highlight_job({ jobId })` succeeds only when `jobId` belongs to `JobSearchStore.jobs()`.
- Success selects the job, opens its map popover, and returns a structured success response.
- An unavailable current result returns `JOB_NOT_IN_RESULTS` without UI or filter changes.
- Mobile collapses the results sheet before revealing the highlight.
- Manual selection and route teardown clear the transient AI highlight.
- AI-only animation is subtle and disabled under `prefers-reduced-motion: reduce`.
- Existing tests, lint, type-check, and runtime WebMCP behavior remain valid.

## Open Questions

None. The interaction model and boundaries were explicitly confirmed on 2026-08-31.
