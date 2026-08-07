import test from "node:test";
import assert from "node:assert/strict";
import {normalizeResourceManifest,resourceManifestValid} from "../resources/resource-manifest.js";
import {KHAEMENES_ACADEMY_SNAPSHOT} from "../resources/snapshots/manifest-snapshots.js";

test("approved Khaemenes snapshot normalizes as searchable manifest",()=>{
  const m=normalizeResourceManifest(KHAEMENES_ACADEMY_SNAPSHOT);
  assert.equal(resourceManifestValid(m),true);
  assert.equal(m.sourceId,"khaemenes.academy");
  assert.ok(m.resources.some(r=>r.id==="academy-home"));
});
