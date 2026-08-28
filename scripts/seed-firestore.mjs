import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const projectId = 'job-pilot-1e4ee';
const database = '(default)';

function getAccessToken() {
  return execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => toFirestoreValue(item)),
      },
    };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, nested]) => [key, toFirestoreValue(nested)]),
        ),
      },
    };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  return { stringValue: String(value) };
}

function toFirestoreFields(document) {
  return Object.fromEntries(
    Object.entries(document).map(([key, value]) => [key, toFirestoreValue(value)]),
  );
}

async function commitWrites(writes, accessToken) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${database}/documents:commit`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ writes }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore commit failed (${response.status}): ${body}`);
  }
}

const jobs = JSON.parse(
  readFileSync(new URL('../src/assets/seed/jobs.json', import.meta.url), 'utf8'),
);

const accessToken = getAccessToken();
const writes = jobs.map((job) => {
  const { id, ...data } = job;
  return {
    update: {
      name: `projects/${projectId}/databases/${database}/documents/jobs/${id}`,
      fields: toFirestoreFields(data),
    },
  };
});

const batchSize = 400;
for (let index = 0; index < writes.length; index += batchSize) {
  await commitWrites(writes.slice(index, index + batchSize), accessToken);
}

console.log(`Seeded ${jobs.length} jobs into Firestore (${projectId}).`);
