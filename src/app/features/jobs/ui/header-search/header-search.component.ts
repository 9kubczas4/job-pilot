import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  JobSearchSuggestion,
  LocationSearchSuggestion,
  SEARCH_RADIUS_OPTIONS_KM,
} from '@features/jobs/domain/header-search.model';

export type HeaderSearchVariant = 'full' | 'compact';

@Component({
  selector: 'app-header-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '[class.header-search-host--compact]': 'compact()',
  },
  imports: [],
  templateUrl: './header-search.component.html',
  styleUrl: './header-search.component.scss',
})
export class HeaderSearchComponent {
  readonly variant = input<HeaderSearchVariant>('full');
  readonly searchQuery = input('');
  readonly locationQuery = input('');
  readonly radiusKm = input(DEFAULT_SEARCH_RADIUS_KM);
  readonly jobSuggestions = input<JobSearchSuggestion[]>([]);
  readonly locationSuggestions = input<LocationSearchSuggestion[]>([]);

  readonly compact = computed(() => this.variant() === 'compact');

  readonly searchQueryChange = output<string>();
  readonly locationQueryChange = output<string>();
  readonly locationCoordsChange = output<{ lat?: number; lng?: number }>();
  readonly radiusChange = output<number>();
  readonly searchApply = output<void>();

  readonly radiusOptions = SEARCH_RADIUS_OPTIONS_KM;
  readonly defaultRadius = DEFAULT_SEARCH_RADIUS_KM;

  private readonly host = inject(ElementRef<HTMLElement>);

  readonly jobPanelOpen = signal(false);
  readonly locationPanelOpen = signal(false);
  readonly radiusPanelOpen = signal(false);

  private skipLocationCoordReset = false;

  onJobQueryChange(value: string): void {
    this.searchQueryChange.emit(value);
    this.jobPanelOpen.set(value.trim().length >= 2);
    this.locationPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
  }

  onLocationQueryChange(value: string): void {
    this.locationQueryChange.emit(value);
    if (!this.skipLocationCoordReset) {
      this.locationCoordsChange.emit({ lat: undefined, lng: undefined });
    }
    this.locationPanelOpen.set(true);
    this.jobPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
  }

  onRadiusChange(value: number): void {
    this.radiusChange.emit(Number.isFinite(value) ? value : DEFAULT_SEARCH_RADIUS_KM);
    this.closePanels();
    this.searchApply.emit();
  }

  toggleRadiusPanel(event: Event): void {
    event.stopPropagation();
    const nextOpen = !this.radiusPanelOpen();
    this.radiusPanelOpen.set(nextOpen);
    this.jobPanelOpen.set(false);
    this.locationPanelOpen.set(false);
  }

  selectRadius(radius: number): void {
    this.onRadiusChange(radius);
    this.radiusPanelOpen.set(false);
  }

  onJobFocus(): void {
    if (this.searchQuery().trim().length >= 2) {
      this.jobPanelOpen.set(true);
    }
    this.locationPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
  }

  onLocationFocus(): void {
    this.locationPanelOpen.set(true);
    this.jobPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
  }

  selectJobSuggestion(suggestion: JobSearchSuggestion): void {
    this.searchQueryChange.emit(suggestion.value);
    this.closePanels();
    this.searchApply.emit();
  }

  selectLocationSuggestion(suggestion: LocationSearchSuggestion): void {
    this.skipLocationCoordReset = true;
    this.locationQueryChange.emit(suggestion.city);
    this.locationCoordsChange.emit({
      lat: suggestion.latitude,
      lng: suggestion.longitude,
    });
    this.closePanels();
    this.searchApply.emit();
    queueMicrotask(() => {
      this.skipLocationCoordReset = false;
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.closePanels();
    this.searchApply.emit();
  }

  suggestionKindLabel(kind: JobSearchSuggestion['kind']): string {
    switch (kind) {
      case 'title':
        return 'Role';
      case 'company':
        return 'Company';
      case 'skill':
        return 'Skill';
      default:
        return 'Keyword';
    }
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closePanels();
    }
  }

  private closePanels(): void {
    this.jobPanelOpen.set(false);
    this.locationPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
  }
}
