/** Route segments for `Routes` config (`path` values). */
export const RoutePaths = {
  home: '',
  jobs: 'jobs',
  jobId: ':id',
  profile: 'profile',
  saved: 'saved',
  wildcard: '**',
} as const;

/** Root-relative link commands for `routerLink` / `Router.navigate`. */
export const AppLinks = {
  home: ['/'] as const,
  jobs: ['/', RoutePaths.jobs] as const,
  job: (id: string) => ['/', RoutePaths.jobs, id] as const,
  profile: ['/', RoutePaths.profile] as const,
  saved: ['/', RoutePaths.saved] as const,
};
