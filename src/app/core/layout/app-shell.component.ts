import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AppLinks } from '@app/app-paths';
import { AuthService } from '@core/auth/auth.service';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { AppLogoComponent } from '@shared/ui/app-logo/app-logo.component';
import { FilterDrawerComponent } from '@shared/ui/filter-drawer/filter-drawer.component';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule, AppLogoComponent, FilterDrawerComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly headerUi = inject(HeaderUiStore);
  readonly links = AppLinks;

  private readonly router = inject(Router);

  readonly userInitials = computed(() => {
    const name = this.auth.user()?.displayName?.trim();
    if (!name) {
      return '?';
    }
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  });

  signIn(): void {
    this.auth.signInWithGoogle();
  }

  signOut(): void {
    this.auth.signOut();
  }

  onSearchChange(value: string): void {
    this.headerUi.searchQuery.set(value);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    const query = this.headerUi.searchQuery().trim();

    if (this.isJobsRoute()) {
      return;
    }

    this.router.navigate(this.links.jobs, {
      queryParams: query ? { q: query } : {},
    });
  }

  private isJobsRoute(): boolean {
    return this.router.url.startsWith('/jobs');
  }
}
