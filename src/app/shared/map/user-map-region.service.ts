import { isPlatformBrowser } from '@angular/common';
import { Injectable, NgZone, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  MapDefaultRegion,
  resolveMapRegionFromCoords,
} from './map-default-region';

const GEOLOCATION_TIMEOUT_MS = 5_000;
const GEOLOCATION_MAX_AGE_MS = 600_000;

@Injectable({ providedIn: 'root' })
export class UserMapRegionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  readonly region = signal<MapDefaultRegion>('us');

  private detectionStarted = false;

  detectRegion(): void {
    if (this.detectionStarted || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.detectionStarted = true;

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.ngZone.run(() => {
          this.region.set(
            resolveMapRegionFromCoords(position.coords.latitude, position.coords.longitude),
          );
        });
      },
      () => {
        // Keep the default US region when permission is denied or lookup fails.
      },
      {
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAX_AGE_MS,
      },
    );
  }
}
