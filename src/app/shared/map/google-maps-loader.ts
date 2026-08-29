let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (!apiKey || typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsConfigured(apiKey: string | undefined): boolean {
  return Boolean(apiKey?.trim());
}
