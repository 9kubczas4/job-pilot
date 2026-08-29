import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { formatWorkplaceMode, formatTagLabel } from '../../domain/job-formatters';
import { JobSearchStore } from '../../state/job-search.store';

@Component({
  selector: 'app-job-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './job-filters.component.html',
  styleUrl: './job-filters.component.scss',
})
export class JobFiltersComponent {
  readonly store = inject(JobSearchStore);
  private readonly headerUi = inject(HeaderUiStore);
  readonly workplaceOptions = ['remote', 'hybrid', 'onsite'] as const;

  readonly formatWorkplaceMode = formatWorkplaceMode;

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
    if (criteria.locations?.length) {
      const radius = criteria.radiusKm;
      const label =
        radius != null && criteria.locationLat != null
          ? `${criteria.locations[0]} · ${radius} km`
          : criteria.locations[0];
      chips.push({ key: 'location', label });
    }
    criteria.workplace?.forEach((mode) =>
      chips.push({ key: `workplace:${mode}`, label: formatWorkplaceMode(mode) }),
    );
    criteria.skills?.forEach((skill) =>
      chips.push({ key: `skill:${skill}`, label: formatTagLabel(skill) }),
    );

    return chips;
  }

  removeChip(key: string): void {
    if (key === 'query') {
      this.store.patchCriteria({ query: undefined });
      this.headerUi.searchQuery.set('');
      return;
    }

    if (key === 'location') {
      this.store.patchCriteria({
        locations: undefined,
        locationLat: undefined,
        locationLng: undefined,
        radiusKm: undefined,
      });
      this.headerUi.locationQuery.set('');
      this.headerUi.locationLat.set(undefined);
      this.headerUi.locationLng.set(undefined);
      return;
    }

    const [type, value] = key.split(':');
    const criteria = this.store.criteria();

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
