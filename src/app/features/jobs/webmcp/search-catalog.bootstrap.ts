import { type Provider } from '@angular/core';
import { provideHeaderSearchSlot } from '../state/header-search-slot.provider';

/** Header search slot wiring for app-shell pages. */
export function provideJobsHeaderSearch(): Provider[] {
  return [provideHeaderSearchSlot()];
}
