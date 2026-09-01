import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { FIREBASE } from '@core/infrastructure/firebase/firebase.providers';
import { normalizeJobOffer } from '@features/jobs/domain/job-normalizer';
import { JobOffer } from '@features/jobs/domain/job.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class JobRepository {
  private readonly firebase = inject(FIREBASE);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private seedCache: JobOffer[] | null = null;
  private catalogCache: JobOffer[] | null = null;
  private catalogLoadPromise: Promise<JobOffer[]> | null = null;
  private readonly jobsById = new Map<string, JobOffer | null>();
  private readonly jobLoadPromises = new Map<string, Promise<JobOffer | null>>();

  async getAllJobs(): Promise<JobOffer[]> {
    if (this.catalogCache) {
      return this.catalogCache;
    }
    if (this.catalogLoadPromise) {
      return this.catalogLoadPromise;
    }

    this.catalogLoadPromise = this.loadAllJobs()
      .then((jobs) => {
        this.catalogCache = jobs;
        for (const job of jobs) {
          this.jobsById.set(job.id, job);
        }
        return jobs;
      })
      .finally(() => {
        this.catalogLoadPromise = null;
      });

    return this.catalogLoadPromise;
  }

  async getJobById(jobId: string): Promise<JobOffer | null> {
    if (this.jobsById.has(jobId)) {
      return this.jobsById.get(jobId) ?? null;
    }
    if (this.catalogCache) {
      return null;
    }
    if (this.catalogLoadPromise) {
      await this.catalogLoadPromise;
      return this.jobsById.get(jobId) ?? null;
    }

    const pending = this.jobLoadPromises.get(jobId);
    if (pending) {
      return pending;
    }

    const loadPromise = this.loadJobById(jobId)
      .then((job) => {
        this.jobsById.set(jobId, job);
        return job;
      })
      .finally(() => {
        this.jobLoadPromises.delete(jobId);
      });
    this.jobLoadPromises.set(jobId, loadPromise);
    return loadPromise;
  }

  async getJobsByIds(jobIds: readonly string[]): Promise<(JobOffer | null)[]> {
    return Promise.all(jobIds.map((jobId) => this.getJobById(jobId)));
  }

  private async loadAllJobs(): Promise<JobOffer[]> {
    if (isPlatformServer(this.platformId)) {
      return this.loadSeedJobs(true);
    }

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

  private async loadJobById(jobId: string): Promise<JobOffer | null> {
    if (isPlatformServer(this.platformId)) {
      const jobs = await this.loadSeedJobs(true);
      return jobs.find((job) => job.id === jobId) ?? null;
    }

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

  private async loadSeedJobs(force = false): Promise<JobOffer[]> {
    if (this.seedCache) {
      return this.seedCache;
    }

    if (!force && !environment.useSeedFallback) {
      return [];
    }

    const raw = await firstValueFrom(this.http.get<Record<string, unknown>[]>('/assets/seed/jobs.json'));
    this.seedCache = raw.map((job) =>
      normalizeJobOffer(job as Record<string, unknown> & { id: string }),
    );
    return this.seedCache;
  }
}
