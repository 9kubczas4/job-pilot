import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toast.notification(); as notification) {
      <div
        class="toast-host"
        [class.toast-host--ai-activity]="notification.kind === 'ai-activity'"
        [attr.data-toast-kind]="notification.kind"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        @if (notification.kind === 'ai-activity') {
          <span class="toast-host__activity" aria-hidden="true"></span>
        }
        <span class="toast-host__copy">
          <span class="toast-host__message">{{ notification.message }}</span>
          @if (notification.detail) {
            <span class="toast-host__detail">{{ notification.detail }}</span>
          }
        </span>
      </div>
    }
  `,
  styleUrl: './toast-host.component.scss',
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
