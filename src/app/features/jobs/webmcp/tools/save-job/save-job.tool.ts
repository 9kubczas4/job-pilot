import { inject } from '@angular/core';
import { provideExperimentalWebMcpTools } from '@angular/core';
import { SavedJobsStore } from '@features/saved-jobs/state/saved-jobs.store';
import { toolJson, toolText } from '@core/webmcp/tool-response';
import { SAVE_JOB_SCHEMA } from './save-job.schema';

export function provideSaveJobWebMcpTool() {
  return provideExperimentalWebMcpTools([
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
  ]);
}
