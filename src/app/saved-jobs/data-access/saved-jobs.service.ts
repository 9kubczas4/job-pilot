import { computed, inject, Injectable, signal } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { AuthService } from '../../core/auth/auth.service';
import { FIREBASE } from '../../core/firebase/firebase.providers';
import { JobApplication } from '../../shared/models/profile.types';

@Injectable({ providedIn: 'root' })
export class SavedJobsService {
  private readonly firebase = inject(FIREBASE);
  private readonly auth = inject(AuthService);

  readonly savedJobIds = signal<string[]>([]);
  readonly appliedJobIds = signal<string[]>([]);

  readonly savedCount = computed(() => this.savedJobIds().length);

  async loadUserData(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) {
      this.savedJobIds.set([]);
      this.appliedJobIds.set([]);
      return;
    }

    const savedSnapshot = await getDocs(
      collection(this.firebase.firestore, 'users', userId, 'savedJobs'),
    );
    this.savedJobIds.set(savedSnapshot.docs.map((item) => item.id));

    const applicationsSnapshot = await getDocs(
      collection(this.firebase.firestore, 'users', userId, 'applications'),
    );
    this.appliedJobIds.set(applicationsSnapshot.docs.map((item) => item.id));
  }

  isSaved(jobId: string): boolean {
    return this.savedJobIds().includes(jobId);
  }

  isApplied(jobId: string): boolean {
    return this.appliedJobIds().includes(jobId);
  }

  async saveJob(jobId: string): Promise<void> {
    const userId = this.auth.requireUserId();
    await setDoc(doc(this.firebase.firestore, 'users', userId, 'savedJobs', jobId), {
      jobId,
      savedAt: new Date().toISOString(),
    });
    this.savedJobIds.update((ids) => (ids.includes(jobId) ? ids : [...ids, jobId]));
  }

  async unsaveJob(jobId: string): Promise<void> {
    const userId = this.auth.requireUserId();
    await deleteDoc(doc(this.firebase.firestore, 'users', userId, 'savedJobs', jobId));
    this.savedJobIds.update((ids) => ids.filter((id) => id !== jobId));
  }

  async applyToJob(jobId: string, note?: string): Promise<JobApplication> {
    const userId = this.auth.requireUserId();
    const application: JobApplication = {
      jobId,
      appliedAt: new Date().toISOString(),
      note,
    };
    await setDoc(
      doc(this.firebase.firestore, 'users', userId, 'applications', jobId),
      application,
    );
    this.appliedJobIds.update((ids) => (ids.includes(jobId) ? ids : [...ids, jobId]));
    return application;
  }
}
