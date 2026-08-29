import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { toolJson } from '@shared/webmcp/tool-response';
import { JobSearchCriteria } from '../domain/search.model';
import { JobSearchStore } from '../state/job-search.store';
import { SEARCH_JOBS_SCHEMA } from './search-jobs.schema';

export function provideSearchJobsWebMcpTool() {
  return provideExperimentalWebMcpTools([
    {
      name: 'search_jobs',
      description:
        'Search job offers and update filters, list, and map in real time. Use this for natural-language job search intent.',
      inputSchema: SEARCH_JOBS_SCHEMA,
      execute: (input) => {
        const store = inject(JobSearchStore);
        store.applyCriteria(input as JobSearchCriteria);
        return toolJson({
          criteria: store.criteria(),
          resultCount: store.jobs().length,
          jobIds: store.jobs().slice(0, 10).map((job) => job.id),
        });
      },
    },
  ]);
}
