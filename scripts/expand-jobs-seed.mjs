import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeCompetencies } from './lib/job-competency.utils.mjs';
import {
  ROLE_TEMPLATES,
  buildCompetencies,
  buildRoleContent,
  findRoleTemplate,
  pick,
  resolveSalaryBand,
  roundSalary,
} from './lib/job-role-templates.mjs';

const TARGET_COUNT = 200;

const LOCATIONS = [
  // Poland - major cities
  { city: 'Warsaw', country: 'Poland', latitude: 52.2297, longitude: 21.0122 },
  { city: 'Krakow', country: 'Poland', latitude: 50.0614, longitude: 19.9372 },
  { city: 'Wroclaw', country: 'Poland', latitude: 51.1079, longitude: 17.0385 },
  { city: 'Gdansk', country: 'Poland', latitude: 54.352, longitude: 18.6466 },
  { city: 'Poznan', country: 'Poland', latitude: 52.4064, longitude: 16.9252 },
  { city: 'Lodz', country: 'Poland', latitude: 51.7592, longitude: 19.456 },
  { city: 'Katowice', country: 'Poland', latitude: 50.2649, longitude: 19.0238 },
  { city: 'Lublin', country: 'Poland', latitude: 51.2465, longitude: 22.5684 },
  { city: 'Szczecin', country: 'Poland', latitude: 53.4285, longitude: 14.5528 },
  { city: 'Bydgoszcz', country: 'Poland', latitude: 53.1235, longitude: 18.0084 },
  { city: 'Bialystok', country: 'Poland', latitude: 53.1325, longitude: 23.1688 },
  { city: 'Rzeszow', country: 'Poland', latitude: 50.0412, longitude: 21.9991 },
  { city: 'Torun', country: 'Poland', latitude: 53.0138, longitude: 18.5984 },
  { city: 'Kielce', country: 'Poland', latitude: 50.8661, longitude: 20.6286 },
  { city: 'Olsztyn', country: 'Poland', latitude: 53.7784, longitude: 20.4801 },
  { city: 'Gdynia', country: 'Poland', latitude: 54.5189, longitude: 18.5305 },
  { city: 'Sopot', country: 'Poland', latitude: 54.4418, longitude: 18.5601 },
  { city: 'Gliwice', country: 'Poland', latitude: 50.2945, longitude: 18.6714 },
  { city: 'Zabrze', country: 'Poland', latitude: 50.3249, longitude: 18.7857 },
  { city: 'Bielsko-Biala', country: 'Poland', latitude: 49.8224, longitude: 19.0469 },
  { city: 'Czestochowa', country: 'Poland', latitude: 50.8118, longitude: 19.1203 },
  { city: 'Radom', country: 'Poland', latitude: 51.4027, longitude: 21.1471 },
  { city: 'Sosnowiec', country: 'Poland', latitude: 50.278, longitude: 19.1344 },
  { city: 'Opole', country: 'Poland', latitude: 50.6751, longitude: 17.9213 },
  { city: 'Gorzow Wielkopolski', country: 'Poland', latitude: 52.7368, longitude: 15.2288 },
  { city: 'Plock', country: 'Poland', latitude: 52.5468, longitude: 19.7064 },
  { city: 'Tarnow', country: 'Poland', latitude: 50.0121, longitude: 20.9858 },
  { city: 'Kalisz', country: 'Poland', latitude: 51.7617, longitude: 18.091 },
  { city: 'Legnica', country: 'Poland', latitude: 51.207, longitude: 16.1619 },
  { city: 'Zielona Gora', country: 'Poland', latitude: 51.9356, longitude: 15.5064 },
  { city: 'Walbrzych', country: 'Poland', latitude: 50.7714, longitude: 16.2843 },
  { city: 'Slupsk', country: 'Poland', latitude: 54.4641, longitude: 17.0285 },
  { city: 'Koszalin', country: 'Poland', latitude: 54.1944, longitude: 16.1722 },
  { city: 'Jelenia Gora', country: 'Poland', latitude: 50.9045, longitude: 15.7198 },
  { city: 'Nowy Sacz', country: 'Poland', latitude: 49.6249, longitude: 20.6915 },
  { city: 'Konin', country: 'Poland', latitude: 52.2231, longitude: 18.2512 },
  { city: 'Pila', country: 'Poland', latitude: 53.1514, longitude: 16.7378 },
  { city: 'Elblag', country: 'Poland', latitude: 54.1561, longitude: 19.4045 },
  { city: 'Grudziadz', country: 'Poland', latitude: 53.4843, longitude: 18.7536 },
  { city: 'Rybnik', country: 'Poland', latitude: 50.1022, longitude: 18.5464 },
  { city: 'Tychy', country: 'Poland', latitude: 50.1372, longitude: 18.9664 },
  { city: 'Dabrowa Gornicza', country: 'Poland', latitude: 50.3219, longitude: 19.1889 },
  { city: 'Chorzow', country: 'Poland', latitude: 50.2984, longitude: 18.9543 },
  { city: 'Suwalki', country: 'Poland', latitude: 54.1118, longitude: 22.9308 },
  { city: 'Zamosc', country: 'Poland', latitude: 50.7231, longitude: 23.2519 },
  { city: 'Leszno', country: 'Poland', latitude: 51.845, longitude: 16.5749 },
  { city: 'Krosno', country: 'Poland', latitude: 49.6833, longitude: 21.7667 },
  { city: 'Pabianice', country: 'Poland', latitude: 51.6644, longitude: 19.3547 },
  { city: 'Mielec', country: 'Poland', latitude: 50.2871, longitude: 21.4239 },
  // United States - East
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { city: 'Boston', country: 'United States', latitude: 42.3601, longitude: -71.0589 },
  { city: 'Philadelphia', country: 'United States', latitude: 39.9526, longitude: -75.1652 },
  { city: 'Washington', country: 'United States', latitude: 38.9072, longitude: -77.0369 },
  { city: 'Atlanta', country: 'United States', latitude: 33.749, longitude: -84.388 },
  { city: 'Miami', country: 'United States', latitude: 25.7617, longitude: -80.1918 },
  { city: 'Charlotte', country: 'United States', latitude: 35.2271, longitude: -80.8431 },
  { city: 'Raleigh', country: 'United States', latitude: 35.7796, longitude: -78.6382 },
  // United States - Midwest
  { city: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
  { city: 'Detroit', country: 'United States', latitude: 42.3314, longitude: -83.0458 },
  { city: 'Minneapolis', country: 'United States', latitude: 44.9778, longitude: -93.265 },
  { city: 'Columbus', country: 'United States', latitude: 39.9612, longitude: -82.9988 },
  { city: 'Indianapolis', country: 'United States', latitude: 39.7684, longitude: -86.1581 },
  { city: 'Kansas City', country: 'United States', latitude: 39.0997, longitude: -94.5786 },
  // United States - South & Texas
  { city: 'Austin', country: 'United States', latitude: 30.2672, longitude: -97.7431 },
  { city: 'Dallas', country: 'United States', latitude: 32.7767, longitude: -96.797 },
  { city: 'Houston', country: 'United States', latitude: 29.7604, longitude: -95.3698 },
  { city: 'San Antonio', country: 'United States', latitude: 29.4241, longitude: -98.4936 },
  { city: 'Nashville', country: 'United States', latitude: 36.1627, longitude: -86.7816 },
  { city: 'Tampa', country: 'United States', latitude: 27.9506, longitude: -82.4572 },
  // United States - West
  { city: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
  { city: 'San Jose', country: 'United States', latitude: 37.3382, longitude: -121.8863 },
  { city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
  { city: 'San Diego', country: 'United States', latitude: 32.7157, longitude: -117.1611 },
  { city: 'Seattle', country: 'United States', latitude: 47.6062, longitude: -122.3321 },
  { city: 'Portland', country: 'United States', latitude: 45.5152, longitude: -122.6784 },
  { city: 'Denver', country: 'United States', latitude: 39.7392, longitude: -104.9903 },
  { city: 'Salt Lake City', country: 'United States', latitude: 40.7608, longitude: -111.891 },
  { city: 'Phoenix', country: 'United States', latitude: 33.4484, longitude: -112.074 },
  { city: 'Las Vegas', country: 'United States', latitude: 36.1699, longitude: -115.1398 },
  { city: 'Pittsburgh', country: 'United States', latitude: 40.4406, longitude: -79.9959 },
  { city: 'Cleveland', country: 'United States', latitude: 41.4993, longitude: -81.6944 },
  { city: 'Milwaukee', country: 'United States', latitude: 43.0389, longitude: -87.9065 },
  { city: 'Jacksonville', country: 'United States', latitude: 30.3322, longitude: -81.6557 },
  { city: 'Memphis', country: 'United States', latitude: 35.1495, longitude: -90.049 },
  { city: 'Louisville', country: 'United States', latitude: 38.2527, longitude: -85.7585 },
  { city: 'Richmond', country: 'United States', latitude: 37.5407, longitude: -77.436 },
  { city: 'Providence', country: 'United States', latitude: 41.824, longitude: -71.4128 },
  { city: 'Buffalo', country: 'United States', latitude: 42.8864, longitude: -78.8784 },
  { city: 'Boise', country: 'United States', latitude: 43.615, longitude: -116.2023 },
  { city: 'Albuquerque', country: 'United States', latitude: 35.0844, longitude: -106.6504 },
  { city: 'Oklahoma City', country: 'United States', latitude: 35.4676, longitude: -97.5164 },
  { city: 'New Orleans', country: 'United States', latitude: 29.9511, longitude: -90.0715 },
  { city: 'Orlando', country: 'United States', latitude: 28.5383, longitude: -81.3792 },
];

const COMPANIES = [
  { id: 'acme', name: 'Acme' },
  { id: 'novatech', name: 'NovaTech' },
  { id: 'cloudscale', name: 'CloudScale' },
  { id: 'dataforge', name: 'DataForge' },
  { id: 'pixelworks', name: 'PixelWorks' },
  { id: 'stackline', name: 'Stackline' },
  { id: 'orbitsoft', name: 'OrbitSoft' },
  { id: 'nimbus', name: 'Nimbus Labs' },
  { id: 'retailplus', name: 'RetailPlus' },
  { id: 'brandwave', name: 'BrandWave' },
  { id: 'northbridge', name: 'Northbridge' },
  { id: 'bluepeak', name: 'BluePeak' },
  { id: 'vertex', name: 'Vertex Systems' },
  { id: 'helix', name: 'Helix AI' },
  { id: 'quantumleaf', name: 'QuantumLeaf' },
  { id: 'riverstone', name: 'Riverstone' },
  { id: 'brightpath', name: 'BrightPath' },
  { id: 'corelane', name: 'CoreLane' },
  { id: 'skyforge', name: 'SkyForge' },
  { id: 'opengrid', name: 'OpenGrid' },
];

const WORKPLACES = ['remote', 'hybrid', 'onsite'];
const WORK_SCHEDULES = ['full-time', 'part-time', 'freelance'];
const CONTRACT_TYPES = ['b2b', 'employment', 'service-contract', 'internship'];

function locationKey(location) {
  return `${location.city}|${location.country}`;
}

function coordinateKey(location) {
  return `${location.latitude.toFixed(4)}|${location.longitude.toFixed(4)}`;
}

function offsetLatLng(latitude, longitude, distanceKm, bearingDeg) {
  const earthRadiusKm = 6371;
  const bearing = (bearingDeg * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const lngRad = (longitude * Math.PI) / 180;
  const angularDistance = distanceKm / earthRadiusKm;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const newLngRad =
    lngRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad),
    );

  return {
    latitude: Number(((newLatRad * 180) / Math.PI).toFixed(4)),
    longitude: Number(((newLngRad * 180) / Math.PI).toFixed(4)),
  };
}

function buildUniqueLocationPool(baseLocations, targetCount) {
  const pool = [];
  const used = new Set();

  function tryAdd(location) {
    const key = coordinateKey(location);
    if (used.has(key)) {
      return false;
    }
    used.add(key);
    pool.push(location);
    return true;
  }

  for (const base of baseLocations) {
    tryAdd({
      city: base.city,
      country: base.country,
      latitude: base.latitude,
      longitude: base.longitude,
    });
    if (pool.length >= targetCount) {
      return pool.slice(0, targetCount);
    }
  }

  let ring = 1;
  while (pool.length < targetCount) {
    for (let baseIndex = 0; baseIndex < baseLocations.length; baseIndex += 1) {
      const base = baseLocations[baseIndex];
      const bearing = (ring * 47 + baseIndex * 29) % 360;
      const distanceKm = 2.2 + ring * 1.6;
      const offset = offsetLatLng(base.latitude, base.longitude, distanceKm, bearing);

      tryAdd({
        city: base.city,
        country: base.country,
        latitude: offset.latitude,
        longitude: offset.longitude,
      });

      if (pool.length >= targetCount) {
        return pool.slice(0, targetCount);
      }
    }
    ring += 1;
  }

  return pool.slice(0, targetCount);
}

function createLocationAssigner(pool) {
  return function assignLocation(index) {
    return { ...pool[index] };
  };
}

function uniqueContractTypes(index) {
  return [pick(CONTRACT_TYPES, index), ...(index % 5 === 0 ? [pick(CONTRACT_TYPES, index + 1)] : [])].filter(
    (value, position, array) => array.indexOf(value) === position,
  );
}

function enrichJob(job, index, assignLocation) {
  const template = findRoleTemplate(job.title);
  const company = job.company ?? pick(COMPANIES, index);
  const workplace = job.workplace ?? pick(WORKPLACES, index);
  const location = assignLocation(index);
  const seniority = job.seniority?.length ? job.seniority : template.seniority;
  const contractTypes = job.contractTypes?.length ? job.contractTypes : uniqueContractTypes(index);
  const primaryContract = contractTypes[0];
  const [salaryMin, salaryMax] = resolveSalaryBand(template, location, seniority, primaryContract, index);
  const roleContent = buildRoleContent(template, company, workplace, location, index);

  return {
    ...job,
    title: template.title,
    company,
    description: roleContent.description,
    seniority,
    salary: {
      min: salaryMin,
      max: salaryMax,
      currency: 'USD',
      period: 'month',
    },
    contractTypes,
    workplace,
    location,
    responsibilities: roleContent.responsibilities,
    requirements: roleContent.requirements,
    niceToHave: roleContent.niceToHave,
    benefits: roleContent.benefits,
    competencies: buildCompetencies(template.stack, index),
    workSchedules: job.workSchedules?.length ? job.workSchedules : [pick(WORK_SCHEDULES, index)],
  };
}

function buildJob(id, template, index, assignLocation) {
  const company = pick(COMPANIES, index);
  const workplace = pick(WORKPLACES, index);
  const location = assignLocation(index);
  const contractTypes = uniqueContractTypes(index);
  const [salaryMin, salaryMax] = resolveSalaryBand(
    template,
    location,
    template.seniority,
    contractTypes[0],
    index,
  );
  const roleContent = buildRoleContent(template, company, workplace, location, index);
  const createdAt = new Date('2026-07-01T08:00:00.000Z');
  createdAt.setDate(createdAt.getDate() + (index % 45));
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + 14 + (index % 21));

  return {
    id,
    title: template.title,
    company,
    description: roleContent.description,
    seniority: template.seniority,
    salary: {
      min: salaryMin,
      max: salaryMax,
      currency: 'USD',
      period: 'month',
    },
    contractTypes,
    workplace,
    location,
    responsibilities: roleContent.responsibilities,
    requirements: roleContent.requirements,
    niceToHave: roleContent.niceToHave,
    benefits: roleContent.benefits,
    competencies: buildCompetencies(template.stack, index),
    workSchedules: [pick(WORK_SCHEDULES, index)],
    createdAt: createdAt.toISOString(),
    applicationDeadline: deadline.toISOString(),
  };
}

function migrateExistingJob(job, index, assignLocation) {
  const enriched = enrichJob(job, index, assignLocation);

  return {
    ...enriched,
    competencies: normalizeCompetencies(enriched.competencies),
    createdAt: job.createdAt ?? enriched.createdAt,
    applicationDeadline: job.applicationDeadline ?? enriched.applicationDeadline,
  };
}

const path = new URL('../src/assets/seed/jobs.json', import.meta.url);
const existing = JSON.parse(readFileSync(path, 'utf8'));

const locationPool = buildUniqueLocationPool(LOCATIONS, TARGET_COUNT);
const assignLocation = createLocationAssigner(locationPool);

const jobs = existing.map((job, index) => migrateExistingJob(job, index, assignLocation));

let nextIndex = jobs.length;
while (jobs.length < TARGET_COUNT) {
  const template = pick(ROLE_TEMPLATES, nextIndex);
  const id = `job-${String(nextIndex + 1).padStart(3, '0')}`;
  jobs.push(buildJob(id, template, nextIndex, assignLocation));
  nextIndex += 1;
}

writeFileSync(path, `${JSON.stringify(jobs, null, 2)}\n`, 'utf8');

const cityCounts = new Map();
const coordinateCounts = new Map();
for (const job of jobs) {
  cityCounts.set(locationKey(job.location), (cityCounts.get(locationKey(job.location)) ?? 0) + 1);
  coordinateCounts.set(
    coordinateKey(job.location),
    (coordinateCounts.get(coordinateKey(job.location)) ?? 0) + 1,
  );
}
const maxPerCity = Math.max(...cityCounts.values());
const duplicateCoordinates = [...coordinateCounts.values()].filter((count) => count > 1).length;
const remoteMissingLocation = jobs.filter((job) => job.workplace === 'remote' && !job.location).length;

console.log(`Wrote ${jobs.length} jobs across ${cityCounts.size} cities (max ${maxPerCity}/city).`);
console.log(`Duplicate map coordinates: ${duplicateCoordinates}.`);
console.log(`Remote without location: ${remoteMissingLocation}.`);
