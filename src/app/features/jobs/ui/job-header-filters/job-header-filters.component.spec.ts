import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JobHeaderFiltersComponent } from './job-header-filters.component';

describe('JobHeaderFiltersComponent', () => {
  it('marks the filter button as busy during an AI filter update', async () => {
    await TestBed.configureTestingModule({
      imports: [JobHeaderFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobHeaderFiltersComponent);
    fixture.componentRef.setInput('enabled', true);
    fixture.componentRef.setInput('aiUpdateActive', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.header-action') as HTMLButtonElement;
    expect(button.classList.contains('header-action--ai-updating')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });
});
