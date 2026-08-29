import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { enableAppShellPageScroll } from '@core/layout/enable-app-shell-page-scroll';
import { AuthService } from '@core/auth/auth.service';
import { AppLinks } from '@app/app-paths';
import { JobOffer } from '@features/jobs/domain/job.model';
import { formatJobDate } from '@features/jobs/domain/job-formatters';
import { JobCardComponent } from '@features/jobs/ui/job-card/job-card.component';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { JobApplication } from '../../domain/application.model';
import { SavedJobsStore } from '../../state/saved-jobs.store';

interface AppliedJobEntry {
  job: JobOffer;
  application: JobApplication;
}

@Component({
  selector: 'app-applications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, JobCardComponent, RouterLink],
  templateUrl: './applications.page.html',
  styleUrl: './applications.page.scss',
})
export class ApplicationsPageComponent {
  readonly auth = inject(AuthService);
  readonly savedJobsStore = inject(SavedJobsStore);
  private readonly searchStore = inject(JobSearchStore);

  readonly appliedJobs = computed(() => {
    const jobsById = new Map(this.searchStore.allJobs().map((job) => [job.id, job]));

    return this.savedJobsStore
      .applications()
      .map((application) => {
        const job = jobsById.get(application.jobId);
        return job ? { job, application } : null;
      })
      .filter((entry): entry is AppliedJobEntry => entry !== null)
      .sort((left, right) => right.application.appliedAt.localeCompare(left.application.appliedAt));
  });

  readonly jobLink = AppLinks.job;
  readonly links = AppLinks;
  readonly formatAppliedDate = formatJobDate;

  constructor() {
    enableAppShellPageScroll();
    this.searchStore.loadJobs();

    effect(() => {
      if (this.auth.loading() || !this.auth.isAuthenticated()) {
        return;
      }

      void this.savedJobsStore.loadUserData();
    });
  }

  signIn(): void {
    void this.auth.signInWithGoogle();
  }
}
