import { JobSearchCriteria } from './search.model';
import { hasActiveSearchOrFilter } from './search-active.utils';

describe('search-active.utils', () => {
  it('detects an active text query', () => {
    expect(hasActiveSearchOrFilter({ query: 'frontend' })).toBe(true);
  });

  it('detects active filters', () => {
    expect(hasActiveSearchOrFilter({ seniority: ['senior'] })).toBe(true);
    expect(hasActiveSearchOrFilter({ salaryMin: 5000 })).toBe(true);
  });

  it('returns false for empty criteria', () => {
    expect(hasActiveSearchOrFilter({} satisfies JobSearchCriteria)).toBe(false);
  });
});
