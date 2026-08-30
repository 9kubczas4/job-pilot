import { JobFixedSizeVirtualScrollStrategy } from './job-fixed-size-virtual-scroll.strategy';

describe('JobFixedSizeVirtualScrollStrategy', () => {
  it('includes leading gap in total content size but not rendered offset', () => {
    const viewport = {
      getDataLength: () => 3,
      getRenderedRange: () => ({ start: 0, end: 3 }),
      getViewportSize: () => 200,
      measureScrollOffset: () => 0,
      setTotalContentSize: vi.fn(),
      setRenderedRange: vi.fn(),
      setRenderedContentOffset: vi.fn(),
      scrollToOffset: vi.fn(),
    };

    const strategy = new JobFixedSizeVirtualScrollStrategy(118, 236, 472, 8);
    strategy.attach(viewport as never);

    expect(viewport.setTotalContentSize).toHaveBeenCalledWith(8 + 3 * 118);
    expect(viewport.setRenderedContentOffset).toHaveBeenCalledWith(0);
  });

  it('renders enough items to fill the viewport', () => {
    const viewport = {
      getDataLength: () => 50,
      getRenderedRange: () => ({ start: 0, end: 0 }),
      getViewportSize: () => 400,
      measureScrollOffset: () => 0,
      setTotalContentSize: vi.fn(),
      setRenderedRange: vi.fn(),
      setRenderedContentOffset: vi.fn(),
      scrollToOffset: vi.fn(),
    };

    const strategy = new JobFixedSizeVirtualScrollStrategy(118, 236, 472, 8);
    strategy.attach(viewport as never);

    expect(viewport.setRenderedRange).toHaveBeenCalledWith(
      expect.objectContaining({
        start: 0,
        end: expect.any(Number),
      }),
    );

    const renderedRange = viewport.setRenderedRange.mock.calls.at(-1)?.[0];
    expect(renderedRange.end - renderedRange.start).toBeGreaterThanOrEqual(Math.ceil(400 / 118));
  });

  it('scrolls to index without adding leading gap offset', () => {
    const viewport = {
      getDataLength: () => 10,
      getRenderedRange: () => ({ start: 0, end: 0 }),
      getViewportSize: () => 200,
      measureScrollOffset: () => 0,
      setTotalContentSize: vi.fn(),
      setRenderedRange: vi.fn(),
      setRenderedContentOffset: vi.fn(),
      scrollToOffset: vi.fn(),
    };

    const strategy = new JobFixedSizeVirtualScrollStrategy(118, 236, 472, 8);
    strategy.attach(viewport as never);
    strategy.scrollToIndex(2, 'auto');

    expect(viewport.scrollToOffset).toHaveBeenCalledWith(2 * 118, 'auto');
  });
});
