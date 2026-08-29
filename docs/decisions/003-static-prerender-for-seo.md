# ADR-003: Static prerender for job pages

## Status
Accepted

## Date
2026-08-29

## Context

Job Pilot is deployed to Firebase Hosting as a static site. Job detail pages (`/jobs/:id`) benefit from pre-rendered HTML for:

- Faster first contentful paint when shared via link
- Crawlable job content without requiring JavaScript execution
- Consistent rendering during the Angular SSR build step

The app is otherwise client-driven: Firebase Auth, Firestore reads, Google Maps, and WebMCP all require a browser.

## Decision

Use Angular SSR in **static prerender** mode (`outputMode: "static"` in `angular.json`):

- All routes prerender at build time via `app.routes.server.ts`
- Job detail routes use `getPrerenderParams()` reading `src/assets/seed/jobs.json` to generate one HTML file per job ID
- Unknown job IDs fall back to client rendering (`PrerenderFallback.Client`)
- `JobRepository` reads seed JSON on the server platform; in the browser it reads Firestore with seed fallback
- Client hydration enabled via `provideClientHydration()` with HTTP transfer cache

Local SSR preview: `npm run build && npm run serve:ssr:job-pilot`

Static-only preview (no Express): `npm run build && npm run preview:static`

## Alternatives Considered

### Pure CSR (client-side rendering only)
- Pros: Simplest build, no server bundle
- Cons: Empty HTML shell on job detail pages; poor link-preview and SEO
- Rejected: Job board links are a primary sharing surface

### Full SSR with Express in production
- Pros: Dynamic server rendering per request
- Cons: Requires a Node server; Firebase Hosting serves static files only
- Rejected: Hosting platform constraint

### Prerender only home and job list, not detail pages
- Pros: Faster builds
- Cons: Misses the highest-value pages for sharing
- Rejected: Detail pages are the main deep-link target

## Consequences

- Build time scales with number of seeded jobs (currently 42 prerendered detail pages)
- Server-side data comes from seed JSON, not Firestore - prerendered HTML reflects seed data
- After hydration, the browser fetches live Firestore data and reconciles
- `firebase` and Google Maps initialization must guard against server platform (`isPlatformBrowser`, `isPlatformServer`)
