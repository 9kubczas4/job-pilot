/** District-level coordinates for spreading job markers within US metro areas. */
export const CITY_LOCATIONS = {
  'New York': [
    { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
    { city: 'New York', country: 'United States', latitude: 40.7282, longitude: -73.9942 },
    { city: 'New York', country: 'United States', latitude: 40.6892, longitude: -74.0445 },
    { city: 'New York', country: 'United States', latitude: 40.758, longitude: -73.9855 },
    { city: 'New York', country: 'United States', latitude: 40.7484, longitude: -73.9857 },
    { city: 'New York', country: 'United States', latitude: 40.7061, longitude: -74.0087 },
    { city: 'New York', country: 'United States', latitude: 40.7614, longitude: -73.9776 },
  ],
  Boston: [
    { city: 'Boston', country: 'United States', latitude: 42.3601, longitude: -71.0589 },
    { city: 'Boston', country: 'United States', latitude: 42.3554, longitude: -71.0655 },
    { city: 'Boston', country: 'United States', latitude: 42.3736, longitude: -71.1097 },
    { city: 'Boston', country: 'United States', latitude: 42.3467, longitude: -71.0972 },
    { city: 'Boston', country: 'United States', latitude: 42.3656, longitude: -71.0096 },
    { city: 'Boston', country: 'United States', latitude: 42.3398, longitude: -71.0892 },
    { city: 'Boston', country: 'United States', latitude: 42.3505, longitude: -71.0754 },
  ],
  Chicago: [
    { city: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
    { city: 'Chicago', country: 'United States', latitude: 41.8819, longitude: -87.6278 },
    { city: 'Chicago', country: 'United States', latitude: 41.8925, longitude: -87.6244 },
    { city: 'Chicago', country: 'United States', latitude: 41.8656, longitude: -87.6173 },
    { city: 'Chicago', country: 'United States', latitude: 41.8506, longitude: -87.6177 },
    { city: 'Chicago', country: 'United States', latitude: 41.9033, longitude: -87.6367 },
  ],
  'San Francisco': [
    { city: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
    { city: 'San Francisco', country: 'United States', latitude: 37.7849, longitude: -122.4094 },
    { city: 'San Francisco', country: 'United States', latitude: 37.7649, longitude: -122.4294 },
    { city: 'San Francisco', country: 'United States', latitude: 37.7955, longitude: -122.3937 },
    { city: 'San Francisco', country: 'United States', latitude: 37.7599, longitude: -122.4148 },
    { city: 'San Francisco', country: 'United States', latitude: 37.7694, longitude: -122.4862 },
  ],
  'Los Angeles': [
    { city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
    { city: 'Los Angeles', country: 'United States', latitude: 34.0407, longitude: -118.2468 },
    { city: 'Los Angeles', country: 'United States', latitude: 34.0689, longitude: -118.4452 },
    { city: 'Los Angeles', country: 'United States', latitude: 34.0195, longitude: -118.4912 },
    { city: 'Los Angeles', country: 'United States', latitude: 34.0736, longitude: -118.2406 },
    { city: 'Los Angeles', country: 'United States', latitude: 34.1016, longitude: -118.3267 },
  ],
};

/**
 * @param {string} city
 * @param {number} index
 */
export function pickCityLocation(city, index) {
  const locations = CITY_LOCATIONS[city];
  if (!locations?.length) {
    return null;
  }
  return locations[index % locations.length];
}

/**
 * @param {Array<{ location?: { city: string } }>} jobs
 */
export function spreadJobLocations(jobs) {
  const cityCounters = {};

  return jobs.map((job) => {
    if (!job.location?.city) {
      return job;
    }

    const city = job.location.city;
    const index = cityCounters[city] ?? 0;
    cityCounters[city] = index + 1;

    const location = pickCityLocation(city, index);
    if (!location) {
      return job;
    }

    return { ...job, location: { ...location } };
  });
}
