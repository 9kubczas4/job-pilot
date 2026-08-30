import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterLink } from '@angular/router';
import { fromEvent } from 'rxjs';
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

@Component({
  selector: 'app-job-list',
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
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
})
export class JobListComponent {
  readonly jobs = input.required<JobOffer[]>();
  readonly loading = input(false);
  readonly selectedJobId = input<string | null>(null);
  readonly savedJobIds = input<string[]>([]);
  readonly appliedJobIds = input<string[]>([]);
  readonly sortOptions = input<SortMenuOption[]>([]);
  readonly sort = input('newest');
  readonly sortUpdateActive = input(false);
  readonly selectJob = output<string>();
  readonly toggleSave = output<string>();
  readonly sortChange = output<string>();
  readonly scrollPositionChange = output<number>();
  readonly scrollPlaceholdersActive = signal(false);
  readonly listJobs = computed(() => (this.loading() ? JOB_VIRTUAL_SCROLL_LOADING_JOBS : this.jobs()));
  readonly virtualScrollItemSize = JOB_VIRTUAL_SCROLL_ITEM_SIZE_PX;
  readonly virtualScrollItemGap = JOB_VIRTUAL_SCROLL_ITEM_GAP_PX;
  readonly virtualScrollListInsetTop = JOB_VIRTUAL_SCROLL_LIST_INSET_TOP_PX;
  readonly virtualScrollMinBufferPx = JOB_VIRTUAL_SCROLL_MIN_BUFFER_PX;
  readonly virtualScrollMaxBufferPx = JOB_VIRTUAL_SCROLL_MAX_BUFFER_PX;

  readonly jobLink = AppLinks.job;
  readonly trackJob = (_index: number, job: JobOffer): string => job.id;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const mobileQuery = window.matchMedia('(max-width: 64rem)');
      const scrollContainer = this.host.nativeElement.querySelector('.job-list__body');

      if (!(scrollContainer instanceof HTMLElement)) {
        return;
      }

      fromEvent(scrollContainer, 'scroll', { passive: true })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (!mobileQuery.matches) {
            return;
          }

          this.scrollPositionChange.emit(scrollContainer.scrollTop);
        });
    });
  }
}
