import { inject, Injectable } from '@angular/core';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { FIREBASE } from '@core/infrastructure/firebase/firebase.providers';

@Injectable({ providedIn: 'root' })
export class SavedJobsRepository {
  private readonly firebase = inject(FIREBASE);

  async loadSavedJobIds(userId: string): Promise<string[]> {
    const snapshot = await getDocs(
      collection(this.firebase.firestore, 'users', userId, 'savedJobs'),
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
}
