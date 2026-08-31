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
    'Start or replace the text-and-location portion of the current job search, then navigate the UI to the resulting jobs page. Use this tool instead of interacting with the page UI or DOM. Existing structured filters from filter_jobs are preserved. Use zero or one city; call filter_jobs separately to refine or sort. Returns success, changed, normalized criteria, resultCount, and up to 10 lightweight results with matching jobIds. Each result includes id, title, company, location, distanceKm when available, workplace, salary, seniority, and skills; use get_job only for the complete description, requirements, responsibilities, benefits, or application details.',
  inputSchema: SEARCH_JOBS_INPUT_SCHEMA,
  execute: async (input) => ({
    ...(await inject(JobSearchWebMcpService).applySearchCriteria(input)),
  }),
});

export function provideSearchJobsWebMcpTool() {
  return provideZodWebMcpTools([SEARCH_JOBS_WEBMCP_TOOL]);
}
