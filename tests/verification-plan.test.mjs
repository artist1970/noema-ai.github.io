import test from "node:test";
import assert from "node:assert/strict";
import {buildVerificationPlan} from "../research/verification-plan.js";

test("legal plan includes Firmament",()=>{
  const plan=buildVerificationPlan({domain:"legal",requiresFreshness:true,contested:false});
  assert.ok(plan.tasks.some(t=>t.laneId==="firmament"));
  assert.ok(plan.tasks.some(t=>t.id==="freshness"));
});

test("atmospheric plan includes Solanar",()=>{
  const plan=buildVerificationPlan({domain:"atmospheric",requiresFreshness:true,contested:false});
  assert.ok(plan.tasks.some(t=>t.laneId==="solanar"));
});

test("contested plan explicitly searches contradiction and international reporting",()=>{
  const plan=buildVerificationPlan({domain:"general",requiresFreshness:false,contested:true});
  assert.ok(plan.tasks.some(t=>t.id==="contradictions"));
  assert.ok(plan.tasks.some(t=>t.id==="international-lane"));
});


test("every verification plan searches ARSHIF and Khaemenes before verdict",()=>{
  for(const domain of ["general","news","historical","education","science","medical","legal","atmospheric"]){
    const plan=buildVerificationPlan({domain,requiresFreshness:false,contested:false});
    assert.ok(plan.tasks.some(t=>t.laneId==="arshif"), domain);
    assert.ok(plan.tasks.some(t=>t.laneId==="khaemenes"), domain);
  }
});
