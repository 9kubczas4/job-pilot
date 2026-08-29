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
import { GOOGLE_MAPS_API_KEY } from '@shared/map/google-maps-config';
import { isGoogleMapsConfigured } from '@shared/map/google-maps-loader';
import { JobOffer } from '../../domain/job.model';

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
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  };

  private map: google.maps.Map | null = null;
  private infoWindow: google.maps.InfoWindow | null = null;
  private readonly markers = new globalThis.Map<string, google.maps.Marker>();

  constructor() {
    effect(() => {
      const jobs = this.jobs();
      const selectedId = this.selectedJobId();
      this.renderMarkers(jobs, selectedId);
    });
  }

  onMapReady(map: google.maps.Map): void {
    this.map = map;
    this.infoWindow = new google.maps.InfoWindow();
    this.renderMarkers(this.jobs(), this.selectedJobId());
  }

  onAuthFailure(): void {
    this.mapError.set(true);
  }

  private renderMarkers(jobs: JobOffer[], selectedId: string | null): void {
    if (!this.map) {
      return;
    }

    const nextIds = new Set<string>();

    for (const job of jobs) {
      if (!job.location) {
        continue;
      }

      nextIds.add(job.id);
      const position = { lat: job.location.latitude, lng: job.location.longitude };
      const isSelected = job.id === selectedId;
      let marker = this.markers.get(job.id);

      if (!marker) {
        marker = new google.maps.Marker({
          map: this.map,
          position,
          title: `${job.title} · ${job.company.name}`,
          icon: this.createMarkerIcon(isSelected),
        });

        marker.addListener('click', () => {
          this.selectJob.emit(job.id);
          this.infoWindow?.setContent(`<strong>${job.title}</strong><br>${job.company.name}`);
          this.infoWindow?.open({ map: this.map!, anchor: marker });
        });

        this.markers.set(job.id, marker);
      } else {
        marker.setPosition(position);
        marker.setIcon(this.createMarkerIcon(isSelected));
      }
    }

    for (const [jobId, marker] of this.markers.entries()) {
      if (!nextIds.has(jobId)) {
        marker.setMap(null);
        this.markers.delete(jobId);
      }
    }

    const locatedJobs = jobs.filter((job) => job.location);
    if (!locatedJobs.length) {
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

  private createMarkerIcon(isSelected: boolean): google.maps.Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isSelected ? '#2563eb' : '#64748b',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: isSelected ? 9 : 7,
    };
  }
}
