import { Routes } from '@angular/router';
import { provideProfileRouteWebMcpTools } from './core/webmcp/tools/profile.tools';
import { provideJobDetailsWebMcpTools } from './core/webmcp/tools/job-details.tools';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/pages/home.page').then((m) => m.HomePageComponent),
  },
  {
    path: 'jobs',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/jobs/job-search.page').then((m) => m.JobSearchPageComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/jobs/job-details.page').then((m) => m.JobDetailsPageComponent),
        providers: [provideJobDetailsWebMcpTools()],
      },
    ],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.page').then((m) => m.ProfilePageComponent),
    providers: [provideProfileRouteWebMcpTools()],
  },
  {
    path: 'saved',
    loadComponent: () =>
      import('./features/saved-jobs/saved-jobs.page').then((m) => m.SavedJobsPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
