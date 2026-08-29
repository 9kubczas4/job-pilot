import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { fromEvent } from 'rxjs';
import { AppLinks } from '@app/app-paths';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { JobCardComponent } from '../job-card/job-card.component';
import { JobOffer } from '../../domain/job.model';

@Component({
  selector: 'app-job-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JobCardComponent, RouterLink],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
})
export class JobListComponent {
  readonly jobs = input.required<JobOffer[]>();
  readonly loading = input(false);
  readonly selectedJobId = input<string | null>(null);
  readonly savedJobIds = input<string[]>([]);
  readonly appliedJobIds = input<string[]>([]);
  readonly selectJob = output<string>();

  readonly jobLink = AppLinks.job;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly headerUi = inject(HeaderUiStore);
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

          this.headerUi.reportScrollPosition(scrollContainer.scrollTop);
        });
    });
  }
}
