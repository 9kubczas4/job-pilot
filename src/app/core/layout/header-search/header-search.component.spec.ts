import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HeaderSearchComponent } from './header-search.component';

describe('HeaderSearchComponent', () => {
  it('marks only the query field as busy when the AI changes the query', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSearchComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderSearchComponent);
    fixture.componentRef.setInput('queryUpdateActive', true);

    await fixture.whenStable();

    const queryInput = fixture.nativeElement.querySelector('#header-search-jobs') as HTMLInputElement;
    const locationInput = fixture.nativeElement.querySelector(
      '#header-search-location',
    ) as HTMLInputElement;
    const radiusButton = fixture.nativeElement.querySelector(
      '#header-search-radius',
    ) as HTMLButtonElement;

    expect(queryInput.classList.contains('header-search__input--ai-updating')).toBe(true);
    expect(queryInput.getAttribute('aria-busy')).toBe('true');
    expect(locationInput.classList.contains('header-search__input--ai-updating')).toBe(false);
    expect(radiusButton.classList.contains('header-search__radius--ai-updating')).toBe(false);
  });

  it('marks location and radius independently from the query field', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSearchComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderSearchComponent);
    fixture.componentRef.setInput('locationUpdateActive', true);
    fixture.componentRef.setInput('radiusUpdateActive', true);

    await fixture.whenStable();

    const queryInput = fixture.nativeElement.querySelector('#header-search-jobs') as HTMLInputElement;
    const locationInput = fixture.nativeElement.querySelector(
      '#header-search-location',
    ) as HTMLInputElement;
    const radiusButton = fixture.nativeElement.querySelector(
      '#header-search-radius',
    ) as HTMLButtonElement;

    expect(queryInput.classList.contains('header-search__input--ai-updating')).toBe(false);
    expect(locationInput.classList.contains('header-search__input--ai-updating')).toBe(true);
    expect(radiusButton.classList.contains('header-search__radius--ai-updating')).toBe(true);
  });
});
