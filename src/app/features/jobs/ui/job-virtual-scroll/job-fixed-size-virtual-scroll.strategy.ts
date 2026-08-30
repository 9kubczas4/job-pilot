import { VirtualScrollStrategy, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export class JobFixedSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  private readonly scrolledIndexChangeSubject = new Subject<number>();

  readonly scrolledIndexChange = this.scrolledIndexChangeSubject.pipe(distinctUntilChanged());

  private viewport: CdkVirtualScrollViewport | null = null;

  constructor(
    private itemSize: number,
    private minBufferPx: number,
    private maxBufferPx: number,
    private leadingGap: number,
  ) {}

  attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  detach(): void {
    this.scrolledIndexChangeSubject.complete();
    this.viewport = null;
  }

  updateConfiguration(
    itemSize: number,
    minBufferPx: number,
    maxBufferPx: number,
    leadingGap: number,
  ): void {
    if (maxBufferPx < minBufferPx) {
      throw new Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
    }

    this.itemSize = itemSize;
    this.minBufferPx = minBufferPx;
    this.maxBufferPx = maxBufferPx;
    this.leadingGap = leadingGap;
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  onContentScrolled(): void {
    this.updateRenderedRange();
  }

  onDataLengthChanged(): void {
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  onContentRendered(): void {}

  onRenderedOffsetChanged(): void {}

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    this.viewport?.scrollToOffset(index * this.itemSize, behavior);
  }

  private updateTotalContentSize(): void {
    if (!this.viewport) {
      return;
    }

    this.viewport.setTotalContentSize(this.leadingGap + this.viewport.getDataLength() * this.itemSize);
  }

  private updateRenderedRange(): void {
    if (!this.viewport) {
      return;
    }

    const renderedRange = this.viewport.getRenderedRange();
    const newRange = {
      start: renderedRange.start,
      end: renderedRange.end,
    };
    const viewportSize = this.viewport.getViewportSize();
    const dataLength = this.viewport.getDataLength();
    const scrollOffset = this.viewport.measureScrollOffset();
    let firstVisibleIndex = this.itemSize > 0 ? scrollOffset / this.itemSize : 0;

    if (newRange.end > dataLength) {
      const maxVisibleItems = Math.ceil(viewportSize / this.itemSize);
      const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));

      if (firstVisibleIndex !== newVisibleIndex) {
        firstVisibleIndex = newVisibleIndex;
        newRange.start = Math.floor(firstVisibleIndex);
      }

      newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
    }

    const startBuffer = scrollOffset - newRange.start * this.itemSize;

    if (startBuffer < this.minBufferPx && newRange.start !== 0) {
      const expandStart = Math.ceil((this.maxBufferPx - startBuffer) / this.itemSize);
      newRange.start = Math.max(0, newRange.start - expandStart);
      newRange.end = Math.min(
        dataLength,
        Math.ceil(firstVisibleIndex + (viewportSize + this.minBufferPx) / this.itemSize),
      );
    } else {
      const endBuffer =
        this.leadingGap + newRange.end * this.itemSize - (scrollOffset + viewportSize);

      if (endBuffer < this.minBufferPx && newRange.end !== dataLength) {
        const expandEnd = Math.ceil((this.maxBufferPx - endBuffer) / this.itemSize);

        if (expandEnd > 0) {
          newRange.end = Math.min(dataLength, newRange.end + expandEnd);
          newRange.start = Math.max(0, Math.floor(firstVisibleIndex - this.minBufferPx / this.itemSize));
        }
      }
    }

    this.viewport.setRenderedRange(newRange);
    this.viewport.setRenderedContentOffset(Math.round(this.itemSize * newRange.start));
    this.scrolledIndexChangeSubject.next(Math.floor(firstVisibleIndex));
  }
}
