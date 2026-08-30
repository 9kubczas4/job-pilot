import { computed, inject, Injectable, signal } from '@angular/core';
import { findSimilarJobs } from '@features/jobs/domain/job-similarity.utils';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JobRepository } from '@features/jobs/data-access/job.repository';

@Injectable({ providedIn: 'root' })
export class JobDetailsStore {
  private readonly jobRepository = inject(JobRepository);

  readonly job = signal<JobOffer | null>(null);
  readonly allJobs = signal<JobOffer[]>([]);
  readonly loading = signal(false);

  readonly similarJobs = computed(() => {
    const job = this.job();
    if (!job) {
      return [];
    }

    return findSimilarJobs(job, this.allJobs());
  });

  async getJobById(jobId: string): Promise<JobOffer | null> {
    return this.jobRepository.getJobById(jobId);
  }

  async loadJob(jobId: string): Promise<void> {
    if (this.job()?.id !== jobId) {
      this.job.set(null);
    }

    this.loading.set(true);
    try {
      const [job, allJobs] = await Promise.all([
        this.jobRepository.getJobById(jobId),
        this.jobRepository.getAllJobs(),
      ]);
      this.job.set(job);
      this.allJobs.set(allJobs);
    } finally {
      this.loading.set(false);
    }
  }
}
