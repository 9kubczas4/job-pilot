import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  PLATFORM_ID,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { enableAppShellPageScroll } from '@core/layout/enable-app-shell-page-scroll';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { PageSeoService } from '@core/infrastructure/seo/page-seo.service';
import { AppLinks } from '@core/app-paths';
import { environment } from '@environments/environment';
import { buildJobSeoMetadata } from '@features/jobs/domain/job-seo.utils';
import { SavedJobsStore } from '@features/jobs/state/saved-jobs.store';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';
import { AuthPromptDialogComponent } from '@features/jobs/ui/auth-prompt-dialog/auth-prompt-dialog.component';
import { JobHeaderSearchComponent } from '@features/jobs/shell/job-header-search.component';
import { SaveJobButtonComponent } from '@features/jobs/ui/save-job-button/save-job-button.component';
import {
  formatSalary,
  formatWorkplace,
  formatSeniorityLevel,
  formatWorkSchedule,
  formatContractType,
  formatJobDate,
  formatApplicationDeadline,
  formatWorkplaceMode,
} from '@features/jobs/domain/job-formatters';
import { JobOffer } from '@features/jobs/domain/job.model';
import { ToastService } from '@shared/ui/toast/toast.service';
import { JobCardComponent } from '@features/jobs/ui/job-card/job-card.component';
import { CompetencyChipComponent } from '@features/jobs/ui/competency-chip/competency-chip.component';
import { JobDetailsStore } from '@features/jobs/state/job-details.store';
import { ApplyJobStore } from '@features/jobs/state/apply-job.store';

type AuthPromptAction = 'save' | 'apply';

@Component({
  selector: 'app-job-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    JobHeaderSearchComponent,
    RouterLink,
    AuthPromptDialogComponent,
    SaveJobButtonComponent,
    JobCardComponent,
    CompetencyChipComponent,
  ],
  templateUrl: './job-details.page.html',
  styleUrl: './job-details.page.scss',
})
export class JobDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(JobDetailsStore);
  readonly savedJobs = inject(SavedJobsStore);
  readonly jobApplications = inject(JobApplicationsStore);
  readonly applyJobStore = inject(ApplyJobStore);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly pageSeo = inject(PageSeoService);

  readonly authPromptOpen = signal(false);
  readonly authPromptAction = signal<AuthPromptAction>('save');
  readonly links = AppLinks;
  readonly skeletonListRows = [0, 1, 2, 3];
  readonly skeletonColumns = [0, 1];

  readonly formatSalary = formatSalary;
  readonly formatWorkplace = formatWorkplace;
  readonly formatSeniorityLevel = formatSeniorityLevel;
  readonly formatWorkSchedule = formatWorkSchedule;
  readonly formatContractType = formatContractType;
  readonly formatJobDate = formatJobDate;
  readonly formatApplicationDeadline = formatApplicationDeadline;
  readonly formatWorkplaceMode = formatWorkplaceMode;

  readonly authPromptTitle = computed(() =>
    this.authPromptAction() === 'apply' ? 'Sign in to apply' : 'Sign in to save jobs',
  );

  readonly authPromptMessage = computed(() =>
    this.authPromptAction() === 'apply'
      ? 'Sign in to submit your application and track it from your profile.'
      : 'Sign in to add offers to your saved list and access them from any device.',
  );

  readonly applying = computed(() => {
    const jobId = this.store.job()?.id;
    if (!jobId) {
      return false;
    }

    if (this.applyJobStore.loading()) {
      return true;
    }

    const presentation = this.applyJobStore.presentation();
    return presentation?.jobId === jobId && this.applyJobStore.submitting();
  });

  private readonly routeJobId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  constructor() {
    enableAppShellPageScroll();
    this.destroyRef.onDestroy(() => this.pageSeo.restoreDefaults());

    effect(() => {
      if (this.auth.loading() || !this.auth.isAuthenticated()) {
        return;
      }

      this.savedJobs.loadSavedJobs();
      this.jobApplications.loadApplications();
    });

    effect(() => {
      const jobId = this.routeJobId();
      if (!jobId) {
        return;
      }

      untracked(() => {
        this.authPromptOpen.set(false);
        this.applyJobStore.dismiss();
        this.store.loadJob(jobId);
      });

      this.scrollToTop();
    });

    effect(() => {
      const job = this.store.job();
      const jobId = this.routeJobId();
      if (!job || !jobId || job.id !== jobId) {
        return;
      }

      this.pageSeo.apply(buildJobSeoMetadata(job, environment.siteUrl));
    });
  }

  toggleSave(): void {
    const job = this.store.job();
    if (!job) {
      return;
    }

    if (!this.auth.isAuthenticated()) {
      this.authPromptAction.set('save');
      this.authPromptOpen.set(true);
      return;
    }

    if (this.savedJobs.isSaved(job.id)) {
      this.savedJobs.unsaveJob(job.id);
      this.toast.show('Removed from saved jobs.');
      return;
    }

    this.savedJobs.saveJob(job.id);
    this.toast.show('Job saved.');
  }

  apply(): void {
    const job = this.store.job();
    if (!job || this.jobApplications.isApplied(job.id)) {
      return;
    }

    if (!this.auth.isAuthenticated()) {
      this.authPromptAction.set('apply');
      this.authPromptOpen.set(true);
      return;
    }

    this.applyJobStore.show({ jobId: job.id });
  }

  closeAuthPrompt(): void {
    this.authPromptOpen.set(false);
  }

  async confirmAuthPrompt(): Promise<void> {
    const action = this.authPromptAction();

    try {
      await this.auth.signInWithGoogle();
      this.authPromptOpen.set(false);

      const job = this.store.job();
      if (!job) {
        return;
      }

      if (action === 'save') {
        if (!this.savedJobs.isSaved(job.id)) {
          await this.savedJobs.saveJob(job.id);
          this.toast.show('Job saved.');
        }
        return;
      }

      if (!this.jobApplications.isApplied(job.id)) {
        this.applyJobStore.show({ jobId: job.id });
      }
    } catch {
      // User dismissed the provider popup or sign-in failed.
    }
  }

  companyInitials(job: JobOffer): string {
    const parts = job.company.name.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
  }

  private scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.scrollTo({ top: 0 });
  }
}
