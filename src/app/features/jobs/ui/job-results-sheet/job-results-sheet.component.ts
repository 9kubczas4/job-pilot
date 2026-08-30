import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterLink } from '@angular/router';
import { AppLinks } from '@core/app-paths';
import { JobCardComponent } from '@features/jobs/ui/job-card/job-card.component';
import { JobCardSkeletonComponent } from '@features/jobs/ui/job-card-skeleton/job-card-skeleton.component';
import { JobVirtualScrollPlaceholdersDirective } from '@features/jobs/ui/job-virtual-scroll/job-virtual-scroll-placeholders.directive';
import { JobVirtualScrollStrategyDirective } from '@features/jobs/ui/job-virtual-scroll/job-virtual-scroll-strategy.directive';
import {
  JOB_VIRTUAL_SCROLL_ITEM_GAP_PX,
  JOB_VIRTUAL_SCROLL_ITEM_SIZE_PX,
  JOB_VIRTUAL_SCROLL_LIST_INSET_TOP_PX,
  JOB_VIRTUAL_SCROLL_MAX_BUFFER_PX,
  JOB_VIRTUAL_SCROLL_MIN_BUFFER_PX,
} from '@features/jobs/ui/job-virtual-scroll/job-virtual-scroll.constants';
import { JOB_VIRTUAL_SCROLL_LOADING_JOBS } from '@features/jobs/ui/job-virtual-scroll/job-virtual-scroll-loading-jobs';
import { JobSortMenuComponent, SortMenuOption } from '@features/jobs/ui/job-sort-menu/job-sort-menu.component';
import { JobOffer } from '@features/jobs/domain/job.model';

export type JobSheetSnap = 'collapsed' | 'peek' | 'half' | 'full';

const COLLAPSED_HEIGHT_PX = 52;

@Component({
  selector: 'app-job-results-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JobCardComponent,
    JobCardSkeletonComponent,
    JobSortMenuComponent,
    JobVirtualScrollPlaceholdersDirective,
    JobVirtualScrollStrategyDirective,
    RouterLink,
    ScrollingModule,
  ],
  templateUrl: './job-results-sheet.component.html',
  styleUrl: './job-results-sheet.component.scss',
})
export class JobResultsSheetComponent {
  readonly jobs = input.required<JobOffer[]>();
  readonly loading = input(false);
  readonly selectedJobId = input<string | null>(null);
  readonly savedJobIds = input<string[]>([]);
  readonly appliedJobIds = input<string[]>([]);
  readonly snap = input<JobSheetSnap>('peek');
  readonly focusJobId = input<string | null>(null);
  readonly sortOptions = input<SortMenuOption[]>([]);
  readonly sort = input('newest');

  readonly snapChange = output<JobSheetSnap>();
  readonly selectJob = output<string>();
  readonly toggleSave = output<string>();
  readonly clearFocus = output<void>();
  readonly sortChange = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);

  readonly jobLink = AppLinks.job;
  readonly trackJob = (_index: number, job: JobOffer): string => job.id;
  readonly dragOffsetPx = signal(0);
  readonly dragHeightPx = signal<number | null>(null);
  readonly isDragging = signal(false);
  readonly scrollPlaceholdersActive = signal(false);
  readonly listJobs = computed(() => (this.loading() ? JOB_VIRTUAL_SCROLL_LOADING_JOBS : this.jobs()));
  readonly virtualScrollItemSize = JOB_VIRTUAL_SCROLL_ITEM_SIZE_PX;
  readonly virtualScrollItemGap = JOB_VIRTUAL_SCROLL_ITEM_GAP_PX;
  readonly virtualScrollListInsetTop = JOB_VIRTUAL_SCROLL_LIST_INSET_TOP_PX;
  readonly virtualScrollMinBufferPx = JOB_VIRTUAL_SCROLL_MIN_BUFFER_PX;
  readonly virtualScrollMaxBufferPx = JOB_VIRTUAL_SCROLL_MAX_BUFFER_PX;

  readonly focusedJob = computed(() => {
    const focusId = this.focusJobId();
    if (!focusId) {
      return null;
    }

    return this.jobs().find((job) => job.id === focusId) ?? null;
  });

  readonly summaryLabel = computed(() => {
    const count = this.jobs().length;
    if (this.loading()) {
      return 'Loading jobs…';
    }
    if (!count) {
      return 'No matching jobs';
    }
    return `${count} matching ${count === 1 ? 'job' : 'jobs'}`;
  });

  private dragStartY = 0;
  private dragStartHeight = 0;
  private dragSnap: JobSheetSnap = 'peek';
  private pointerMoved = false;

  onHandlePointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const handle = event.currentTarget;
    if (!(handle instanceof HTMLElement)) {
      return;
    }

    handle.setPointerCapture(event.pointerId);
    this.dragStartY = event.clientY;
    this.dragSnap = this.snap();
    this.dragStartHeight = this.snapHeightPx(this.dragSnap);
    this.dragOffsetPx.set(0);
    this.dragHeightPx.set(this.dragStartHeight);
    this.pointerMoved = false;
    this.isDragging.set(true);
  }

  onHandlePointerMove(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }

    const delta = this.dragStartY - event.clientY;
    if (Math.abs(delta) > 4) {
      this.pointerMoved = true;
    }
    const maxHeight = this.maxSheetHeight();
    const nextHeight = clamp(this.dragStartHeight + delta, COLLAPSED_HEIGHT_PX, maxHeight);
    this.dragHeightPx.set(nextHeight);
    this.dragOffsetPx.set(nextHeight - this.snapHeightPx(this.dragSnap));
  }

  onHandlePointerUp(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }

    const handle = event.currentTarget;
    if (handle instanceof HTMLElement && handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }

    const visibleHeight = this.dragStartHeight + (this.dragStartY - event.clientY);
    const nextSnap = this.nearestSnap(visibleHeight);
    this.snapChange.emit(nextSnap);
    this.isDragging.set(false);
    this.dragOffsetPx.set(0);
    this.dragHeightPx.set(null);
  }

  onHandleClick(): void {
    if (this.pointerMoved) {
      this.pointerMoved = false;
      return;
    }

    this.snapChange.emit(this.nextSnap(this.snap()));
  }

  onHandleKeyboardActivate(event: Event): void {
    event.preventDefault();
    this.onHandleClick();
  }

  onBackdropClick(): void {
    this.snapChange.emit('peek');
    this.clearFocus.emit();
  }

  showAllJobs(): void {
    this.clearFocus.emit();
    this.snapChange.emit('half');
  }

  private nextSnap(current: JobSheetSnap): JobSheetSnap {
    const order: JobSheetSnap[] = ['collapsed', 'peek', 'half', 'full'];
    const index = order.indexOf(current);
    return order[(index + 1) % order.length] ?? 'peek';
  }

  private nearestSnap(visibleHeightPx: number): JobSheetSnap {
    const options: JobSheetSnap[] = ['collapsed', 'peek', 'half', 'full'];
    let closest: JobSheetSnap = 'peek';
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const option of options) {
      const distance = Math.abs(visibleHeightPx - this.snapHeightPx(option));
      if (distance < closestDistance) {
        closest = option;
        closestDistance = distance;
      }
    }

    return closest;
  }

  private snapHeightPx(snap: JobSheetSnap): number {
    if (snap === 'collapsed') {
      return COLLAPSED_HEIGHT_PX;
    }

    const hostHeight = this.host.nativeElement.clientHeight || window.innerHeight;
    const toolbarOffset = 56;

    switch (snap) {
      case 'peek':
        return Math.min(hostHeight * 0.24, 176);
      case 'half':
        return hostHeight * 0.52;
      case 'full':
        return hostHeight - toolbarOffset;
      default:
        return COLLAPSED_HEIGHT_PX;
    }
  }

  private maxSheetHeight(): number {
    return this.snapHeightPx('full');
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
