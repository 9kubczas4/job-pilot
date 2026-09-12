import { inject } from '@angular/core';
import { toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { JobDetailsStore } from '@features/jobs/state/job-details.store';
import { GET_JOBS_INPUT_SCHEMA } from './get-jobs.schema';

export const GET_JOBS_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'get_jobs',
  description:
    'Fetch full job records for 1–20 IDs in input order. Use when you need complete offer details; returns found/not_found per ID (dates are ISO 8601; salary includes currency + period) without changing state.',
  inputSchema: GET_JOBS_INPUT_SCHEMA,
  execute: async ({ jobIds }) => {
    const jobs = await inject(JobDetailsStore).getJobsByIds(jobIds);

    return toolSuccess({
      changed: false,
      results: jobIds.map((jobId, index) => {
        const job = jobs[index];
        return job
          ? { jobId, status: 'found' as const, job }
          : { jobId, status: 'not_found' as const };
      }),
    });
  },
});

export function provideGetJobsWebMcpTool() {
  return provideZodWebMcpTools([GET_JOBS_WEBMCP_TOOL]);
}
