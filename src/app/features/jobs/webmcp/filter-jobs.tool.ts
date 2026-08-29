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
        'Apply structured job filters and navigate to the job board so filters, sort, list, and map update in real time. Use for workplace, seniority, contract type, skills, salary, and sort. Use search_jobs for free-text query and location search.',
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
