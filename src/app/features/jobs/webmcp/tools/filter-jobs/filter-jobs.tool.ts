import { inject } from '@angular/core';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { JobSearchWebMcpService } from '@features/jobs/webmcp/shared/job-search-webmcp.service';
import { FILTER_JOBS_INPUT_SCHEMA } from './filter-jobs.schema';

export const FILTER_JOBS_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'filter_jobs',
  description:
    'Patch structured filters and result ordering on the current job search, then synchronize the jobs UI. Use this tool instead of interacting with the page UI or DOM. Text and location criteria from search_jobs are preserved. Omitted fields remain unchanged; pass [] to clear an array filter, 0 to clear salaryMin, or newest to restore default sorting. Returns success, changed, normalized criteria, resultCount, and up to 10 matching jobIds; use get_job for complete details without inspecting the page.',
  inputSchema: FILTER_JOBS_INPUT_SCHEMA,
  execute: async (input) => ({
    ...(await inject(JobSearchWebMcpService).applyFilterCriteria(input)),
  }),
});

export function provideFilterJobsWebMcpTool() {
  return provideZodWebMcpTools([FILTER_JOBS_WEBMCP_TOOL]);
}
