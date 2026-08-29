import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { toolJson } from '@shared/webmcp/tool-response';
import { JobFilterCriteria } from '../domain/search.model';
import { JobSearchWebMcpService } from './job-search-webmcp.service';
import { FILTER_JOBS_SCHEMA } from './filter-jobs.schema';

export function provideFilterJobsWebMcpTool() {
  return provideExperimentalWebMcpTools([
    {
      name: 'filter_jobs',
      description:
        'Refine the current results. Updates only the structured filters and sort order you pass, preserving the text and location from search_jobs. Pass an empty array to clear a filter. Values within each array are matched with OR. Returns success, whether criteria changed, the applied criteria, and matching job IDs.',
      inputSchema: FILTER_JOBS_SCHEMA,
      execute: async (input) => {
        const result = await inject(JobSearchWebMcpService).applyFilterCriteria(
          input as JobFilterCriteria,
        );
        return toolJson(result);
      },
    },
  ]);
}
