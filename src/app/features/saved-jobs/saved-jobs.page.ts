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
  templateUrl: './saved-jobs.page.html',
  styleUrl: './saved-jobs.page.scss',
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
