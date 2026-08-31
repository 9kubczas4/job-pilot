import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { JobRepository } from '@features/jobs/data-access/job.repository';
import { JobOffer } from '@features/jobs/domain/job.model';
import { HeaderUiStore } from '@features/jobs/state/header-ui.store';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { JobSearchWebMcpService } from './job-search-webmcp.service';

@Component({ template: '' })
class EmptyPageComponent {}

const NEW_YORK_JOB: JobOffer = {
  id: 'job-001',
  title: 'Frontend Developer',
  company: { id: 'acme', name: 'Acme' },
  description: 'Angular role in New York.',
  seniority: ['senior'],
  competencies: [{ name: 'Angular', level: 5 }],
  salary: { min: 7500, max: 11500, currency: 'USD', period: 'month' },
  workSchedules: ['full-time'],
  contractTypes: ['b2b'],
  workplace: 'remote',
  location: {
    city: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
  },
  responsibilities: [],
  requirements: [],
  createdAt: '2026-08-28T00:00:00.000Z',
};

describe('JobSearchWebMcpService', () => {
  let service: JobSearchWebMcpService;
  let router: Router;
  let headerUi: HeaderUiStore;
  let store: JobSearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: EmptyPageComponent },
          { path: 'jobs', component: EmptyPageComponent },
        ]),
        {
          provide: JobRepository,
          useValue: { getAllJobs: () => Promise.resolve([NEW_YORK_JOB]) },
        },
      ],
    }).compileComponents();

    service = TestBed.inject(JobSearchWebMcpService);
    router = TestBed.inject(Router);
    headerUi = TestBed.inject(HeaderUiStore);
    store = TestBed.inject(JobSearchStore);
    await router.navigateByUrl('/');
  });

  it('submits search criteria through the same UI trigger when called from home', async () => {
    const triggerBefore = headerUi.searchApplyTrigger();

    await service.applySearchCriteria({
      query: 'Frontend',
      location: 'New York',
      radiusMi: 100,
    });

    expect(headerUi.searchQuery()).toBe('Frontend');
    expect(headerUi.locationQuery()).toBe('New York');
    expect(headerUi.radiusMi()).toBe(100);
    expect(headerUi.searchApplyTrigger()).toBe(triggerBefore + 1);
    expect(router.parseUrl(router.url).queryParams).toMatchObject({
      q: 'Frontend',
      location: 'New York',
      radius: '100',
    });
    expect(router.url.startsWith('/jobs?')).toBe(true);
    expect(headerUi.queryToolActive()).toBe(true);
    expect(headerUi.locationToolActive()).toBe(true);
    expect(headerUi.radiusToolActive()).toBe(true);
    expect(headerUi.filterToolActive()).toBe(false);
    expect(headerUi.sortToolActive()).toBe(false);
  });

  it('returns lightweight job summaries alongside ids from search_jobs', async () => {
    const result = await service.applySearchCriteria({
      query: 'Frontend',
      location: 'New York',
      radiusMi: 25,
    });

    expect(result.jobIds).toEqual(['job-001']);
    expect(result.results).toEqual([
      {
        id: 'job-001',
        title: 'Frontend Developer',
        company: 'Acme',
        location: 'New York',
        distanceMi: 0,
        workplace: 'remote',
        salary: { min: 7500, max: 11500, currency: 'USD', period: 'month' },
        seniority: ['senior'],
        skills: ['Angular'],
      },
    ]);
  });

  it('marks only radius when search_jobs preserves query and location', async () => {
    store.setCriteriaFromRoute({
      query: 'Frontend',
      locations: ['New York'],
      locationLat: 40.7128,
      locationLng: -74.006,
      radiusMi: 25,
    });

    await service.applySearchCriteria({
      query: 'Frontend',
      location: 'New York',
      radiusMi: 50,
    });

    expect(headerUi.queryToolActive()).toBe(false);
    expect(headerUi.locationToolActive()).toBe(false);
    expect(headerUi.radiusToolActive()).toBe(true);
    expect(headerUi.filterToolActive()).toBe(false);
    expect(headerUi.sortToolActive()).toBe(false);
  });

  it('does not mark controls when normalized criteria stay unchanged', async () => {
    store.setCriteriaFromRoute({
      locations: ['New York'],
      locationLat: 40.7128,
      locationLng: -74.006,
      radiusMi: 25,
    });

    await service.applySearchCriteria({ location: 'New York', radiusMi: 25 });

    expect(headerUi.queryToolActive()).toBe(false);
    expect(headerUi.locationToolActive()).toBe(false);
    expect(headerUi.radiusToolActive()).toBe(false);
    expect(headerUi.filterToolActive()).toBe(false);
    expect(headerUi.sortToolActive()).toBe(false);
  });

  it('replaces the complete search state and clears omitted filters', async () => {
    store.setCriteriaFromRoute({
      query: 'Legacy query',
      locations: ['Boston'],
      workplace: ['onsite'],
      skills: ['Java'],
      salaryMin: 9000,
      sort: 'salary-asc',
    });

    await service.applySearchCriteria({
      query: 'Frontend',
      location: 'New York',
      workplace: ['remote'],
      seniority: ['senior'],
      sort: 'salary-desc',
    });

    expect(store.criteria()).toEqual({
      query: 'Frontend',
      locations: ['New York'],
      locationLat: NEW_YORK_JOB.location?.latitude,
      locationLng: NEW_YORK_JOB.location?.longitude,
      radiusMi: 50,
      workplace: ['remote'],
      seniority: ['senior'],
      skills: undefined,
      contracts: undefined,
      workSchedules: undefined,
      salaryMin: undefined,
      roles: undefined,
      sort: 'salary-desc',
    });
    expect(router.parseUrl(router.url).queryParams).toMatchObject({
      q: 'Frontend',
      location: 'New York',
      workplace: 'remote',
      seniority: 'senior',
      sort: 'salary-desc',
    });
  });
});
