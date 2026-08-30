import { inject } from '@angular/core';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { toolFailure, toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { SavedJobsStore } from '@features/jobs/state/saved-jobs.store';
import { SAVED_JOB_INPUT_SCHEMA } from './saved-jobs.schema';

export const SAVED_JOBS_WEBMCP_TOOLS = [
  defineZodWebMcpTool({
    name: 'save_job',
    description:
      "Save one job to the signed-in user's shortlist. Use this tool instead of interacting with the page UI or DOM. Use it when the user wants to remember or favorite a job returned by search_jobs or get_job. Requires sign-in. It is idempotent: an already saved job is not duplicated. Returns success, changed, jobId, saved: true, and the complete current savedJobIds state with savedCount.",
    inputSchema: SAVED_JOB_INPUT_SCHEMA,
    execute: ({ jobId }) => updateSavedState(jobId, true),
  }),
  defineZodWebMcpTool({
    name: 'unsave_job',
    description:
      "Remove one job from the signed-in user's shortlist. Use this tool instead of interacting with the page UI or DOM. This does not delete the job or any existing application. Requires sign-in. It is idempotent: a job that is not saved causes no state change. Returns success, changed, jobId, saved: false, and the complete current savedJobIds state with savedCount.",
    inputSchema: SAVED_JOB_INPUT_SCHEMA,
    execute: ({ jobId }) => updateSavedState(jobId, false),
  }),
] as const;

export function provideSavedJobsWebMcpTools() {
  return provideZodWebMcpTools(SAVED_JOBS_WEBMCP_TOOLS);
}

async function updateSavedState(jobId: string, shouldBeSaved: boolean) {
  if (!inject(AuthService).isAuthenticated()) {
    return toolFailure(
      'UNAUTHENTICATED',
      shouldBeSaved
        ? 'Sign in before saving a job.'
        : 'Sign in before removing a job from the shortlist.',
    );
  }

  const savedJobs = inject(SavedJobsStore);
  await savedJobs.loadSavedJobs();
  const currentlySaved = savedJobs.isSaved(jobId);
  const changed = currentlySaved !== shouldBeSaved;

  if (changed) {
    if (shouldBeSaved) {
      await savedJobs.saveJob(jobId);
    } else {
      await savedJobs.unsaveJob(jobId);
    }
  }

  const savedJobIds = savedJobs.savedJobIds();
  return toolSuccess({
    changed,
    jobId,
    saved: shouldBeSaved,
    savedJobIds,
    savedCount: savedJobIds.length,
  });
}
