/** District-level coordinates for spreading job markers within Polish cities. */
export const CITY_LOCATIONS = {
  Krakow: [
    { city: 'Krakow', country: 'Poland', latitude: 50.0614, longitude: 19.9372 },
    { city: 'Krakow', country: 'Poland', latitude: 50.0512, longitude: 19.9483 },
    { city: 'Krakow', country: 'Poland', latitude: 50.0394, longitude: 19.9594 },
    { city: 'Krakow', country: 'Poland', latitude: 50.0847, longitude: 19.9147 },
    { city: 'Krakow', country: 'Poland', latitude: 50.0734, longitude: 20.034 },
    { city: 'Krakow', country: 'Poland', latitude: 50.0986, longitude: 19.8869 },
    { city: 'Krakow', country: 'Poland', latitude: 50.0489, longitude: 19.9658 },
    { city: 'Krakow', country: 'Poland', latitude: 50.0711, longitude: 19.9628 },
  ],
  Wroclaw: [
    { city: 'Wroclaw', country: 'Poland', latitude: 51.1105, longitude: 17.0319 },
    { city: 'Wroclaw', country: 'Poland', latitude: 51.1149, longitude: 17.0327 },
    { city: 'Wroclaw', country: 'Poland', latitude: 51.1278, longitude: 17.0456 },
    { city: 'Wroclaw', country: 'Poland', latitude: 51.0853, longitude: 17.0128 },
    { city: 'Wroclaw', country: 'Poland', latitude: 51.1456, longitude: 17.1289 },
    { city: 'Wroclaw', country: 'Poland', latitude: 51.1123, longitude: 16.9789 },
    { city: 'Wroclaw', country: 'Poland', latitude: 51.0689, longitude: 16.9856 },
  ],
  Poznan: [
    { city: 'Poznan', country: 'Poland', latitude: 52.4083, longitude: 16.9337 },
    { city: 'Poznan', country: 'Poland', latitude: 52.4189, longitude: 16.9056 },
    { city: 'Poznan', country: 'Poland', latitude: 52.3934, longitude: 16.9123 },
    { city: 'Poznan', country: 'Poland', latitude: 52.3789, longitude: 16.8945 },
    { city: 'Poznan', country: 'Poland', latitude: 52.4312, longitude: 16.9456 },
    { city: 'Poznan', country: 'Poland', latitude: 52.3656, longitude: 16.9567 },
    { city: 'Poznan', country: 'Poland', latitude: 52.3845, longitude: 16.9012 },
  ],
  Katowice: [
    { city: 'Katowice', country: 'Poland', latitude: 50.2649, longitude: 19.0238 },
    { city: 'Katowice', country: 'Poland', latitude: 50.2789, longitude: 19.0456 },
    { city: 'Katowice', country: 'Poland', latitude: 50.2234, longitude: 19.0123 },
    { city: 'Katowice', country: 'Poland', latitude: 50.2456, longitude: 19.0567 },
    { city: 'Katowice', country: 'Poland', latitude: 50.2123, longitude: 18.9789 },
    { city: 'Katowice', country: 'Poland', latitude: 50.2512, longitude: 19.0345 },
  ],
  Warsaw: [
    { city: 'Warsaw', country: 'Poland', latitude: 52.2297, longitude: 21.0122 },
    { city: 'Warsaw', country: 'Poland', latitude: 52.2485, longitude: 21.0127 },
    { city: 'Warsaw', country: 'Poland', latitude: 52.2052, longitude: 21.0234 },
    { city: 'Warsaw', country: 'Poland', latitude: 52.2356, longitude: 20.9912 },
    { city: 'Warsaw', country: 'Poland', latitude: 52.2678, longitude: 20.9856 },
    { city: 'Warsaw', country: 'Poland', latitude: 52.1934, longitude: 21.0345 },
    { city: 'Warsaw', country: 'Poland', latitude: 52.2145, longitude: 20.9545 },
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
