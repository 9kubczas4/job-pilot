import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  NgZone,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GoogleMap } from '@angular/google-maps';
import { Cluster, MarkerClusterer } from '@googlemaps/markerclusterer';
import { AppLinks } from '@core/app-paths';
import { ResolvedTheme, ThemeService } from '@core/infrastructure/theme/theme.service';
import { GOOGLE_MAPS_API_KEY } from '@shared/map/google-maps-config';
import { getMapDefaultView } from '@shared/map/map-default-region';
import { resolveMapResultsViewport, type MapGeoBounds } from '@shared/map/map-results-viewport';
import { isGoogleMapsConfigured, loadGoogleMapsApi } from '@shared/map/google-maps-loader';
import { createClusterMarkerIcon, createJobMarkerIcon } from '@shared/map/google-maps-markers';
import { UserMapRegionService } from '@shared/map/user-map-region.service';
import { DEFAULT_SEARCH_RADIUS_MI } from '@features/jobs/domain/header-search.model';
import { getMapStylesForTheme } from '@shared/map/google-maps-styles';
import { JobLocation, JobOffer } from '@features/jobs/domain/job.model';
import { JobHighlightRequest } from '@features/jobs/domain/job-highlight.model';
import {
  buildJobMapPopupHtml,
} from './job-map-popup';

const MARKER_FOCUS_ZOOM = 13;
const ZOOM_ANIMATION_MS = 500;
const CLUSTER_ZOOM_PADDING_PX = 80;

@Component({
  selector: 'app-job-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GoogleMap],
  templateUrl: './job-map.component.html',
  styleUrl: './job-map.component.scss',
})
export class JobMapComponent {
  private readonly apiKey = inject(GOOGLE_MAPS_API_KEY, { optional: true }) ?? '';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly theme = inject(ThemeService);
  private readonly userMapRegion = inject(UserMapRegionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly jobs = input<JobOffer[]>([]);
  readonly selectedJobId = input<string | null>(null);
  readonly searchCenter = input<google.maps.LatLngLiteral | null>(null);
  readonly searchRadiusKm = input<number | undefined>(undefined);
  readonly fitResultsToViewport = input(false);
  readonly showPopups = input(true);
  readonly highlightRequest = input<JobHighlightRequest | null>(null);
  readonly selectJob = output<string>();

  readonly mapsConfigured = isGoogleMapsConfigured(this.apiKey);
  readonly mapsApiReady = signal(!isGoogleMapsConfigured(this.apiKey));
  readonly mapError = signal(false);
  readonly mapOptions: google.maps.MapOptions;

  private mapTheme: ResolvedTheme = 'light';

  private map: google.maps.Map | null = null;
  private infoWindow: google.maps.InfoWindow | null = null;
  private clusterer: MarkerClusterer | null = null;
  private readonly markers = new globalThis.Map<string, google.maps.Marker>();
  private readonly markerJobs = new globalThis.Map<google.maps.Marker, JobOffer>();
  private lastJobIdsKey = '';
  private lastSearchCenterKey = '';
  private lastViewportKey = '';
  private lastHighlightRequestId = 0;
  private mapAnimationFrame: number | null = null;
  private popupAbortController: AbortController | null = null;
  private activeAiPopupJobId: string | null = null;
  private prefersReducedMotion = false;
  private isDestroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.destroyMapResources());
    this.userMapRegion.detectRegion();
    this.mapTheme = this.theme.resolved();
    this.mapOptions = this.buildMapOptions(this.mapTheme);

    if (isPlatformBrowser(this.platformId) && this.mapsConfigured) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const syncMotionPreference = () => {
        this.prefersReducedMotion = motionQuery.matches;
      };
      syncMotionPreference();
      motionQuery.addEventListener('change', syncMotionPreference);
      this.destroyRef.onDestroy(() =>
        motionQuery.removeEventListener('change', syncMotionPreference),
      );

      afterNextRender(() => {
        void loadGoogleMapsApi(this.apiKey)
          .then(() => this.mapsApiReady.set(true))
          .catch(() => this.mapError.set(true));
      });
    }

    effect(() => {
      const theme = this.theme.resolved();
      this.applyMapTheme(theme);
    });

    effect(() => {
      const jobs = this.jobs();
      const selectedId = this.selectedJobId();
      const searchCenter = this.searchCenter();
      const searchRadiusKm = this.searchRadiusKm();
      const fitResultsToViewport = this.fitResultsToViewport();
      const highlightRequest = this.highlightRequest();
      this.syncMap(jobs, selectedId, searchCenter, searchRadiusKm, fitResultsToViewport);
      this.applyHighlightRequest(highlightRequest);
    });

    effect(() => {
      this.userMapRegion.region();
      if (!this.map || !this.clusterer) {
        return;
      }

      if (this.shouldUseDefaultRegionView(this.searchCenter(), this.fitResultsToViewport())) {
        this.resetToDefaultView();
      }
    });
  }

  onMapReady(map: google.maps.Map): void {
    this.map = map;
    map.setOptions(this.getMapThemeOptions(this.mapTheme));
    this.infoWindow = new google.maps.InfoWindow({
      maxWidth: 320,
      disableAutoPan: true,
    });
    map.addListener('click', () => this.closeJobPopup());
    this.clusterer = new MarkerClusterer({
      map,
      markers: [],
      onClusterClick: (_event, cluster) => {
        this.closeJobPopup();
        this.focusOnCluster(cluster);
      },
      renderer: {
        render: ({ count, position }) =>
          new google.maps.Marker({
            position,
            icon: createClusterMarkerIcon(count, this.mapTheme),
            zIndex: 1000 + count,
          }),
      },
    });
    this.syncMap(
      this.jobs(),
      this.selectedJobId(),
      this.searchCenter(),
      this.searchRadiusKm(),
      this.fitResultsToViewport(),
    );
    this.applyHighlightRequest(this.highlightRequest());
  }

  onAuthFailure(): void {
    this.mapError.set(true);
  }

  notifyVisible(): void {
    if (!this.map) {
      return;
    }

    google.maps.event.trigger(this.map, 'resize');
  }

  private syncMap(
    jobs: JobOffer[],
    selectedId: string | null,
    searchCenter: google.maps.LatLngLiteral | null,
    searchRadiusKm: number | undefined,
    fitResultsToViewport: boolean,
  ): void {
    if (this.isDestroyed || !this.map || !this.clusterer) {
      return;
    }

    const locatedJobs = jobs.filter((job) => job.location);
    const jobIdsKey = locatedJobs
      .map((job) => job.id)
      .sort()
      .join(',');
    const searchCenterKey = searchCenter
      ? `${searchCenter.lat},${searchCenter.lng},${searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_MI}`
      : '';
    const viewportKey = fitResultsToViewport ? `fit:${jobIdsKey}` : searchCenterKey;

    const jobsChanged = jobIdsKey !== this.lastJobIdsKey;
    const searchCenterChanged = searchCenterKey !== this.lastSearchCenterKey;
    const viewportChanged = viewportKey !== this.lastViewportKey;

    if (jobsChanged) {
      this.lastJobIdsKey = jobIdsKey;
      this.rebuildMarkers(locatedJobs, selectedId);
    } else {
      this.updateMarkerSelection(selectedId);
    }

    if (jobsChanged || searchCenterChanged || viewportChanged) {
      this.lastSearchCenterKey = searchCenterKey;
      this.lastViewportKey = viewportKey;
      this.applyResultsViewport(locatedJobs, searchCenter, searchRadiusKm, fitResultsToViewport);
    }
  }

  private applyResultsViewport(
    locatedJobs: JobOffer[],
    searchCenter: google.maps.LatLngLiteral | null,
    searchRadiusKm: number | undefined,
    fitResultsToViewport: boolean,
  ): void {
    if (fitResultsToViewport && locatedJobs.length) {
      const locations = locatedJobs.map((job) => ({
        lat: job.location!.latitude,
        lng: job.location!.longitude,
      }));
      const viewport = resolveMapResultsViewport(locations);

      if (viewport.kind === 'world') {
        this.applyMapView(viewport.center, viewport.zoom);
        return;
      }

      if (viewport.kind === 'bounds') {
        this.fitBoundsToViewport(viewport.bounds);
        return;
      }
    }

    if (searchCenter) {
      this.focusOnSearchCenter(searchCenter, searchRadiusKm);
      return;
    }

    this.resetToDefaultView();
  }

  private rebuildMarkers(locatedJobs: JobOffer[], selectedId: string | null): void {
    this.clusterer?.clearMarkers();

    for (const marker of this.markers.values()) {
      this.disposeMarker(marker);
    }

    this.markers.clear();
    this.markerJobs.clear();

    const nextMarkers: google.maps.Marker[] = [];

    for (const job of locatedJobs) {
      const position = { lat: job.location!.latitude, lng: job.location!.longitude };
      const isSelected = job.id === selectedId;
      const marker = new google.maps.Marker({
        position,
        icon: createJobMarkerIcon(isSelected, this.mapTheme),
        title: `${job.title} · ${job.company.name}`,
        zIndex: isSelected ? 2 : 1,
      });

      marker.addListener('click', () => this.onMarkerClick(job, marker));

      this.markers.set(job.id, marker);
      this.markerJobs.set(marker, job);
      nextMarkers.push(marker);
    }

    this.clusterer?.addMarkers(nextMarkers);
  }

  private updateMarkerSelection(selectedId: string | null): void {
    for (const [jobId, marker] of this.markers.entries()) {
      const isSelected = jobId === selectedId;
      marker.setIcon(createJobMarkerIcon(isSelected, this.mapTheme));
      marker.setZIndex(isSelected ? 2 : 1);
    }
  }

  private applyMapTheme(theme: ResolvedTheme): void {
    const themeChanged = this.mapTheme !== theme;
    this.mapTheme = theme;

    if (!this.map) {
      return;
    }

    this.map.setOptions(this.getMapThemeOptions(theme));

    if (!themeChanged || !this.clusterer) {
      return;
    }

    this.closeJobPopup();
    this.lastJobIdsKey = '';
    this.lastSearchCenterKey = '';
    this.lastViewportKey = '';
    this.syncMap(
      this.jobs(),
      this.selectedJobId(),
      this.searchCenter(),
      this.searchRadiusKm(),
      this.fitResultsToViewport(),
    );
  }

  private getMapThemeOptions(theme: ResolvedTheme): Pick<
    google.maps.MapOptions,
    'styles' | 'colorScheme' | 'backgroundColor'
  > {
    const isDark = theme === 'dark';

    return {
      styles: getMapStylesForTheme(theme),
      colorScheme: isDark ? 'DARK' : 'LIGHT',
      backgroundColor: isDark ? '#0a1020' : '#f1f5f9',
    };
  }

  private onMarkerClick(job: JobOffer, marker: google.maps.Marker): void {
    this.selectJob.emit(job.id);
    if (job.location) {
      this.focusOnMarker(job.location);
    }

    if (!this.showPopups()) {
      return;
    }

    this.openJobPopup(job, marker);
  }

  private focusOnMarker(location: JobLocation): void {
    this.animateTo(
      { lat: location.latitude, lng: location.longitude },
      MARKER_FOCUS_ZOOM,
    );
  }

  private focusOnSearchCenter(
    center: google.maps.LatLngLiteral,
    radiusMi: number | undefined,
  ): void {
    this.animateTo(center, this.zoomForRadiusMi(radiusMi ?? DEFAULT_SEARCH_RADIUS_MI));
  }

  private resetToDefaultView(): void {
    const view = getMapDefaultView(this.userMapRegion.region());
    this.applyMapView(view.center, view.zoom);
  }

  private applyMapView(
    target: google.maps.LatLngLiteral,
    targetZoom: number,
    animate = true,
  ): void {
    const map = this.map;
    if (!map) {
      return;
    }

    const startCenter = map.getCenter();
    if (!startCenter || !animate) {
      map.setCenter(target);
      map.setZoom(targetZoom);
      return;
    }

    this.animateTo(target, targetZoom);
  }

  private zoomForRadiusMi(radiusMi: number): number {
    if (radiusMi <= 25) {
      return 11;
    }
    if (radiusMi <= 50) {
      return 10;
    }
    if (radiusMi <= 100) {
      return 9;
    }
    if (radiusMi <= 150) {
      return 8;
    }
    return 7;
  }

  private focusOnCluster(cluster: Cluster): void {
    const map = this.map;
    if (!map) {
      return;
    }

    const center = cluster.bounds?.getCenter() ?? cluster.position;
    const currentZoom = map.getZoom() ?? getMapDefaultView(this.userMapRegion.region()).zoom;
    const targetZoom = cluster.bounds
      ? this.getZoomForBounds(cluster.bounds, CLUSTER_ZOOM_PADDING_PX)
      : currentZoom + 2;

    this.animateTo(
      { lat: center.lat(), lng: center.lng() },
      Math.min(Math.max(targetZoom, currentZoom + 1), MARKER_FOCUS_ZOOM),
    );
  }

  private getZoomForBounds(bounds: google.maps.LatLngBounds, paddingPx: number): number {
    const map = this.map;
    if (!map) {
      return getMapDefaultView(this.userMapRegion.region()).zoom;
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const mapDiv = map.getDiv();
    const mapWidth = Math.max(mapDiv.offsetWidth - paddingPx * 2, 1);
    const mapHeight = Math.max(mapDiv.offsetHeight - paddingPx * 2, 1);

    const latFraction = (this.latRadians(ne.lat()) - this.latRadians(sw.lat())) / Math.PI;
    const lngDiff = ne.lng() - sw.lng();
    const lngFraction = ((lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360);

    const latZoom = this.zoomForFraction(mapHeight, latFraction);
    const lngZoom = this.zoomForFraction(mapWidth, lngFraction);

    return Math.min(latZoom, lngZoom, MARKER_FOCUS_ZOOM);
  }

  private latRadians(lat: number): number {
    const sin = Math.sin((lat * Math.PI) / 180);
    return Math.log((1 + sin) / (1 - sin)) / 2;
  }

  private zoomForFraction(mapPx: number, fraction: number): number {
    if (fraction <= 0) {
      return MARKER_FOCUS_ZOOM;
    }

    return Math.floor(Math.log(mapPx / 256 / fraction) / Math.LN2);
  }

  private animateTo(
    target: google.maps.LatLngLiteral,
    targetZoom: number,
    durationMs = ZOOM_ANIMATION_MS,
  ): void {
    const map = this.map;
    if (!map) {
      return;
    }

    if (this.prefersReducedMotion) {
      map.setCenter(target);
      map.setZoom(targetZoom);
      return;
    }

    if (this.mapAnimationFrame != null) {
      cancelAnimationFrame(this.mapAnimationFrame);
      this.mapAnimationFrame = null;
    }

    const startCenter = map.getCenter();
    if (!startCenter) {
      map.setCenter(target);
      map.setZoom(targetZoom);
      return;
    }

    const startLat = startCenter.lat();
    const startLng = startCenter.lng();
    const startZoom = map.getZoom() ?? getMapDefaultView(this.userMapRegion.region()).zoom;
    const startTime = performance.now();

    const step = (now: number) => {
      if (this.isDestroyed || !this.map) {
        this.mapAnimationFrame = null;
        return;
      }

      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;

      map.setCenter({
        lat: startLat + (target.lat - startLat) * eased,
        lng: startLng + (target.lng - startLng) * eased,
      });
      map.setZoom(Math.round(startZoom + (targetZoom - startZoom) * eased));

      if (progress < 1) {
        this.mapAnimationFrame = requestAnimationFrame(step);
      } else {
        this.mapAnimationFrame = null;
      }
    };

    this.mapAnimationFrame = requestAnimationFrame(step);
  }

  private applyHighlightRequest(request: JobHighlightRequest | null): void {
    if (!request) {
      if (this.activeAiPopupJobId) {
        this.closeJobPopup();
      }
      return;
    }

    if (request.requestId === this.lastHighlightRequestId) {
      return;
    }

    const marker = this.markers.get(request.jobId);
    const job = this.jobs().find((candidate) => candidate.id === request.jobId);
    if (!marker || !job?.location || !this.map || !this.infoWindow) {
      return;
    }

    this.lastHighlightRequestId = request.requestId;
    this.focusOnMarker(job.location);
    this.openJobPopup(job, marker, true);
  }

  private openJobPopup(
    job: JobOffer,
    marker: google.maps.Marker,
    aiHighlighted = false,
  ): void {
    this.activeAiPopupJobId = aiHighlighted ? job.id : null;
    this.infoWindow?.setContent(buildJobMapPopupHtml(job, { aiHighlighted }));
    this.infoWindow?.open({ map: this.map!, anchor: marker });
    this.attachPopupNavigation(job);
  }

  private attachPopupNavigation(job: JobOffer): void {
    if (!this.infoWindow) {
      return;
    }

    this.popupAbortController?.abort();
    this.popupAbortController = new AbortController();
    const { signal } = this.popupAbortController;

    google.maps.event.addListenerOnce(this.infoWindow, 'domready', () => {
      if (signal.aborted || this.isDestroyed) {
        return;
      }

      const popup = document.querySelector(`[data-job-map-popup="${CSS.escape(job.id)}"]`);
      if (!(popup instanceof HTMLElement)) {
        return;
      }

      const infoWindowRoot = popup.closest('.gm-style-iw');
      const popupTail = this.findInfoWindowTail(popup);

      const setHovered = (hovered: boolean) => {
        infoWindowRoot?.classList.toggle('job-map-popup--hovered', hovered);
        popupTail?.classList.toggle('job-map-popup-tail--hovered', hovered);
      };

      popup.addEventListener('mouseenter', () => setHovered(true), { signal });
      popup.addEventListener('mouseleave', () => setHovered(false), { signal });

      popup.addEventListener(
        'click',
        () => {
          this.ngZone.run(() => {
            this.router.navigate(AppLinks.job(job.id));
          });
        },
        { signal },
      );

      popup.addEventListener(
        'keydown',
        (event) => {
          if (event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            this.ngZone.run(() => {
              this.router.navigate(AppLinks.job(job.id));
            });
          }
        },
        { signal },
      );
    });
  }

  private shouldUseDefaultRegionView(
    searchCenter: google.maps.LatLngLiteral | null,
    fitResultsToViewport: boolean,
  ): boolean {
    return !searchCenter && !fitResultsToViewport;
  }

  private closeJobPopup(): void {
    this.activeAiPopupJobId = null;
    this.infoWindow?.close();
  }

  private findInfoWindowTail(popup: HTMLElement): HTMLElement | null {
    const infoWindow = popup.closest('.gm-style-iw');
    const anchor = infoWindow?.parentElement;
    const tail = anchor?.querySelector('.gm-style-iw-tc');
    return tail instanceof HTMLElement ? tail : null;
  }

  private fitBoundsToViewport(bounds: MapGeoBounds, paddingPx = 48): void {
    if (!this.map) {
      return;
    }

    const googleBounds = new google.maps.LatLngBounds(
      { lat: bounds.south, lng: bounds.west },
      { lat: bounds.north, lng: bounds.east },
    );
    this.map.fitBounds(googleBounds, paddingPx);

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      if (this.isDestroyed || !this.map) {
        return;
      }

      const zoom = this.map.getZoom();
      if (zoom != null && zoom > 11) {
        this.map.setZoom(11);
      }
    });
  }

  private disposeMarker(marker: google.maps.Marker): void {
    google.maps.event.clearInstanceListeners(marker);
    marker.setMap(null);
  }

  private destroyMapResources(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;
    this.popupAbortController?.abort();
    this.popupAbortController = null;

    if (this.mapAnimationFrame != null) {
      cancelAnimationFrame(this.mapAnimationFrame);
      this.mapAnimationFrame = null;
    }

    this.infoWindow?.close();
    if (this.infoWindow) {
      google.maps.event.clearInstanceListeners(this.infoWindow);
      this.infoWindow = null;
    }

    this.clusterer?.clearMarkers();
    this.clusterer?.setMap(null);
    this.clusterer = null;

    for (const marker of this.markers.values()) {
      this.disposeMarker(marker);
    }

    this.markers.clear();
    this.markerJobs.clear();

    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
      this.map = null;
    }
  }

  private buildMapOptions(theme: ResolvedTheme): google.maps.MapOptions {
    const defaultView = getMapDefaultView();

    return {
      center: defaultView.center,
      zoom: defaultView.zoom,
      ...this.getMapThemeOptions(theme),
      clickableIcons: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    };
  }
}
