import { Injectable, signal } from '@angular/core';
import { JobHighlightRequest } from '@features/jobs/domain/job-highlight.model';

@Injectable({ providedIn: 'root' })
export class JobHighlightStore {
  private readonly requestState = signal<JobHighlightRequest | null>(null);
  private nextRequestId = 0;

  readonly request = this.requestState.asReadonly();

  highlight(jobId: string): void {
    this.nextRequestId += 1;
    this.requestState.set({
      jobId,
      requestId: this.nextRequestId,
    });
  }

  clear(): void {
    this.requestState.set(null);
  }
}
