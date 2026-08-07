import test from "node:test";
import assert from "node:assert/strict";
import {LearningFederation} from "../resources/learning-federation.js";

test("source-owned live manifest failure becomes source snapshot fallback",async()=>{
  const federation=new LearningFederation({
    fetchImpl:async()=>{throw new Error("offline")}
  });
  const provenance=await federation.refresh({
    sourceIds:["khaemenes.elementary"],
    allowNetwork:true
  });
  assert.equal(provenance[0].mode,"source-manifest-snapshot-fallback");
  assert.equal(provenance[0].sourceKind,"source-owned-manifest");
});

test("admin inventory remains admin inventory and does not attempt fake manifest refresh",async()=>{
  let calls=0;
  const federation=new LearningFederation({
    fetchImpl:async()=>{calls++;throw new Error("should-not-call")}
  });
  const provenance=await federation.refresh({
    sourceIds:["verve.finance"],
    allowNetwork:true
  });
  assert.equal(calls,0);
  assert.equal(provenance[0].mode,"admin-approved-inventory-snapshot");
});
