import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { GET_PROFILE_WEBMCP_TOOL, UPDATE_PROFILE_WEBMCP_TOOL } from './profile.tools';

describe('get_profile WebMCP contract', () => {
  it('directs the agent to use the tool instead of the UI or DOM', () => {
    expect(GET_PROFILE_WEBMCP_TOOL.description).toContain(
      'Use this tool instead of interacting with the page UI or DOM.',
    );
  });

  it('rejects unexpected arguments with the shared error envelope', async () => {
    const response = await TestBed.runInInjectionContext(() =>
      GET_PROFILE_WEBMCP_TOOL.execute(
        { unexpected: true },
        { signal: new AbortController().signal },
      ),
    );

    expect(JSON.parse(response.content[0].text)).toMatchObject({
      success: false,
      error: { code: 'INVALID_ARGUMENTS' },
    });
  });
});

describe('update_profile WebMCP contract', () => {
  it('directs the agent to use the tool instead of the UI or DOM', () => {
    expect(UPDATE_PROFILE_WEBMCP_TOOL.description).toContain(
      'Use this tool instead of interacting with the page UI or DOM.',
    );
  });

  it('describes every top-level parameter and rejects empty patches', async () => {
    for (const [name, schema] of Object.entries(
      UPDATE_PROFILE_WEBMCP_TOOL.inputSchema.properties ?? {},
    )) {
      expect(schema.description, name).toBeTruthy();
    }

    const response = await TestBed.runInInjectionContext(() =>
      UPDATE_PROFILE_WEBMCP_TOOL.execute({}, { signal: new AbortController().signal }),
    );

    expect(JSON.parse(response.content[0].text)).toMatchObject({
      success: false,
      error: { code: 'INVALID_ARGUMENTS' },
    });
  });
});
