import { inject, provideExperimentalWebMcpTools, WebMcpToolDescriptor } from '@angular/core';
import { toolJson, toolText } from '@core/webmcp/tool-response';
import { SavedJobsStore } from '../../../state/saved-jobs.store';
import { SAVED_JOB_INPUT_SCHEMA } from './saved-jobs.schema';

export const SAVED_JOBS_WEBMCP_TOOLS: WebMcpToolDescriptor<typeof SAVED_JOB_INPUT_SCHEMA>[] = [
  {
    name: 'save_job',
    description:
      "Save a job to the signed-in user's shortlist. Use when the user wants to remember or favorite a specific job. Idempotent: if the job is already saved, no duplicate is created. Requires sign-in. Returns success, changed, jobId, and saved: true.",
    inputSchema: SAVED_JOB_INPUT_SCHEMA,
    execute: ({ jobId }) => updateSavedState(jobId, true),
  },
  {
    name: 'unsave_job',
    description:
      "Remove a job from the signed-in user's shortlist. Use when the user no longer wants a specific job saved. This does not delete the job or an existing application. Idempotent: if the job is not saved, no change is made. Requires sign-in. Returns success, changed, jobId, and saved: false.",
    inputSchema: SAVED_JOB_INPUT_SCHEMA,
    execute: ({ jobId }) => updateSavedState(jobId, false),
  },
];

export function provideSavedJobsWebMcpTools() {
  return provideExperimentalWebMcpTools(SAVED_JOBS_WEBMCP_TOOLS);
}

async function updateSavedState(jobId: string, shouldBeSaved: boolean) {
  if (typeof jobId !== 'string' || jobId.trim().length === 0) {
    return toolText('jobId must be a non-empty string.');
  }

  const savedJobs = inject(SavedJobsStore);

  try {
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

    return toolJson({
      success: true,
      changed,
      jobId,
      saved: shouldBeSaved,
    });
  } catch (error) {
    const fallback = shouldBeSaved ? 'Saving the job failed.' : 'Removing the saved job failed.';
    return toolText(error instanceof Error ? error.message : fallback);
  }
}
