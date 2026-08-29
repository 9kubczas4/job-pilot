import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { JobSearchCriteria } from '@features/jobs/domain/search.model';
import { SEARCH_JOBS_SCHEMA } from '../schemas/search-jobs.schema';
import { toolJson } from '../utils/tool-response';

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
