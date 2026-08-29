import { inject, Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { AuthService } from '../../../core/auth/auth.service';
import { FIREBASE } from '../../../core/firebase/firebase.providers';
import { JobApplication } from '../domain/application.model';

@Injectable({ providedIn: 'root' })
export class SavedJobsRepository {
  private readonly firebase = inject(FIREBASE);
  private readonly auth = inject(AuthService);

  async loadSavedJobIds(userId: string): Promise<string[]> {
    const snapshot = await getDocs(
      collection(this.firebase.firestore, 'users', userId, 'savedJobs'),
    );
    return snapshot.docs.map((item) => item.id);
  }

  async loadAppliedJobIds(userId: string): Promise<string[]> {
    const snapshot = await getDocs(
      collection(this.firebase.firestore, 'users', userId, 'applications'),
    );
    return snapshot.docs.map((item) => item.id);
  }

  async saveJob(userId: string, jobId: string): Promise<void> {
    await setDoc(doc(this.firebase.firestore, 'users', userId, 'savedJobs', jobId), {
      jobId,
      savedAt: new Date().toISOString(),
    });
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    await deleteDoc(doc(this.firebase.firestore, 'users', userId, 'savedJobs', jobId));
  }

  async applyToJob(userId: string, jobId: string, note?: string): Promise<JobApplication> {
    const application: JobApplication = {
      jobId,
      appliedAt: new Date().toISOString(),
      note,
    };
    await setDoc(
      doc(this.firebase.firestore, 'users', userId, 'applications', jobId),
      application,
    );
    return application;
  }
}
