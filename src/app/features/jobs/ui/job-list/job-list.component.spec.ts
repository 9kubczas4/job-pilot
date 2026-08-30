import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { JobOffer } from '@features/jobs/domain/job.model';
import { JOB_VIRTUAL_SCROLL_ITEM_SIZE_PX } from '@features/jobs/ui/job-virtual-scroll/job-virtual-scroll.constants';
import { JobListComponent } from './job-list.component';

const JOBS = Array.from({ length: 50 }, (_, index): JobOffer => ({
  id: `job-${index}`,
  title: `Frontend Developer ${index}`,
  company: { id: `company-${index}`, name: `Company ${index}` },
  description: 'Build accessible products.',
  seniority: ['regular'],
  competencies: [],
  workSchedules: ['full-time'],
  contractTypes: ['employment'],
  workplace: 'hybrid',
  responsibilities: [],
  requirements: [],
  createdAt: '2026-01-01T00:00:00.000Z',
}));

describe('JobListComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [JobListComponent],
      providers: [provideRouter([])],
    });
  });

  it('renders skeleton placeholders while loading', async () => {
    const fixture = TestBed.createComponent(JobListComponent);
    fixture.componentRef.setInput('jobs', []);
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('app-job-card-skeleton').length).toBeGreaterThan(1);
    expect(fixture.nativeElement.textContent).not.toContain('Loading jobs…');
  });

  it('renders job results through a fixed-size CDK virtual viewport', async () => {
    const fixture = TestBed.createComponent(JobListComponent);
    fixture.componentRef.setInput('jobs', JOBS);
    await fixture.whenStable();

    const viewport = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport');

    expect(viewport).toBeTruthy();
    expect(fixture.componentInstance.virtualScrollItemSize).toBe(JOB_VIRTUAL_SCROLL_ITEM_SIZE_PX);
    expect(fixture.nativeElement.querySelector('app-job-card-skeleton')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('50 matching jobs');
  });
});
