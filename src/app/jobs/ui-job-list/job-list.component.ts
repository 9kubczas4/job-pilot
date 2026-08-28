import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavedJobsService } from '../../saved-jobs/data-access/saved-jobs.service';
import { JobCardComponent } from '../ui-job-card/job-card.component';
import { JobOffer } from '../../shared/models/job.types';

@Component({
  selector: 'app-job-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JobCardComponent, RouterLink],
  template: `
    <section class="job-list">
      @if (loading()) {
        <p class="state">Loading jobs…</p>
      } @else if (!jobs().length) {
        <p class="state">No jobs match your filters.</p>
      } @else {
        @for (job of jobs(); track job.id) {
          <a [routerLink]="['/jobs', job.id]" class="job-link" (click)="selectJob.emit(job.id)">
            <app-job-card
              [job]="job"
              [selected]="selectedJobId() === job.id"
              [saved]="savedJobs.isSaved(job.id)"
              [applied]="savedJobs.isApplied(job.id)"
              (selectedChange)="selectJob.emit($event)"
            />
          </a>
        }
      }
    </section>
  `,
  styles: `
    .job-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      overflow: auto;
    }

    .job-link {
      text-decoration: none;
      color: inherit;
    }

    .state {
      color: var(--text-muted);
      padding: 2rem 1rem;
      text-align: center;
    }
  `,
})
export class JobListComponent {
  readonly jobs = input.required<JobOffer[]>();
  readonly loading = input(false);
  readonly selectedJobId = input<string | null>(null);
  readonly selectJob = output<string>();

  readonly savedJobs = inject(SavedJobsService);
}
