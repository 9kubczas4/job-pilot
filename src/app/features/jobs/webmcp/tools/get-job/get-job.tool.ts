import { inject } from '@angular/core';
import { toolFailure, toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { JobDetailsStore } from '@features/jobs/state/job-details.store';
import { GET_JOB_INPUT_SCHEMA } from './get-job.schema';

export const GET_JOB_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'get_job',
  description:
    'Read one job offer by its exact jobId. Use this tool instead of interacting with the page UI or DOM. Use a jobId returned by search_jobs. This tool does not change application state and does not require sign-in. Returns the complete job record on success or a structured NOT_FOUND error when the identifier is unknown.',
  inputSchema: GET_JOB_INPUT_SCHEMA,
  execute: async ({ jobId }) => {
    const job = await inject(JobDetailsStore).getJobById(jobId);
    return job
      ? toolSuccess({ changed: false, job })
      : toolFailure('NOT_FOUND', `No job exists with jobId "${jobId}".`);
  },
});

export function provideGetJobWebMcpTool() {
  return provideZodWebMcpTools([GET_JOB_WEBMCP_TOOL]);
}
