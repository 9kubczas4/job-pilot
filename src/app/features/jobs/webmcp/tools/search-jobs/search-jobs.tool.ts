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
    'Search jobs using complete criteria and update the jobs page. Each call replaces the current search state; omitted fields use defaults. Returns normalized criteria, total count, and lightweight results.',
  inputSchema: SEARCH_JOBS_INPUT_SCHEMA,
  execute: async (input) => ({
    ...(await inject(JobSearchWebMcpService).applySearchCriteria(input)),
  }),
});

export function provideSearchJobsWebMcpTool() {
  return provideZodWebMcpTools([SEARCH_JOBS_WEBMCP_TOOL]);
}
