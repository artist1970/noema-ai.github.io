import test from "node:test";
import assert from "node:assert/strict";
import {ResourceDirector} from "../resources/resource-director.js";

test("resource director caches the federation inventory in NAIB Internal Cloud", async () => {
  const director=new ResourceDirector();
  const result=await director.cacheFederationInventory("test");
  assert.equal(result.ok,true);
  assert.ok(result.count>=1);

  const cached=await director.cachedFederationIndex();
  assert.ok(cached);
  assert.equal(cached.value.reason,"test");
  assert.ok(Array.isArray(cached.value.sources));

  const status=await director.storageStatus();
  assert.equal(status.dependencyFree,true);
  assert.equal(status.remoteSync,false);
  assert.ok(status.recordCount>=1);
});
