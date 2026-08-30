export function parseMonthValue(value?: string): Date | null {
  if (!value?.trim()) {
    return null;
  }

  const [yearRaw, monthRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!year || !month || month < 1 || month > 12) {
    return null;
  }

  return new Date(year, month - 1, 1);
}

export function formatMonthValue(date: Date | null | undefined): string | undefined {
  if (!date) {
    return undefined;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthDisplay(
  date: Date | null | undefined,
  month: 'short' | 'long' = 'short',
): string {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month,
    year: 'numeric',
  }).format(date);
}

export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function isFutureMonth(date: Date): boolean {
  const candidate = new Date(date.getFullYear(), date.getMonth(), 1);
  return candidate.getTime() > startOfCurrentMonth().getTime();
}

export function isFutureMonthValue(value?: string): boolean {
  const date = parseMonthValue(value);
  return date ? isFutureMonth(date) : false;
}
