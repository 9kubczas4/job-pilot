import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppLinks } from '../../../shared/routing/app-paths';
import { JobCardComponent } from './job-card.component';
import { JobOffer } from '../domain/job.model';

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
          <a
            [routerLink]="jobLink(job.id)"
            class="job-link"
            (click)="selectJob.emit(job.id)"
          >
            <app-job-card
              [job]="job"
              [selected]="selectedJobId() === job.id"
              [saved]="savedJobIds().includes(job.id)"
              [applied]="appliedJobIds().includes(job.id)"
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

    .job-link:hover .job-card,
    .job-link:focus-visible .job-card {
      border-color: var(--primary);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
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
  readonly savedJobIds = input<string[]>([]);
  readonly appliedJobIds = input<string[]>([]);
  readonly selectJob = output<string>();

  readonly jobLink = AppLinks.job;
}
