import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../core/layout/app-shell.component';
import { AuthService } from '../../core/auth/auth.service';
import { AppLinks } from '../../shared/routing/app-paths';
import { SavedJobsStore } from '../saved-jobs/state/saved-jobs.store';
import { formatSalary, formatWorkplace } from './domain/job-formatters';
import { JobDetailsStore } from './state/job-details.store';

@Component({
  selector: 'app-job-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, RouterLink],
  template: `
    <app-shell>
      @if (store.job(); as currentJob) {
      <section class="details">
        <a [routerLink]="links.jobs" class="back">← Back to search</a>

        <header>
          <div>
            <p class="company">{{ currentJob.company.name }}</p>
            <h1>{{ currentJob.title }}</h1>
            <p class="meta">{{ formatWorkplace(currentJob) }}</p>
            @if (formatSalary(currentJob); as salary) {
              <p class="salary">{{ salary }}</p>
            }
          </div>

          <div class="actions">
            <button type="button" class="btn btn-ghost" (click)="toggleSave()">
              {{ savedJobs.isSaved(currentJob.id) ? 'Saved' : 'Save job' }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="savedJobs.isApplied(currentJob.id)"
              (click)="apply()"
            >
              {{ savedJobs.isApplied(currentJob.id) ? 'Applied' : 'Apply' }}
            </button>
          </div>
        </header>

        @if (toast()) {
          <p class="toast">{{ toast() }}</p>
        }

        <article class="section">
          <h2>Description</h2>
          <p>{{ currentJob.description }}</p>
        </article>

        <article class="section">
          <h2>Requirements</h2>
          <ul>
            @for (item of currentJob.requirements; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </article>

        <article class="section">
          <h2>Responsibilities</h2>
          <ul>
            @for (item of currentJob.responsibilities; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </article>
      </section>
      } @else {
        <p class="state">Loading job details…</p>
      }
    </app-shell>
  `,
  styles: `
    .details {
      max-width: 920px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .back {
      color: var(--primary);
      text-decoration: none;
      display: inline-block;
      margin-bottom: 1rem;
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .company,
    .meta {
      color: var(--text-muted);
      margin: 0;
    }

    h1 {
      margin: 0.25rem 0;
    }

    .salary {
      font-weight: 700;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      align-items: start;
    }

    .section {
      margin-top: 1.5rem;
    }

    .toast {
      background: #ecfdf5;
      color: #047857;
      border-radius: 10px;
      padding: 0.75rem 1rem;
    }

    .state {
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
    }
  `,
})
export class JobDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(JobDetailsStore);
  readonly savedJobs = inject(SavedJobsStore);
  readonly auth = inject(AuthService);

  readonly toast = signal<string | null>(null);
  readonly links = AppLinks;

  readonly formatSalary = formatSalary;
  readonly formatWorkplace = formatWorkplace;

  ngOnInit(): void {
    void this.savedJobs.loadUserData();
    const jobId = this.route.snapshot.paramMap.get('id');
    if (!jobId) {
      return;
    }

    void this.store.loadJob(jobId);
  }

  toggleSave(): void {
    const job = this.store.job();
    if (!job) {
      return;
    }

    if (!this.auth.isAuthenticated()) {
      this.toast.set('Sign in to save jobs.');
      return;
    }

    if (this.savedJobs.isSaved(job.id)) {
      void this.savedJobs.unsaveJob(job.id);
      this.toast.set('Removed from saved jobs.');
      return;
    }

    void this.savedJobs.saveJob(job.id);
    this.toast.set('Job saved.');
  }

  apply(): void {
    const job = this.store.job();
    if (!job) {
      return;
    }

    if (!this.auth.isAuthenticated()) {
      this.toast.set('Sign in to apply.');
      return;
    }

    void this.savedJobs.applyToJob(job.id).then(() => {
      this.toast.set(`Application submitted for ${job.title}.`);
    });
  }
}
