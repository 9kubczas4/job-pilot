import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { SavedJobsStore } from '@features/saved-jobs/state/saved-jobs.store';
import { toolJson, toolText } from '@core/webmcp/tool-response';
import { APPLY_JOB_SCHEMA } from './apply-job.schema';

export function provideApplyJobWebMcpTool() {
  return provideExperimentalWebMcpTools([
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
