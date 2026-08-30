import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedJobsStore } from '../../../state/saved-jobs.store';
import { SAVED_JOBS_WEBMCP_TOOLS } from './saved-jobs.tool';

describe('saved jobs WebMCP tools', () => {
  const savedJobs = {
    loadSavedJobs: vi.fn<() => Promise<void>>(),
    isSaved: vi.fn<(jobId: string) => boolean>(),
    saveJob: vi.fn<(jobId: string) => Promise<void>>(),
    unsaveJob: vi.fn<(jobId: string) => Promise<void>>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    savedJobs.loadSavedJobs.mockResolvedValue(undefined);
    savedJobs.saveJob.mockResolvedValue(undefined);
    savedJobs.unsaveJob.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [{ provide: SavedJobsStore, useValue: savedJobs }],
    });
  });

  it('exposes separate save_job and unsave_job contracts', () => {
    expect(SAVED_JOBS_WEBMCP_TOOLS.map((tool) => tool.name)).toEqual(['save_job', 'unsave_job']);

    for (const tool of SAVED_JOBS_WEBMCP_TOOLS) {
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

  it('does not save an already saved job again', async () => {
    savedJobs.isSaved.mockReturnValue(true);

    const result = await executeTool('save_job', 'job-001');

    expect(savedJobs.saveJob).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      changed: false,
      jobId: 'job-001',
      saved: true,
    });
  });

  it('saves a job that is not saved', async () => {
    savedJobs.isSaved.mockReturnValue(false);

    const result = await executeTool('save_job', 'job-001');

    expect(savedJobs.saveJob).toHaveBeenCalledWith('job-001');
    expect(result).toEqual({
      success: true,
      changed: true,
      jobId: 'job-001',
      saved: true,
    });
  });

  it('unsaves a saved job', async () => {
    savedJobs.isSaved.mockReturnValue(true);

    const result = await executeTool('unsave_job', 'job-001');

    expect(savedJobs.unsaveJob).toHaveBeenCalledWith('job-001');
    expect(result).toEqual({
      success: true,
      changed: true,
      jobId: 'job-001',
      saved: false,
    });
  });

  it('does not unsave a job that is not saved', async () => {
    savedJobs.isSaved.mockReturnValue(false);

    const result = await executeTool('unsave_job', 'job-001');

    expect(savedJobs.unsaveJob).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      changed: false,
      jobId: 'job-001',
      saved: false,
    });
  });
});

async function executeTool(name: 'save_job' | 'unsave_job', jobId: string) {
  const tool = SAVED_JOBS_WEBMCP_TOOLS.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`Missing ${name} tool.`);
  }

  const response = await TestBed.runInInjectionContext(() =>
    tool.execute({ jobId }, { signal: new AbortController().signal }),
  );
  const toolResponse = response as { content: { type: 'text'; text: string }[] };
  return JSON.parse(toolResponse.content[0].text) as unknown;
}
