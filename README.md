# Job Pilot

A modern job board for humans and AI agents, built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/).

Job Pilot combines a Just Join IT–inspired browsing experience with [Angular 22 experimental WebMCP support](https://angular.dev/ai/webmcp). Humans browse, filter, and inspect jobs in the browser. Codex completes profiles, searches offers, saves jobs, and applies — all through tools that operate on the same domain model as the UI.

## Why WebMCP

Traditional agents interact with web apps through DOM automation. Job Pilot exposes structured tools (`search_jobs`, `update_profile`, `apply_to_job`, and more) so Codex can:

- read and update the candidate profile
- translate natural-language intent into `JobSearchCriteria`
- update filters, list, and map in real time
- save and apply to jobs for the authenticated user

The agent never receives a `userId` in tool payloads. Identity comes from Firebase Auth in the app.

## Stack

- Angular 22 (standalone, Signals)
- Firebase Hosting, Firestore, Auth, Storage
- MapLibre GL JS
- Zod (planned validation layer)
- Angular experimental WebMCP API

## WebMCP Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `get_profile_schema` | `/profile` | Static profile schema for agents |
| `get_profile` | global | Read authenticated profile |
| `update_profile` | `/profile` | Partial profile updates |
| `search_jobs` | global | Update search criteria and UI |
| `get_job` | `/jobs/:id` | Read full job offer |
| `save_job` | `/jobs/:id` | Save job for authenticated user |
| `apply_to_job` | `/jobs/:id` | Submit minimal application |

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

Copy `src/environments/environment.example.ts` values into:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Enable Google Sign-In in Firebase Authentication.

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

Until Firestore is seeded, the app falls back to `src/assets/seed/jobs.json` in development.

### Build

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting,firestore:rules,storage
```

## Testing with Codex

1. Deploy or run the app in an environment reachable from the ChatGPT desktop in-app browser.
2. Open the app in that browser.
3. Sign in with Google for profile, saved jobs, and applications.
4. In Codex, try:
   - “Help me complete my profile based on this CV…”
   - “Find lead frontend jobs, remote or hybrid in Warsaw, minimum 25k PLN.”
   - “Save this job and apply to the Frontend Tech Lead role.”

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
  core/           Auth, Firebase, layout, WebMCP tools
  shared/         Business-agnostic UI kit and utilities
  features/       Feature modules (see below)
docs/architecture/import-boundaries.md
```

Import boundaries are enforced by ESLint — see [Import Boundaries](docs/architecture/import-boundaries.md).

```
features/{name}/
  {name}.page.ts   Smart page (route target)
  ui/              Presentational components
  domain/          Models and pure business rules
  data-access/     Repositories, Firestore
  state/           Stores and facades
```

## Hackathon Submission Checklist

- [ ] Live URL accessible in ChatGPT browser / Chrome 149+ with WebMCP enabled
- [ ] Public GitHub repo with MIT license
- [ ] README explains WebMCP implementation
- [ ] YouTube demo video (<3 min)
- [ ] Judge test credentials (if auth required)

## Documentation

- Product intent: [`docs/ideas/job-pilot.md`](docs/ideas/job-pilot.md)
- Angular WebMCP: https://angular.dev/ai/webmcp
- Challenge details: https://webmcp.devpost.com/

## License

MIT — see [`LICENSE`](LICENSE).
