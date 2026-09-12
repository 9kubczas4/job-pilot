import { inject } from '@angular/core';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { JobSearchWebMcpService } from '@features/jobs/webmcp/shared/job-search-webmcp.service';
import { SEARCH_JOBS_INPUT_SCHEMA } from './search-jobs.schema';

export const SEARCH_JOBS_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'search_jobs',
  description:
    'Search and replace the /jobs criteria with a complete filter set (omitted fields reset to defaults). Use when the user wants new results; returns normalized criteria, total count, and lightweight summaries (salary includes currency + period; distances in miles).',
  inputSchema: SEARCH_JOBS_INPUT_SCHEMA,
  execute: async (input) => ({
    ...(await inject(JobSearchWebMcpService).applySearchCriteria(input)),
  }),
});

export function provideSearchJobsWebMcpTool() {
  return provideZodWebMcpTools([SEARCH_JOBS_WEBMCP_TOOL]);
}
