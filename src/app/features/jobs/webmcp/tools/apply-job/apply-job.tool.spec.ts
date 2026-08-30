import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APPLY_JOB_WEBMCP_TOOL } from './apply-job.tool';

describe('apply_job WebMCP tool', () => {
  const auth = { isAuthenticated: vi.fn<() => boolean>() };
  const applications = {
    loadApplications: vi.fn<() => Promise<void>>(),
    applications: vi.fn(() => []),
    applyToJob: vi.fn(),
  };

  const application = {
    jobId: 'job-001',
    appliedAt: '2026-08-30T12:00:00.000Z',
    note: 'Strong match.',
    status: 'applied' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    auth.isAuthenticated.mockReturnValue(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: JobApplicationsStore, useValue: applications },
      ],
    });
  });

  it('returns UNAUTHENTICATED without loading applications', async () => {
    const response = await TestBed.runInInjectionContext(() =>
      APPLY_JOB_WEBMCP_TOOL.execute({ jobId: 'job-001' }, { signal: new AbortController().signal }),
    );

    expect(JSON.parse(response.content[0].text)).toEqual({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Sign in before applying to a job.',
      },
    });
    expect(applications.loadApplications).not.toHaveBeenCalled();
  });

  it('returns the complete created application so the agent does not inspect the UI', async () => {
    auth.isAuthenticated.mockReturnValue(true);
    applications.loadApplications.mockResolvedValue(undefined);
    applications.applications.mockReturnValue([]);
    applications.applyToJob.mockResolvedValue(application);

    const response = await TestBed.runInInjectionContext(() =>
      APPLY_JOB_WEBMCP_TOOL.execute(
        { jobId: 'job-001', note: 'Strong match.' },
        { signal: new AbortController().signal },
      ),
    );

    expect(JSON.parse(response.content[0].text)).toEqual({
      success: true,
      changed: true,
      application,
    });
  });
});
