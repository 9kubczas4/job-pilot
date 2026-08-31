import { Injectable, computed, inject, signal } from '@angular/core';
import {
  DEFAULT_JOB_COMPARE_TITLE,
  JobComparePresentation,
  JobCompareShowInput,
  JobCompareShowResult,
} from '@features/jobs/domain/job-compare.model';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobDetailsStore } from '@features/jobs/state/job-details.store';

@Injectable({ providedIn: 'root' })
export class JobCompareStore {
  private readonly presentationState = signal<JobComparePresentation | null>(null);
  private readonly openState = signal(false);
  private readonly loadingState = signal(false);
  private nextRequestId = 0;

  readonly presentation = this.presentationState.asReadonly();
  readonly open = this.openState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly isOpen = computed(() => this.openState() && this.presentationState() !== null);

  private readonly jobDetailsStore = inject(JobDetailsStore);

  async show(input: JobCompareShowInput): Promise<JobCompareShowResult | null> {
    this.loadingState.set(true);

    try {
      const resolved = await Promise.all(
        input.offers.map(async (offer) => ({
          offer,
          job: await this.jobDetailsStore.getJobById(offer.jobId),
        })),
      );

      const missingJobIds = resolved
        .filter((entry) => entry.job === null)
        .map((entry) => entry.offer.jobId);
      const available = resolved.filter(
        (entry): entry is { offer: (typeof resolved)[number]['offer']; job: JobOffer } =>
          entry.job !== null,
      );

      if (available.length < 2) {
        return null;
      }

      this.nextRequestId += 1;
      const presentation: JobComparePresentation = {
        requestId: this.nextRequestId,
        title: input.title?.trim() || DEFAULT_JOB_COMPARE_TITLE,
        summary: input.summary.trim(),
        offers: available.map(({ offer, job }) => ({
          jobId: offer.jobId,
          badge: offer.badge,
          note: offer.note,
          highlighted: offer.highlighted,
          job,
        })),
      };

      this.presentationState.set(presentation);
      this.openState.set(true);

      return {
        displayed: true,
        offerCount: presentation.offers.length,
        missingJobIds,
        offers: presentation.offers.map(({ jobId, badge, note, highlighted, job }) => ({
          jobId,
          badge,
          note,
          ...(highlighted ? { highlighted: true } : {}),
          title: job.title,
          company: job.company.name,
          ...(job.location ? { location: job.location.city } : {}),
        })),
      };
    } finally {
      this.loadingState.set(false);
    }
  }

  dismiss(): void {
    this.openState.set(false);
    this.presentationState.set(null);
    this.loadingState.set(false);
  }
}
