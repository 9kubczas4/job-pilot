import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'job-pilot-theme';
const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly systemPrefersDark = signal(false);
  private readonly preferenceState = signal<ThemePreference>('system');

  readonly preference = this.preferenceState.asReadonly();

  readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.preferenceState();

    if (preference === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }

    return preference;
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.preferenceState.set(this.readStoredPreference());
    this.systemPrefersDark.set(window.matchMedia(THEME_MEDIA_QUERY).matches);

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);
    const onSystemThemeChange = (event: MediaQueryListEvent) => {
      this.systemPrefersDark.set(event.matches);
    };

    mediaQuery.addEventListener('change', onSystemThemeChange);

    effect(() => {
      this.applyTheme(this.resolved());
    });

    effect(() => {
      const preference = this.preferenceState();
      localStorage.setItem(STORAGE_KEY, preference);
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preferenceState.set(preference);
  }

  private readStoredPreference(): ThemePreference {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  }

  private applyTheme(theme: ResolvedTheme): void {
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.style.colorScheme = theme;
  }
}
