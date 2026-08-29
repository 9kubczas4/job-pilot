import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { Map as MaplibreMap, Marker } from 'maplibre-gl';
import { JobOffer } from '../../domain/job.model';

@Component({
  selector: 'app-job-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-map.component.html',
  styleUrl: './job-map.component.scss',
})
export class JobMapComponent implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  readonly jobs = input<JobOffer[]>([]);
  readonly selectedJobId = input<string | null>(null);
  readonly selectJob = output<string>();

  private map: MaplibreMap | null = null;
  private markers = new globalThis.Map<string, Marker>();

  constructor() {
    effect(() => {
      const jobs = this.jobs();
      const selectedId = this.selectedJobId();
      this.renderMarkers(jobs, selectedId);
    });
  }

  ngAfterViewInit(): void {
    this.map = new maplibregl.Map({
      container: this.host().nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [19.1451, 51.9194],
      zoom: 5,
    });

    this.map!.addControl(new maplibregl.NavigationControl(), 'top-right');
    this.renderMarkers(this.jobs(), this.selectedJobId());
  }

  ngOnDestroy(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();
    this.map?.remove();
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
      const isSelected = job.id === selectedId;
      let marker = this.markers.get(job.id);

      if (!marker) {
        marker = new maplibregl.Marker({ color: isSelected ? '#2563eb' : '#64748b' })
          .setLngLat([job.location.longitude, job.location.latitude])
          .setPopup(new maplibregl.Popup().setText(`${job.title} · ${job.company.name}`))
          .addTo(this.map);

        marker.getElement().addEventListener('click', () => {
          this.selectJob.emit(job.id);
        });

        this.markers.set(job.id, marker);
      } else {
        marker.setLngLat([job.location.longitude, job.location.latitude]);
      }
    }

    for (const [jobId, marker] of this.markers.entries()) {
      if (!nextIds.has(jobId)) {
        marker.remove();
        this.markers.delete(jobId);
      }
    }

    const locatedJobs = jobs.filter((job) => job.location);
    if (locatedJobs.length) {
      const bounds = new maplibregl.LngLatBounds();
      locatedJobs.forEach((job) =>
        bounds.extend([job.location!.longitude, job.location!.latitude]),
      );
      this.map.fitBounds(bounds, { padding: 48, maxZoom: 11 });
    }
  }
}
