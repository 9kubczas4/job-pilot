import { Injectable, computed, inject, signal } from '@angular/core';
import { JobApplication } from '@features/jobs/domain/job-application.model';
import {
  ApplyJobPresentation,
  ApplyJobShowInput,
  ApplyJobShowResult,
} from '@features/jobs/domain/apply-job.model';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';
import { JobDetailsStore } from '@features/jobs/state/job-details.store';

@Injectable({ providedIn: 'root' })
export class ApplyJobStore {
  private readonly jobDetailsStore = inject(JobDetailsStore);
  private readonly applicationsStore = inject(JobApplicationsStore);

  private readonly presentationState = signal<ApplyJobPresentation | null>(null);
  private readonly openState = signal(false);
  private readonly loadingState = signal(false);
  private readonly submittingState = signal(false);
  private nextRequestId = 0;

  readonly presentation = this.presentationState.asReadonly();
  readonly open = this.openState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly submitting = this.submittingState.asReadonly();
  readonly isOpen = computed(() => this.openState() && this.presentationState() !== null);

  async show(input: ApplyJobShowInput): Promise<ApplyJobShowResult | null> {
    this.loadingState.set(true);

    try {
      const job = await this.jobDetailsStore.getJobById(input.jobId);
      if (!job) {
        return null;
      }

      this.nextRequestId += 1;
      const presentation: ApplyJobPresentation = {
        requestId: this.nextRequestId,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company.name,
        note: input.note?.trim() ?? '',
      };

      this.presentationState.set(presentation);
      this.openState.set(true);

      return {
        displayed: true,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company.name,
        prefilledNote: presentation.note,
      };
    } finally {
      this.loadingState.set(false);
    }
  }

  async submit(note: string): Promise<JobApplication> {
    const presentation = this.presentationState();
    if (!presentation || this.submittingState()) {
      throw new Error('No apply dialog is open.');
    }

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      throw new Error('Application message is required.');
    }

    this.submittingState.set(true);

    try {
      const application = await this.applicationsStore.applyToJob(presentation.jobId, trimmedNote);
      this.dismiss();
      return application;
    } finally {
      this.submittingState.set(false);
    }
  }

  dismiss(): void {
    this.openState.set(false);
    this.presentationState.set(null);
    this.loadingState.set(false);
    this.submittingState.set(false);
  }
}
