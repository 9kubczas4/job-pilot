import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { toolJson, toolText } from '@core/webmcp/tool-response';
import { JobRepository } from '../../../data-access/job.repository';
import { GET_JOB_SCHEMA } from './get-job.schema';

export function provideGetJobWebMcpTool() {
  return provideExperimentalWebMcpTools([
    {
      name: 'get_job',
      description:
        'Read a single job offer by jobId. Returns success, the full job record, and changed: false.',
      inputSchema: GET_JOB_SCHEMA,
      execute: async ({ jobId }) => {
        if (typeof jobId !== 'string') {
          return toolText('jobId must be a string.');
        }
        const job = await inject(JobRepository).getJobById(jobId);
        if (!job) {
          return toolText(`Job not found: ${jobId}`);
        }
        return toolJson({ success: true, changed: false, job });
      },
    },
  ]);
}
