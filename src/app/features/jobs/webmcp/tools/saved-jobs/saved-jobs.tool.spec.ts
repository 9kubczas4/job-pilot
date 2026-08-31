import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedJobsStore } from '../../../state/saved-jobs.store';
import { SAVED_JOBS_WEBMCP_TOOLS } from './saved-jobs.tool';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { JobOffer } from '@features/jobs/domain/job.model';

const SAVED_JOB: JobOffer = {
  id: 'job-001',
  title: 'Frontend Developer',
  company: { id: 'acme', name: 'Acme' },
  description: 'Angular role in Warsaw.',
  seniority: ['senior'],
  competencies: [{ name: 'Angular', level: 5 }],
  salary: { min: 5_200, max: 8_200, currency: 'USD', period: 'month' },
  workSchedules: ['full-time'],
  contractTypes: ['b2b'],
  workplace: 'hybrid',
  location: {
    city: 'Warsaw',
    country: 'Poland',
    latitude: 52.2297,
    longitude: 21.0122,
  },
  responsibilities: [],
  requirements: [],
  createdAt: '2026-08-28T00:00:00.000Z',
};

describe('saved jobs WebMCP tools', () => {
  const savedJobs = {
    loadSavedJobs: vi.fn<() => Promise<void>>(),
    isSaved: vi.fn<(jobId: string) => boolean>(),
    saveJob: vi.fn<(jobId: string) => Promise<void>>(),
    unsaveJob: vi.fn<(jobId: string) => Promise<void>>(),
    savedJobIds: vi.fn<() => string[]>(),
  };
  const auth = { isAuthenticated: vi.fn<() => boolean>() };
  const jobSearch = {
    loadJobs: vi.fn<() => Promise<void>>(),
    allJobs: vi.fn<() => JobOffer[]>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    savedJobs.loadSavedJobs.mockResolvedValue(undefined);
    savedJobs.saveJob.mockResolvedValue(undefined);
    savedJobs.unsaveJob.mockResolvedValue(undefined);
    savedJobs.savedJobIds.mockReturnValue([]);
    auth.isAuthenticated.mockReturnValue(true);
    jobSearch.loadJobs.mockResolvedValue(undefined);
    jobSearch.allJobs.mockReturnValue([SAVED_JOB]);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: SavedJobsStore, useValue: savedJobs },
        { provide: JobSearchStore, useValue: jobSearch },
      ],
    });
  });

  it('exposes separate read, save, and unsave contracts', () => {
    expect(SAVED_JOBS_WEBMCP_TOOLS.map((tool) => tool.name)).toEqual([
      'get_saved_jobs',
      'save_job',
      'unsave_job',
    ]);

    expect(SAVED_JOBS_WEBMCP_TOOLS[0].inputSchema).toMatchObject({
      type: 'object',
      additionalProperties: false,
      properties: {},
    });

    for (const tool of SAVED_JOBS_WEBMCP_TOOLS.slice(1)) {
      expect(tool.inputSchema).toMatchObject({
        type: 'object',
        required: ['jobId'],
        additionalProperties: false,
        properties: {
          jobId: {
            type: 'string',
            description: expect.stringContaining('job identifier'),
          },
        },
      });
    }
  });

  it('returns saved IDs and lightweight details without changing state', async () => {
    savedJobs.savedJobIds.mockReturnValue(['job-001', 'job-unavailable']);

    const result = await executeTool('get_saved_jobs', {});

    expect(result).toEqual({
      success: true,
      changed: false,
      savedCount: 2,
      savedJobIds: ['job-001', 'job-unavailable'],
      unavailableJobIds: ['job-unavailable'],
      jobs: [
        {
          id: 'job-001',
          title: 'Frontend Developer',
          company: 'Acme',
          location: 'Warsaw',
          workplace: 'hybrid',
          salary: { min: 5_200, max: 8_200, currency: 'USD', period: 'month' },
          seniority: ['senior'],
          skills: ['Angular'],
        },
      ],
    });
    expect(savedJobs.loadSavedJobs).toHaveBeenCalledOnce();
    expect(jobSearch.loadJobs).toHaveBeenCalledOnce();
    expect(savedJobs.saveJob).not.toHaveBeenCalled();
    expect(savedJobs.unsaveJob).not.toHaveBeenCalled();
  });

  it('returns UNAUTHENTICATED for get_saved_jobs without loading user data', async () => {
    auth.isAuthenticated.mockReturnValue(false);

    const result = await executeTool('get_saved_jobs', {});

    expect(result).toEqual({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Sign in before reading saved jobs.',
      },
    });
    expect(savedJobs.loadSavedJobs).not.toHaveBeenCalled();
    expect(jobSearch.loadJobs).not.toHaveBeenCalled();
  });

  it('does not save an already saved job again', async () => {
    savedJobs.isSaved.mockReturnValue(true);
    savedJobs.savedJobIds.mockReturnValue(['job-001']);

    const result = await executeTool('save_job', { jobId: 'job-001' });

    expect(savedJobs.saveJob).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      changed: false,
      jobId: 'job-001',
      saved: true,
      savedJobIds: ['job-001'],
      savedCount: 1,
    });
  });

  it('saves a job that is not saved', async () => {
    savedJobs.isSaved.mockReturnValue(false);
    savedJobs.savedJobIds.mockReturnValue(['job-001']);

    const result = await executeTool('save_job', { jobId: 'job-001' });

    expect(savedJobs.saveJob).toHaveBeenCalledWith('job-001');
    expect(result).toEqual({
      success: true,
      changed: true,
      jobId: 'job-001',
      saved: true,
      savedJobIds: ['job-001'],
      savedCount: 1,
    });
  });

  it('unsaves a saved job', async () => {
    savedJobs.isSaved.mockReturnValue(true);

    const result = await executeTool('unsave_job', { jobId: 'job-001' });

    expect(savedJobs.unsaveJob).toHaveBeenCalledWith('job-001');
    expect(result).toEqual({
      success: true,
      changed: true,
      jobId: 'job-001',
      saved: false,
      savedJobIds: [],
      savedCount: 0,
    });
  });

  it('does not unsave a job that is not saved', async () => {
    savedJobs.isSaved.mockReturnValue(false);

    const result = await executeTool('unsave_job', { jobId: 'job-001' });

    expect(savedJobs.unsaveJob).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      changed: false,
      jobId: 'job-001',
      saved: false,
      savedJobIds: [],
      savedCount: 0,
    });
  });

  it('returns a structured authentication error without loading saved jobs', async () => {
    auth.isAuthenticated.mockReturnValue(false);

    const result = await executeTool('save_job', { jobId: 'job-001' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Sign in before saving a job.',
      },
    });
    expect(savedJobs.loadSavedJobs).not.toHaveBeenCalled();
  });
});

async function executeTool(name: 'get_saved_jobs' | 'save_job' | 'unsave_job', input: unknown) {
  const tool = SAVED_JOBS_WEBMCP_TOOLS.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`Missing ${name} tool.`);
  }

  const response = await TestBed.runInInjectionContext(() =>
    tool.execute(input, { signal: new AbortController().signal }),
  );
  const toolResponse = response as { content: { type: 'text'; text: string }[] };
  return JSON.parse(toolResponse.content[0].text) as unknown;
}
