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
        'Set a free-text query and/or location, open the job board, and refresh the search bar, list, and map. For workplace, seniority, salary, skills, contract, or sort, use filter_jobs.',
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
