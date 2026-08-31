import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ApplyJobStore } from '@features/jobs/state/apply-job.store';
import { ApplyJobDialogComponent } from '@features/jobs/ui/apply-job-dialog/apply-job-dialog.component';
import { ToastService } from '@shared/ui/toast/toast.service';

@Component({
  selector: 'app-apply-job-dialog-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ApplyJobDialogComponent],
  template: `
    @if (store.presentation(); as presentation) {
      <app-apply-job-dialog
        [open]="store.isOpen()"
        [jobTitle]="presentation.jobTitle"
        [companyName]="presentation.companyName"
        [initialNote]="presentation.note"
        [submitting]="store.submitting()"
        (closed)="onClose()"
        (confirmed)="onConfirm($event)"
      />
    }
  `,
})
export class ApplyJobDialogHostComponent {
  readonly store = inject(ApplyJobStore);

  private readonly toast = inject(ToastService);

  onClose(): void {
    this.store.dismiss();
  }

  async onConfirm(note?: string): Promise<void> {
    const jobTitle = this.store.presentation()?.jobTitle;

    try {
      await this.store.submit(note);
      if (jobTitle) {
        this.toast.show(`Application submitted for ${jobTitle}.`);
      }
    } catch {
      this.toast.show('Could not submit application. Please try again.', 5000);
    }
  }
}
