# ADR-002: Feature-colocated WebMCP tools

## Status
Accepted

## Date
2026-08-29

## Context

Job Pilot exposes seven WebMCP tools so Codex can search jobs, manage profiles, and apply to offers. Early planning placed all tools in `core/webmcp/tools/`, but as features matured it became clear that tools are tightly coupled to feature stores and repositories.

Tools must share the same state as the UI (`JobSearchStore`, `ProfileStore`, `SavedJobsStore`) without creating circular imports or violating layer boundaries.

## Decision

Colocate WebMCP tools inside each feature at `features/{name}/webmcp/`:

| Tool(s) | Location | Registration |
|---------|----------|--------------|
| `search_jobs` | `features/jobs/webmcp/search-jobs.tool.ts` | `app.config.ts` (global) |
| `filter_jobs` | `features/jobs/webmcp/filter-jobs.tool.ts` | `app.config.ts` (global) |
| `get_profile` | `features/profile/webmcp/profile.tools.ts` | `app.config.ts` (global) |
| `update_profile` | `features/profile/pages/profile/profile.page.ts` | Signal Form implicit tool on `/profile` |
| `get_job`, `save_job`, `apply_job` | `features/jobs/webmcp/job-details.tools.ts` | Route provider on `/jobs` |

Shared response helpers (`toolJson`, `toolText`) live in `shared/webmcp/tool-response.ts`.

Route-scoped tools use `providers: [provideXxxWebMcpTools()]` on the matching route. Global tools register in `app.config.ts`.

## Alternatives Considered

### Central `core/webmcp/` module
- Pros: Single place to discover all agent tools
- Cons: Core would import feature state/data-access, breaking the "core is feature-agnostic" rule
- Rejected: Violates ADR-001 import boundaries

### Tools defined inline in page components
- Pros: Maximum locality
- Cons: Mixes UI concerns with agent API; harder to test and document
- Rejected: WebMCP is a separate orchestration layer, not part of the page

## Consequences

- Adding a new tool means adding a file in the relevant feature's `webmcp/` folder
- `eslint-plugin-boundaries` treats `feature-webmcp` as its own layer with explicit allow-list
- Tool discovery requires scanning `features/*/webmcp/` rather than one central directory - mitigated by the tools table in README
