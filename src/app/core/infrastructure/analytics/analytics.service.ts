import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, effect, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { FIREBASE } from '@core/infrastructure/firebase/firebase.providers';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import {
  Analytics,
  getAnalytics,
  isSupported,
  logEvent,
  setUserId,
  type EventParams,
} from 'firebase/analytics';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly firebase = inject(FIREBASE);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private analytics: Analytics | null = null;
  private readonly ready: Promise<void>;
  private routerTrackingStarted = false;

  constructor() {
    this.ready = this.initAnalytics();
    this.bindAuthUserId();
  }

  startRouterTracking(): void {
    if (this.routerTrackingStarted || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.routerTrackingStarted = true;

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        void this.logPageView(event.urlAfterRedirects);
      });
  }

  async logPageView(path: string, title = document.title): Promise<void> {
    await this.logEvent('page_view', {
      page_path: path,
      page_title: title,
      page_location: this.pageLocation(path),
    });
  }

  async logEvent(eventName: string, eventParams?: EventParams): Promise<void> {
    await this.ready;

    if (!this.analytics) {
      return;
    }

    logEvent(this.analytics, eventName, eventParams);
  }

  private async initAnalytics(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !environment.firebase.measurementId) {
      return;
    }

    if (!(await isSupported())) {
      return;
    }

    this.analytics = getAnalytics(this.firebase.app);
  }

  private bindAuthUserId(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    effect(() => {
      void this.syncUserId(this.auth.userId());
    });
  }

  private async syncUserId(userId: string | null): Promise<void> {
    await this.ready;

    if (!this.analytics) {
      return;
    }

    setUserId(this.analytics, userId);
  }

  private pageLocation(path: string): string {
    const siteRoot = environment.siteUrl.replace(/\/$/, '');

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${siteRoot}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
