import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { toolJson } from '@shared/webmcp/tool-response';
import { JobSearchCriteria } from '../domain/search.model';
import { JobSearchWebMcpService } from './job-search-webmcp.service';
import { SEARCH_JOBS_SCHEMA } from './search-jobs.schema';

export function provideSearchJobsWebMcpTool() {
  return provideExperimentalWebMcpTools([
    {
      name: 'search_jobs',
      description:
        'Search job offers by free-text query and location. Navigates to the job board and updates the search bar, filters, list, and map in real time. Use filter_jobs for structured filters such as workplace, seniority, and salary.',
      inputSchema: SEARCH_JOBS_SCHEMA,
      execute: async (input) => {
        const result = await inject(JobSearchWebMcpService).applySearchCriteria(
          input as JobSearchCriteria,
        );
        return toolJson(result);
      },
    },
  ]);
}
