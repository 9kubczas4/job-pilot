import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = 'demo-job-pilot';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error('Start the Firestore emulator before seeding demo data.');
}

const jobs = JSON.parse(
  readFileSync(new URL('../src/assets/seed/jobs.json', import.meta.url), 'utf8'),
);

const app = initializeApp({ projectId });
const firestore = getFirestore(app);
const batch = firestore.batch();

for (const { id, ...data } of jobs) {
  batch.set(firestore.collection('jobs').doc(id), data);
}

await batch.commit();
console.log(`Seeded ${jobs.length} demo jobs into local Firestore (${projectId}).`);
