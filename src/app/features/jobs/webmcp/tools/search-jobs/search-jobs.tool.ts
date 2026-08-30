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
    'Start or replace the text-and-location portion of the current job search, then navigate the UI to the resulting jobs page. Use this tool instead of interacting with the page UI or DOM. Existing structured filters from filter_jobs are preserved. Use zero or one city; call filter_jobs separately to refine or sort. Returns success, changed, normalized criteria, resultCount, and up to 10 matching jobIds; use get_job for complete details without inspecting the page.',
  inputSchema: SEARCH_JOBS_INPUT_SCHEMA,
  execute: async (input) => ({
    ...(await inject(JobSearchWebMcpService).applySearchCriteria(input)),
  }),
});

export function provideSearchJobsWebMcpTool() {
  return provideZodWebMcpTools([SEARCH_JOBS_WEBMCP_TOOL]);
}
