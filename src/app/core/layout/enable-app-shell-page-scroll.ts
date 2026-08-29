import { DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export function enableAppShellPageScroll(): void {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);

  if (!isPlatformBrowser(platformId)) {
    return;
  }

  document.body.classList.add('page-scroll-y');
  destroyRef.onDestroy(() => document.body.classList.remove('page-scroll-y'));
}
