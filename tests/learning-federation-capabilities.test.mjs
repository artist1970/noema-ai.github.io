import test from "node:test";
import assert from "node:assert/strict";
import {CapabilityLedger} from "../permissions/capability-ledger.js";
import {ActionGate} from "../permissions/action-gate.js";

test("federation cannot invent objectives, fake source manifests, bypass health verification, or promote games over courses by default",()=>{
  const gate=new ActionGate({ledger:new CapabilityLedger()});
  for(const id of [
    "learning-federation.invent-learning-objective",
    "learning-federation.game-over-course",
    "learning-federation.health-without-verifier",
    "learning-federation.dynamic-finance-without-freshness",
    "learning-federation.fake-source-manifest"
  ]){
    assert.equal(
      gate.evaluate(id,{confirmed:true,adminAuthorized:true}).allowed,
      false,
      id
    );
  }
});
