# Job Pilot

## Problem Statement

**How might we demonstrate that a web application can be natively shared by humans and AI agents (Codex)—where natural-language intent instantly updates UI state—without DOM scraping and without a separate backend?**

## Recommended Direction

**Codex-Native Job Board** — a modern job board (Just Join IT–inspired UX) with a WebMCP layer powered by the [Angular 22 experimental WebMCP API](https://angular.dev/ai/webmcp).

The agent runs in **Codex** (ChatGPT desktop in-app browser). The app exposes tools and reacts through shared state (`JobSearchStore`, profile Signal Form). Humans and agents operate on the same domain model—filters, list, map, profile.

**Hackathon:** [WebMCP Challenge](https://webmcp.devpost.com/) — deadline **September 3, 2026**. Judging criteria (equal weight): WebMCP Leverage (tie-breaker), Execution, Impact, Creativity & Ambition.

**Demo deliverable:** <3 min split-screen video (Codex + app) plus a live URL for judges.

## Key Assumptions to Validate

- [ ] Codex discovers and invokes tools when the app is open in the ChatGPT in-app browser — **test on Day 1**
- [ ] `search_jobs` visually updates filters, chips, list, and map — **test before recording video**
- [ ] 80+ seeded jobs are enough for a realistic map and filter demo
- [ ] Angular experimental WebMCP APIs are stable enough for the hackathon (unit-test tools with `@mcp-b/webmcp-polyfill`)

## MVP Scope

### Human UX

- Browse jobs, text search, filters with removable chips
- Split list + map (MapLibre markers, list↔map selection sync)
- Job details (full offer model)
- Deep-linkable search URLs (`/jobs?q=...&location=...`)
- Candidate profile (CRUD)
- Saved jobs
- Google Sign-In (anonymous job browsing allowed)
- Modern, clean UI (Just Join IT–inspired)

### WebMCP Tools (7)

| Tool | Angular implementation | Route |
|------|------------------------|-------|
| `get_profile_schema` | `provideExperimentalWebMcpTools` | `/profile` |
| `get_profile` | `declareExperimentalWebMcpTool` in `ProfileService` | `/profile` |
| `update_profile` | Signal Form + `experimentalWebMcpTool` | `/profile` |
| `search_jobs` | `declareExperimentalWebMcpTool` in `JobSearchStore` | `/jobs` |
| `get_job` | route provider | `/jobs/:id` |
| `save_job` | route provider / service | `/jobs/:id` |
| `apply_to_job` | route provider / service | `/jobs/:id` |

#### `apply_to_job` (minimal)

- Input: `{ jobId, note? }`
- Requires auth + minimal profile
- Persists to `/users/{userId}/applications/{jobId}`
- UI: toast + “Applied” badge on job card (no Applications screen in MVP)

### Platform

- Angular 22, Signals, Firebase (Hosting, Firestore, Auth, Storage)
- `provideRouter(routes, withExperimentalAutoCleanupInjectors())`
- `provideExperimentalWebMcpForms()` for profile
- Seed: 80–120 jobs, demo user, sample CV content (agent reads CV externally)

### Hackathon submission

- Live URL (Firebase Hosting)
- Public repo + open-source license
- README with Codex testing instructions
- Judge test credentials (Google login)
- Public YouTube video <3 min

### Hero demo flow

1. Job board looks like a real product
2. Codex: complete profile from CV → `get_profile_schema` → `update_profile`
3. Codex: *“Find lead frontend jobs, remote/hybrid Warsaw, 25k+”* → `search_jobs` → **UI reacts live**
4. `get_job` → `save_job` → `apply_to_job`

## Not Doing (and Why)

| Item | Reason |
|------|--------|
| In-app agent panel | Agent lives in Codex |
| Map clustering | Cut first—markers are enough |
| Deterministic matching % | Cut first—agent explains fit in natural language |
| `get_visible_jobs` | Post-MVP |
| Applications screen / status workflow | Apply = tool + badge only |
| CV OCR, Node/Express backend | Agent reads CV on its side |
| SSR | CSR + Firebase Hosting is sufficient |
| Scraping, recruiter dashboard, posting, ATS, messaging | Out of hackathon scope |

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
└─────────────────────────────────────────┘
    ▲
    │  human clicks filters (same store)
    └── browser (Firebase Hosting)
```

## Module Structure

```
src/app/
  jobs/
    domain/
    data-access/
    feature-search/
    feature-details/
    ui-job-card/
    ui-job-list/
    ui-job-map/
    ui-filters/
  profile/
    domain/
    data-access/
    feature-profile/
    feature-cv-upload/
    ui-profile-form/
  saved-jobs/
    domain/
    data-access/
    feature-saved-jobs/
  webmcp/
    tools/
    schemas/
    services/
  core/
    auth/
    firebase/
    layout/
  shared/
    ui/
    utils/
    models/
```

## Open Questions

- Firebase project ID / existing Firebase setup?
- License: MIT?
- Production name: **Job Pilot** — confirmed

## Timeline (until Sep 3)

| Phase | Work | Days |
|-------|------|------|
| 1. Foundation | Angular, Firebase, auth, seed jobs, list + filters + URL routing | 2 |
| 2. Map + Profile | MapLibre + sync, profile CRUD, saved jobs | 1.5 |
| 3. WebMCP | 7 tools, SearchStore integration, security rules | 1 |
| 4. Polish + Submit | UI polish, demo mode, video, README, license, deploy | 1.5 |
