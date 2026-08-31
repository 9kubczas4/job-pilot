import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { JobRepository } from '@features/jobs/data-access/job.repository';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobDetailsStore } from './job-details.store';

const JOB: JobOffer = {
  id: 'job-001',
  title: 'Frontend Developer',
  company: { id: 'acme', name: 'Acme' },
  description: 'Angular role.',
  seniority: ['senior'],
  competencies: [{ name: 'Angular', level: 5 }],
  workSchedules: ['full-time'],
  contractTypes: ['b2b'],
  workplace: 'remote',
  responsibilities: [],
  requirements: [],
  createdAt: '2026-08-28T00:00:00.000Z',
};

describe('JobDetailsStore', () => {
  it('reads multiple jobs in input order through one repository batch', async () => {
    const getJobsByIds = vi.fn(async () => [JOB, null, JOB]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: JobRepository,
          useValue: { getJobsByIds },
        },
      ],
    });

    const result = await TestBed.inject(JobDetailsStore).getJobsByIds([
      'job-001',
      'job-999',
      'job-001',
    ]);

    expect(result).toEqual([JOB, null, JOB]);
    expect(getJobsByIds).toHaveBeenCalledOnce();
  });
});
