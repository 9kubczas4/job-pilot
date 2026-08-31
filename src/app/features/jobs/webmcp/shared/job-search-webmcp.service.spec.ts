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

const WARSAW_JOB: JobOffer = {
  id: 'job-001',
  title: 'Frontend Developer',
  company: { id: 'acme', name: 'Acme' },
  description: 'Angular role in Warsaw.',
  seniority: ['senior'],
  competencies: [{ name: 'Angular', level: 5 }],
  salary: { min: 12000, max: 17000, currency: 'USD', period: 'month' },
  workSchedules: ['full-time'],
  contractTypes: ['b2b'],
  workplace: 'remote',
  location: {
    city: 'Warsaw',
    country: 'Poland',
    latitude: 52.2297,
    longitude: 21.0122,
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
          useValue: { getAllJobs: () => Promise.resolve([WARSAW_JOB]) },
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
      location: 'Warsaw',
      radiusKm: 50,
    });

    expect(headerUi.searchQuery()).toBe('Frontend');
    expect(headerUi.locationQuery()).toBe('Warsaw');
    expect(headerUi.radiusKm()).toBe(50);
    expect(headerUi.searchApplyTrigger()).toBe(triggerBefore + 1);
    expect(router.parseUrl(router.url).queryParams).toMatchObject({
      q: 'Frontend',
      location: 'Warsaw',
      radius: '50',
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
      location: 'Warsaw',
      radiusKm: 25,
    });

    expect(result.jobIds).toEqual(['job-001']);
    expect(result.results).toEqual([
      {
        id: 'job-001',
        title: 'Frontend Developer',
        company: 'Acme',
        location: 'Warsaw',
        distanceKm: 0,
        workplace: 'remote',
        salary: { min: 12000, max: 17000, currency: 'USD', period: 'month' },
        seniority: ['senior'],
        skills: ['Angular'],
      },
    ]);
  });

  it('marks only radius when search_jobs preserves query and location', async () => {
    store.setCriteriaFromRoute({
      query: 'Frontend',
      locations: ['Warsaw'],
      locationLat: 52.2297,
      locationLng: 21.0122,
      radiusKm: 25,
    });

    await service.applySearchCriteria({
      query: 'Frontend',
      location: 'Warsaw',
      radiusKm: 50,
    });

    expect(headerUi.queryToolActive()).toBe(false);
    expect(headerUi.locationToolActive()).toBe(false);
    expect(headerUi.radiusToolActive()).toBe(true);
    expect(headerUi.filterToolActive()).toBe(false);
    expect(headerUi.sortToolActive()).toBe(false);
  });

  it('does not mark controls when normalized criteria stay unchanged', async () => {
    store.setCriteriaFromRoute({
      locations: ['Warsaw'],
      locationLat: 52.2297,
      locationLng: 21.0122,
      radiusKm: 25,
    });

    await service.applySearchCriteria({ location: 'Warsaw', radiusKm: 25 });

    expect(headerUi.queryToolActive()).toBe(false);
    expect(headerUi.locationToolActive()).toBe(false);
    expect(headerUi.radiusToolActive()).toBe(false);
    expect(headerUi.filterToolActive()).toBe(false);
    expect(headerUi.sortToolActive()).toBe(false);
  });

  it('replaces the complete search state and clears omitted filters', async () => {
    store.setCriteriaFromRoute({
      query: 'Legacy query',
      locations: ['Krakow'],
      workplace: ['onsite'],
      skills: ['Java'],
      salaryMin: 9000,
      sort: 'salary-asc',
    });

    await service.applySearchCriteria({
      query: 'Frontend',
      location: 'Warsaw',
      workplace: ['remote'],
      seniority: ['senior'],
      sort: 'salary-desc',
    });

    expect(store.criteria()).toEqual({
      query: 'Frontend',
      locations: ['Warsaw'],
      locationLat: WARSAW_JOB.location?.latitude,
      locationLng: WARSAW_JOB.location?.longitude,
      radiusKm: 25,
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
      location: 'Warsaw',
      workplace: 'remote',
      seniority: 'senior',
      sort: 'salary-desc',
    });
  });
});
