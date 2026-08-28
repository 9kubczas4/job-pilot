import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <a routerLink="/" class="brand">Job Pilot</a>

        <nav class="nav">
          <a routerLink="/jobs" routerLinkActive="active">Jobs</a>
          <a routerLink="/saved" routerLinkActive="active">Saved</a>
          <a routerLink="/profile" routerLinkActive="active">Profile</a>
        </nav>

        <div class="auth">
          @if (auth.isAuthenticated()) {
            <span class="user">{{ auth.user()?.displayName ?? 'Signed in' }}</span>
            <button type="button" class="btn btn-ghost" (click)="signOut()">Sign out</button>
          } @else {
            <button type="button" class="btn btn-primary" (click)="signIn()">Sign in with Google</button>
          }
        </div>
      </header>

      <main class="app-main">
        <ng-content />
      </main>
    </div>
  `,
  styles: `
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--surface);
    }

    .app-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface-elevated);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .brand {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
    }

    .nav {
      display: flex;
      gap: 1rem;
      flex: 1;
    }

    .nav a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
    }

    .nav a.active,
    .nav a:hover {
      color: var(--primary);
    }

    .auth {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .app-main {
      flex: 1;
    }
  `,
})
export class AppShellComponent {
  readonly auth = inject(AuthService);

  signIn(): void {
    void this.auth.signInWithGoogle();
  }

  signOut(): void {
    void this.auth.signOut();
  }
}
