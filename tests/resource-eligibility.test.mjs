import test from "node:test";
import assert from "node:assert/strict";
import {checkResourceEligibility,explicitPreferenceTerms} from "../resources/resource-eligibility.js";

const faithResource={
  mentorEligible:true,
  audiences:["high","adult"],
  roles:["student"],
  requiresPreferenceMatch:["faith"]
};

test("preference-gated resource is withheld without explicit match",()=>{
  const x=checkResourceEligibility(faithResource,{audience:"high",role:"student",preferenceTerms:[]});
  assert.equal(x.eligible,false);
  assert.ok(x.reasons.includes("preference-match-required"));
});

test("explicit current-request faith topic enables request-local preference match",()=>{
  const prefs=explicitPreferenceTerms({query:"Help me study Bible history",context:{}});
  const x=checkResourceEligibility(faithResource,{audience:"high",role:"student",preferenceTerms:prefs});
  assert.equal(x.eligible,true);
});
