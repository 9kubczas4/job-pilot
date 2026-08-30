import { ChangeDetectionStrategy, Component, effect, input, model, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { formatMonthValue, isFutureMonth, parseMonthValue, startOfCurrentMonth } from '@features/profile/domain/month-date.utils';

const MONTH_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/yyyy',
  },
  display: {
    dateInput: 'MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-profile-month-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MONTH_DATE_FORMATS },
  ],
  template: `
    <mat-form-field appearance="outline" class="profile-mat-field profile-month-picker">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [matDatepicker]="picker"
        [matDatepickerFilter]="dateFilter"
        [max]="maxDate"
        [disabled]="disabled()"
        [value]="selectedDate()"
        (dateChange)="onDateInput($event.value)"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker
        #picker
        startView="multi-year"
        (monthSelected)="onMonthSelected($event, picker)"
      />
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
})
export class ProfileMonthPickerComponent implements FormValueControl<string> {
  readonly label = input.required<string>();

  readonly value = model<string>('');
  readonly disabled = input(false);

  readonly maxDate = startOfCurrentMonth();
  readonly dateFilter = (date: Date | null): boolean => !date || !isFutureMonth(date);

  readonly selectedDate = signal<Date | null>(null);

  constructor() {
    effect(() => {
      this.selectedDate.set(parseMonthValue(this.value()));
    });
  }

  onMonthSelected(value: Date, picker: MatDatepicker<Date>): void {
    picker.close();
    this.onDateInput(value);
  }

  onDateInput(value: Date | null): void {
    if (value && isFutureMonth(value)) {
      return;
    }

    this.selectedDate.set(value);
    this.value.set(formatMonthValue(value) ?? '');
  }
}
