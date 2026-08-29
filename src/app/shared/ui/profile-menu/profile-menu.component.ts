import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AppLinks } from '@app/app-paths';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-profile-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'profile-menu-host',
    '[class.profile-menu-host--compact]': 'compact()',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {
  readonly compact = input(false);

  readonly auth = inject(AuthService);
  readonly links = AppLinks;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly menuOpen = signal(false);

  readonly userInitials = computed(() => {
    const name = this.auth.user()?.displayName?.trim();
    if (!name) {
      return '?';
    }

    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeMenu());
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  signIn(): void {
    void this.auth.signInWithGoogle();
  }

  signOut(): void {
    this.closeMenu();
    void this.auth.signOut();
  }

  onDocumentClick(event: Event): void {
    if (!this.menuOpen()) {
      return;
    }

    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) {
      return;
    }

    this.closeMenu();
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }
}
