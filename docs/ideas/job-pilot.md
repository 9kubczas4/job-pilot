# Job Pilot

## Problem Statement

**How might we demonstrate that a web application can be natively shared by humans and AI agents (Codex)-where natural-language intent instantly updates UI state-without DOM scraping and without a separate backend?**

## Recommended Direction

**Codex-Native Job Board** - a modern job board with a WebMCP layer powered by the [Angular 22 experimental WebMCP API](https://angular.dev/ai/webmcp).

The agent runs in **Codex** (ChatGPT desktop in-app browser). The app exposes tools and reacts through shared state (`JobSearchStore`, profile Signal Form). Humans and agents operate on the same domain model-filters, list, map, profile.

**Hackathon:** [WebMCP Challenge](https://webmcp.devpost.com/) - deadline **September 3, 2026**. Judging criteria (equal weight): WebMCP Leverage (tie-breaker), Execution, Impact, Creativity & Ambition.

## Key Assumptions to Validate

- [ ] Codex discovers and invokes tools when the app is open in the ChatGPT in-app browser - **test on Day 1**
- [ ] `search_jobs` visually updates filters, chips, list, and map - **test before recording video**
- [x] 42 seeded jobs are enough for a realistic map and filter demo
- [ ] Angular experimental WebMCP APIs are stable enough for the hackathon

## MVP Scope

### Human UX (implemented)

- Browse jobs, text search, filters with removable chips
- Split list + map (Google Maps markers with clustering, list↔map selection sync)
- Job details (full offer model)
- Deep-linkable search URLs (`/jobs?q=...&location=...`)
- Candidate profile (CRUD)
- Saved jobs
- Applications list (`/applications`)
- Google Sign-In (anonymous job browsing allowed)
- Modern, clean UI
- Static prerender for all routes; job detail pages pre-generated at build time

### WebMCP Tools (7, implemented)

| Tool | Registration | Source |
|------|--------------|--------|
| `search_jobs` | Global (`app.config.ts`) | `features/jobs/webmcp/search-jobs.tool.ts` |
| `filter_jobs` | Global (`app.config.ts`) | `features/jobs/webmcp/filter-jobs.tool.ts` |
| `get_profile` | Global (`app.config.ts`) | `features/profile/webmcp/profile.tools.ts` |
| `update_profile` | Route `/profile` | `features/profile/pages/profile/profile.page.ts` (Signal Form implicit tool) |
| `get_job` | Route `/jobs` | `features/jobs/webmcp/job-details.tools.ts` |
| `save_job` | Route `/jobs` | `features/jobs/webmcp/job-details.tools.ts` |
| `apply_job` | Route `/jobs` | `features/jobs/webmcp/job-details.tools.ts` |

#### `apply_job` (minimal)

- Input: `{ jobId, note? }`
- Requires auth + minimal profile
- Persists to `/users/{userId}/applications/{jobId}`
- UI: toast + "Applied" badge on job card + entry on `/applications`

### Platform

- Angular 22, Signals, static prerender + hydration
- Firebase (Hosting, Firestore, Auth, Storage)
- Google Maps JavaScript API with marker clustering
- `provideRouter(routes, withExperimentalAutoCleanupInjectors())`
- `provideExperimentalWebMcpForms()` for profile
- Seed: 200 jobs in `src/assets/seed/jobs.json`, Firestore seed script available

### Hackathon submission

- Live URL (Firebase Hosting)
- Public repo + open-source license
- README with Codex testing instructions
- Judge test credentials (Google login)
- Public YouTube video <3 min

### Hero demo flow

1. Job board looks like a real product
2. Codex: complete profile from CV → `update_profile` (schema inferred from Signal Form)
3. Codex: *"Find lead frontend jobs, remote/hybrid Warsaw, 25k+"* → `search_jobs` → **UI reacts live**
4. `get_job` → `save_job` → `apply_job`

## Not Doing (and Why)

| Item | Reason |
|------|--------|
| In-app agent panel | Agent lives in Codex |
| Deterministic matching % | Agent explains fit in natural language |
| `get_visible_jobs` | Post-MVP |
| Application status workflow | Apply = tool + badge + list only |
| CV OCR, Node/Express backend | Agent reads CV on its side; Express is build-time SSR only |
| Scraping, recruiter dashboard, posting, ATS, messaging | Out of hackathon scope |

## Deferred / Changed from Original Plan

| Original plan | Current state | ADR |
|---------------|---------------|-----|
| MapLibre GL | Google Maps with clustering | [ADR-004](../decisions/004-google-maps-for-job-map.md) |
| CSR only | Static prerender + hydration | [ADR-003](../decisions/003-static-prerender-for-seo.md) |
| Tools in `core/webmcp/` | Tools in `features/*/webmcp/` | [ADR-002](../decisions/002-feature-colocated-webmcp-tools.md) |
| No applications screen | `/applications` page added | Scope expansion during implementation |
| 80–120 seeded jobs | 200 jobs in seed JSON | Sufficient for demo; expandable via `scripts/expand-jobs-seed.mjs` |
| Zod validation layer | Not yet integrated | Dependency present; validation uses JSON schemas in tool definitions |

## Architecture

```
Codex (ChatGPT browser)
    │  WebMCP tools (Angular experimental API)
    ▼
┌─────────────────────────────────────────┐
│  Job Pilot (Angular 22)                 │
│  JobSearchStore.criteria ──► UI         │
│  Profile Signal Form ──► Firestore      │
│  Route-scoped tool registration         │
│  Static prerender (job detail pages)    │
└─────────────────────────────────────────┘
    ▲
    │  human clicks filters (same store)
    └── browser (Firebase Hosting)
```

## Module Structure

Layered features under `features/`, infrastructure in `core/`, business-agnostic code in `shared/`. Import rules are enforced by ESLint - see [`docs/architecture/import-boundaries.md`](../architecture/import-boundaries.md) and [ADR-001](../decisions/001-layered-feature-architecture.md).

```
src/app/
  app.config.ts
  app.config.server.ts
  app.routes.ts
  app.routes.server.ts
  app.ts

  core/
    auth/
    firebase/
    layout/
    pages/home/             # landing / hackathon intro

  shared/
    map/                      # Google Maps loader, styles, markers
    ui/                         # button, chip, filter-drawer, header-search, …
    webmcp/                     # toolJson, toolText helpers
    state/                      # header-ui.store

  features/
    jobs/
      pages/
        job-search/             # list + map + filters
        job-details/
      webmcp/
        search-jobs.tool.ts
        search-jobs.schema.ts
        job-details.tools.ts
      ui/
        job-card/
        job-list/
        job-map/
        job-filters/
        job-sort-menu/
        job-results-sheet/
        apply-job-dialog/
        competency-chip/
      domain/
        job.model.ts
        search.model.ts
        job-matcher.ts
        job-filter.utils.ts
        job-sort.utils.ts
        search-url.utils.ts
        job-similarity.utils.ts
        job-competency.utils.ts
        city-catalog.ts
        geo.utils.ts
        job-formatters.ts
      data-access/
        job.repository.ts
      state/
        job-search.store.ts

    profile/
      pages/profile/
      webmcp/
        profile.tools.ts
      ui/
        profile-skill-row/
        profile-month-picker/
      domain/
        profile.model.ts
        profile.utils.ts
        profile-options.ts
        month-date.utils.ts
      data-access/
        profile.repository.ts
      state/
        profile.store.ts

    saved-jobs/
      pages/
        saved-jobs/
        applications/
      domain/
        application.model.ts
      data-access/
        saved-jobs.repository.ts
      state/
        saved-jobs.store.ts

  prerender/
    job-prerender-params.ts     # build-time job IDs from seed JSON
```

### Import boundaries (summary)

| Layer | May import |
|-------|------------|
| `domain` | external, sibling feature domain |
| `data-access` | domain, core |
| `state` | domain, data-access, core |
| `ui` | domain, state, shared, sibling ui |
| `pages/` | ui, state, domain, shared, core |
| `webmcp/` | state, domain, data-access, shared |
| `core` | shared |
| `core/pages` | core, shared |
| `shared` | shared, external |

## Open Questions

- Firebase project ID / existing Firebase setup?
- License: MIT?
- Production name: **Job Pilot** - confirmed

## Timeline (until Sep 3)

| Phase | Work | Status |
|-------|------|--------|
| 1. Foundation | Angular, Firebase, auth, seed jobs, list + filters + URL routing | Done |
| 2. Map + Profile | Google Maps + sync, profile CRUD, saved jobs | Done |
| 3. WebMCP | 7 tools, SearchStore integration, security rules | Done |
| 4. Polish + Submit | UI polish, prerender, video, README, license, deploy | In progress |
