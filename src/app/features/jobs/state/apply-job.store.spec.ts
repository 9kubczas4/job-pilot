import { TestBed } from '@angular/core/testing';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';
import { JobDetailsStore } from '@features/jobs/state/job-details.store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplyJobStore } from './apply-job.store';

const JOB: JobOffer = {
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

describe('ApplyJobStore', () => {
  let store: ApplyJobStore;

  const jobDetailsStore = {
    getJobById: vi.fn<(jobId: string) => Promise<JobOffer | null>>(),
  };
  const applicationsStore = {
    applyToJob: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    jobDetailsStore.getJobById.mockResolvedValue(JOB);

    TestBed.configureTestingModule({
      providers: [
        { provide: JobDetailsStore, useValue: jobDetailsStore },
        { provide: JobApplicationsStore, useValue: applicationsStore },
      ],
    });

    store = TestBed.inject(ApplyJobStore);
  });

  it('opens the dialog with a pre-filled note', async () => {
    const result = await store.show({ jobId: 'job-001', note: ' Strong match. ' });

    expect(result).toEqual({
      displayed: true,
      jobId: 'job-001',
      jobTitle: 'Frontend Developer',
      companyName: 'Acme',
      prefilledNote: 'Strong match.',
    });
    expect(store.isOpen()).toBe(true);
    expect(store.presentation()?.note).toBe('Strong match.');
  });

  it('submits through the applications store and closes the dialog', async () => {
    applicationsStore.applyToJob.mockResolvedValue({
      jobId: 'job-001',
      appliedAt: '2026-08-30T12:00:00.000Z',
      note: 'Ready to start.',
    });

    await store.show({ jobId: 'job-001' });
    await store.submit('Ready to start.');

    expect(applicationsStore.applyToJob).toHaveBeenCalledWith('job-001', 'Ready to start.');
    expect(store.isOpen()).toBe(false);
  });

  it('rejects submit without a message', async () => {
    await store.show({ jobId: 'job-001' });

    await expect(store.submit('   ')).rejects.toThrow('Application message is required.');
    expect(applicationsStore.applyToJob).not.toHaveBeenCalled();
    expect(store.isOpen()).toBe(true);
  });

  it('clears state on dismiss', async () => {
    await store.show({ jobId: 'job-001' });

    store.dismiss();

    expect(store.isOpen()).toBe(false);
    expect(store.presentation()).toBeNull();
  });
});
