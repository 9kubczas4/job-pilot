import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { GOOGLE_MAPS_API_KEY } from '@shared/map/google-maps-config';
import { isGoogleMapsConfigured } from '@shared/map/google-maps-loader';
import { createClusterMarkerIcon, createJobMarkerIcon } from '@shared/map/google-maps-markers';
import { MONOCHROME_MAP_STYLES } from '@shared/map/google-maps-styles';
import { JobOffer } from '../../domain/job.model';
import { buildJobMapPopupHtml } from './job-map-popup';

const DEFAULT_CENTER = { lat: 51.9194, lng: 19.1451 };
const DEFAULT_ZOOM = 5;

@Component({
  selector: 'app-job-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GoogleMap],
  templateUrl: './job-map.component.html',
  styleUrl: './job-map.component.scss',
})
export class JobMapComponent {
  private readonly apiKey = inject(GOOGLE_MAPS_API_KEY, { optional: true }) ?? '';

  readonly jobs = input<JobOffer[]>([]);
  readonly selectedJobId = input<string | null>(null);
  readonly selectJob = output<string>();

  readonly mapsConfigured = isGoogleMapsConfigured(this.apiKey);
  readonly mapError = signal(false);

  readonly mapOptions: google.maps.MapOptions = {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    styles: MONOCHROME_MAP_STYLES,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  };

  private map: google.maps.Map | null = null;
  private infoWindow: google.maps.InfoWindow | null = null;
  private clusterer: MarkerClusterer | null = null;
  private readonly markers = new globalThis.Map<string, google.maps.Marker>();
  private readonly markerJobs = new globalThis.Map<google.maps.Marker, JobOffer>();
  private lastJobIdsKey = '';
  private lastSelectedJobId: string | null = null;

  constructor() {
    effect(() => {
      const jobs = this.jobs();
      const selectedId = this.selectedJobId();
      this.syncMap(jobs, selectedId);
    });
  }

  onMapReady(map: google.maps.Map): void {
    this.map = map;
    this.infoWindow = new google.maps.InfoWindow({
      maxWidth: 320,
    });
    this.clusterer = new MarkerClusterer({
      map,
      markers: [],
      renderer: {
        render: ({ count, position }) =>
          new google.maps.Marker({
            position,
            icon: createClusterMarkerIcon(count),
            zIndex: 1000 + count,
          }),
      },
    });
    this.syncMap(this.jobs(), this.selectedJobId());
  }

  onAuthFailure(): void {
    this.mapError.set(true);
  }

  private syncMap(jobs: JobOffer[], selectedId: string | null): void {
    if (!this.map || !this.clusterer) {
      return;
    }

    const locatedJobs = jobs.filter((job) => job.location);
    const jobIdsKey = locatedJobs
      .map((job) => job.id)
      .sort()
      .join(',');

    if (jobIdsKey !== this.lastJobIdsKey) {
      this.lastJobIdsKey = jobIdsKey;
      this.rebuildMarkers(locatedJobs, selectedId);
      this.fitBoundsToJobs(locatedJobs);
    } else {
      this.updateMarkerSelection(selectedId);
    }

    if (selectedId !== this.lastSelectedJobId) {
      this.lastSelectedJobId = selectedId;
      this.openSelectedJobPopup(selectedId);
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
        icon: createJobMarkerIcon(isSelected),
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
      marker.setIcon(createJobMarkerIcon(isSelected));
      marker.setZIndex(isSelected ? 2 : 1);
    }
  }

  private onMarkerClick(job: JobOffer, marker: google.maps.Marker): void {
    this.selectJob.emit(job.id);
    this.openJobPopup(job, marker);
  }

  private openSelectedJobPopup(selectedId: string | null): void {
    if (!selectedId) {
      return;
    }

    const marker = this.markers.get(selectedId);
    const job = marker ? this.markerJobs.get(marker) : undefined;
    if (marker && job) {
      this.openJobPopup(job, marker);
    }
  }

  private openJobPopup(job: JobOffer, marker: google.maps.Marker): void {
    this.infoWindow?.setContent(buildJobMapPopupHtml(job));
    this.infoWindow?.open({ map: this.map!, anchor: marker });
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
}
