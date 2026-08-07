import test from "node:test";
import assert from "node:assert/strict";
import {analyzeSourceIndependence} from "../research/source-independence.js";

test("repeated wire-family articles count as one independence family",()=>{
  const result=analyzeSourceIndependence([
    {id:"1",independenceFamily:"wire-a",region:"US"},
    {id:"2",independenceFamily:"wire-a",region:"UK"},
    {id:"3",independenceFamily:"paper-b",region:"France"}
  ]);
  assert.equal(result.independentFamilyCount,2);
  assert.equal(result.duplicateFamilies.length,1);
});
