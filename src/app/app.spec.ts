import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('shows a subtle status toast when a WebMCP tool is activated', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const event = new Event('toolactivated');
    Object.defineProperty(event, 'toolName', { value: 'search_jobs' });

    window.dispatchEvent(event);
    await fixture.whenStable();

    const toast = fixture.nativeElement.querySelector(
      '[data-toast-kind="ai-activity"]',
    ) as HTMLElement | null;
    expect(toast).toBeTruthy();
    expect(toast?.textContent).toContain('AI tool activated');
    expect(toast?.textContent).toContain('Search jobs');
    expect(toast?.getAttribute('role')).toBe('status');
  });
});
