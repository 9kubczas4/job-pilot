import { describe, expect, it } from 'vitest';
import publicJourneys from '../../webmcp-evals/public-journeys.evals.json';
import toolSelectionEvals from '../../webmcp-evals/tool-selection.evals.json';
import evalTools from '../../webmcp-evals/tools.json';
import { APPLY_JOB_WEBMCP_TOOL } from './features/jobs/webmcp/tools/apply-job/apply-job.tool';
import { GET_JOBS_WEBMCP_TOOL } from './features/jobs/webmcp/tools/get-jobs/get-jobs.tool';
import { SAVED_JOBS_WEBMCP_TOOLS } from './features/jobs/webmcp/tools/saved-jobs/saved-jobs.tool';
import { SEARCH_JOBS_WEBMCP_TOOL } from './features/jobs/webmcp/tools/search-jobs/search-jobs.tool';
import { HIGHLIGHT_JOB_WEBMCP_TOOL } from './features/jobs/webmcp/tools/highlight-job/highlight-job.tool';
import { COMPARE_OFFERS_WEBMCP_TOOL } from './features/jobs/webmcp/tools/compare-offers/compare-offers.tool';
import {
  GET_PROFILE_WEBMCP_TOOL,
  UPDATE_PROFILE_WEBMCP_TOOL,
} from './features/profile/webmcp/profile.tools';

const runtimeTools = [
  SEARCH_JOBS_WEBMCP_TOOL,
  HIGHLIGHT_JOB_WEBMCP_TOOL,
  COMPARE_OFFERS_WEBMCP_TOOL,
  GET_JOBS_WEBMCP_TOOL,
  ...SAVED_JOBS_WEBMCP_TOOLS,
  APPLY_JOB_WEBMCP_TOOL,
  GET_PROFILE_WEBMCP_TOOL,
  UPDATE_PROFILE_WEBMCP_TOOL,
];

describe('WebMCP eval fixtures', () => {
  it('keeps the static tool catalog synchronized with runtime descriptors', () => {
    expect(evalTools.tools).toEqual(
      runtimeTools.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),
    );
  });

  it('covers every tool in the tool-selection eval suite', () => {
    const coveredToolNames = new Set(
      toolSelectionEvals.flatMap((evaluation) =>
        evaluation.expectedCall.flatMap(expectedFunctionNames),
      ),
    );

    expect(coveredToolNames).toEqual(new Set(runtimeTools.map(({ name }) => name)));
  });

  it('limits live public journeys to non-mutating tools', () => {
    const calledToolNames = new Set(
      publicJourneys.flatMap((evaluation) =>
        evaluation.expectedCall.flatMap(expectedFunctionNames),
      ),
    );

    expect(calledToolNames).toEqual(
      new Set(['search_jobs', 'highlight_job', 'get_jobs']),
    );
  });
});

function expectedFunctionNames(call: unknown): string[] {
  if (!call || typeof call !== 'object') {
    return [];
  }

  if ('functionName' in call && typeof call.functionName === 'string') {
    return [call.functionName];
  }

  if ('ordered' in call && Array.isArray(call.ordered)) {
    return call.ordered.flatMap(expectedFunctionNames);
  }

  if ('unordered' in call && Array.isArray(call.unordered)) {
    return call.unordered.flatMap(expectedFunctionNames);
  }

  return [];
}
