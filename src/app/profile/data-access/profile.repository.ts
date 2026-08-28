import { inject, Injectable } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthService } from '../../core/auth/auth.service';
import { FIREBASE } from '../../core/firebase/firebase.providers';
import { CandidateProfile } from '../../shared/models/profile.types';

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

    return snapshot.data() as CandidateProfile;
  }

  async saveProfile(profile: CandidateProfile): Promise<void> {
    const userId = this.auth.requireUserId();
    await setDoc(doc(this.firebase.firestore, 'profiles', userId), {
      ...profile,
      id: userId,
      updatedAt: new Date().toISOString(),
    });
  }

  emptyProfile(userId: string): CandidateProfile {
    return {
      id: userId,
      skills: [],
      preferredRoles: [],
      preferredSeniorities: [],
      preferredLocations: [],
      workplacePreferences: [],
      contractPreferences: [],
      updatedAt: new Date().toISOString(),
    };
  }
}
