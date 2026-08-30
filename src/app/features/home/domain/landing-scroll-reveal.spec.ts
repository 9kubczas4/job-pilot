import { setupLandingScrollReveal } from './landing-scroll-reveal';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe('landing-scroll-reveal', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  it('reveals sections when the scroll container moves', () => {
    const host = document.createElement('div');
    const scrollRoot = document.createElement('main');
    scrollRoot.className = 'app-main';
    scrollRoot.style.height = '400px';
    scrollRoot.style.overflow = 'auto';

    const visible = document.createElement('section');
    visible.setAttribute('data-reveal', '');
    visible.style.height = '120px';

    const hidden = document.createElement('section');
    hidden.setAttribute('data-reveal', '');
    hidden.style.height = '120px';
    hidden.style.marginTop = '800px';

    scrollRoot.append(host);
    host.append(visible, hidden);
    document.body.append(scrollRoot);

    vi.spyOn(scrollRoot, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 400,
      left: 0,
      right: 800,
      width: 800,
      height: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    vi.spyOn(visible, 'getBoundingClientRect').mockReturnValue({
      top: 40,
      bottom: 160,
      left: 0,
      right: 800,
      width: 800,
      height: 120,
      x: 0,
      y: 40,
      toJSON: () => ({}),
    });

    vi.spyOn(hidden, 'getBoundingClientRect').mockReturnValue({
      top: 900,
      bottom: 1020,
      left: 0,
      right: 800,
      width: 800,
      height: 120,
      x: 0,
      y: 900,
      toJSON: () => ({}),
    });

    setupLandingScrollReveal(host, vi.fn());

    expect(visible.classList.contains('is-revealed')).toBe(true);
    expect(hidden.classList.contains('is-revealed')).toBe(false);

    vi.spyOn(hidden, 'getBoundingClientRect').mockReturnValue({
      top: 120,
      bottom: 240,
      left: 0,
      right: 800,
      width: 800,
      height: 120,
      x: 0,
      y: 120,
      toJSON: () => ({}),
    });

    scrollRoot.scrollTop = 700;
    scrollRoot.dispatchEvent(new Event('scroll'));

    expect(hidden.classList.contains('is-revealed')).toBe(true);

    scrollRoot.remove();
  });
});
