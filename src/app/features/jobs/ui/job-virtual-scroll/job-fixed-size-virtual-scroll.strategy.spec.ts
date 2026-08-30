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
