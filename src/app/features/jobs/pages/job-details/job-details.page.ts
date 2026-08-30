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
import { AuthService } from '@core/auth/auth.service';
import { AppLinks } from '@core/app-paths';
import { SavedJobsStore } from '@features/jobs/saved-jobs/state/saved-jobs.store';
import { JobApplicationsStore } from '@features/jobs/applications/state/job-applications.store';
import { AuthPromptDialogComponent } from '@shared/ui/auth-prompt-dialog/auth-prompt-dialog.component';
import { JobHeaderSearchComponent } from '../../ui/job-header-search/job-header-search.component';
import { SaveJobButtonComponent } from '../../ui/save-job-button/save-job-button.component';
import {
  formatSalary,
  formatWorkplace,
  formatSeniorityLevel,
  formatWorkSchedule,
  formatContractType,
  formatJobDate,
  formatApplicationDeadline,
  formatWorkplaceMode,
} from '../../domain/job-formatters';
import { JobOffer } from '../../domain/job.model';
import { ToastService } from '@shared/ui/toast/toast.service';
import { JobCardComponent } from '../../ui/job-card/job-card.component';
import { CompetencyChipComponent } from '../../ui/competency-chip/competency-chip.component';
import { ApplyJobDialogComponent } from '../../ui/apply-job-dialog/apply-job-dialog.component';
import { JobDetailsStore } from '../../state/job-details.store';

type AuthPromptAction = 'save' | 'apply';

@Component({
  selector: 'app-job-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    JobHeaderSearchComponent,
    RouterLink,
    AuthPromptDialogComponent,
    ApplyJobDialogComponent,
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
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly authPromptOpen = signal(false);
  readonly authPromptAction = signal<AuthPromptAction>('save');
  readonly applyDialogOpen = signal(false);
  readonly applying = signal(false);
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

  private readonly routeJobId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  constructor() {
    enableAppShellPageScroll();

    effect(() => {
      if (this.auth.loading() || !this.auth.isAuthenticated()) {
        return;
      }

      void this.savedJobs.loadSavedJobs();
      void this.jobApplications.loadApplications();
    });

    effect(() => {
      const jobId = this.routeJobId();
      if (!jobId) {
        return;
      }

      untracked(() => {
        this.authPromptOpen.set(false);
        this.applyDialogOpen.set(false);
        void this.store.loadJob(jobId);
      });

      this.scrollToTop();
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
      void this.savedJobs.unsaveJob(job.id);
      this.toast.show('Removed from saved jobs.');
      return;
    }

    void this.savedJobs.saveJob(job.id);
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

    this.applyDialogOpen.set(true);
  }

  closeApplyDialog(): void {
    this.applyDialogOpen.set(false);
  }

  async submitApplication(note?: string): Promise<void> {
    const job = this.store.job();
    if (!job || this.applying() || this.jobApplications.isApplied(job.id)) {
      return;
    }

    this.applying.set(true);
    try {
      await this.jobApplications.applyToJob(job.id, note);
      this.applyDialogOpen.set(false);
      this.toast.show(`Application submitted for ${job.title}.`);
    } catch {
      this.toast.show('Could not submit application. Please try again.', 5000);
    } finally {
      this.applying.set(false);
    }
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
        this.applyDialogOpen.set(true);
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
