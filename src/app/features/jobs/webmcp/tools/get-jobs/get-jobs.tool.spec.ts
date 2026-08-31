import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobDetailsStore } from '@features/jobs/state/job-details.store';
import { GET_JOBS_WEBMCP_TOOL } from './get-jobs.tool';

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

describe('get_jobs WebMCP tool', () => {
  const getJobsByIds = vi.fn<
    (jobIds: readonly string[]) => Promise<(JobOffer | null)[]>
  >();

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: JobDetailsStore, useValue: { getJobsByIds } }],
    });
  });

  it('returns found and missing jobs in input order', async () => {
    getJobsByIds.mockResolvedValue([JOB, null]);

    const result = await executeTool({ jobIds: ['job-001', 'job-999'] });

    expect(result).toEqual({
      success: true,
      changed: false,
      results: [
        { jobId: 'job-001', status: 'found', job: JOB },
        { jobId: 'job-999', status: 'not_found' },
      ],
    });
  });

  it('accepts a batch of twenty unique IDs', async () => {
    const jobIds = Array.from({ length: 20 }, (_, index) => `job-${index + 1}`);
    getJobsByIds.mockResolvedValue(jobIds.map(() => null));

    await executeTool({ jobIds });

    expect(getJobsByIds).toHaveBeenCalledWith(jobIds);
  });

  it.each([
    { jobIds: [] },
    { jobIds: ['job-001', 'job-001'] },
    { jobIds: Array.from({ length: 21 }, (_, index) => String(index + 1)) },
  ])('rejects an invalid batch: $jobIds', async (input) => {
    const result = await executeTool(input);

    expect(result).toMatchObject({
      success: false,
      error: { code: 'INVALID_ARGUMENTS' },
    });
    expect(getJobsByIds).not.toHaveBeenCalled();
  });
});

async function executeTool(input: unknown) {
  const response = await TestBed.runInInjectionContext(() =>
    GET_JOBS_WEBMCP_TOOL.execute(input, { signal: new AbortController().signal }),
  );
  return JSON.parse(response.content[0].text) as unknown;
}
