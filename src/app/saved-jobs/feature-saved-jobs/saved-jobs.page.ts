import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../core/layout/app-shell.component';
import { AuthService } from '../../core/auth/auth.service';
import { JobSearchStore } from '../../jobs/data-access/job-search.store';
import { SavedJobsService } from '../data-access/saved-jobs.service';
import { JobCardComponent } from '../../jobs/ui-job-card/job-card.component';

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
              <a [routerLink]="['/jobs', job.id]">
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
  private readonly savedJobsService = inject(SavedJobsService);
  private readonly searchStore = inject(JobSearchStore);

  readonly savedJobs = computed(() => {
    const ids = new Set(this.savedJobsService.savedJobIds());
    return this.searchStore.allJobs().filter((job) => ids.has(job.id));
  });

  ngOnInit(): void {
    void this.searchStore.loadJobs();
    void this.savedJobsService.loadUserData();
  }
}
