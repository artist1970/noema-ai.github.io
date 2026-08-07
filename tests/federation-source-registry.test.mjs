import test from "node:test";
import assert from "node:assert/strict";
import {
  LEARNING_FEDERATION_SOURCES,
  FEDERATION_SOURCE_KINDS,
  sourceForAudience
} from "../resources/federation-source-registry.js";

test("all Khaemenes learning stages are connected as source-owned manifests",()=>{
  for(const id of [
    "khaemenes.preschool",
    "khaemenes.kindergarten",
    "khaemenes.elementary",
    "khaemenes.middle",
    "khaemenes.high",
    "khaemenes.higher-learning",
    "khaemenes.linguistics"
  ]){
    const source=LEARNING_FEDERATION_SOURCES.find(s=>s.id===id);
    assert.ok(source,id);
    assert.equal(source.sourceKind,FEDERATION_SOURCE_KINDS.SOURCE_MANIFEST,id);
  }
});

test("finance Medicament Bazaar Art and Arcade are explicit admin inventory snapshots",()=>{
  for(const id of [
    "verve.finance","verve.medicament","verve.bazaar-art","verve.arcade-learning"
  ]){
    const source=LEARNING_FEDERATION_SOURCES.find(s=>s.id===id);
    assert.ok(source,id);
    assert.equal(source.sourceKind,FEDERATION_SOURCE_KINDS.ADMIN_INVENTORY,id);
    assert.equal(source.url,"",id);
  }
});

test("enrollment audiences map to current Khaemenes school sources",()=>{
  assert.equal(sourceForAudience("elementary"),"khaemenes.elementary");
  assert.equal(sourceForAudience("middle"),"khaemenes.middle");
  assert.equal(sourceForAudience("high"),"khaemenes.high");
  assert.equal(sourceForAudience("higher-learning"),"khaemenes.higher-learning");
});
