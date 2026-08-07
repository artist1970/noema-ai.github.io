import test from "node:test";
import assert from "node:assert/strict";
import {ResourceManifestLoader} from "../resources/resource-manifest-loader.js";
import {KHAEMENES_ACADEMY_SNAPSHOT} from "../resources/snapshots/manifest-snapshots.js";

const source={
  id:"khaemenes.academy",
  url:"https://example.invalid/manifest.json"
};

test("manifest loader falls back honestly when network refresh fails",async()=>{
  const loader=new ResourceManifestLoader({
    source,
    snapshot:KHAEMENES_ACADEMY_SNAPSHOT,
    fetchImpl:async()=>{throw new Error("offline")}
  });
  const out=await loader.refresh({allowNetwork:true});
  assert.equal(out.provenance.mode,"snapshot-fallback");
  assert.equal(out.manifest.sourceId,"khaemenes.academy");
});
