export interface PageSeoMetadata {
  title: string;
  description: string;
  url: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
}

export const DEFAULT_PAGE_SEO: PageSeoMetadata = {
  title: 'Job Pilot - Job board for humans & AI agents',
  description:
    'Browse tech jobs on a map, filter by role and location, and let AI agents search, save, and apply through WebMCP tools that share the same data as the UI.',
  url: 'https://job-pilot-1e4ee.web.app/',
  ogTitle: 'Job Pilot — Job board for humans & AI agents',
  ogDescription:
    'Browse tech jobs on a map, filter by role and location, and let AI agents search, save, and apply through WebMCP tools.',
  twitterTitle: 'Job Pilot — Job board for humans & AI agents',
  twitterDescription:
    'Browse tech jobs on a map, filter by role and location, and let AI agents search, save, and apply through WebMCP tools.',
};
