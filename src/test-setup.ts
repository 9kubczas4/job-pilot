import { beforeEach } from 'vitest';

interface MatchMediaEntry {
  readonly list: MediaQueryList;
  setMatches(matches: boolean): void;
}

const entries = new Map<string, MatchMediaEntry>();

function createMatchMediaEntry(media: string): MatchMediaEntry {
  const eventTarget = new EventTarget();
  let matches = false;

  const list: MediaQueryList = {
    get matches() {
      return matches;
    },
    media,
    onchange: null,
    addListener(listener) {
      eventTarget.addEventListener('change', listener as EventListener);
    },
    removeListener(listener) {
      eventTarget.removeEventListener('change', listener as EventListener);
    },
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      eventTarget.addEventListener(type, listener, options);
    },
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) {
      eventTarget.removeEventListener(type, listener, options);
    },
    dispatchEvent(event) {
      const dispatched = eventTarget.dispatchEvent(event);
      list.onchange?.call(list, event as MediaQueryListEvent);
      return dispatched;
    },
  };

  return {
    list,
    setMatches(nextMatches) {
      if (matches === nextMatches) {
        return;
      }

      matches = nextMatches;
      const event = new Event('change') as MediaQueryListEvent;
      Object.defineProperties(event, {
        matches: { value: matches },
        media: { value: media },
      });
      list.dispatchEvent(event);
    },
  };
}

function getEntry(media: string): MatchMediaEntry {
  const existing = entries.get(media);
  if (existing) {
    return existing;
  }

  const entry = createMatchMediaEntry(media);
  entries.set(media, entry);
  return entry;
}

export function installMatchMediaMock(): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (media: string) => getEntry(media).list,
  });
}

export function resetMatchMediaMock(): void {
  entries.clear();
  installMatchMediaMock();
}

export function setMediaQueryMatches(media: string, matches: boolean): void {
  getEntry(media).setMatches(matches);
}

class ResizeObserverMock implements ResizeObserver {
  observe(): void {
    return;
  }

  unobserve(): void {
    return;
  }

  disconnect(): void {
    return;
  }
}

export function installResizeObserverMock(): void {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: ResizeObserverMock,
  });
}

installMatchMediaMock();
installResizeObserverMock();
beforeEach(resetMatchMediaMock);
