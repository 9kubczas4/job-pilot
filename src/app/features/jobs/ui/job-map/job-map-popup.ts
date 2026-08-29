import { formatSalary, formatWorkplace } from '../../domain/job-formatters';
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

function formatSeniority(levels: JobOffer['seniority']): string {
  return levels.map((level) => level.charAt(0).toUpperCase() + level.slice(1)).join(' · ');
}

export function buildJobMapPopupHtml(job: JobOffer): string {
  const salary = formatSalary(job);
  const workplace = formatWorkplace(job);
  const skills = job.skills.slice(0, 3).map((skill) => skill.name);
  const extraSkills = job.skills.length - skills.length;
  const contracts = job.contractTypes.map((type) => type.toUpperCase()).join(' · ');

  const skillsHtml = skills.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
        ${skills
          .map(
            (skill) =>
              `<span style="padding:3px 8px;border-radius:999px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:500;">${escapeHtml(skill)}</span>`,
          )
          .join('')}
        ${
          extraSkills > 0
            ? `<span style="padding:3px 8px;border-radius:999px;background:#f8fafc;color:#94a3b8;font-size:11px;font-weight:500;">+${extraSkills}</span>`
            : ''
        }
      </div>`
    : '';

  return `
    <article style="font-family:Inter,system-ui,sans-serif;color:#0f172a;min-width:220px;max-width:280px;padding:2px 2px 4px;">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <div style="flex-shrink:0;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#eff6ff,#eef2ff);color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;letter-spacing:0.02em;">
          ${escapeHtml(companyInitials(job.company.name))}
        </div>
        <div style="min-width:0;flex:1;">
          <h3 style="margin:0;font-size:14px;font-weight:600;line-height:1.35;">${escapeHtml(job.title)}</h3>
          <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${escapeHtml(job.company.name)}</p>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">
        <span style="padding:4px 8px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;font-size:11px;color:#475569;">${escapeHtml(workplace)}</span>
        <span style="padding:4px 8px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;font-size:11px;color:#475569;">${escapeHtml(formatSeniority(job.seniority))}</span>
      </div>

      ${
        salary
          ? `<p style="margin:10px 0 0;font-size:13px;font-weight:600;color:#047857;">${escapeHtml(salary)}</p>`
          : ''
      }

      ${
        contracts
          ? `<p style="margin:6px 0 0;font-size:11px;color:#94a3b8;">${escapeHtml(contracts)}</p>`
          : ''
      }

      ${skillsHtml}

      <p style="margin:12px 0 0;font-size:11px;color:#2563eb;font-weight:500;">View in list →</p>
    </article>`;
}
