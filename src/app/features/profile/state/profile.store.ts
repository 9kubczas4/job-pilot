import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { CandidateProfile } from '../domain/profile.model';
import { stripUndefinedDeep } from '../domain/profile.utils';
import { ProfileRepository } from '../data-access/profile.repository';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly auth = inject(AuthService);
  private readonly repository = inject(ProfileRepository);

  readonly profile = signal<CandidateProfile | null>(null);
  readonly loading = signal(false);

  async loadProfile(): Promise<CandidateProfile | null> {
    if (!this.auth.isAuthenticated()) {
      this.profile.set(null);
      return null;
    }

    this.loading.set(true);
    try {
      const profile = await this.repository.getProfile();
      this.profile.set(profile);
      return profile;
    } finally {
      this.loading.set(false);
    }
  }

  async updateProfile(partial: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const userId = this.auth.requireUserId();
    const current = this.profile() ?? this.repository.emptyProfile(userId);
    const next = stripUndefinedDeep({
      ...current,
      ...partial,
      id: userId,
      updatedAt: new Date().toISOString(),
    });
    await this.repository.saveProfile(next);
    this.profile.set(next);
    return next;
  }
}
