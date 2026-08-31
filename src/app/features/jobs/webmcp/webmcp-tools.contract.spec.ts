import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { APPLY_JOB_WEBMCP_TOOL } from './tools/apply-job/apply-job.tool';
import { FILTER_JOBS_WEBMCP_TOOL } from './tools/filter-jobs/filter-jobs.tool';
import { GET_JOB_WEBMCP_TOOL } from './tools/get-job/get-job.tool';
import { SAVED_JOBS_WEBMCP_TOOLS } from './tools/saved-jobs/saved-jobs.tool';
import { SEARCH_JOBS_WEBMCP_TOOL } from './tools/search-jobs/search-jobs.tool';
import { HIGHLIGHT_JOB_WEBMCP_TOOL } from './tools/highlight-job/highlight-job.tool';

const tools = [
  SEARCH_JOBS_WEBMCP_TOOL,
  FILTER_JOBS_WEBMCP_TOOL,
  HIGHLIGHT_JOB_WEBMCP_TOOL,
  GET_JOB_WEBMCP_TOOL,
  APPLY_JOB_WEBMCP_TOOL,
  ...SAVED_JOBS_WEBMCP_TOOLS,
];

describe('jobs WebMCP contracts', () => {
  it('publishes strict, described object schemas', () => {
    for (const tool of tools) {
      expect(tool.description.length, tool.name).toBeGreaterThan(80);
      expect(tool.description, tool.name).toContain(
        'Use this tool instead of interacting with the page UI or DOM.',
      );
      expect(tool.inputSchema).toMatchObject({
        type: 'object',
        additionalProperties: false,
      });

      for (const [name, schema] of Object.entries(tool.inputSchema.properties ?? {})) {
        expect(schema.description, `${tool.name}.${name}`).toBeTruthy();
      }
    }
  });

  it.each([
    [GET_JOB_WEBMCP_TOOL, { jobId: '' }],
    [APPLY_JOB_WEBMCP_TOOL, { jobId: 'job-001', note: 'x'.repeat(2001) }],
    [SEARCH_JOBS_WEBMCP_TOOL, { locations: ['Warsaw', 'Krakow'] }],
    [SEARCH_JOBS_WEBMCP_TOOL, { radiusKm: 50 }],
    [FILTER_JOBS_WEBMCP_TOOL, { salaryMin: -1 }],
    [HIGHLIGHT_JOB_WEBMCP_TOOL, { jobId: '   ' }],
    [SAVED_JOBS_WEBMCP_TOOLS[0], { jobId: '   ' }],
  ])('rejects invalid arguments before executing %s', async (tool, input) => {
    const result = await executeTool(tool, input);

    expect(result).toMatchObject({
      success: false,
      error: { code: 'INVALID_ARGUMENTS' },
    });
  });
});

async function executeTool(tool: (typeof tools)[number], input: unknown) {
  const response = await TestBed.runInInjectionContext(() =>
    tool.execute(input, { signal: new AbortController().signal }),
  );
  return JSON.parse(response.content[0].text) as unknown;
}
