import { inject } from '@angular/core';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { toolFailure, toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { ApplyJobStore } from '@features/jobs/state/apply-job.store';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';
import { APPLY_JOB_INPUT_SCHEMA } from './apply-job.schema';

export const APPLY_JOB_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'apply_job',
  description:
    'Open the job application dialog with an optional pre-filled message. Use this tool instead of interacting with the page UI or DOM. The user must review the message and click Submit — this tool does not submit the application automatically. Call it only after the user has clearly chosen a job. Requires sign-in. If the user already applied, returns the existing application without opening the dialog. Returns success, dialogOpened, job details, and prefilledNote.',
  inputSchema: APPLY_JOB_INPUT_SCHEMA,
  execute: async ({ jobId, note }) => {
    const auth = inject(AuthService);
    const applications = inject(JobApplicationsStore);
    const applyJobStore = inject(ApplyJobStore);

    if (!auth.isAuthenticated()) {
      return toolFailure('UNAUTHENTICATED', 'Sign in before applying to a job.');
    }

    await applications.loadApplications();
    const existing = applications.applications().find((application) => application.jobId === jobId);

    if (existing) {
      return toolSuccess({
        changed: false,
        alreadyApplied: true,
        application: { ...existing, status: 'applied' },
      });
    }

    const result = await applyJobStore.show({ jobId, note });
    if (!result) {
      return toolFailure('NOT_FOUND', `Job offer not found: ${jobId}.`);
    }

    return toolSuccess({
      changed: true,
      dialogOpened: true,
      jobId: result.jobId,
      jobTitle: result.jobTitle,
      companyName: result.companyName,
      prefilledNote: result.prefilledNote,
    });
  },
});

export function provideApplyJobWebMcpTool() {
  return provideZodWebMcpTools([APPLY_JOB_WEBMCP_TOOL]);
}
