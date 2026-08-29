import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toast.message(); as message) {
      <p class="toast-host" role="status" aria-live="polite">{{ message }}</p>
    }
  `,
  styleUrl: './toast-host.component.scss',
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
