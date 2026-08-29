import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { JobApplication } from '../domain/application.model';
import { SavedJobsRepository } from '../data-access/saved-jobs.repository';

@Injectable({ providedIn: 'root' })
export class SavedJobsStore {
  private readonly repository = inject(SavedJobsRepository);
  private readonly auth = inject(AuthService);

  readonly savedJobIds = signal<string[]>([]);
  readonly appliedJobIds = signal<string[]>([]);
  readonly applications = signal<JobApplication[]>([]);

  readonly savedCount = computed(() => this.savedJobIds().length);
  readonly applicationsCount = computed(() => this.applications().length);

  async loadUserData(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) {
      this.savedJobIds.set([]);
      this.appliedJobIds.set([]);
      this.applications.set([]);
      return;
    }

    const [savedIds, applications] = await Promise.all([
      this.repository.loadSavedJobIds(userId),
      this.repository.loadApplications(userId),
    ]);
    this.savedJobIds.set(savedIds);
    this.applications.set(applications);
    this.appliedJobIds.set(applications.map((application) => application.jobId));
  }

  isSaved(jobId: string): boolean {
    return this.savedJobIds().includes(jobId);
  }

  isApplied(jobId: string): boolean {
    return this.appliedJobIds().includes(jobId);
  }

  async saveJob(jobId: string): Promise<void> {
    const userId = this.auth.requireUserId();
    await this.repository.saveJob(userId, jobId);
    this.savedJobIds.update((ids) => (ids.includes(jobId) ? ids : [...ids, jobId]));
  }

  async unsaveJob(jobId: string): Promise<void> {
    const userId = this.auth.requireUserId();
    await this.repository.unsaveJob(userId, jobId);
    this.savedJobIds.update((ids) => ids.filter((id) => id !== jobId));
  }

  async applyToJob(jobId: string, note?: string): Promise<JobApplication> {
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
