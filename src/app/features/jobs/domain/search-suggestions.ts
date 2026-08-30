import {
  JobSearchSuggestion,
  JobSuggestionKind,
  LocationSearchSuggestion,
} from '../domain/header-search.model';
import { CityCenter, buildLocationSuggestions } from './city-catalog';
import { JobOffer } from './job.model';

const MAX_SUGGESTIONS = 8;

export function buildJobSearchSuggestions(jobs: JobOffer[], query: string): JobSearchSuggestion[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) {
    return [];
  }

  const suggestions: JobSearchSuggestion[] = [];
  const seen = new Set<string>();

  const addSuggestion = (
    kind: JobSuggestionKind,
    label: string,
    value: string,
    sublabel?: string,
  ) => {
    const key = `${kind}:${value.toLowerCase()}`;
    if (seen.has(key) || !label.toLowerCase().includes(normalized)) {
      return;
    }

    seen.add(key);
    suggestions.push({
      id: key,
      kind,
      label,
      value,
      sublabel,
    });
  };

  for (const job of jobs) {
    addSuggestion('title', job.title, job.title, job.company.name);
    addSuggestion('company', job.company.name, job.company.name, 'Company');

    for (const competency of job.competencies) {
      addSuggestion('skill', competency.name, competency.name, 'Competency');
    }
  }

  const keywordMatches = extractKeywordSuggestions(normalized);
  for (const keyword of keywordMatches) {
    addSuggestion('keyword', keyword, keyword, 'Keyword');
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}

function extractKeywordSuggestions(query: string): string[] {
  const catalog = ['frontend', 'backend', 'fullstack', 'remote', 'hybrid', 'angular', 'react', 'typescript'];
  return catalog.filter((keyword) => keyword.includes(query));
}

export function buildLocationSearchSuggestions(
  catalog: CityCenter[],
  query: string,
): LocationSearchSuggestion[] {
  return buildLocationSuggestions(catalog, query).map((city) => ({
    id: city.city,
    label: `${city.city}, ${city.country}`,
    city: city.city,
    latitude: city.latitude,
    longitude: city.longitude,
  }));
}
