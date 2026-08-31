import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JobRepository } from '@features/jobs/data-access/job.repository';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobCompareStore } from '@features/jobs/state/job-compare.store';
import { COMPARE_OFFERS_WEBMCP_TOOL } from './compare-offers.tool';

const FRONTEND_JOB: JobOffer = {
  id: 'job-001',
  title: 'Frontend Developer',
  company: { id: 'acme', name: 'Acme' },
  description: 'Angular role in New York.',
  seniority: ['senior'],
  competencies: [{ name: 'Angular', level: 5 }],
  workSchedules: ['full-time'],
  contractTypes: ['b2b'],
  workplace: 'hybrid',
  location: {
    city: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
  },
  responsibilities: [],
  requirements: [],
  createdAt: '2026-08-28T00:00:00.000Z',
};

const BACKEND_JOB: JobOffer = {
  ...FRONTEND_JOB,
  id: 'job-002',
  title: 'Backend Developer',
};

const FULLSTACK_JOB: JobOffer = {
  ...FRONTEND_JOB,
  id: 'job-003',
  title: 'Fullstack Developer',
};

describe('compare_offers WebMCP tool', () => {
  let compareStore: JobCompareStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: JobRepository,
          useValue: {
            getJobById: (jobId: string) =>
              Promise.resolve(
                [FRONTEND_JOB, BACKEND_JOB, FULLSTACK_JOB].find((job) => job.id === jobId) ??
                  null,
              ),
          },
        },
      ],
    });

    compareStore = TestBed.inject(JobCompareStore);
  });

  it('publishes a strict comparison contract', () => {
    expect(COMPARE_OFFERS_WEBMCP_TOOL.inputSchema).toMatchObject({
      type: 'object',
      required: ['summary', 'offers'],
      additionalProperties: false,
      properties: {
        title: {
          type: 'string',
          minLength: 1,
          maxLength: 120,
        },
        summary: {
          type: 'string',
          minLength: 1,
          maxLength: 2000,
        },
        offers: {
          type: 'array',
          minItems: 2,
          maxItems: 5,
        },
      },
    });
  });

  it('opens the drawer for resolvable offers with badges and notes', async () => {
    const result = await executeTool({
      title: 'Top picks',
      summary: 'Frontend and backend both fit, but frontend matches your Angular focus best.',
      offers: [
        { jobId: 'job-001', badge: 'najlepsza', note: 'Strong Angular match.', highlighted: true },
        { jobId: 'job-002', badge: 'rozwojowa' },
      ],
    });

    expect(result).toEqual({
      success: true,
      changed: true,
      displayed: true,
      title: 'Top picks',
      summary: 'Frontend and backend both fit, but frontend matches your Angular focus best.',
      offerCount: 2,
      offers: [
        {
          jobId: 'job-001',
          badge: 'najlepsza',
          note: 'Strong Angular match.',
          highlighted: true,
          title: 'Frontend Developer',
          company: 'Acme',
          location: 'New York',
        },
        {
          jobId: 'job-002',
          badge: 'rozwojowa',
          title: 'Backend Developer',
          company: 'Acme',
          location: 'New York',
        },
      ],
    });
    expect(compareStore.isOpen()).toBe(true);
    expect(compareStore.presentation()?.requestId).toBe(1);
  });

  it('reports missing ids without blocking display when enough offers resolve', async () => {
    const result = await executeTool({
      summary: 'Two valid offers remain after filtering unknown ids.',
      offers: [
        { jobId: 'job-001', badge: 'interesujaca' },
        { jobId: 'job-missing' },
        { jobId: 'job-003' },
      ],
    });

    expect(result).toMatchObject({
      success: true,
      changed: true,
      displayed: true,
      offerCount: 2,
      missingJobIds: ['job-missing'],
    });
    expect(compareStore.presentation()?.offers.map((offer) => offer.jobId)).toEqual([
      'job-001',
      'job-003',
    ]);
  });

  it('returns NOT_FOUND when fewer than two offers resolve', async () => {
    const result = await executeTool({
      summary: 'Not enough valid offers.',
      offers: [
        { jobId: 'job-001', badge: 'najlepsza' },
        { jobId: 'job-missing-a' },
        { jobId: 'job-missing-b' },
      ],
    });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message:
          'Could not resolve at least two job offers from: job-001, job-missing-a, job-missing-b.',
      },
    });
    expect(compareStore.isOpen()).toBe(false);
    expect(compareStore.presentation()).toBeNull();
  });
});

async function executeTool(input: unknown) {
  const response = await TestBed.runInInjectionContext(() =>
    COMPARE_OFFERS_WEBMCP_TOOL.execute(input, { signal: new AbortController().signal }),
  );
  return JSON.parse(response.content[0].text) as unknown;
}
