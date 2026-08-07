import test from "node:test";
import assert from "node:assert/strict";
import {buildDelegation} from "../delegation/delegation-engine.js";

test("Verifier is added when research is required",()=>{
  const d=buildDelegation({modules:[{id:"arshif",label:"ARSHIF"}]},{researchRequired:true});
  assert.ok(d.specialists.includes("The Verifier"));
  assert.equal(d.policy.specialistsMayNotElevatePermissions,true);
});
