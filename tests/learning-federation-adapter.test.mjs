import test from "node:test";
import assert from "node:assert/strict";
import {validateSpecialistAdapter} from "../specialists/adapter-contract.js";
import {LearningFederationAdapter} from "../adapters/learning-federation-adapter.js";

test("learning federation adapter satisfies specialist adapter contract",()=>{
  const adapter=new LearningFederationAdapter({
    director:{discover:()=>({results:[]})}
  });
  assert.equal(validateSpecialistAdapter(adapter).valid,true);
  assert.equal(adapter.canExecute().ok,true);
});
