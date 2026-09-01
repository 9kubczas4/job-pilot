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
    'Return complete job records for one to twenty IDs in input order. Missing offers are marked per item. Does not change application state. On /jobs, when discussing one visible offer, also call highlight_job with the same jobId so the map focuses it.',
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
