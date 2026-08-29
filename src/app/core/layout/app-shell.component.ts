import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppLinks } from '@shared/routing/app-paths';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly links = AppLinks;

  signIn(): void {
    this.auth.signInWithGoogle();
  }

  signOut(): void {
    this.auth.signOut();
  }
}
