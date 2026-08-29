import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { FIREBASE } from '@core/firebase/firebase.providers';
import { normalizeJobOffer } from '../domain/job-normalizer';
import { JobOffer } from '../domain/job.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class JobRepository {
  private readonly firebase = inject(FIREBASE);
  private readonly http = inject(HttpClient);

  private seedCache: JobOffer[] | null = null;

  async getAllJobs(): Promise<JobOffer[]> {
    try {
      const snapshot = await getDocs(collection(this.firebase.firestore, 'jobs'));
      if (!snapshot.empty) {
        return snapshot.docs.map((item) =>
          normalizeJobOffer({ id: item.id, ...item.data() }),
        );
      }
    } catch {
      // Fall back to local seed when Firestore is unavailable.
    }

    return this.loadSeedJobs();
  }

  async getJobById(jobId: string): Promise<JobOffer | null> {
    try {
      const snapshot = await getDoc(doc(this.firebase.firestore, 'jobs', jobId));
      if (snapshot.exists()) {
        return normalizeJobOffer({ id: snapshot.id, ...snapshot.data() });
      }
    } catch {
      // Fall back to local seed when Firestore is unavailable.
    }

    const jobs = await this.loadSeedJobs();
    return jobs.find((job) => job.id === jobId) ?? null;
  }

  private async loadSeedJobs(): Promise<JobOffer[]> {
    if (this.seedCache) {
      return this.seedCache;
    }

    if (environment.useSeedFallback) {
      const raw = await firstValueFrom(this.http.get<Record<string, unknown>[]>('/assets/seed/jobs.json'));
      this.seedCache = raw.map((job) =>
        normalizeJobOffer(job as Record<string, unknown> & { id: string }),
      );
      return this.seedCache;
    }

    return [];
  }
}
