import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-job-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-card-skeleton.component.html',
  styleUrl: './job-card-skeleton.component.scss',
})
export class JobCardSkeletonComponent {}
