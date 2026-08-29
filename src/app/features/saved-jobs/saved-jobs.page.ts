import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../core/layout/app-shell.component';
import { AuthService } from '../../core/auth/auth.service';
import { AppLinks } from '../../shared/routing/app-paths';
import { JobCardComponent } from '../jobs/ui/job-card.component';
import { JobSearchStore } from '../jobs/state/job-search.store';
import { SavedJobsStore } from './state/saved-jobs.store';

@Component({
  selector: 'app-saved-jobs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, JobCardComponent, RouterLink],
  template: `
    <app-shell>
      <section class="saved">
        <h1>Saved jobs</h1>

        @if (!auth.isAuthenticated()) {
          <p class="notice">Sign in to view saved jobs.</p>
        } @else if (!savedJobs().length) {
          <p class="notice">No saved jobs yet.</p>
        } @else {
          <div class="list">
            @for (job of savedJobs(); track job.id) {
              <a [routerLink]="jobLink(job.id)">
                <app-job-card [job]="job" [saved]="true" />
              </a>
            }
          </div>
        }
      </section>
    </app-shell>
  `,
  styles: `
    .saved {
      max-width: 720px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .notice {
      color: var(--text-muted);
    }

    .list {
      display: grid;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    a {
      text-decoration: none;
      color: inherit;
    }
  `,
})
export class SavedJobsPageComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly savedJobsStore = inject(SavedJobsStore);
  private readonly searchStore = inject(JobSearchStore);

  readonly savedJobs = computed(() => {
    const ids = new Set(this.savedJobsStore.savedJobIds());
    return this.searchStore.allJobs().filter((job) => ids.has(job.id));
  });

  readonly jobLink = AppLinks.job;

  ngOnInit(): void {
    void this.searchStore.loadJobs();
    void this.savedJobsStore.loadUserData();
  }
}
