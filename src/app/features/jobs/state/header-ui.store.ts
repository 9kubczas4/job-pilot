import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  JobSearchSuggestion,
  LocationSearchSuggestion,
} from '@features/jobs/domain/header-search.model';
import { JobSearchCriteria } from '@features/jobs/domain/search.model';

const HIDE_SCROLL_ACCUMULATED_PX = 56;
const SHOW_SCROLL_ACCUMULATED_PX = 20;
const MIN_SCROLL_TOP_TO_HIDE_PX = 72;
const AI_TOOL_ACTIVITY_LINGER_MS = 1200;
const AI_TOOL_ACTIVITY_TARGETS = ['query', 'location', 'radius', 'filters', 'sort'] as const;

export type JobSearchAiActivity = (typeof AI_TOOL_ACTIVITY_TARGETS)[number];

@Injectable({ providedIn: 'root' })
export class HeaderUiStore {
  readonly filtersOpen = signal(false);
  readonly filtersEnabled = signal(false);
  readonly searchQuery = signal('');
  readonly locationQuery = signal('');
  readonly locationLat = signal<number | undefined>(undefined);
  readonly locationLng = signal<number | undefined>(undefined);
  readonly radiusKm = signal(DEFAULT_SEARCH_RADIUS_KM);
  readonly jobSuggestions = signal<JobSearchSuggestion[]>([]);
  readonly locationSuggestions = signal<LocationSearchSuggestion[]>([]);
  readonly activeFilterCount = signal(0);
  readonly searchApplyTrigger = signal(0);
  readonly mobileSearchCloseRequest = signal(0);
  readonly headerHidden = signal(false);
  readonly queryToolActive = signal(false);
  readonly locationToolActive = signal(false);
  readonly radiusToolActive = signal(false);
  readonly filterToolActive = signal(false);
  readonly sortToolActive = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private lastScrollTop = 0;
  private scrollAccumulator = 0;
  private pendingScrollTop: number | null = null;
  private scrollFrameId: number | null = null;
  private readonly activityTokens: Record<JobSearchAiActivity, number> = {
    query: 0,
    location: 0,
    radius: 0,
    filters: 0,
    sort: 0,
  };
  private readonly activityTimers: Record<
    JobSearchAiActivity,
    ReturnType<typeof setTimeout> | null
  > = {
    query: null,
    location: null,
    radius: null,
    filters: null,
    sort: null,
  };

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const target of AI_TOOL_ACTIVITY_TARGETS) {
        this.clearActivityTimer(target);
      }
    });
  }

  beginAiToolActivity(activities: readonly JobSearchAiActivity[]): () => void {
    const activeTokens = [...new Set(activities)].map((activity) => {
      this.clearActivityTimer(activity);
      const token = ++this.activityTokens[activity];
      this.activitySignal(activity).set(true);
      return { activity, token };
    });

    return () => {
      for (const { activity, token } of activeTokens) {
        if (this.activityTokens[activity] !== token) {
          continue;
        }

        this.activityTimers[activity] = setTimeout(() => {
          if (this.activityTokens[activity] === token) {
            this.activitySignal(activity).set(false);
          }
          this.activityTimers[activity] = null;
        }, AI_TOOL_ACTIVITY_LINGER_MS);
      }
    };
  }

  applySearch(): void {
    this.searchApplyTrigger.update((value) => value + 1);
  }

  requestMobileSearchClose(): void {
    this.mobileSearchCloseRequest.update((value) => value + 1);
  }

  syncFromCriteria(criteria: JobSearchCriteria): void {
    this.searchQuery.set(criteria.query ?? '');
    this.locationQuery.set(criteria.locations?.[0] ?? '');
    this.locationLat.set(criteria.locationLat);
    this.locationLng.set(criteria.locationLng);
    this.radiusKm.set(criteria.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM);
  }

  openFilters(): void {
    this.filtersOpen.set(true);
    this.showHeader();
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
    if (this.filtersOpen()) {
      this.showHeader();
    }
  }

  enableFilters(): void {
    this.filtersEnabled.set(true);
  }

  disableFilters(): void {
    this.filtersEnabled.set(false);
    this.filtersOpen.set(false);
  }

  reportScrollPosition(scrollTop: number): void {
    this.pendingScrollTop = scrollTop;

    if (this.scrollFrameId != null || typeof requestAnimationFrame !== 'function') {
      if (this.scrollFrameId == null) {
        this.applyScrollPosition(scrollTop);
      }
      return;
    }

    this.scrollFrameId = requestAnimationFrame(() => {
      this.scrollFrameId = null;
      const nextScrollTop = this.pendingScrollTop;
      this.pendingScrollTop = null;

      if (nextScrollTop != null) {
        this.applyScrollPosition(nextScrollTop);
      }
    });
  }

  showHeader(): void {
    this.headerHidden.set(false);
    this.scrollAccumulator = 0;
  }

  resetScrollTracking(scrollTop = 0): void {
    this.lastScrollTop = scrollTop;
    this.scrollAccumulator = 0;
    this.headerHidden.set(false);
  }

  private applyScrollPosition(scrollTop: number): void {
    if (scrollTop <= 0) {
      this.headerHidden.set(false);
      this.scrollAccumulator = 0;
      this.lastScrollTop = scrollTop;
      return;
    }

    const delta = scrollTop - this.lastScrollTop;
    this.lastScrollTop = scrollTop;

    if (Math.abs(delta) < 1) {
      return;
    }

    if ((delta > 0 && this.scrollAccumulator < 0) || (delta < 0 && this.scrollAccumulator > 0)) {
      this.scrollAccumulator = 0;
    }

    this.scrollAccumulator += delta;

    if (this.scrollAccumulator >= HIDE_SCROLL_ACCUMULATED_PX && scrollTop > MIN_SCROLL_TOP_TO_HIDE_PX) {
      this.headerHidden.set(true);
      this.scrollAccumulator = 0;
      return;
    }

    if (this.scrollAccumulator <= -SHOW_SCROLL_ACCUMULATED_PX) {
      this.headerHidden.set(false);
      this.scrollAccumulator = 0;
    }
  }

  private activitySignal(activity: JobSearchAiActivity): WritableSignal<boolean> {
    switch (activity) {
      case 'query':
        return this.queryToolActive;
      case 'location':
        return this.locationToolActive;
      case 'radius':
        return this.radiusToolActive;
      case 'filters':
        return this.filterToolActive;
      case 'sort':
        return this.sortToolActive;
    }
  }

  private clearActivityTimer(activity: JobSearchAiActivity): void {
    const timer = this.activityTimers[activity];
    if (timer) {
      clearTimeout(timer);
      this.activityTimers[activity] = null;
    }
  }
}
