import { inject } from '@angular/core';
import { toolFailure, toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { JobHighlightStore } from '@features/jobs/state/job-highlight.store';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { HIGHLIGHT_JOB_INPUT_SCHEMA } from './highlight-job.schema';

export const HIGHLIGHT_JOB_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'highlight_job',
  description:
    'Visually point to one job from the current results on /jobs. Use this tool instead of interacting with the page UI or DOM. Use it when identifying a recommended or otherwise notable offer. It selects the marker, focuses the map, opens the job popover, and reveals the map on mobile without changing search filters, the URL, saved jobs, or applications. Requires an exact jobId present in the current search results and returns JOB_NOT_IN_RESULTS otherwise.',
  inputSchema: HIGHLIGHT_JOB_INPUT_SCHEMA,
  execute: async ({ jobId }) => {
    const searchStore = inject(JobSearchStore);
    const highlightStore = inject(JobHighlightStore);

    await searchStore.loadJobs();
    const job = searchStore.jobs().find((candidate) => candidate.id === jobId);
    if (!job) {
      return toolFailure(
        'JOB_NOT_IN_RESULTS',
        `Job "${jobId}" is not available in the current search results.`,
      );
    }

    searchStore.selectJob(job.id);
    highlightStore.highlight(job.id);

    return toolSuccess({
      changed: true,
      jobId: job.id,
      highlighted: true,
      job: {
        id: job.id,
        title: job.title,
        company: job.company.name,
        ...(job.location ? { location: job.location.city } : {}),
      },
    });
  },
});

export function provideHighlightJobWebMcpTool() {
  return provideZodWebMcpTools([HIGHLIGHT_JOB_WEBMCP_TOOL]);
}
