import test from "node:test";
import assert from "node:assert/strict";
import {
  NAIB_CLOUD,
  cloudRecordId,
  normalizeCloudMetadata,
  normalizeKey,
  normalizeNamespace
} from "../storage/internal-cloud-schema.js";
import { InternalCloud } from "../storage/internal-cloud.js";

test("internal cloud schema normalizes namespaces and keys", () => {
  assert.equal(normalizeNamespace(" Portfolio Evidence "), "Portfolio-Evidence");
  assert.equal(normalizeKey("week 02/math"), "week-02/math");
  assert.equal(cloudRecordId("portfolio", "grade-02/week-1"), "portfolio::grade-02/week-1");
  assert.equal(NAIB_CLOUD.DEFAULT_CHUNK_BYTES, 1024 * 1024);
});

test("internal cloud metadata remains bounded and serializable", () => {
  const meta = normalizeCloudMetadata({
    grade: "grade-02",
    score: 91,
    approved: true,
    tags: ["math", "portfolio"],
    nested: { hidden: true }
  });
  assert.equal(meta.grade, "grade-02");
  assert.equal(meta.score, 91);
  assert.equal(meta.approved, true);
  assert.deepEqual(meta.tags, ["math", "portfolio"]);
  assert.equal(typeof meta.nested, "undefined");
});

test("internal cloud works without IndexedDB through dependency-free memory fallback", async () => {
  const cloud = new InternalCloud({ indexedDBImpl: null, navigatorImpl: null, chunkBytes: 256 * 1024 });
  const init = await cloud.initialize();
  assert.equal(init.backend, "memory-fallback");

  const saved = await cloud.put("research", "case-1", { claim: "example", sources: 3 }, {
    metadata: { project: "test" }
  });
  assert.equal(saved.ok, true);

  const loaded = await cloud.get("research", "case-1");
  assert.deepEqual(loaded.value, { claim: "example", sources: 3 });

  const rows = await cloud.list("research");
  assert.equal(rows.length, 1);

  const denied = await cloud.delete("research", "case-1");
  assert.equal(denied.ok, false);

  const deleted = await cloud.delete("research", "case-1", { confirmed: true });
  assert.equal(deleted.ok, true);
});
