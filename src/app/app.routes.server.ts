import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

function getJobPrerenderParams(): { id: string }[] {
  const seedPath = join(process.cwd(), 'src/assets/seed/jobs.json');
  const jobs = JSON.parse(readFileSync(seedPath, 'utf-8')) as { id: string }[];
  return jobs.map((job) => ({ id: job.id }));
}

/**
 * Hybrid render modes for production builds.
 *
 * Most routes use prerender (SSG) so the demo ships static HTML for key pages.
 * That improves Core Web Vitals — especially LCP and FCP — because the browser
 * can paint content before Angular bootstraps, instead of waiting on JS download
 * and execution (CSR).
 *
 * Job details are prerendered for every seeded ID; unknown IDs fall back to CSR.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'jobs',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'jobs/saved',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'jobs/applications',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'jobs/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(getJobPrerenderParams()),
    fallback: PrerenderFallback.Client,
  },
  {
    path: 'profile',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'saved',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'applications',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
