import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JobCompetency } from '@features/jobs/domain/job.model';
import { formatTagLabel } from '@features/jobs/domain/job-formatters';
import { normalizeCompetencyScale } from '@features/jobs/domain/job-competency.utils';

@Component({
  selector: 'app-competency-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="competency-chip">
      <span class="competency-chip__name">{{ name() }}</span>
      <span class="competency-chip__level" [attr.aria-label]="levelLabel()">
        @for (segment of segments(); track segment) {
          <span class="competency-chip__dot" [class.is-filled]="segment <= level()"></span>
        }
      </span>
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .competency-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      padding: 0.25rem var(--space-2) 0.25rem var(--space-3);
      background: var(--color-surface);
    }

    .competency-chip__name {
      color: var(--color-text);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
    }

    .competency-chip__level {
      display: inline-flex;
      align-items: center;
      gap: 0.125rem;
    }

    .competency-chip__dot {
      width: 0.3125rem;
      height: 0.3125rem;
      border-radius: var(--radius-full);
      background: var(--color-border);
    }

    .competency-chip__dot.is-filled {
      background: var(--color-primary);
    }
  `,
})
export class CompetencyChipComponent {
  readonly competency = input.required<JobCompetency>();

  readonly name = computed(() => formatTagLabel(this.competency().name));
  readonly level = computed(() => this.competency().level);
  readonly scale = computed(() => normalizeCompetencyScale(this.competency().scale));
  readonly segments = computed(() => Array.from({ length: this.scale() }, (_, index) => index + 1));
  readonly levelLabel = computed(() => `${this.name()} level ${this.level()} out of ${this.scale()}`);
}
