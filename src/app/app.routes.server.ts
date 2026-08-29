import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { getJobPrerenderParams } from './prerender/job-prerender-params';

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
