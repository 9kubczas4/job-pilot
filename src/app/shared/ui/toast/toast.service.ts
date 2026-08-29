import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<string | null>(null);

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  show(text: string, durationMs = 3000): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    this.message.set(text);
    this.hideTimer = setTimeout(() => {
      this.message.set(null);
      this.hideTimer = null;
    }, durationMs);
  }
}
