# ADR-004: Google Maps for the job map

## Status
Accepted

## Date
2026-08-29

## Context

The job search page shows a split list + map view with marker selection sync. Early planning assumed MapLibre GL (open-source, no API key). The project already uses Google Cloud for Firebase and the hackathon provides a free Maps tier.

Requirements:

- Markers for job locations with list↔map selection sync
- Marker clustering when many jobs share an area
- Acceptable cost on Firebase/Google Cloud free tier

## Decision

Use **Google Maps JavaScript API** via `@angular/google-maps` and `@googlemaps/markerclusterer`.

- API key configured in `environment.googleMapsApiKey`
- Lazy-loaded in browser via `APP_INITIALIZER` (`shared/map/google-maps-loader.ts`)
- Custom map styles in `shared/map/google-maps-styles.ts`
- Marker clustering enabled in `job-map.component.ts`

Map helpers live in `shared/map/` because they are rendering infrastructure, not job domain logic.

## Alternatives Considered

### MapLibre GL JS
- Pros: No API key, fully open-source, used in early spec
- Cons: Separate tile provider setup; no integration with existing GCP billing
- Rejected: Google Maps fits the existing cloud stack and Angular has first-party bindings

### Google Maps without clustering
- Pros: Simpler implementation
- Cons: 40+ markers in Warsaw overlap and degrade UX
- Rejected: Clustering is implemented with `@googlemaps/markerclusterer`

## Consequences

- Production requires a restricted Google Maps API key (domain-restricted)
- Map does not render during prerender/SSR — the component guards on browser platform
- Free tier: 10,000 map loads/month; set GCP quota limits for safety
- `@angular/google-maps` and marker clusterer add to bundle size (~budget: 1.5 MB warning in `angular.json`)
