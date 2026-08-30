import { Routes } from '@angular/router';
import { RoutePaths } from '@core/app-paths';
import { provideUpdateProfileWebMcpTool } from '@features/profile/webmcp/profile.tools';

export const routes: Routes = [
  {
    path: RoutePaths.home,
    loadComponent: () =>
      import('@features/home/pages/home/home.page').then((m) => m.HomePageComponent),
  },
  {
    path: RoutePaths.jobs,
    children: [
      {
        path: RoutePaths.home,
        loadComponent: () =>
          import('@features/jobs/pages/job-search/job-search.page').then(
            (m) => m.JobSearchPageComponent,
          ),
      },
      {
        path: RoutePaths.saved,
        loadComponent: () =>
          import('@features/jobs/pages/saved-jobs/saved-jobs.page').then(
            (m) => m.SavedJobsPageComponent,
          ),
      },
      {
        path: RoutePaths.applications,
        loadComponent: () =>
          import('@features/jobs/pages/applications/applications.page').then(
            (m) => m.ApplicationsPageComponent,
          ),
      },
      {
        path: RoutePaths.jobId,
        loadComponent: () =>
          import('@features/jobs/pages/job-details/job-details.page').then(
            (m) => m.JobDetailsPageComponent,
          ),
      },
    ],
  },
  {
    path: RoutePaths.profile,
    providers: [provideUpdateProfileWebMcpTool()],
    loadComponent: () =>
      import('@features/profile/pages/profile/profile.page').then((m) => m.ProfilePageComponent),
  },
  {
    path: RoutePaths.saved,
    redirectTo: `/${RoutePaths.jobs}/${RoutePaths.saved}`,
    pathMatch: 'full',
  },
  {
    path: RoutePaths.applications,
    redirectTo: `/${RoutePaths.jobs}/${RoutePaths.applications}`,
    pathMatch: 'full',
  },
  {
    path: RoutePaths.wildcard,
    redirectTo: RoutePaths.home,
  },
];
