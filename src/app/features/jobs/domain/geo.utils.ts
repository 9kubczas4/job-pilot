export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const KM_PER_MILE = 1.609344;

export function milesToKm(miles: number): number {
  return miles * KM_PER_MILE;
}

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}

export function haversineDistanceMi(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  return kmToMiles(haversineDistanceKm(lat1, lng1, lat2, lng2));
}
