import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { AuthService } from '@core/auth/auth.service';
import { AppLinks } from '@app/app-paths';
import { SavedJobsStore } from '@features/saved-jobs/state/saved-jobs.store';
import { AuthPromptDialogComponent } from '@shared/ui/auth-prompt-dialog/auth-prompt-dialog.component';
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
import { JobDetailsStore } from '../../state/job-details.store';

type AuthPromptAction = 'save' | 'apply';

@Component({
  selector: 'app-job-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, RouterLink, AuthPromptDialogComponent, JobCardComponent, CompetencyChipComponent],
  templateUrl: './job-details.page.html',
  styleUrl: './job-details.page.scss',
})
export class JobDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(JobDetailsStore);
  readonly savedJobs = inject(SavedJobsStore);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly authPromptOpen = signal(false);
  readonly authPromptAction = signal<AuthPromptAction>('save');
  readonly links = AppLinks;

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
    if (!job) {
      return;
    }

    if (!this.auth.isAuthenticated()) {
      this.authPromptAction.set('apply');
      this.authPromptOpen.set(true);
      return;
    }

    void this.savedJobs.applyToJob(job.id).then(() => {
      this.toast.show(`Application submitted for ${job.title}.`);
    });
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

      if (!this.savedJobs.isApplied(job.id)) {
        await this.savedJobs.applyToJob(job.id);
        this.toast.show(`Application submitted for ${job.title}.`);
      }
    } catch {
      // User dismissed the provider popup or sign-in failed.
    }
  }

  companyInitials(job: JobOffer): string {
    const parts = job.company.name.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
  }
}
