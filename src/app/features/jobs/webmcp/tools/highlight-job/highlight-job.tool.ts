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
    'Highlight a job in the current /jobs results. Use this tool instead of interacting with the page UI or DOM. Focuses its map marker and opens its preview without changing filters. Requires a visible jobId.',
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
