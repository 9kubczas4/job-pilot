import { formatSalary, formatWorkplace } from './job-formatters';
import { JobOffer } from './job.model';
import { PageSeoMetadata } from '@core/domains/seo/page-seo.model';

const META_DESCRIPTION_MAX = 160;

function truncate(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildJobPageUrl(siteUrl: string, jobId: string): string {
  return `${siteUrl.replace(/\/$/, '')}/jobs/${jobId}`;
}

export function buildJobMetaDescription(job: JobOffer): string {
  const location = job.location?.city ?? formatWorkplace(job);
  const salary = formatSalary(job);
  const lead = [job.title, job.company.name, location, salary].filter(Boolean).join(' · ');
  const excerpt = job.description.trim();

  if (!excerpt) {
    return truncate(lead, META_DESCRIPTION_MAX);
  }

  const combined = `${lead}. ${excerpt}`;
  return truncate(combined, META_DESCRIPTION_MAX);
}

export function buildJobSeoMetadata(job: JobOffer, siteUrl: string): PageSeoMetadata {
  const description = buildJobMetaDescription(job);
  const headline = `${job.title} at ${job.company.name}`;

  return {
    title: `${headline} | Job Pilot`,
    description,
    url: buildJobPageUrl(siteUrl, job.id),
    ogTitle: headline,
    ogDescription: description,
    twitterTitle: headline,
    twitterDescription: description,
  };
}
