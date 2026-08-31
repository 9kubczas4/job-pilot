import { inject } from '@angular/core';
import { toolFailure, toolSuccess } from '@core/infrastructure/webmcp/tool-response';
import {
  defineZodWebMcpTool,
  provideZodWebMcpTools,
} from '@core/infrastructure/webmcp/zod-webmcp-tool';
import { DEFAULT_JOB_COMPARE_TITLE } from '@features/jobs/domain/job-compare.model';
import { JobCompareStore } from '@features/jobs/state/job-compare.store';
import { COMPARE_OFFERS_INPUT_SCHEMA } from './compare-offers.schema';

export const COMPARE_OFFERS_WEBMCP_TOOL = defineZodWebMcpTool({
  name: 'compare_offers',
  description:
    'Open a transient comparison drawer with the agent analysis for two to five job offers. Use this tool instead of interacting with the page UI or DOM. Use it when the user should see a side-by-side recommendation with optional per-offer badges (for example, najlepsza, interesujaca, rozwojowa), short notes, and an optional highlighted primary pick with a gradient border and star. Accepts any known jobId from search_jobs, get_jobs, or get_saved_jobs. Does not change search filters, saved jobs, or applications. Returns NOT_FOUND when fewer than two requested jobs resolve.',
  inputSchema: COMPARE_OFFERS_INPUT_SCHEMA,
  execute: async (input) => {
    const result = await inject(JobCompareStore).show({
      title: input.title,
      summary: input.summary,
      offers: input.offers,
    });

    if (!result) {
      const jobIds = input.offers.map((offer) => offer.jobId).join(', ');
      return toolFailure(
        'NOT_FOUND',
        `Could not resolve at least two job offers from: ${jobIds}.`,
      );
    }

    return toolSuccess({
      changed: true,
      displayed: result.displayed,
      title: input.title?.trim() || DEFAULT_JOB_COMPARE_TITLE,
      summary: input.summary.trim(),
      offerCount: result.offerCount,
      offers: result.offers,
      ...(result.missingJobIds.length ? { missingJobIds: result.missingJobIds } : {}),
    });
  },
});

export function provideCompareOffersWebMcpTool() {
  return provideZodWebMcpTools([COMPARE_OFFERS_WEBMCP_TOOL]);
}
