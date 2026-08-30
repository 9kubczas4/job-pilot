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
import { RouterLink } from '@angular/router';
import { AppLinks } from '@core/app-paths';
import { JobCardComponent } from '../job-card/job-card.component';
import { JobSortMenuComponent, SortMenuOption } from '../job-sort-menu/job-sort-menu.component';
import { JobOffer } from '../../domain/job.model';

export type JobSheetSnap = 'collapsed' | 'peek' | 'half' | 'full';

const COLLAPSED_HEIGHT_PX = 52;

@Component({
  selector: 'app-job-results-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JobCardComponent, JobSortMenuComponent, RouterLink],
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
  readonly dragOffsetPx = signal(0);
  readonly dragHeightPx = signal<number | null>(null);
  readonly isDragging = signal(false);

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
    this.isDragging.set(true);
    this.dragStartY = event.clientY;
    this.dragStartHeight = this.measureVisibleHeight();
    this.dragSnap = this.snap();
    this.dragOffsetPx.set(0);
    this.dragHeightPx.set(null);
    this.pointerMoved = false;
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

    this.isDragging.set(false);
    const visibleHeight = this.dragStartHeight + (this.dragStartY - event.clientY);
    this.dragOffsetPx.set(0);
    this.dragHeightPx.set(null);
    this.snapChange.emit(this.nearestSnap(visibleHeight));
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

  private measureVisibleHeight(): number {
    return this.snapHeightPx(this.snap()) + this.dragOffsetPx();
  }

  private maxSheetHeight(): number {
    return this.snapHeightPx('full');
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
