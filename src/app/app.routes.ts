import { Routes } from '@angular/router';
import { provideJobDetailsWebMcpTools } from '@features/jobs/webmcp/job-details.tools';
import { RoutePaths } from '@core/app-paths';

export const routes: Routes = [
  {
    path: RoutePaths.home,
    loadComponent: () => import('@core/pages/home/home.page').then((m) => m.HomePageComponent),
  },
  {
    path: RoutePaths.jobs,
    providers: [provideJobDetailsWebMcpTools()],
    children: [
      {
        path: RoutePaths.home,
        loadComponent: () =>
          import('@features/jobs/pages/job-search/job-search.page').then((m) => m.JobSearchPageComponent),
      },
      {
        path: RoutePaths.jobId,
        loadComponent: () =>
          import('@features/jobs/pages/job-details/job-details.page').then((m) => m.JobDetailsPageComponent),
      },
    ],
  },
  {
    path: RoutePaths.profile,
    loadComponent: () =>
      import('@features/profile/pages/profile/profile.page').then((m) => m.ProfilePageComponent),
  },
  {
    path: RoutePaths.saved,
    loadComponent: () =>
      import('@features/saved-jobs/pages/saved-jobs/saved-jobs.page').then((m) => m.SavedJobsPageComponent),
  },
  {
    path: RoutePaths.applications,
    loadComponent: () =>
      import('@features/saved-jobs/pages/applications/applications.page').then(
        (m) => m.ApplicationsPageComponent,
      ),
  },
  {
    path: RoutePaths.wildcard,
    redirectTo: RoutePaths.home,
  },
];
