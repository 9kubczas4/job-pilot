import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ToastService } from '@shared/ui/toast/toast.service';
import { defineZodWebMcpTool } from './zod-webmcp-tool';

describe('defineZodWebMcpTool', () => {
  const tool = defineZodWebMcpTool({
    name: 'example_tool',
    description: 'Example tool.',
    inputSchema: z.strictObject({
      jobId: z.string().trim().min(1).meta({ description: 'A non-empty job identifier.' }),
    }),
    execute: vi.fn(({ jobId }) => ({ success: true as const, jobId })),
  });

  it('derives the agent-facing JSON Schema from Zod metadata', () => {
    expect(tool.inputSchema).toMatchObject({
      type: 'object',
      required: ['jobId'],
      additionalProperties: false,
      properties: {
        jobId: {
          type: 'string',
          minLength: 1,
          description: 'A non-empty job identifier.',
        },
      },
    });
  });

  it('returns a structured validation error and does not execute invalid input', async () => {
    const result = await executeTool(tool, { jobId: '   ', unexpected: true });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'INVALID_ARGUMENTS',
        message: 'Tool arguments did not match the input schema.',
        issues: [
          { path: 'jobId', message: 'Too small: expected string to have >=1 characters' },
          { path: '', message: 'Unrecognized key: "unexpected"' },
        ],
      },
    });
    expect(tool.run).not.toHaveBeenCalled();
  });

  it('passes parsed and normalized input to the implementation', async () => {
    const result = await executeTool(tool, { jobId: ' job-001 ' });

    expect(result).toEqual({ success: true, jobId: 'job-001' });
    expect(tool.run).toHaveBeenCalledWith(
      { jobId: 'job-001' },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('announces tool activation through the global toast service', async () => {
    const toast = TestBed.inject(ToastService);
    const showAiToolActivated = vi.spyOn(toast, 'showAiToolActivated');

    await executeTool(tool, { jobId: 'job-001' });

    expect(showAiToolActivated).toHaveBeenCalledWith('example_tool');
  });

  it('converts unexpected execution failures to the shared error envelope', async () => {
    const failingTool = defineZodWebMcpTool({
      name: 'failing_tool',
      description: 'Fails.',
      inputSchema: z.strictObject({}),
      execute: () => {
        throw new Error('Persistence is unavailable.');
      },
    });

    const result = await executeTool(failingTool, {});

    expect(result).toEqual({
      success: false,
      error: {
        code: 'EXECUTION_FAILED',
        message: 'Persistence is unavailable.',
      },
    });
  });
});

async function executeTool(tool: ReturnType<typeof defineZodWebMcpTool>, input: unknown) {
  const response = await TestBed.runInInjectionContext(() =>
    tool.execute(input, { signal: new AbortController().signal }),
  );
  return JSON.parse(response.content[0].text) as unknown;
}
