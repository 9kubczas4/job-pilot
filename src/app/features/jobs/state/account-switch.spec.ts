import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { JobApplicationsRepository } from '@features/jobs/data-access/job-applications.repository';
import { SavedJobsRepository } from '@features/jobs/data-access/saved-jobs.repository';
import { JobApplication } from '@features/jobs/domain/job-application.model';
import { JobApplicationsStore } from './job-applications.store';
import { SavedJobsStore } from './saved-jobs.store';
import { describe, expect, it, vi } from 'vitest';

describe('account switching', () => {
  it('does not show saved jobs returned for the previous user', async () => {
    const userId = signal<string | null>('alex');
    let resolveAlex!: (ids: string[]) => void;
    const repository = {
      loadSavedJobIds: vi.fn((id: string) => id === 'alex'
        ? new Promise<string[]>((resolve) => { resolveAlex = resolve; })
        : Promise.resolve(['sam-job'])),
    };
    TestBed.configureTestingModule({
      providers: [
        SavedJobsStore,
        { provide: AuthService, useValue: { userId } },
        { provide: SavedJobsRepository, useValue: repository },
      ],
    });
    const store = TestBed.inject(SavedJobsStore);

    const oldLoad = store.loadSavedJobs();
    userId.set('sam');
    await store.loadSavedJobs();
    resolveAlex(['alex-job']);
    await oldLoad;

    expect(store.savedJobIds()).toEqual(['sam-job']);
  });

  it('does not show applications returned for the previous user', async () => {
    const userId = signal<string | null>('alex');
    let resolveAlex!: (applications: JobApplication[]) => void;
    const repository = {
      loadApplications: vi.fn((id: string) => id === 'alex'
        ? new Promise<JobApplication[]>((resolve) => { resolveAlex = resolve; })
        : Promise.resolve([{ jobId: 'sam-job', appliedAt: '2026-11-11T00:00:00Z' }])),
    };
    TestBed.configureTestingModule({
      providers: [
        JobApplicationsStore,
        { provide: AuthService, useValue: { userId } },
        { provide: JobApplicationsRepository, useValue: repository },
      ],
    });
    const store = TestBed.inject(JobApplicationsStore);

    const oldLoad = store.loadApplications();
    userId.set('sam');
    await store.loadApplications();
    resolveAlex([{ jobId: 'alex-job', appliedAt: '2026-11-10T00:00:00Z' }]);
    await oldLoad;

    expect(store.applications()).toEqual([{ jobId: 'sam-job', appliedAt: '2026-11-11T00:00:00Z' }]);
    expect(store.appliedJobIds()).toEqual(['sam-job']);
  });
});
