import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { JobApplication } from '@features/jobs/domain/job-application.model';
import { JobApplicationsRepository } from '@features/jobs/data-access/job-applications.repository';

@Injectable({ providedIn: 'root' })
export class JobApplicationsStore {
  private readonly repository = inject(JobApplicationsRepository);
  private readonly auth = inject(AuthService);

  readonly appliedJobIds = signal<string[]>([]);
  readonly applications = signal<JobApplication[]>([]);

  readonly applicationsCount = computed(() => this.applications().length);

  async loadApplications(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) {
      this.appliedJobIds.set([]);
      this.applications.set([]);
      return;
    }

    const applications = await this.repository.loadApplications(userId);
    this.applications.set(applications);
    this.appliedJobIds.set(applications.map((application) => application.jobId));
  }

  isApplied(jobId: string): boolean {
    return this.appliedJobIds().includes(jobId);
  }

  async applyToJob(jobId: string, note: string): Promise<JobApplication> {
    const userId = this.auth.requireUserId();
    const application = await this.repository.applyToJob(userId, jobId, note);
    this.appliedJobIds.update((ids) => (ids.includes(jobId) ? ids : [...ids, jobId]));
    this.applications.update((items) => {
      const next = items.filter((item) => item.jobId !== jobId);
      return [...next, application];
    });
    return application;
  }
}
