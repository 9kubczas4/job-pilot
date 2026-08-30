let loadPromise: Promise<void> | null = null;

/**
 * Loads Google Maps using the Dynamic Library Import bootstrap required by
 * @angular/google-maps (google.maps.importLibrary).
 *
 * @see https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import
 */
export function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (!apiKey || typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    installGoogleMapsBootstrap({ key: apiKey, v: 'weekly' });
    await getGoogleMapsWindow().maps.importLibrary('maps');
  })().catch((error: unknown) => {
    loadPromise = null;
    throw error;
  });

  return loadPromise;
}

export function isGoogleMapsConfigured(apiKey: string | undefined): boolean {
  return Boolean(apiKey?.trim());
}

function installGoogleMapsBootstrap(options: { key: string; v: string }): void {
  const w = window as Window & { google?: { maps?: Record<string, unknown> } };
  if (typeof w.google?.maps?.['importLibrary'] === 'function') {
    return;
  }

  w.google ??= {};
  const d = (w.google.maps ??= {});

  // Official inline bootstrap from Google Maps docs.
  ((g: { key: string; v: string }) => {
    let h: Promise<void> | undefined;
    const p = 'The Google Maps JavaScript API';
    const c = 'google';
    const l = 'importLibrary';
    const q = '__ib__';
    const m = document;
    const r = new Set<string>();
    const e = new URLSearchParams();
    const u = () =>
      h ||
      (h = new Promise<void>((resolve, reject) => {
        const a = m.createElement('script');
        e.set('libraries', [...r].join(','));
        for (const k of Object.keys(g)) {
          e.set(
            k.replace(/[A-Z]/g, (t) => `_${t[0].toLowerCase()}`),
            g[k as keyof typeof g],
          );
        }
        e.set('callback', `${c}.maps.${q}`);
        a.src = `https://maps.${c}apis.com/maps/api/js?${e}`;
        d[q] = resolve;
        a.onerror = () => {
          h = undefined;
          reject(new Error(`${p} could not load.`));
        };
        a.nonce = (m.querySelector('script[nonce]') as HTMLScriptElement | null)?.nonce ?? '';
        m.head.append(a);
      }));

    if (d[l]) {
      console.warn(`${p} only loads once. Ignoring:`, g);
      return;
    }

    d[l] = (library: string, ...args: unknown[]) =>
      r.add(library) &&
      u().then(() => (d[l] as (lib: string, ...a: unknown[]) => Promise<unknown>)(library, ...args));
  })(options);
}

function getGoogleMapsWindow(): typeof google {
  const w = window as Window & { google?: typeof google };
  if (!w.google?.maps) {
    throw new Error('Google Maps bootstrap did not initialize window.google.maps');
  }
  return w.google;
}
