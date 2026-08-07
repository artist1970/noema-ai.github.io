import test from "node:test";
import assert from "node:assert/strict";
import {normalizeProviderResponse} from "../providers/provider-response-normalizer.js";

test("provider chain-of-thought and permission mutations are ignored",()=>{
  const out=normalizeProviderResponse({
    text:"Visible answer",
    chainOfThought:"secret reasoning",
    permissionChanges:{admin:true},
    memoryWrites:["remember this"],
    generatedByModel:true
  },"test-provider");

  assert.equal(out.text,"Visible answer");
  assert.ok(out.warnings.some(x=>x.includes("chainOfThought")));
  assert.ok(out.warnings.some(x=>x.includes("permissionChanges")));
  assert.equal("chainOfThought" in out,false);
  assert.equal("permissionChanges" in out,false);
});
