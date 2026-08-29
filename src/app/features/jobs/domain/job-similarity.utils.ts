import { JobOffer } from './job.model';

const DEFAULT_LIMIT = 4;

export function findSimilarJobs(
  source: JobOffer,
  candidates: JobOffer[],
  limit = DEFAULT_LIMIT,
): JobOffer[] {
  const sourceListingKey = listingKey(source);

  const scored = dedupeByListingKey(
    candidates.filter((job) => job.id !== source.id && listingKey(job) !== sourceListingKey),
  )
    .map((job) => ({ job, score: scoreSimilarity(source, job) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const results: JobOffer[] = [];
  const seenCompanies = new Set<string>();

  for (const { job } of scored) {
    if (seenCompanies.has(job.company.id)) {
      continue;
    }

    seenCompanies.add(job.company.id);
    results.push(job);

    if (results.length >= limit) {
      return results;
    }
  }

  for (const { job } of scored) {
    if (results.some((entry) => entry.id === job.id)) {
      continue;
    }

    results.push(job);

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

function listingKey(job: JobOffer): string {
  return `${job.company.id}|${job.title.trim().toLowerCase()}`;
}

function dedupeByListingKey(jobs: JobOffer[]): JobOffer[] {
  const seen = new Set<string>();
  const unique: JobOffer[] = [];

  for (const job of jobs) {
    const key = listingKey(job);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(job);
  }

  return unique;
}

function scoreSimilarity(source: JobOffer, candidate: JobOffer): number {
  let score = 0;

  if (source.company.id === candidate.company.id) {
    score += 4;
  }

  if (source.workplace === candidate.workplace) {
    score += 2;
  }

  const sourceCity = source.location?.city.toLowerCase();
  const candidateCity = candidate.location?.city.toLowerCase();
  if (sourceCity && candidateCity && sourceCity === candidateCity) {
    score += 3;
  }

  score += overlapCount(source.seniority, candidate.seniority) * 2;
  score += overlapCount(source.competencies.map((c) => c.name), candidate.competencies.map((c) => c.name)) * 2;
  score += overlapCount(source.contractTypes, candidate.contractTypes);
  score += titleOverlapScore(source.title, candidate.title);

  return score;
}

function overlapCount<T extends string>(left: T[], right: T[]): number {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value)).length;
}

function titleOverlapScore(left: string, right: string): number {
  const tokens = (value: string) =>
    value
      .toLowerCase()
      .split(/[\s,/|-]+/)
      .filter((token) => token.length > 2);

  const rightTokens = new Set(tokens(right));
  return tokens(left).filter((token) => rightTokens.has(token)).length;
}
