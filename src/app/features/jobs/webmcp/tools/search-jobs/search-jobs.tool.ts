import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { toolJson } from '@core/webmcp/tool-response';
import { JobSearchWebMcpService } from '../../shared/job-search-webmcp.service';
import { JobSearchInput } from '../../shared/webmcp-criteria.utils';
import { SEARCH_JOBS_SCHEMA } from './search-jobs.schema';

export function provideSearchJobsWebMcpTool() {
  return provideExperimentalWebMcpTools([
    {
      name: 'search_jobs',
      description:
        'Start a new job search. Replaces the current text, location, and radius criteria while preserving structured filters from filter_jobs. Use exactly one city as the geographic center. Call filter_jobs after this to refine or sort results. Returns success, whether criteria changed, the applied criteria, and matching job IDs.',
      inputSchema: SEARCH_JOBS_SCHEMA,
      execute: async (input) => {
        const result = await inject(JobSearchWebMcpService).applySearchCriteria(
          input as JobSearchInput,
        );
        return toolJson(result);
      },
    },
  ]);
}
