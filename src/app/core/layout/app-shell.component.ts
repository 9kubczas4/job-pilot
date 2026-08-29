import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, fromEvent } from 'rxjs';
import { AppLinks } from '@app/app-paths';
import { AuthService } from '@core/auth/auth.service';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { AppLogoComponent } from '@shared/ui/app-logo/app-logo.component';
import { FilterDrawerComponent } from '@shared/ui/filter-drawer/filter-drawer.component';
import { ToastHostComponent } from '@shared/ui/toast/toast-host.component';
import { HeaderSearchComponent } from '@shared/ui/header-search/header-search.component';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    AppLogoComponent,
    FilterDrawerComponent,
    HeaderSearchComponent,
    ToastHostComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly headerUi = inject(HeaderUiStore);
  readonly links = AppLinks;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly headerCollapsed = computed(
    () => this.headerUi.headerHidden() && !this.headerUi.filtersOpen(),
  );

  readonly userInitials = computed(() => {
    const name = this.auth.user()?.displayName?.trim();
    if (!name) {
      return '?';
    }
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const shell = this.host.nativeElement;
      const header = shell.querySelector('.app-header');

      if (header instanceof HTMLElement) {
        const syncHeaderSize = () => {
          shell.style.setProperty('--app-header-size', `${header.offsetHeight}px`);
        };

        syncHeaderSize();
        const observer = new ResizeObserver(syncHeaderSize);
        observer.observe(header);
        this.destroyRef.onDestroy(() => observer.disconnect());
      }
    });

    const mobileQuery = window.matchMedia('(max-width: 64rem)');

    fromEvent(window, 'scroll', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!mobileQuery.matches) {
          return;
        }

        this.headerUi.reportScrollPosition(window.scrollY);
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.headerUi.resetScrollTracking(window.scrollY);
      });
  }

  signIn(): void {
    this.auth.signInWithGoogle();
  }

  signOut(): void {
    this.auth.signOut();
  }
}
