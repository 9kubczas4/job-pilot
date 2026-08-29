import {
  formatSalary,
  formatWorkplace,
  formatSeniority,
  formatContractTypes,
  formatWorkSchedules,
  formatCompetency,
} from '../../domain/job-formatters';
import { JobOffer } from '../../domain/job.model';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function companyInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

export function buildJobMapPopupHtml(job: JobOffer): string {
  const salary = formatSalary(job);
  const workplace = formatWorkplace(job);
  const competencies = job.competencies.slice(0, 3).map((competency) => formatCompetency(competency));
  const extraCompetencies = job.competencies.length - competencies.length;
  const contracts = formatContractTypes(job.contractTypes);
  const schedules = formatWorkSchedules(job.workSchedules);

  const competenciesHtml = competencies.length
    ? `<div class="job-map-popup__competencies">
        ${competencies
          .map((competency) => `<span class="job-map-popup__chip">${escapeHtml(competency)}</span>`)
          .join('')}
        ${
          extraCompetencies > 0
            ? `<span class="job-map-popup__chip job-map-popup__chip--muted">+${extraCompetencies}</span>`
            : ''
        }
      </div>`
    : '';

  return `
    <article
      class="job-map-popup"
      data-job-map-popup="${escapeHtml(job.id)}"
      role="link"
      tabindex="0"
      aria-label="View ${escapeHtml(job.title)} at ${escapeHtml(job.company.name)}"
    >
      <div class="job-map-popup__identity">
        <div class="job-map-popup__logo" aria-hidden="true">
          ${escapeHtml(companyInitials(job.company.name))}
        </div>
        <div class="job-map-popup__intro">
          <h3 class="job-map-popup__title">${escapeHtml(job.title)}</h3>
          <p class="job-map-popup__company">${escapeHtml(job.company.name)}</p>
        </div>
      </div>

      <div class="job-map-popup__badges">
        <span class="job-map-popup__badge">${escapeHtml(workplace)}</span>
        <span class="job-map-popup__badge">${escapeHtml(formatSeniority(job.seniority))}</span>
      </div>

      ${salary ? `<p class="job-map-popup__salary">${escapeHtml(salary)}</p>` : ''}

      ${
        contracts
          ? `<p class="job-map-popup__meta">${escapeHtml(contracts)} · ${escapeHtml(schedules)}</p>`
          : ''
      }

      ${competenciesHtml}
    </article>`;
}
