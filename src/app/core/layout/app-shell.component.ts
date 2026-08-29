import { ChangeDetectionStrategy, Component, DestroyRef, inject, PLATFORM_ID, afterNextRender, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AppLinks } from '@app/app-paths';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { AppLogoComponent } from '@shared/ui/app-logo/app-logo.component';
import { FilterDrawerComponent } from '@shared/ui/filter-drawer/filter-drawer.component';
import { HeaderSearchComponent } from '@shared/ui/header-search/header-search.component';
import { ProfileMenuComponent } from '@shared/ui/profile-menu/profile-menu.component';
import { ThemeToggleComponent } from '@shared/ui/theme-toggle/theme-toggle.component';

const MOBILE_SHELL_QUERY = '(max-width: 64rem)';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    AppLogoComponent,
    FilterDrawerComponent,
    HeaderSearchComponent,
    ProfileMenuComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly headerUi = inject(HeaderUiStore);
  readonly links = AppLinks;
  readonly isMobileLayout = signal(false);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const mobileQuery = window.matchMedia(MOBILE_SHELL_QUERY);
      const syncLayout = () => this.isMobileLayout.set(mobileQuery.matches);

      syncLayout();
      mobileQuery.addEventListener('change', syncLayout);
      this.destroyRef.onDestroy(() => mobileQuery.removeEventListener('change', syncLayout));
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.headerUi.showHeader();
      });
  }
}
