import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { formatMonthValue, isFutureMonth, parseMonthValue, startOfCurrentMonth } from '../../domain/month-date.utils';

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
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MONTH_DATE_FORMATS },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProfileMonthPickerComponent),
      multi: true,
    },
  ],
  template: `
    <mat-form-field appearance="outline" class="profile-mat-field profile-month-picker">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [ngModel]="selectedDate()"
        (ngModelChange)="onDateInput($event)"
        [matDatepicker]="picker"
        [matDatepickerFilter]="dateFilter"
        [max]="maxDate"
        [disabled]="isDisabled()"
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
export class ProfileMonthPickerComponent implements ControlValueAccessor {
  readonly label = input.required<string>();

  readonly maxDate = startOfCurrentMonth();
  readonly dateFilter = (date: Date | null): boolean => !date || !isFutureMonth(date);

  readonly selectedDate = signal<Date | null>(null);
  readonly isDisabled = signal(false);

  private onChange: (value: string | undefined) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | undefined): void {
    this.selectedDate.set(parseMonthValue(value));
  }

  registerOnChange(fn: (value: string | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onDateInput(value: Date | null): void {
    if (value && isFutureMonth(value)) {
      return;
    }

    this.selectedDate.set(value);
    this.onChange(formatMonthValue(value));
    this.onTouched();
  }

  onMonthSelected(value: Date, picker: MatDatepicker<Date>): void {
    picker.close();
    this.onDateInput(value);
  }
}
