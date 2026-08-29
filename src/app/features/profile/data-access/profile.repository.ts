import { inject, Injectable } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthService } from '@core/auth/auth.service';
import { FIREBASE } from '@core/firebase/firebase.providers';
import { normalizeContractTypes } from '@features/jobs/domain/contract-type.utils';
import { CandidateProfile } from '../domain/profile.model';
import { stripUndefinedDeep } from '../domain/profile.utils';

@Injectable({ providedIn: 'root' })
export class ProfileRepository {
  private readonly firebase = inject(FIREBASE);
  private readonly auth = inject(AuthService);

  async getProfile(): Promise<CandidateProfile | null> {
    const userId = this.auth.userId();
    if (!userId) {
      return null;
    }

    const snapshot = await getDoc(doc(this.firebase.firestore, 'profiles', userId));
    if (!snapshot.exists()) {
      return this.emptyProfile(userId);
    }

    return this.normalizeProfile(snapshot.data() as CandidateProfile);
  }

  async saveProfile(profile: CandidateProfile): Promise<void> {
    const userId = this.auth.requireUserId();
    const payload = stripUndefinedDeep({
      ...this.normalizeProfile(profile),
      id: userId,
      updatedAt: new Date().toISOString(),
    });

    await setDoc(doc(this.firebase.firestore, 'profiles', userId), payload);
  }

  emptyProfile(userId: string): CandidateProfile {
    return {
      id: userId,
      workHistory: [],
      skills: [],
      preferredRoles: [],
      preferredSeniorities: [],
      preferredLocations: [],
      workplacePreferences: [],
      contractPreferences: [],
      updatedAt: new Date().toISOString(),
    };
  }

  private normalizeProfile(profile: CandidateProfile): CandidateProfile {
    return {
      ...profile,
      workHistory: profile.workHistory ?? [],
      skills: profile.skills ?? [],
      preferredRoles: profile.preferredRoles ?? [],
      preferredSeniorities: profile.preferredSeniorities ?? [],
      preferredLocations: profile.preferredLocations ?? [],
      workplacePreferences: profile.workplacePreferences ?? [],
      contractPreferences: normalizeContractTypes(profile.contractPreferences, []),
    };
  }
}
