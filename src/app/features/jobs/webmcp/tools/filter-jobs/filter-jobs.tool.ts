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
    'Patch structured filters and result ordering on the current job search, then synchronize the jobs UI. Use this tool instead of interacting with the page UI or DOM. Text and location criteria from search_jobs are preserved. Omitted fields remain unchanged; pass [] to clear an array filter, 0 to clear salaryMin, or newest to restore default sorting. Returns success, changed, normalized criteria, resultCount, and up to 10 lightweight results with matching jobIds. Each result includes id, title, company, location, distanceKm when available, workplace, salary, seniority, and skills; use get_job only for the complete description, requirements, responsibilities, benefits, or application details.',
  inputSchema: FILTER_JOBS_INPUT_SCHEMA,
  execute: async (input) => ({
    ...(await inject(JobSearchWebMcpService).applyFilterCriteria(input)),
  }),
});

export function provideFilterJobsWebMcpTool() {
  return provideZodWebMcpTools([FILTER_JOBS_WEBMCP_TOOL]);
}
