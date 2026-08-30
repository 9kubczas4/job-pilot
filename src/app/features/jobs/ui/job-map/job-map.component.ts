import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  NgZone,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { GoogleMap } from '@angular/google-maps';
import { Cluster, MarkerClusterer } from '@googlemaps/markerclusterer';
import { AppLinks } from '@core/app-paths';
import { ResolvedTheme, ThemeService } from '@core/infrastructure/theme/theme.service';
import { GOOGLE_MAPS_API_KEY } from '@shared/map/google-maps-config';
import { isGoogleMapsConfigured } from '@shared/map/google-maps-loader';
import { createClusterMarkerIcon, createJobMarkerIcon } from '@shared/map/google-maps-markers';
import { DEFAULT_SEARCH_RADIUS_KM } from '../../domain/header-search.model';
import { getMapStylesForTheme } from '@shared/map/google-maps-styles';
import { JobLocation, JobOffer } from '../../domain/job.model';
import {
  buildJobMapPopupHtml,
} from './job-map-popup';

const DEFAULT_CENTER = { lat: 51.9194, lng: 19.1451 };
const DEFAULT_ZOOM = 5;
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
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly theme = inject(ThemeService);

  readonly jobs = input<JobOffer[]>([]);
  readonly selectedJobId = input<string | null>(null);
  readonly searchCenter = input<google.maps.LatLngLiteral | null>(null);
  readonly searchRadiusKm = input<number | undefined>(undefined);
  readonly showPopups = input(true);
  readonly selectJob = output<string>();

  readonly mapsConfigured = isGoogleMapsConfigured(this.apiKey);
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
  private mapAnimationFrame: number | null = null;

  constructor() {
    this.mapTheme = this.theme.resolved();
    this.mapOptions = this.buildMapOptions(this.mapTheme);

    effect(() => {
      const theme = this.theme.resolved();
      this.applyMapTheme(theme);
    });

    effect(() => {
      const jobs = this.jobs();
      const selectedId = this.selectedJobId();
      const searchCenter = this.searchCenter();
      const searchRadiusKm = this.searchRadiusKm();
      this.syncMap(jobs, selectedId, searchCenter, searchRadiusKm);
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
    );
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
  ): void {
    if (!this.map || !this.clusterer) {
      return;
    }

    const locatedJobs = jobs.filter((job) => job.location);
    const jobIdsKey = locatedJobs
      .map((job) => job.id)
      .sort()
      .join(',');
    const searchCenterKey = searchCenter
      ? `${searchCenter.lat},${searchCenter.lng},${searchRadiusKm ?? DEFAULT_SEARCH_RADIUS_KM}`
      : '';

    const jobsChanged = jobIdsKey !== this.lastJobIdsKey;
    const searchCenterChanged = searchCenterKey !== this.lastSearchCenterKey;

    if (jobsChanged) {
      this.lastJobIdsKey = jobIdsKey;
      this.rebuildMarkers(locatedJobs, selectedId);
    } else {
      this.updateMarkerSelection(selectedId);
    }

    if (jobsChanged || searchCenterChanged) {
      this.lastSearchCenterKey = searchCenterKey;
      if (locatedJobs.length) {
        this.fitBoundsToJobs(locatedJobs);
      } else if (searchCenter) {
        this.focusOnSearchCenter(searchCenter, searchRadiusKm);
      } else {
        this.resetToDefaultView();
      }
    }
  }

  private rebuildMarkers(locatedJobs: JobOffer[], selectedId: string | null): void {
    this.clusterer?.clearMarkers();

    for (const marker of this.markers.values()) {
      marker.setMap(null);
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
    this.syncMap(
      this.jobs(),
      this.selectedJobId(),
      this.searchCenter(),
      this.searchRadiusKm(),
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
    radiusKm: number | undefined,
  ): void {
    this.animateTo(center, this.zoomForRadiusKm(radiusKm ?? DEFAULT_SEARCH_RADIUS_KM));
  }

  private resetToDefaultView(): void {
    this.animateTo(DEFAULT_CENTER, DEFAULT_ZOOM);
  }

  private zoomForRadiusKm(radiusKm: number): number {
    if (radiusKm <= 10) {
      return 12;
    }
    if (radiusKm <= 25) {
      return 11;
    }
    if (radiusKm <= 50) {
      return 10;
    }
    if (radiusKm <= 100) {
      return 9;
    }
    return 8;
  }

  private focusOnCluster(cluster: Cluster): void {
    const map = this.map;
    if (!map) {
      return;
    }

    const center = cluster.bounds?.getCenter() ?? cluster.position;
    const currentZoom = map.getZoom() ?? DEFAULT_ZOOM;
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
      return DEFAULT_ZOOM;
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

    if (this.mapAnimationFrame != null) {
      cancelAnimationFrame(this.mapAnimationFrame);
      this.mapAnimationFrame = null;
    }

    const startCenter = map.getCenter();
    if (!startCenter) {
      return;
    }

    const startLat = startCenter.lat();
    const startLng = startCenter.lng();
    const startZoom = map.getZoom() ?? DEFAULT_ZOOM;
    const startTime = performance.now();

    const step = (now: number) => {
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

  private openJobPopup(job: JobOffer, marker: google.maps.Marker): void {
    this.infoWindow?.setContent(buildJobMapPopupHtml(job));
    this.infoWindow?.open({ map: this.map!, anchor: marker });
    this.attachPopupNavigation(job);
  }

  private attachPopupNavigation(job: JobOffer): void {
    if (!this.infoWindow) {
      return;
    }

    google.maps.event.addListenerOnce(this.infoWindow, 'domready', () => {
      const popup = document.querySelector(`[data-job-map-popup="${job.id}"]`);
      if (!(popup instanceof HTMLElement)) {
        return;
      }

      const infoWindowRoot = popup.closest('.gm-style-iw');
      const popupTail = this.findInfoWindowTail(popup);

      const setHovered = (hovered: boolean) => {
        infoWindowRoot?.classList.toggle('job-map-popup--hovered', hovered);
        popupTail?.classList.toggle('job-map-popup-tail--hovered', hovered);
      };

      popup.addEventListener('mouseenter', () => setHovered(true));
      popup.addEventListener('mouseleave', () => setHovered(false));

      popup.addEventListener('click', () => {
        this.ngZone.run(() => {
          void this.router.navigate(AppLinks.job(job.id));
        });
      });

      popup.addEventListener('keydown', (event) => {
        if (event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          this.ngZone.run(() => {
            void this.router.navigate(AppLinks.job(job.id));
          });
        }
      });
    });
  }

  private closeJobPopup(): void {
    this.infoWindow?.close();
  }

  private findInfoWindowTail(popup: HTMLElement): HTMLElement | null {
    const infoWindow = popup.closest('.gm-style-iw');
    const anchor = infoWindow?.parentElement;
    const tail = anchor?.querySelector('.gm-style-iw-tc');
    return tail instanceof HTMLElement ? tail : null;
  }

  private fitBoundsToJobs(locatedJobs: JobOffer[]): void {
    if (!this.map || !locatedJobs.length) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    locatedJobs.forEach((job) =>
      bounds.extend({ lat: job.location!.latitude, lng: job.location!.longitude }),
    );
    this.map.fitBounds(bounds, 48);

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      const zoom = this.map?.getZoom();
      if (zoom != null && zoom > 11) {
        this.map?.setZoom(11);
      }
    });
  }

  private buildMapOptions(theme: ResolvedTheme): google.maps.MapOptions {
    return {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      ...this.getMapThemeOptions(theme),
      clickableIcons: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    };
  }
}
