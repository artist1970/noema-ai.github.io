import test from "node:test";
import assert from "node:assert/strict";
import {specialistEligible,SPECIALIST_STATES,getSpecialist} from "../specialists/specialist-registry.js";

test("Hope requires explicit adult request",()=>{
  assert.equal(specialistEligible("hope",{audience:"adult",explicitRequest:false}).eligible,false);
  assert.equal(specialistEligible("hope",{audience:"adult",explicitRequest:true}).eligible,true);
});

test("333 remains account restricted",()=>{
  const x=specialistEligible("333",{audience:"adult",accountConnected:false});
  assert.equal(x.eligible,false);
  assert.equal(x.reason,"account-required");
  assert.equal(getSpecialist("333").state,SPECIALIST_STATES.RESTRICTED);
});
