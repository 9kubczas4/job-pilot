import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { JobRepository } from '../data-access/job.repository';
import { SavedJobsService } from '../../saved-jobs/data-access/saved-jobs.service';
import { toolJson, toolText } from '../../webmcp/utils/tool-response';

const GET_JOB_SCHEMA = {
  type: 'object',
  properties: {
    jobId: { type: 'string', description: 'The job identifier.' },
  },
  required: ['jobId'],
  additionalProperties: false,
} as const;

const SAVE_JOB_SCHEMA = {
  type: 'object',
  properties: {
    jobId: { type: 'string' },
  },
  required: ['jobId'],
  additionalProperties: false,
} as const;

const APPLY_JOB_SCHEMA = {
  type: 'object',
  properties: {
    jobId: { type: 'string' },
    note: { type: 'string' },
  },
  required: ['jobId'],
  additionalProperties: false,
} as const;

export function provideJobDetailsWebMcpTools() {
  return provideExperimentalWebMcpTools([
    {
      name: 'get_job',
      description: 'Return the full job offer for a given job ID.',
      inputSchema: GET_JOB_SCHEMA,
      execute: async ({ jobId }) => {
        if (typeof jobId !== 'string') {
          return toolText('jobId must be a string.');
        }
        const job = await inject(JobRepository).getJobById(jobId);
        if (!job) {
          return toolText(`Job not found: ${jobId}`);
        }
        return toolJson(job);
      },
    },
    {
      name: 'save_job',
      description: 'Save a job to the authenticated user saved jobs list.',
      inputSchema: SAVE_JOB_SCHEMA,
      execute: async ({ jobId }) => {
        if (typeof jobId !== 'string') {
          return toolText('jobId must be a string.');
        }
        try {
          await inject(SavedJobsService).saveJob(jobId);
          return toolJson({ success: true, jobId });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Save failed.';
          return toolText(message);
        }
      },
    },
    {
      name: 'apply_to_job',
      description:
        'Submit a minimal job application for the authenticated user. Requires a populated profile.',
      inputSchema: APPLY_JOB_SCHEMA,
      execute: async (input) => {
        const { jobId, note } = input as { jobId: string; note?: string };
        if (typeof jobId !== 'string') {
          return toolText('jobId must be a string.');
        }
        try {
          const application = await inject(SavedJobsService).applyToJob(
            jobId,
            typeof note === 'string' ? note : undefined,
          );
          return toolJson({ success: true, ...application });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Application failed.';
          return toolText(message);
        }
      },
    },
  ]);
}
