import { execSync } from 'node:child_process';

const projectId = 'job-pilot-1e4ee';
const database = '(default)';
const collectionsToDelete = ['savedJobs', 'applications'];

function getAccessToken() {
  return execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
}

async function queryCollectionGroup(collectionId, accessToken) {
  const documents = [];
  let pageToken;

  do {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${database}/documents:runQuery`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId, allDescendants: true }],
          },
          ...(pageToken ? { pageToken } : {}),
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Firestore query failed (${response.status}): ${body}`);
    }

    const rows = await response.json();
    for (const row of rows) {
      if (row.document?.name) {
        documents.push(row.document);
      }
    }

    pageToken = rows.at(-1)?.readTime ? undefined : undefined;
    // runQuery returns all results in one page for small datasets; paginate via startAt if needed.
    break;
  } while (pageToken);

  return documents;
}

async function deleteDocument(name, accessToken) {
  const response = await fetch(`https://firestore.googleapis.com/v1/${name}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore delete failed (${response.status}): ${body}`);
  }
}

async function deleteCollectionGroup(collectionId, accessToken) {
  const documents = await queryCollectionGroup(collectionId, accessToken);

  for (const document of documents) {
    await deleteDocument(document.name, accessToken);
  }

  return documents.length;
}

async function main() {
  const accessToken = getAccessToken();
  let deletedTotal = 0;

  for (const collectionName of collectionsToDelete) {
    const deletedCount = await deleteCollectionGroup(collectionName, accessToken);
    if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} ${collectionName} document(s).`);
      deletedTotal += deletedCount;
    }
  }

  if (deletedTotal === 0) {
    console.log('No savedJobs or applications documents found in Firestore.');
    return;
  }

  console.log(
    `Removed ${deletedTotal} savedJobs/applications document(s) from Firestore (${projectId}).`,
  );
}

await main();
