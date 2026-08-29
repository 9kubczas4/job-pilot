import { inject, Injectable, signal } from '@angular/core';
import { JobOffer } from '../domain/job.model';
import { JobRepository } from '../data-access/job.repository';

@Injectable({ providedIn: 'root' })
export class JobDetailsStore {
  private readonly jobRepository = inject(JobRepository);

  readonly job = signal<JobOffer | null>(null);
  readonly loading = signal(false);

  async loadJob(jobId: string): Promise<void> {
    this.loading.set(true);
    try {
      this.job.set(await this.jobRepository.getJobById(jobId));
    } finally {
      this.loading.set(false);
    }
  }
}
