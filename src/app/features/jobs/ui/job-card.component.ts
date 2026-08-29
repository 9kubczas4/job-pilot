import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JobOffer } from '../domain/job.model';
import { formatSalary, formatWorkplace } from '../domain/job-formatters';

@Component({
  selector: 'app-job-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="job-card" [class.selected]="selected()">
      <div class="job-card__header">
        <div>
          <h3>{{ job().title }}</h3>
          <p class="company">{{ job().company.name }}</p>
        </div>
        @if (saved()) {
          <span class="badge">Saved</span>
        }
        @if (applied()) {
          <span class="badge badge-applied">Applied</span>
        }
      </div>

      <p class="meta">{{ formatWorkplace(job()) }}</p>
      @if (formatSalary(job()); as salary) {
        <p class="salary">{{ salary }}</p>
      }

      <div class="skills">
        @for (skill of job().skills.slice(0, 4); track skill.name) {
          <span class="chip">{{ skill.name }}</span>
        }
      </div>
    </article>
  `,
  styles: `
    .job-card {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      background: var(--surface-elevated);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .job-card.selected {
      border-color: var(--primary);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    }

    .job-card__header {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }

    h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--text);
    }

    .company,
    .meta,
    .salary {
      margin: 0.25rem 0 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .salary {
      color: var(--text);
      font-weight: 600;
    }

    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .chip {
      background: var(--chip-bg);
      color: var(--text);
      border-radius: 999px;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background: #eef2ff;
      color: #4338ca;
      white-space: nowrap;
    }

    .badge-applied {
      background: #ecfdf5;
      color: #047857;
    }
  `,
})
export class JobCardComponent {
  readonly job = input.required<JobOffer>();
  readonly selected = input(false);
  readonly saved = input(false);
  readonly applied = input(false);

  readonly formatSalary = formatSalary;
  readonly formatWorkplace = formatWorkplace;
}
