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
  styles: `
    :host {
      pointer-events: none;
      position: fixed;
      inset-block-end: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
      inset-inline: 0;
      z-index: var(--z-toast, 1000);
      display: flex;
      justify-content: center;
      padding-inline: var(--space-4);
    }

    .toast-host {
      margin: 0;
      max-width: 24rem;
      border-radius: var(--radius-full);
      padding: var(--space-3) var(--space-5);
      background: rgb(15 23 42 / 0.92);
      box-shadow: var(--shadow-lg);
      color: #fff;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-align: center;
      backdrop-filter: blur(8px);
      animation: toast-in 180ms ease-out;
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(0.5rem);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
