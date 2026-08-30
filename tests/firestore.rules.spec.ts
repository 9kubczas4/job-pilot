import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const PROJECT_ID = 'demo-job-pilot-rules';
const ALICE_ID = 'alice';
const BOB_ID = 'bob';

describe('Firestore security rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: await readFile('firestore.rules', 'utf8'),
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('allows anyone to read jobs but denies client-side job mutations', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('jobs/job-001').set({ title: 'Frontend Engineer' });
    });

    const anonymous = testEnv.unauthenticatedContext().firestore();
    const alice = testEnv.authenticatedContext(ALICE_ID).firestore();

    await assertSucceeds(anonymous.doc('jobs/job-001').get());
    await assertSucceeds(anonymous.collection('jobs').get());
    await assertSucceeds(alice.doc('jobs/job-001').get());
    await assertFails(anonymous.doc('jobs/job-002').set({ title: 'Injected job' }));
    await assertFails(alice.doc('jobs/job-001').update({ title: 'Tampered job' }));
    await assertFails(alice.doc('jobs/job-001').delete());
  });

  it('allows users to manage only their own profile', async () => {
    const alice = testEnv.authenticatedContext(ALICE_ID).firestore();
    const bob = testEnv.authenticatedContext(BOB_ID).firestore();
    const anonymous = testEnv.unauthenticatedContext().firestore();
    const aliceProfile = 'profiles/alice';

    await assertSucceeds(alice.doc(aliceProfile).set({ firstName: 'Alice' }));
    await assertSucceeds(alice.doc(aliceProfile).get());
    await assertSucceeds(alice.doc(aliceProfile).update({ headline: 'Engineer' }));
    await assertFails(bob.doc(aliceProfile).get());
    await assertFails(bob.doc(aliceProfile).set({ firstName: 'Mallory' }));
    await assertFails(anonymous.doc(aliceProfile).get());
    await assertSucceeds(alice.doc(aliceProfile).delete());
  });

  it.each(['savedJobs', 'applications'])(
    'allows users to manage only their own %s documents',
    async (collectionName) => {
      const alice = testEnv.authenticatedContext(ALICE_ID).firestore();
      const bob = testEnv.authenticatedContext(BOB_ID).firestore();
      const anonymous = testEnv.unauthenticatedContext().firestore();
      const aliceCollection = `users/${ALICE_ID}/${collectionName}`;
      const aliceDocument = `${aliceCollection}/job-001`;

      await assertSucceeds(alice.doc(aliceDocument).set({ jobId: 'job-001' }));
      await assertSucceeds(alice.doc(aliceDocument).get());
      await assertSucceeds(alice.collection(aliceCollection).get());
      await assertFails(bob.doc(aliceDocument).get());
      await assertFails(bob.collection(aliceCollection).get());
      await assertFails(bob.doc(aliceDocument).set({ jobId: 'job-001' }));
      await assertFails(anonymous.doc(aliceDocument).get());
      await assertSucceeds(alice.doc(aliceDocument).delete());
    },
  );

  it('denies access to collections that are not explicitly allowed', async () => {
    const alice = testEnv.authenticatedContext(ALICE_ID).firestore();

    await assertFails(alice.doc('internal/config').get());
    await assertFails(alice.doc('internal/config').set({ enabled: true }));
  });
});
