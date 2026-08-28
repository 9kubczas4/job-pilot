import { inject, Injectable, signal } from '@angular/core';
import { declareExperimentalWebMcpTool } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { CandidateProfile } from '../../shared/models/profile.types';
import { getProfileSchemaPayload } from '../../webmcp/schemas/profile-schema';
import { toolJson, toolText } from '../../webmcp/utils/tool-response';
import { ProfileRepository } from './profile.repository';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly auth = inject(AuthService);
  private readonly repository = inject(ProfileRepository);

  readonly profile = signal<CandidateProfile | null>(null);
  readonly loading = signal(false);

  constructor() {
    void declareExperimentalWebMcpTool({
      name: 'get_profile',
      description: 'Read the authenticated candidate profile.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: async () => {
        const profile = await this.loadProfile();
        if (!profile) {
          return toolText('Authentication required to read profile.');
        }
        return toolJson(profile);
      },
    });
  }

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
    const next: CandidateProfile = {
      ...current,
      ...partial,
      id: userId,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.saveProfile(next);
    this.profile.set(next);
    return next;
  }
}
