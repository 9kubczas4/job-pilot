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
        'Set structured filters or sort order, open the job board, and refresh the filter panel, chips, list, and map. For text or location search, use search_jobs.',
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
