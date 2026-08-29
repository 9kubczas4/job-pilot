import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../layout/app-shell.component';
import { AppLinks } from '../../shared/routing/app-paths';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePageComponent {
  readonly links = AppLinks;
}
