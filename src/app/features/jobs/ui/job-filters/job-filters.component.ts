import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobSearchStore } from '../../state/job-search.store';

@Component({
  selector: 'app-job-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './job-filters.component.html',
  styleUrl: './job-filters.component.scss',
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

  activeChips(): { key: string; label: string }[] {
    const criteria = this.store.criteria();
    const chips: { key: string; label: string }[] = [];

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
