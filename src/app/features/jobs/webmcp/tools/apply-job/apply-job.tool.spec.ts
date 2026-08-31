import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';
import { ApplyJobStore } from '@features/jobs/state/apply-job.store';
import { JobDetailsStore } from '@features/jobs/state/job-details.store';
import { JobOffer } from '@features/jobs/domain/job.model';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APPLY_JOB_WEBMCP_TOOL } from './apply-job.tool';

describe('apply_job WebMCP tool', () => {
  const auth = { isAuthenticated: vi.fn<() => boolean>() };
  const applications = {
    loadApplications: vi.fn<() => Promise<void>>(),
    applications: vi.fn<() => { jobId: string; appliedAt: string; note?: string }[]>(() => []),
    applyToJob: vi.fn(),
  };

  const job: JobOffer = {
    id: 'job-001',
    title: 'Frontend Developer',
    company: { id: 'acme', name: 'Acme' },
    description: 'Angular role.',
    seniority: ['senior'],
    competencies: [{ name: 'Angular', level: 5 }],
    workSchedules: ['full-time'],
    contractTypes: ['b2b'],
    workplace: 'hybrid',
    responsibilities: [],
    requirements: [],
    createdAt: '2026-08-28T00:00:00.000Z',
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
    applications.applications.mockReturnValue([]);

    TestBed.configureTestingModule({
      providers: [
        ApplyJobStore,
        { provide: AuthService, useValue: auth },
        { provide: JobApplicationsStore, useValue: applications },
        {
          provide: JobDetailsStore,
          useValue: {
            getJobById: vi.fn<(jobId: string) => Promise<JobOffer | null>>().mockResolvedValue(job),
          },
        },
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

  it('returns the existing application without opening the dialog', async () => {
    auth.isAuthenticated.mockReturnValue(true);
    applications.loadApplications.mockResolvedValue(undefined);
    applications.applications.mockReturnValue([application]);

    const response = await TestBed.runInInjectionContext(() =>
      APPLY_JOB_WEBMCP_TOOL.execute(
        { jobId: 'job-001', note: 'Strong match.' },
        { signal: new AbortController().signal },
      ),
    );

    expect(JSON.parse(response.content[0].text)).toEqual({
      success: true,
      changed: false,
      alreadyApplied: true,
      application,
    });
  });

  it('opens the apply dialog with a pre-filled note instead of submitting', async () => {
    auth.isAuthenticated.mockReturnValue(true);
    applications.loadApplications.mockResolvedValue(undefined);
    applications.applications.mockReturnValue([]);

    const response = await TestBed.runInInjectionContext(() =>
      APPLY_JOB_WEBMCP_TOOL.execute(
        { jobId: 'job-001', note: 'Strong match.' },
        { signal: new AbortController().signal },
      ),
    );

    expect(JSON.parse(response.content[0].text)).toEqual({
      success: true,
      changed: true,
      dialogOpened: true,
      jobId: 'job-001',
      jobTitle: 'Frontend Developer',
      companyName: 'Acme',
      prefilledNote: 'Strong match.',
    });
    expect(applications.applyToJob).not.toHaveBeenCalled();
  });
});
