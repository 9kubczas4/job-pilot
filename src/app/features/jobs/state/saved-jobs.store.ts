import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { SavedJobsRepository } from '../data-access/saved-jobs.repository';

@Injectable({ providedIn: 'root' })
export class SavedJobsStore {
  private readonly repository = inject(SavedJobsRepository);
  private readonly auth = inject(AuthService);

  readonly savedJobIds = signal<string[]>([]);

  readonly savedCount = computed(() => this.savedJobIds().length);

  async loadSavedJobs(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) {
      this.savedJobIds.set([]);
      return;
    }

    const savedIds = await this.repository.loadSavedJobIds(userId);
    this.savedJobIds.set(savedIds);
  }

  isSaved(jobId: string): boolean {
    return this.savedJobIds().includes(jobId);
  }

  async saveJob(jobId: string): Promise<void> {
    const userId = this.auth.requireUserId();
    if (this.savedJobIds().includes(jobId)) {
      return;
    }

    this.savedJobIds.update((ids) => [...ids, jobId]);

    try {
      await this.repository.saveJob(userId, jobId);
    } catch (error) {
      this.savedJobIds.update((ids) => ids.filter((id) => id !== jobId));
      throw error;
    }
  }

  async unsaveJob(jobId: string): Promise<void> {
    const userId = this.auth.requireUserId();
    const previous = this.savedJobIds();

    if (!previous.includes(jobId)) {
      return;
    }

    this.savedJobIds.update((ids) => ids.filter((id) => id !== jobId));

    try {
      await this.repository.unsaveJob(userId, jobId);
    } catch (error) {
      this.savedJobIds.set(previous);
      throw error;
    }
  }
}
