import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobSearchStore } from '../data-access/job-search.store';

@Component({
  selector: 'app-job-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <section class="filters">
      <div class="search-row">
        <input
          type="search"
          placeholder="Role, skill or company"
          [ngModel]="store.criteria().query ?? ''"
          (ngModelChange)="updateQuery($event)"
        />
        <input
          type="text"
          placeholder="Location"
          [ngModel]="locationValue()"
          (ngModelChange)="updateLocation($event)"
        />
      </div>

      <div class="quick-filters">
        @for (option of workplaceOptions; track option) {
          <button
            type="button"
            class="chip-btn"
            [class.active]="isWorkplaceActive(option)"
            (click)="toggleWorkplace(option)"
          >
            {{ option }}
          </button>
        }
        <button type="button" class="chip-btn ghost" (click)="store.clearCriteria()">Clear</button>
      </div>

      <div class="active-filters">
        @for (chip of activeChips(); track chip.key) {
          <button type="button" class="chip removable" (click)="removeChip(chip.key)">
            {{ chip.label }} ×
          </button>
        }
      </div>
    </section>
  `,
  styles: `
    .filters {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface-elevated);
    }

    .search-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 0.75rem;
    }

    input {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.75rem 0.875rem;
      font: inherit;
      background: var(--surface);
    }

    .quick-filters,
    .active-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .chip-btn,
    .chip {
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: 999px;
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      cursor: pointer;
      text-transform: capitalize;
    }

    .chip-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .chip-btn.ghost {
      color: var(--text-muted);
    }

    .chip.removable {
      background: var(--chip-bg);
    }

    @media (max-width: 768px) {
      .search-row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class JobFiltersComponent {
  readonly store = inject(JobSearchStore);
  readonly workplaceOptions = ['remote', 'hybrid', 'onsite'] as const;

  locationValue(): string {
    return this.store.criteria().locations?.[0] ?? '';
  }

  updateQuery(value: string): void {
    this.store.patchCriteria({ query: value || undefined });
  }

  updateLocation(value: string): void {
    this.store.patchCriteria({ locations: value ? [value] : undefined });
  }

  isWorkplaceActive(option: (typeof this.workplaceOptions)[number]): boolean {
    return this.store.criteria().workplace?.includes(option) ?? false;
  }

  toggleWorkplace(option: (typeof this.workplaceOptions)[number]): void {
    const current = new Set(this.store.criteria().workplace ?? []);
    if (current.has(option)) {
      current.delete(option);
    } else {
      current.add(option);
    }
    this.store.patchCriteria({
      workplace: current.size ? [...current] : undefined,
    });
  }

  activeChips(): Array<{ key: string; label: string }> {
    const criteria = this.store.criteria();
    const chips: Array<{ key: string; label: string }> = [];

    if (criteria.query) {
      chips.push({ key: 'query', label: criteria.query });
    }
    criteria.locations?.forEach((location) =>
      chips.push({ key: `location:${location}`, label: location }),
    );
    criteria.workplace?.forEach((mode) =>
      chips.push({ key: `workplace:${mode}`, label: mode }),
    );
    criteria.skills?.forEach((skill) =>
      chips.push({ key: `skill:${skill}`, label: skill }),
    );

    return chips;
  }

  removeChip(key: string): void {
    if (key === 'query') {
      this.store.patchCriteria({ query: undefined });
      return;
    }

    const [type, value] = key.split(':');
    const criteria = this.store.criteria();

    if (type === 'location') {
      this.store.patchCriteria({
        locations: criteria.locations?.filter((item) => item !== value),
      });
    }
    if (type === 'workplace') {
      this.store.patchCriteria({
        workplace: criteria.workplace?.filter((item) => item !== value) as typeof criteria.workplace,
      });
    }
    if (type === 'skill') {
      this.store.patchCriteria({
        skills: criteria.skills?.filter((item) => item !== value),
      });
    }
  }
}
