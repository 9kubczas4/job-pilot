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
    'Focus one job from the current /jobs search results on the map (selects marker, opens popover, plays highlight). Use when discussing a single visible offer; returns a short job summary without changing filters.',
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
