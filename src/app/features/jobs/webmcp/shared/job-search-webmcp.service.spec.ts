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
      locations: ['Warsaw'],
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

  it('submits filters and preserved search fields through the UI trigger from home', async () => {
    store.setCriteriaFromRoute({
      query: 'Angular',
      locations: ['Warsaw'],
      locationLat: 52.2297,
      locationLng: 21.0122,
      radiusKm: 25,
    });
    headerUi.syncFromCriteria(store.criteria());
    const triggerBefore = headerUi.searchApplyTrigger();

    await service.applyFilterCriteria({ workplace: ['remote'], salaryMin: 7000 });

    expect(headerUi.searchQuery()).toBe('Angular');
    expect(headerUi.locationQuery()).toBe('Warsaw');
    expect(headerUi.searchApplyTrigger()).toBe(triggerBefore + 1);
    expect(router.parseUrl(router.url).queryParams).toMatchObject({
      q: 'Angular',
      location: 'Warsaw',
      workplace: 'remote',
      salaryMin: '7000',
    });
    expect(router.url.startsWith('/jobs?')).toBe(true);
    expect(headerUi.queryToolActive()).toBe(false);
    expect(headerUi.locationToolActive()).toBe(false);
    expect(headerUi.radiusToolActive()).toBe(false);
    expect(headerUi.filterToolActive()).toBe(true);
    expect(headerUi.sortToolActive()).toBe(false);
  });

  it('marks only the sort control when filter_jobs changes sorting', async () => {
    await service.applyFilterCriteria({ sort: 'salary-desc' });

    expect(headerUi.queryToolActive()).toBe(false);
    expect(headerUi.locationToolActive()).toBe(false);
    expect(headerUi.radiusToolActive()).toBe(false);
    expect(headerUi.filterToolActive()).toBe(false);
    expect(headerUi.sortToolActive()).toBe(true);
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
      locations: ['Warsaw'],
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

    await service.applySearchCriteria({ locations: ['Warsaw'], radiusKm: 25 });

    expect(headerUi.queryToolActive()).toBe(false);
    expect(headerUi.locationToolActive()).toBe(false);
    expect(headerUi.radiusToolActive()).toBe(false);
    expect(headerUi.filterToolActive()).toBe(false);
    expect(headerUi.sortToolActive()).toBe(false);
  });
});
