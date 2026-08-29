import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { AuthService } from '@core/auth/auth.service';
import { AppLinks } from '@app/app-paths';
import { SavedJobsStore } from '@features/saved-jobs/state/saved-jobs.store';
import { formatSalary, formatWorkplace } from '../../domain/job-formatters';
import { JobOffer } from '../../domain/job.model';
import { JobDetailsStore } from '../../state/job-details.store';

@Component({
  selector: 'app-job-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, RouterLink],
  templateUrl: './job-details.page.html',
  styleUrl: './job-details.page.scss',
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
    this.savedJobs.loadUserData();
    const jobId = this.route.snapshot.paramMap.get('id');
    if (!jobId) {
      return;
    }

    this.store.loadJob(jobId);
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
      this.savedJobs.unsaveJob(job.id);
      this.toast.set('Removed from saved jobs.');
      return;
    }

    this.savedJobs.saveJob(job.id);
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

    this.savedJobs.applyToJob(job.id).then(() => {
      this.toast.set(`Application submitted for ${job.title}.`);
    });
  }

  companyInitials(job: JobOffer): string {
    const parts = job.company.name.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
  }
}
