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
    if (!this.viewport || this.itemSize <= 0) {
      return;
    }

    const viewportSize = this.viewport.getViewportSize();
    const effectiveViewportSize =
      viewportSize > 0 ? viewportSize : this.itemSize * 4;

    const dataLength = this.viewport.getDataLength();
    if (dataLength === 0) {
      this.viewport.setRenderedRange({ start: 0, end: 0 });
      this.viewport.setRenderedContentOffset(0);
      this.scrolledIndexChangeSubject.next(0);
      return;
    }

    const scrollOffset = this.viewport.measureScrollOffset();
    const firstVisibleIndex = Math.max(0, Math.floor(scrollOffset / this.itemSize));
    const visibleCount = Math.ceil(effectiveViewportSize / this.itemSize);
    const bufferCount = Math.ceil(this.maxBufferPx / this.itemSize);

    let start = Math.max(0, firstVisibleIndex - bufferCount);
    let end = Math.min(dataLength, firstVisibleIndex + visibleCount + bufferCount);

    const minRenderedCount = visibleCount + bufferCount;
    if (end - start < minRenderedCount) {
      start = Math.max(0, end - minRenderedCount);
      end = Math.min(dataLength, start + minRenderedCount);
    }

    this.viewport.setRenderedRange({ start, end });
    this.viewport.setRenderedContentOffset(start * this.itemSize);
    this.scrolledIndexChangeSubject.next(firstVisibleIndex);
  }
}
