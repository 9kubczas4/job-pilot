import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import {
  formatMonthDisplay,
  parseMonthValue,
} from '@features/profile/domain/month-date.utils';

@Injectable()
export class ProfileMonthDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: object): string {
    if (displayFormat === 'MMM yyyy') {
      return formatMonthDisplay(date, 'short');
    }

    if (displayFormat === 'MMMM yyyy') {
      return formatMonthDisplay(date, 'long');
    }

    return super.format(date, displayFormat);
  }

  override parse(value: unknown): Date | null {
    if (typeof value === 'string' && value.trim()) {
      const storedValue = parseMonthValue(value);
      if (storedValue) {
        return storedValue;
      }

      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        const date = new Date(parsed);
        return new Date(date.getFullYear(), date.getMonth(), 1);
      }
    }

    return super.parse(value);
  }
}
