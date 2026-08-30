import { inject, Injectable } from '@angular/core';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { FIREBASE } from '@core/firebase/firebase.providers';
import { JobApplication } from '../domain/job-application.model';

@Injectable({ providedIn: 'root' })
export class JobApplicationsRepository {
  private readonly firebase = inject(FIREBASE);

  async loadApplications(userId: string): Promise<JobApplication[]> {
    const snapshot = await getDocs(
      collection(this.firebase.firestore, 'users', userId, 'applications'),
    );
    return snapshot.docs.map((item) => item.data() as JobApplication);
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
