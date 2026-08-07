import test from "node:test";
import assert from "node:assert/strict";
import {analyzeClaim} from "../research/claim-analyzer.js";

test("medical claim routes to medical lane",()=>{
  const x=analyzeClaim("A clinical treatment cures this disease.");
  assert.equal(x.domain,"medical");
  assert.equal(x.consequence,"high");
});

test("weather warning claim routes atmospheric and requires freshness",()=>{
  const x=analyzeClaim("There is a hurricane warning today.");
  assert.equal(x.domain,"atmospheric");
  assert.equal(x.requiresFreshness,true);
});
