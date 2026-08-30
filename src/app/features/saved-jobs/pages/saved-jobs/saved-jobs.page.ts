import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { enableAppShellPageScroll } from '@core/layout/enable-app-shell-page-scroll';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { AppLinks } from '@core/app-paths';
import { JobCardComponent } from '@features/jobs/ui/job-card/job-card.component';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { SavedJobsStore } from '../../state/saved-jobs.store';

@Component({
  selector: 'app-saved-jobs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, JobCardComponent, RouterLink],
  templateUrl: './saved-jobs.page.html',
  styleUrl: './saved-jobs.page.scss',
})
export class SavedJobsPageComponent {
  readonly auth = inject(AuthService);
  readonly savedJobsStore = inject(SavedJobsStore);
  private readonly searchStore = inject(JobSearchStore);
  private readonly toast = inject(ToastService);

  readonly savedJobs = computed(() => {
    const ids = new Set(this.savedJobsStore.savedJobIds());
    return this.searchStore.allJobs().filter((job) => ids.has(job.id));
  });

  readonly jobLink = AppLinks.job;
  readonly links = AppLinks;

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

  async onToggleSave(jobId: string): Promise<void> {
    await this.savedJobsStore.unsaveJob(jobId);
    this.toast.show('Removed from saved jobs.');
  }

  signIn(): void {
    void this.auth.signInWithGoogle();
  }
}
