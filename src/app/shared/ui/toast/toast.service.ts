import { computed, Injectable, signal } from '@angular/core';

export type ToastKind = 'default' | 'ai-activity';

export interface ToastNotification {
  message: string;
  detail?: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly notification = signal<ToastNotification | null>(null);
  readonly message = computed(() => this.notification()?.message ?? null);

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  show(text: string, durationMs = 3000): void {
    this.showNotification({ message: text, kind: 'default' }, durationMs);
  }

  showAiToolActivated(toolName: string, durationMs = 5000): void {
    this.showNotification(
      {
        message: 'AI tool activated',
        detail: formatToolName(toolName),
        kind: 'ai-activity',
      },
      durationMs,
    );
  }

  private showNotification(notification: ToastNotification, durationMs: number): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    this.notification.set(notification);
    this.hideTimer = setTimeout(() => {
      this.notification.set(null);
      this.hideTimer = null;
    }, durationMs);
  }
}

function formatToolName(toolName: string): string {
  const label = toolName.trim().replace(/[_-]+/g, ' ');
  if (!label) {
    return 'WebMCP tool';
  }

  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}
