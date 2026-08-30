/** Route segments for `Routes` config (`path` values). */
export const RoutePaths = {
  home: '',
  jobs: 'jobs',
  jobId: ':id',
  profile: 'profile',
  saved: 'saved',
  applications: 'applications',
  wildcard: '**',
} as const;

/** Root-relative link commands for `routerLink` / `Router.navigate`. */
export const AppLinks = {
  home: ['/'] as const,
  jobs: ['/', RoutePaths.jobs] as const,
  job: (id: string) => ['/', RoutePaths.jobs, id] as const,
  profile: ['/', RoutePaths.profile] as const,
  saved: ['/', RoutePaths.jobs, RoutePaths.saved] as const,
  applications: ['/', RoutePaths.jobs, RoutePaths.applications] as const,
};

export const AppProfileMenuLinks = {
  saved: AppLinks.saved,
  applications: AppLinks.applications,
  profile: AppLinks.profile,
} as const;
