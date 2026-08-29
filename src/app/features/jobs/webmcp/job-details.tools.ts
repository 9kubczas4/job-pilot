import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { SavedJobsStore } from '@features/saved-jobs/state/saved-jobs.store';
import { toolJson, toolText } from '@shared/webmcp/tool-response';
import { JobRepository } from '../data-access/job.repository';

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
      description: 'Read a single job offer by jobId.',
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
      description:
        'Add a job to favorites. Same as clicking Save in the UI. Works on the job list and job details pages.',
      inputSchema: SAVE_JOB_SCHEMA,
      execute: async ({ jobId }) => {
        if (typeof jobId !== 'string') {
          return toolText('jobId must be a string.');
        }
        try {
          await inject(SavedJobsStore).saveJob(jobId);
          return toolJson({ success: true, jobId });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Save failed.';
          return toolText(message);
        }
      },
    },
    {
      name: 'apply_job',
      description:
        'Submit a job application for the signed-in user. Requires a populated profile. Shows a toast and updates the Applications list in the UI.',
      inputSchema: APPLY_JOB_SCHEMA,
      execute: async (input) => {
        const { jobId, note } = input as { jobId: string; note?: string };
        if (typeof jobId !== 'string') {
          return toolText('jobId must be a string.');
        }
        try {
          const application = await inject(SavedJobsStore).applyToJob(
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
