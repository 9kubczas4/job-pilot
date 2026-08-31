import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { JobRepository } from '@features/jobs/data-access/job.repository';
import { ApplyJobStore } from '@features/jobs/state/apply-job.store';
import { JobCompareStore } from '@features/jobs/state/job-compare.store';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: JobRepository,
          useValue: {
            getJobById: () => Promise.resolve(null),
            getAllJobs: () => Promise.resolve([]),
          },
        },
        {
          provide: ApplyJobStore,
          useValue: {
            presentation: () => null,
            isOpen: () => false,
            submitting: () => false,
            dismiss: () => undefined,
          },
        },
        {
          provide: JobCompareStore,
          useValue: {
            presentation: () => null,
            isOpen: () => false,
            loading: () => false,
            dismiss: () => undefined,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('shows a subtle status toast when a WebMCP tool is activated', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const event = new Event('toolactivated');
    Object.defineProperty(event, 'toolName', { value: 'search_jobs' });

    window.dispatchEvent(event);
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector(
      '[data-toast-kind="ai-activity"]',
    ) as HTMLElement | null;
    expect(toast).toBeTruthy();
    expect(toast?.textContent).toContain('AI tool activated');
    expect(toast?.textContent).toContain('Search jobs');
    expect(toast?.getAttribute('role')).toBe('status');
  });
});
