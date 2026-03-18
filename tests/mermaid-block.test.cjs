const test = require("node:test");
const assert = require("node:assert/strict");

const { waitForDocumentFontsReady } = require("../.tmp/workspace-tests/src/components/MermaidBlock.js");

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test("waitForDocumentFontsReady waits for document fonts readiness", async () => {
  const deferred = createDeferred();
  const doc = { fonts: { ready: deferred.promise } };
  let finished = false;

  const waitPromise = waitForDocumentFontsReady(doc).then(() => {
    finished = true;
  });

  await Promise.resolve();
  assert.equal(finished, false);

  deferred.resolve();
  await waitPromise;
  assert.equal(finished, true);
});

test("waitForDocumentFontsReady resolves when the document does not expose fonts", async () => {
  await assert.doesNotReject(() => waitForDocumentFontsReady({}));
});

test("waitForDocumentFontsReady ignores font readiness rejection", async () => {
  const doc = { fonts: { ready: Promise.reject(new Error("font load failed")) } };

  await assert.doesNotReject(() => waitForDocumentFontsReady(doc));
});
