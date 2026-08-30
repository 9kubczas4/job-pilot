import { ChangeDetectionStrategy, Component, DestroyRef, inject, PLATFORM_ID, afterNextRender, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppLinks, AppProfileMenuLinks } from '@core/app-paths';
import { AuthService } from '@core/auth/auth.service';
import { AppLogoComponent } from '@shared/ui/app-logo/app-logo.component';
import { ProfileMenuComponent } from '@shared/ui/profile-menu/profile-menu.component';
import { ThemeToggleComponent } from '@core/layout/theme-toggle/theme-toggle.component';

const MOBILE_SHELL_QUERY = '(max-width: 64rem)';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    AppLogoComponent,
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
  readonly isMobileLayout = signal(false);

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
  }
}
