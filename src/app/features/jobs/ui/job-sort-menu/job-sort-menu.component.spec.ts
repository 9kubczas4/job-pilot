import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JobSortMenuComponent } from './job-sort-menu.component';

describe('JobSortMenuComponent', () => {
  it('marks the sort trigger as busy during an AI sort update', async () => {
    await TestBed.configureTestingModule({
      imports: [JobSortMenuComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobSortMenuComponent);
    fixture.componentRef.setInput('options', [{ value: 'newest', label: 'Newest' }]);
    fixture.componentRef.setInput('value', 'newest');
    fixture.componentRef.setInput('aiUpdateActive', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.sort-menu__trigger') as HTMLButtonElement;
    expect(button.classList.contains('sort-menu__trigger--ai-updating')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });
});
