# Job Pilot

A modern job board for humans and AI agents, built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/).

Job Pilot combines a browsing experience with [Angular 22 experimental WebMCP support](https://angular.dev/ai/webmcp). Humans browse, filter, and inspect jobs in the browser. Codex completes profiles, searches offers, saves jobs, and applies - all through tools that operate on the same domain model as the UI.

## Why WebMCP

Traditional agents interact with web apps through DOM automation. Job Pilot exposes structured tools (`search_jobs`, `filter_jobs`, `update_profile`, `apply_job`, and more) so Codex can:

- read and update the candidate profile
- translate natural-language intent into `JobSearchCriteria`
- update filters, list, and map in real time
- save and apply to jobs for the authenticated user

The agent never receives a `userId` in tool payloads. Identity comes from Firebase Auth in the app.

## Stack

- Angular 22 (standalone, Signals, static prerender + hydration)
- Firebase Hosting, Firestore, Auth, Storage
- Google Maps JavaScript API (`@angular/google-maps`, marker clustering)
- Angular experimental WebMCP API

## WebMCP Tools

| Tool | Scope | Purpose |
|------|-------|---------|
| `search_jobs` | global | Replace text, location, and radius; preserve structured filters |
| `filter_jobs` | global | Update structured filters and sort; preserve text/location (OR within arrays) |
| `get_profile` | global | Read candidate profile (headline, experience, skills, preferences) |
| `update_profile` | `/profile` | Update candidate profile (Signal Form implicit tool) |
| `get_job` | `/jobs` | Read a single job offer |
| `save_job` | `/jobs` | Add a job to favourites (idempotent) |
| `apply_job` | `/jobs` | Submit a real job application (idempotent for already applied jobs) |

Global tools register in `app.config.ts`. Route-scoped tools register as route `providers` in `app.routes.ts`.

## Getting Started

### Prerequisites

- Node.js 20+
- Firebase project
- ChatGPT desktop app (for Codex + in-app browser testing)

### Install

```bash
npm install
```

### Configure Firebase

Copy values from `src/environments/environment.example.ts` into:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Enable Google Sign-In in Firebase Authentication.

### Configure Google Maps

1. In [Google Cloud Console](https://console.cloud.google.com/), enable **Maps JavaScript API** for your project.
2. Create an API key (restrict it to your domains for production).
3. Set `googleMapsApiKey` in both environment files.

On the hackathon free tier you get **10,000 map loads/month** at no cost. Set a quota limit in GCP if you want a hard cap.

### Run locally

```bash
npm start
```

Open `http://localhost:4200`.

### Seed Firestore (admin)

Jobs are read-only for clients. Seed with:

```bash
# Requires: gcloud CLI logged in (firebase login is not enough)
gcloud auth login
npm run seed:firestore
```

Until Firestore is seeded, the app falls back to `src/assets/seed/jobs.json` when `useSeedFallback: true` in the environment.

### Build

```bash
npm run build
```

Production build prerenders all routes. Job detail pages (`/jobs/:id`) are generated from seed data - see [ADR-003](docs/decisions/003-static-prerender-for-seo.md).

### Preview production build

```bash
# Static files only (Firebase Hosting output)
npm run build
npm run preview:static

# Express SSR server (local testing)
npm run build
npm run serve:ssr:job-pilot
```

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting,firestore:rules,storage
```

Deploy the `dist/job-pilot/browser` output.

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Dev server (`ng serve`) |
| `npm run build` | Production build with prerender |
| `npm run preview:static` | Serve static build locally |
| `npm run serve:ssr:job-pilot` | Run Express SSR server after build |
| `npm run seed:firestore` | Seed jobs to Firestore (admin) |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint including import boundaries |

## Testing with Codex

1. Deploy or run the app in an environment reachable from the ChatGPT desktop in-app browser.
2. Open the app in that browser.
3. Sign in with Google for profile, saved jobs, and applications.
4. In Codex, try:
   - "Help me complete my profile based on this CV…"
   - "Find lead frontend jobs, remote or hybrid in Warsaw, minimum $8k USD."
   - "Save this job and apply to the Frontend Tech Lead role."

Expected result: profile updates appear in `/profile`, search updates filters/list/map on `/jobs`, and job cards show Saved/Applied state.

## Demo Video Script (<3 min)

1. Show the job board UI (list + map)
2. Complete profile from CV via Codex
3. Run natural-language job search and show live UI reaction
4. Save and apply to a job
5. Explain: agent uses domain tools, not DOM clicks

## Project Structure

```
src/app/
  core/              Auth, Firebase, layout, home page
  shared/            Business-agnostic UI kit, map helpers, WebMCP response utils
  features/          Feature modules (see below)
  prerender/         Build-time prerender param helpers
docs/
  architecture/      Import boundaries
  decisions/         Architecture Decision Records (ADRs)
  ideas/             Product intent and scope
```

Import boundaries are enforced by ESLint - see [Import Boundaries](docs/architecture/import-boundaries.md).

```
features/{name}/
  pages/             Smart page (route target)
  webmcp/            Agent tools for the feature
  ui/                Presentational components
  domain/            Models and pure business rules
  data-access/       Repositories, Firestore
  state/             Stores and facades
```

### Routes

| Path | Feature | Description |
|------|---------|-------------|
| `/` | home | Landing / hackathon intro |
| `/jobs` | jobs | Search, filters, list + map |
| `/jobs/:id` | jobs | Job detail |
| `/profile` | profile | Candidate profile CRUD |
| `/jobs/saved` | jobs/saved-jobs | Saved jobs list |
| `/jobs/applications` | jobs/applications | Submitted applications |

## Hackathon Submission Checklist

- [ ] Live URL accessible in ChatGPT browser / Chrome 149+ with WebMCP enabled
- [ ] Public GitHub repo with MIT license
- [ ] README explains WebMCP implementation
- [ ] YouTube demo video (<3 min)
- [ ] Judge test credentials (if auth required)

## Documentation

- Product intent: [`docs/ideas/job-pilot.md`](docs/ideas/job-pilot.md)
- Architecture decisions: [`docs/decisions/`](docs/decisions/)
- Import boundaries: [`docs/architecture/import-boundaries.md`](docs/architecture/import-boundaries.md)
- Angular WebMCP: https://angular.dev/ai/webmcp
- Challenge details: https://webmcp.devpost.com/

## License

MIT - see [`LICENSE`](LICENSE).
