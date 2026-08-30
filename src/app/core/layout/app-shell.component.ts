import { ChangeDetectionStrategy, Component, DestroyRef, inject, PLATFORM_ID, afterNextRender, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppLinks, AppProfileMenuLinks } from '@core/app-paths';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import {
  APP_SHELL_COMPACT_CHROME_QUERY,
} from '@core/layout/app-shell-layout.constants';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { ProfileMenuComponent } from '@shared/ui/profile-menu/profile-menu.component';
import { ThemeToggleComponent } from '@core/layout/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    LogoComponent,
    ProfileMenuComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly links = AppLinks;
  readonly profileMenuLinks = AppProfileMenuLinks;
  readonly isCompactChrome = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const compactChromeQuery = window.matchMedia(APP_SHELL_COMPACT_CHROME_QUERY);
      const syncLayout = () => this.isCompactChrome.set(compactChromeQuery.matches);

      syncLayout();
      compactChromeQuery.addEventListener('change', syncLayout);
      this.destroyRef.onDestroy(() => compactChromeQuery.removeEventListener('change', syncLayout));
    });
  }
}
