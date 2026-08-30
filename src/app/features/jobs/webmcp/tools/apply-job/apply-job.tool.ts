import { inject } from '@angular/core';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { toolFailure, toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';
import { APPLY_JOB_INPUT_SCHEMA } from './apply-job.schema';

export const APPLY_JOB_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'apply_job',
  description:
    'Submit a real job application for the signed-in user and add it to Applications. Use this tool instead of interacting with the page UI or DOM. This action may not be reversible, so call it only after the user has clearly chosen a job. Requires sign-in. It is idempotent: an existing application is returned without creating a duplicate. Returns success, changed, and the complete application record.',
  inputSchema: APPLY_JOB_INPUT_SCHEMA,
  execute: async ({ jobId, note }) => {
    if (!inject(AuthService).isAuthenticated()) {
      return toolFailure('UNAUTHENTICATED', 'Sign in before applying to a job.');
    }

    const applications = inject(JobApplicationsStore);
    await applications.loadApplications();
    const existing = applications.applications().find((application) => application.jobId === jobId);

    if (existing) {
      return toolSuccess({
        changed: false,
        application: { ...existing, status: 'applied' },
      });
    }

    const application = await applications.applyToJob(jobId, note || undefined);
    return toolSuccess({
      changed: true,
      application: { ...application, status: 'applied' },
    });
  },
});

export function provideApplyJobWebMcpTool() {
  return provideZodWebMcpTools([APPLY_JOB_WEBMCP_TOOL]);
}
