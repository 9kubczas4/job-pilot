import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/infrastructure/theme/theme.service';
import { ToastHostComponent } from '@shared/ui/toast/toast-host.component';
import { ToastService } from '@shared/ui/toast/toast.service';
import { JobCompareDrawerHostComponent } from '@features/jobs/shell/job-compare-drawer-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, JobCompareDrawerHostComponent],
  template: `
    <router-outlet />
    <app-toast-host />
    <app-job-compare-drawer-host />
  `,
})
export class App {
  constructor() {
    inject(ThemeService);

    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    const toast = inject(ToastService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const onToolActivated = (event: Event) => {
        toast.showAiToolActivated(readToolName(event));
      };

      window.addEventListener('toolactivated', onToolActivated);
      destroyRef.onDestroy(() => window.removeEventListener('toolactivated', onToolActivated));
    });
  }
}

function readToolName(event: Event): string {
  const directName = (event as Event & { toolName?: unknown }).toolName;
  if (typeof directName === 'string') {
    return directName;
  }

  const detailName = (event as CustomEvent<{ toolName?: unknown }>).detail?.toolName;
  return typeof detailName === 'string' ? detailName : '';
}
