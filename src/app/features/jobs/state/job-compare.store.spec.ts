import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JobRepository } from '@features/jobs/data-access/job.repository';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobCompareStore } from './job-compare.store';

const JOB_A: JobOffer = {
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

const JOB_B: JobOffer = {
  ...JOB_A,
  id: 'job-002',
  title: 'Backend Developer',
};

describe('JobCompareStore', () => {
  let store: JobCompareStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: JobRepository,
          useValue: {
            getJobById: (jobId: string) =>
              Promise.resolve([JOB_A, JOB_B].find((job) => job.id === jobId) ?? null),
          },
        },
      ],
    });

    store = TestBed.inject(JobCompareStore);
  });

  it('opens a presentation with monotonically increasing request ids', async () => {
    await store.show({
      summary: 'First comparison.',
      offers: [
        { jobId: 'job-001', badge: 'najlepsza' },
        { jobId: 'job-002' },
      ],
    });
    expect(store.presentation()?.requestId).toBe(1);

    store.dismiss();

    await store.show({
      summary: 'Second comparison.',
      offers: [
        { jobId: 'job-001' },
        { jobId: 'job-002', badge: 'alternatywa' },
      ],
    });
    expect(store.presentation()?.requestId).toBe(2);
  });

  it('clears state on dismiss', async () => {
    await store.show({
      summary: 'Temporary view.',
      offers: [
        { jobId: 'job-001' },
        { jobId: 'job-002' },
      ],
    });

    store.dismiss();

    expect(store.isOpen()).toBe(false);
    expect(store.presentation()).toBeNull();
    expect(store.loading()).toBe(false);
  });
});
