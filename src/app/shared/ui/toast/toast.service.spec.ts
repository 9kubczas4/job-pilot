import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('keeps the AI tool activity toast visible for five seconds by default', () => {
    const service = new ToastService();

    service.showAiToolActivated('highlight_job');
    vi.advanceTimersByTime(4_999);

    expect(service.notification()).toEqual({
      message: 'AI tool activated',
      detail: 'Highlight job',
      kind: 'ai-activity',
    });

    vi.advanceTimersByTime(1);
    expect(service.notification()).toBeNull();
  });
});
