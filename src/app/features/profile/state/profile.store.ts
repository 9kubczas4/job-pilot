import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { CandidateProfile } from '@features/profile/domain/profile.model';
import { stripUndefinedDeep } from '@features/profile/domain/profile.utils';
import { ProfileRepository } from '@features/profile/data-access/profile.repository';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly auth = inject(AuthService);
  private readonly repository = inject(ProfileRepository);
  private readonly profileLoads = new Map<string, Promise<CandidateProfile | null>>();
  private cachedUserId: string | null = null;
  private hasLoadedProfile = false;
  private cacheVersion = 0;

  readonly profile = signal<CandidateProfile | null>(null);
  readonly loading = signal(false);

  async loadProfile(): Promise<CandidateProfile | null> {
    const userId = this.auth.userId();
    if (!userId) {
      this.resetCache(null);
      return null;
    }

    if (this.cachedUserId !== userId) {
      this.resetCache(userId);
    }
    if (this.hasLoadedProfile) {
      return this.profile();
    }

    const activeLoad = this.profileLoads.get(userId);
    if (activeLoad) {
      return activeLoad;
    }

    const requestVersion = this.cacheVersion;
    this.loading.set(true);
    const load = this.repository
      .getProfile()
      .then((profile) => {
        if (this.auth.userId() !== userId || this.cacheVersion !== requestVersion) {
          return null;
        }

        this.profile.set(profile);
        this.hasLoadedProfile = true;
        return profile;
      })
      .finally(() => {
        if (this.profileLoads.get(userId) === load) {
          this.profileLoads.delete(userId);
        }
        this.loading.set(this.profileLoads.size > 0);
      });
    this.profileLoads.set(userId, load);
    return load;
  }

  async updateProfile(partial: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const userId = this.auth.requireUserId();
    if (this.cachedUserId !== userId) {
      this.resetCache(userId);
    }
    const current = this.profile() ?? this.repository.emptyProfile(userId);
    const next = stripUndefinedDeep({
      ...current,
      ...partial,
      id: userId,
      updatedAt: new Date().toISOString(),
    });
    this.cacheVersion += 1;
    await this.repository.saveProfile(next);
    this.profile.set(next);
    this.hasLoadedProfile = true;
    return next;
  }

  private resetCache(userId: string | null): void {
    if (this.cachedUserId === userId && this.profile() === null && !this.hasLoadedProfile) {
      return;
    }

    this.cachedUserId = userId;
    this.hasLoadedProfile = false;
    this.cacheVersion += 1;
    this.profile.set(null);
  }
}
