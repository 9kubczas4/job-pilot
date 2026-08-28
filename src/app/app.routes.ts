import { Routes } from '@angular/router';
import { provideProfileRouteWebMcpTools } from './profile/webmcp/profile.tools';
import { provideJobDetailsWebMcpTools } from './jobs/webmcp/job-details.tools';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/pages/home.page').then((m) => m.HomePageComponent),
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./jobs/feature-search/job-search.page').then((m) => m.JobSearchPageComponent),
  },
  {
    path: 'jobs/:id',
    loadComponent: () =>
      import('./jobs/feature-details/job-details.page').then((m) => m.JobDetailsPageComponent),
    providers: [provideJobDetailsWebMcpTools()],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/feature-profile/profile.page').then((m) => m.ProfilePageComponent),
    providers: [provideProfileRouteWebMcpTools()],
  },
  {
    path: 'saved',
    loadComponent: () =>
      import('./saved-jobs/feature-saved-jobs/saved-jobs.page').then((m) => m.SavedJobsPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
