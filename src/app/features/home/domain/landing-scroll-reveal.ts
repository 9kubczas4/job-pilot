export function setupLandingScrollReveal(
  host: HTMLElement,
  registerDestroy: (callback: () => void) => void,
): void {
  const targets = [...host.querySelectorAll('[data-reveal]')];

  if (!targets.length) {
    return;
  }

  let destroyed = false;
  const scrollRoot = host.closest('.app-main');
  const boundHandlers: Array<{ root: EventTarget; handler: () => void }> = [];

  const reveal = (element: Element) => {
    element.classList.add('is-revealed');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      }
    },
    {
      root: scrollRoot,
      rootMargin: '0px 0px -2% 0px',
      threshold: 0.01,
    },
  );

  const syncVisible = () => {
    if (destroyed) {
      return;
    }

    for (const target of targets) {
      if (target.classList.contains('is-revealed')) {
        continue;
      }

      if (isIntersecting(target, scrollRoot)) {
        reveal(target);
        observer.unobserve(target);
      }
    }
  };

  for (const target of targets) {
    observer.observe(target);
  }

  syncVisible();

  const attachScroll = (root: EventTarget) => {
    const handler = () => syncVisible();
    root.addEventListener('scroll', handler, { passive: true });
    boundHandlers.push({ root, handler });
  };

  if (scrollRoot instanceof Element) {
    attachScroll(scrollRoot);
  } else {
    attachScroll(window);
  }

  const onResize = () => syncVisible();
  window.addEventListener('resize', onResize, { passive: true });

  const retryId = window.setTimeout(syncVisible, 100);

  registerDestroy(() => {
    destroyed = true;
    observer.disconnect();
    window.clearTimeout(retryId);
    window.removeEventListener('resize', onResize);

    for (const { root, handler } of boundHandlers) {
      root.removeEventListener('scroll', handler);
    }
  });
}

function isIntersecting(element: Element, scrollRoot: Element | null): boolean {
  const rect = element.getBoundingClientRect();
  const rootRect = scrollRoot
    ? scrollRoot.getBoundingClientRect()
    : {
        top: 0,
        left: 0,
        bottom: window.innerHeight,
        right: window.innerWidth,
      };

  const visibleHeight = Math.min(rect.bottom, rootRect.bottom) - Math.max(rect.top, rootRect.top);
  const visibleWidth = Math.min(rect.right, rootRect.right) - Math.max(rect.left, rootRect.left);

  return visibleHeight > 1 && visibleWidth > 0;
}
