import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JobRepository } from '@features/jobs/data-access/job.repository';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobHighlightStore } from '@features/jobs/state/job-highlight.store';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { HIGHLIGHT_JOB_WEBMCP_TOOL } from './highlight-job.tool';

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

describe('highlight_job WebMCP tool', () => {
  let searchStore: JobSearchStore;
  let highlightStore: JobHighlightStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: JobRepository,
          useValue: { getAllJobs: () => Promise.resolve([FRONTEND_JOB, BACKEND_JOB]) },
        },
      ],
    });

    searchStore = TestBed.inject(JobSearchStore);
    highlightStore = TestBed.inject(JobHighlightStore);
    searchStore.setCriteriaFromRoute({ query: 'Frontend' });
  });

  it('publishes a strict jobId contract', () => {
    expect(HIGHLIGHT_JOB_WEBMCP_TOOL.inputSchema).toMatchObject({
      type: 'object',
      required: ['jobId'],
      additionalProperties: false,
      properties: {
        jobId: {
          type: 'string',
          minLength: 1,
          maxLength: 128,
          description: expect.stringContaining('current search results'),
        },
      },
    });
  });

  it('selects and highlights a job from the current search results', async () => {
    const result = await executeTool('job-001');

    expect(result).toEqual({
      success: true,
      changed: true,
      jobId: 'job-001',
      highlighted: true,
      job: {
        id: 'job-001',
        title: 'Frontend Developer',
        company: 'Acme',
        location: 'New York',
      },
    });
    expect(searchStore.selectedJobId()).toBe('job-001');
    expect(highlightStore.request()).toEqual({ jobId: 'job-001', requestId: 1 });
  });

  it('rejects a job outside the current results without changing UI state', async () => {
    const criteriaBefore = searchStore.criteria();

    const result = await executeTool('job-002');

    expect(result).toEqual({
      success: false,
      error: {
        code: 'JOB_NOT_IN_RESULTS',
        message: 'Job "job-002" is not available in the current search results.',
      },
    });
    expect(searchStore.criteria()).toBe(criteriaBefore);
    expect(searchStore.selectedJobId()).toBeNull();
    expect(highlightStore.request()).toBeNull();
  });
});

async function executeTool(jobId: string) {
  const response = await TestBed.runInInjectionContext(() =>
    HIGHLIGHT_JOB_WEBMCP_TOOL.execute(
      { jobId },
      { signal: new AbortController().signal },
    ),
  );
  return JSON.parse(response.content[0].text) as unknown;
}
