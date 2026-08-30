import { Directive, effect, input } from '@angular/core';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { JobFixedSizeVirtualScrollStrategy } from './job-fixed-size-virtual-scroll.strategy';
import {
  JOB_VIRTUAL_SCROLL_ITEM_GAP_PX,
  JOB_VIRTUAL_SCROLL_ITEM_SIZE_PX,
  JOB_VIRTUAL_SCROLL_LIST_INSET_TOP_PX,
  JOB_VIRTUAL_SCROLL_MAX_BUFFER_PX,
  JOB_VIRTUAL_SCROLL_MIN_BUFFER_PX,
} from './job-virtual-scroll.constants';

@Directive({
  selector: 'cdk-virtual-scroll-viewport[appJobVirtualScrollStrategy]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (directive: JobVirtualScrollStrategyDirective) => directive.strategy,
      deps: [JobVirtualScrollStrategyDirective],
    },
  ],
})
export class JobVirtualScrollStrategyDirective {
  readonly jobVirtualScrollItemSize = input(JOB_VIRTUAL_SCROLL_ITEM_SIZE_PX, {
    alias: 'jobVirtualScrollItemSize',
  });
  readonly jobVirtualScrollItemGap = input(JOB_VIRTUAL_SCROLL_ITEM_GAP_PX, {
    alias: 'jobVirtualScrollItemGap',
  });
  readonly jobVirtualScrollMinBufferPx = input(JOB_VIRTUAL_SCROLL_MIN_BUFFER_PX, {
    alias: 'jobVirtualScrollMinBufferPx',
  });
  readonly jobVirtualScrollMaxBufferPx = input(JOB_VIRTUAL_SCROLL_MAX_BUFFER_PX, {
    alias: 'jobVirtualScrollMaxBufferPx',
  });
  readonly jobVirtualScrollInsetTop = input(JOB_VIRTUAL_SCROLL_LIST_INSET_TOP_PX, {
    alias: 'jobVirtualScrollInsetTop',
  });

  readonly strategy = new JobFixedSizeVirtualScrollStrategy(
    JOB_VIRTUAL_SCROLL_ITEM_SIZE_PX,
    JOB_VIRTUAL_SCROLL_MIN_BUFFER_PX,
    JOB_VIRTUAL_SCROLL_MAX_BUFFER_PX,
    JOB_VIRTUAL_SCROLL_LIST_INSET_TOP_PX,
  );

  constructor() {
    effect(() => {
      this.strategy.updateConfiguration(
        this.jobVirtualScrollItemSize(),
        this.jobVirtualScrollMinBufferPx(),
        this.jobVirtualScrollMaxBufferPx(),
        this.jobVirtualScrollInsetTop(),
      );
    });
  }
}
