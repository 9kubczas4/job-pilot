import { JobOffer } from './job.model';

export function formatSalary(job: JobOffer): string | null {
  if (!job.salary) {
    return null;
  }
  const { min, max, currency, period } = job.salary;
  const suffix = period === 'month' ? '/mo' : '/yr';
  return `${formatAmount(min)}–${formatAmount(max)} ${currency}${suffix}`;
}

function formatAmount(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return String(value);
}

export function formatWorkplace(job: JobOffer): string {
  const city = job.location?.city;
  const workplace = job.workplace.charAt(0).toUpperCase() + job.workplace.slice(1);
  return city ? `${city} · ${workplace}` : workplace;
}
