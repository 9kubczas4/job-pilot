import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JobHighlightStore } from './job-highlight.store';

describe('JobHighlightStore', () => {
  let store: JobHighlightStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(JobHighlightStore);
  });

  it('creates a distinct request when the same job is highlighted again', () => {
    store.highlight('job-001');
    const first = store.request();

    store.highlight('job-001');
    const second = store.request();

    expect(first).toEqual({ jobId: 'job-001', requestId: 1 });
    expect(second).toEqual({ jobId: 'job-001', requestId: 2 });
  });

  it('clears transient highlight state', () => {
    store.highlight('job-001');

    store.clear();

    expect(store.request()).toBeNull();
  });

  it('keeps request ids unique after a manual clear', () => {
    store.highlight('job-001');
    store.clear();

    store.highlight('job-001');

    expect(store.request()).toEqual({ jobId: 'job-001', requestId: 2 });
  });
});
