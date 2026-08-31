import { inject } from '@angular/core';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { toolFailure, toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { SavedJobsStore } from '@features/jobs/state/saved-jobs.store';
import { GET_SAVED_JOBS_INPUT_SCHEMA, SAVED_JOB_INPUT_SCHEMA } from './saved-jobs.schema';

export const SAVED_JOBS_WEBMCP_TOOLS = [
  defineZodWebMcpTool({
    name: 'get_saved_jobs',
    description:
      "Read the signed-in user's saved job shortlist. Use this tool instead of interacting with the page UI or DOM. This tool does not change application state and is available from any page. Requires sign-in. Returns changed: false, savedCount, the complete savedJobIds state, lightweight details for jobs still available in the catalog, and unavailableJobIds for saved offers that no longer exist. Use get_job for complete offer details.",
    inputSchema: GET_SAVED_JOBS_INPUT_SCHEMA,
    execute: () => readSavedJobs(),
  }),
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

async function readSavedJobs() {
  if (!inject(AuthService).isAuthenticated()) {
    return toolFailure('UNAUTHENTICATED', 'Sign in before reading saved jobs.');
  }

  const savedJobs = inject(SavedJobsStore);
  const jobSearch = inject(JobSearchStore);
  await Promise.all([savedJobs.loadSavedJobs(), jobSearch.loadJobs()]);

  const savedJobIds = savedJobs.savedJobIds();
  const jobsById = new Map(jobSearch.allJobs().map((job) => [job.id, job]));
  const jobs = savedJobIds.flatMap((jobId) => {
    const job = jobsById.get(jobId);
    return job ? [toSavedJobSummary(job)] : [];
  });
  const unavailableJobIds = savedJobIds.filter((jobId) => !jobsById.has(jobId));

  return toolSuccess({
    changed: false,
    savedCount: savedJobIds.length,
    savedJobIds,
    unavailableJobIds,
    jobs,
  });
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

function toSavedJobSummary(job: JobOffer) {
  return {
    id: job.id,
    title: job.title,
    company: job.company.name,
    ...(job.location ? { location: job.location.city } : {}),
    workplace: job.workplace,
    ...(job.salary ? { salary: { ...job.salary } } : {}),
    seniority: [...job.seniority],
    skills: job.competencies.map((competency) => competency.name),
  };
}
