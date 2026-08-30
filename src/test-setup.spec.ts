import { describe, expect, it, vi } from 'vitest';
import { setMediaQueryMatches } from './test-setup';

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

describe('matchMedia test setup', () => {
  it('returns a stable media query list with a light default', () => {
    const first = window.matchMedia(DARK_MODE_QUERY);
    const second = window.matchMedia(DARK_MODE_QUERY);

    expect(first).toBe(second);
    expect(first.media).toBe(DARK_MODE_QUERY);
    expect(first.matches).toBe(false);
  });

  it('notifies modern and legacy listeners when the preference changes', () => {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    const modernListener = vi.fn();
    const legacyListener = vi.fn();
    mediaQuery.addEventListener('change', modernListener);
    mediaQuery.addListener(legacyListener);

    setMediaQueryMatches(DARK_MODE_QUERY, true);

    expect(mediaQuery.matches).toBe(true);
    expect(modernListener).toHaveBeenCalledOnce();
    expect(legacyListener).toHaveBeenCalledOnce();
    expect(modernListener.mock.calls[0][0]).toMatchObject({
      matches: true,
      media: DARK_MODE_QUERY,
    });
  });

  it('does not emit a change event when the value stays the same', () => {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    const listener = vi.fn();
    mediaQuery.addEventListener('change', listener);

    setMediaQueryMatches(DARK_MODE_QUERY, false);

    expect(listener).not.toHaveBeenCalled();
  });
});
