import test from "node:test";
import assert from "node:assert/strict";
import {validateSpecialistAdapter} from "../specialists/adapter-contract.js";
import {KhaemenesResourceAdapter} from "../adapters/khaemenes-resource-adapter.js";

test("Khaemenes resource adapter satisfies specialist adapter contract",()=>{
  const adapter=new KhaemenesResourceAdapter({director:{discover:()=>({results:[]})}});
  assert.equal(validateSpecialistAdapter(adapter).valid,true);
});
