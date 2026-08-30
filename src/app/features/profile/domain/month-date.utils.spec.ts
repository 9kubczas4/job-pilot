import { describe, expect, it } from 'vitest';
import { formatMonthDisplay, formatMonthValue, parseMonthValue } from './month-date.utils';

describe('month-date.utils', () => {
  it('formats month display as short month and year', () => {
    expect(formatMonthDisplay(new Date(2025, 10, 1))).toBe('Nov 2025');
  });

  it('formats month display as long month and year', () => {
    expect(formatMonthDisplay(new Date(2025, 10, 1), 'long')).toBe('November 2025');
  });

  it('round-trips stored month values', () => {
    const date = parseMonthValue('2025-11');
    expect(date).toEqual(new Date(2025, 10, 1));
    expect(formatMonthValue(date)).toBe('2025-11');
    expect(formatMonthDisplay(date)).toBe('Nov 2025');
  });
});
