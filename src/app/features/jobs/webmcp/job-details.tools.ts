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
    note: { type: 'string', description: 'Optional note attached to the application.' },
  },
  required: ['jobId'],
  additionalProperties: false,
} as const;

export function provideJobDetailsWebMcpTools() {
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
    {
      name: 'save_job',
      description:
        "Add a job to the signed-in user's favorites. Idempotent: saving an already saved job makes no additional change. Requires sign-in. Works on the job list and job details pages. Returns success, whether the saved state changed, jobId, and saved: true.",
      inputSchema: SAVE_JOB_SCHEMA,
      execute: async ({ jobId }) => {
        if (typeof jobId !== 'string') {
          return toolText('jobId must be a string.');
        }

        const savedJobs = inject(SavedJobsStore);
        try {
          await savedJobs.loadUserData();
          const alreadySaved = savedJobs.isSaved(jobId);
          if (!alreadySaved) {
            await savedJobs.saveJob(jobId);
          }

          return toolJson({
            success: true,
            changed: !alreadySaved,
            jobId,
            saved: true,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Save failed.';
          return toolText(message);
        }
      },
    },
    {
      name: 'apply_job',
      description:
        'Submit a real job application for the signed-in user. Creates an entry in Applications and may not be reversible. Requires sign-in. Idempotent: applying to a job that is already applied returns the existing application without creating a duplicate. Returns success, whether a new application was created, jobId, appliedAt, optional note, and status: applied.',
      inputSchema: APPLY_JOB_SCHEMA,
      execute: async (input) => {
        const { jobId, note } = input as { jobId: string; note?: string };
        if (typeof jobId !== 'string') {
          return toolText('jobId must be a string.');
        }

        const savedJobs = inject(SavedJobsStore);
        try {
          await savedJobs.loadUserData();
          const existing = savedJobs.applications().find((application) => application.jobId === jobId);
          if (existing) {
            return toolJson({
              success: true,
              changed: false,
              jobId: existing.jobId,
              appliedAt: existing.appliedAt,
              note: existing.note,
              status: 'applied',
            });
          }

          const application = await savedJobs.applyToJob(
            jobId,
            typeof note === 'string' ? note : undefined,
          );

          return toolJson({
            success: true,
            changed: true,
            jobId: application.jobId,
            appliedAt: application.appliedAt,
            note: application.note,
            status: 'applied',
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Application failed.';
          return toolText(message);
        }
      },
    },
  ]);
}
