import test from "node:test";
import assert from "node:assert/strict";
import {assessResearchRequirement} from "../research/research-trigger.js";

test("ordinary creative request does not automatically require verifier",()=>{
  const x=assessResearchRequirement({
    mode:{id:"creative"},
    safety:{highStakes:false}
  },"Create a watercolor palette for a garden painting.");
  assert.equal(x.required,false);
});

test("medical factual request requires verifier",()=>{
  const x=assessResearchRequirement({
    mode:{id:"personal"},
    safety:{highStakes:false}
  },"Does this medical treatment cure the disease?");
  assert.equal(x.required,true);
  assert.equal(x.analysis.domain,"medical");
});

test("research mode requires verifier",()=>{
  const x=assessResearchRequirement({
    mode:{id:"research"},
    safety:{highStakes:false}
  },"Compare the sources.");
  assert.equal(x.required,true);
});
