import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { enableAppShellPageScroll } from '@core/layout/enable-app-shell-page-scroll';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { AppLinks } from '@core/app-paths';
import { JobOffer } from '@features/jobs/domain/job.model';
import { formatJobDate } from '@features/jobs/domain/job-formatters';
import { JobHeaderSearchComponent } from '@features/jobs/shell/job-header-search.component';
import { JobCardComponent } from '@features/jobs/ui/job-card/job-card.component';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { JobApplication } from '@features/jobs/domain/job-application.model';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';

interface AppliedJobEntry {
  job: JobOffer;
  application: JobApplication;
}

@Component({
  selector: 'app-applications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, JobHeaderSearchComponent, JobCardComponent, RouterLink],
  templateUrl: './applications.page.html',
  styleUrl: './applications.page.scss',
})
export class ApplicationsPageComponent {
  readonly auth = inject(AuthService);
  readonly applicationsStore = inject(JobApplicationsStore);
  private readonly searchStore = inject(JobSearchStore);

  readonly appliedJobs = computed(() => {
    const jobsById = new Map(this.searchStore.allJobs().map((job) => [job.id, job]));

    return this.applicationsStore
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

      this.applicationsStore.loadApplications();
    });
  }

  signIn(): void {
    this.auth.signInWithGoogle();
  }
}
