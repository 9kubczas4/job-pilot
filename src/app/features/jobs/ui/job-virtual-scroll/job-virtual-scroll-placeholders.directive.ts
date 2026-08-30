import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  inject,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { auditTime, fromEvent, merge } from 'rxjs';

const SCROLL_SETTLE_MS = 180;
const MIN_PLACEHOLDER_MS = 120;

@Directive({
  selector: 'cdk-virtual-scroll-viewport[appJobVirtualScrollPlaceholders]',
  exportAs: 'appJobVirtualScrollPlaceholders',
})
export class JobVirtualScrollPlaceholdersDirective {
  readonly activeChange = output<boolean>({ alias: 'activeChange' });

  readonly active = signal(false);

  private readonly viewport = inject(CdkVirtualScrollViewport, { self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      let lastScrollTop = this.viewport.measureScrollOffset();
      let activatedAt = 0;
      let settleTimer: ReturnType<typeof setTimeout> | undefined;
      let hideTimer: ReturnType<typeof setTimeout> | undefined;

      merge(
        this.viewport.elementScrolled(),
        fromEvent(this.viewport.elementRef.nativeElement, 'scroll'),
      )
        .pipe(auditTime(0), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const scrollTop = this.viewport.measureScrollOffset();
          const delta = Math.abs(scrollTop - lastScrollTop);

          if (delta > 0) {
            this.setActive(true);
            activatedAt = performance.now();
          }

          lastScrollTop = scrollTop;

          if (settleTimer !== undefined) {
            clearTimeout(settleTimer);
          }

          settleTimer = setTimeout(() => {
            settleTimer = undefined;

            if (hideTimer !== undefined) {
              clearTimeout(hideTimer);
            }

            const remainingMs = MIN_PLACEHOLDER_MS - (performance.now() - activatedAt);
            hideTimer = setTimeout(() => {
              this.setActive(false);
              hideTimer = undefined;
            }, Math.max(remainingMs, 0));
          }, SCROLL_SETTLE_MS);
        });
    });
  }

  private setActive(next: boolean): void {
    if (this.active() === next) {
      return;
    }

    this.active.set(next);
    this.activeChange.emit(next);
    this.cdr.markForCheck();
  }
}
