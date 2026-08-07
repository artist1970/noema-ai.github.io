import test from "node:test";
import assert from "node:assert/strict";
import {CapabilityLedger} from "../permissions/capability-ledger.js";
import {ActionGate} from "../permissions/action-gate.js";

test("resource discovery cannot bypass audience, preference, freshness or verification rules",()=>{
  const gate=new ActionGate({ledger:new CapabilityLedger()});
  for(const id of [
    "resources.bypass-audience",
    "resources.infer-sensitive-preference",
    "resources.ignore-preference-gate",
    "resources.treat-discovery-as-verification",
    "resources.dynamic-without-freshness"
  ]) {
    assert.equal(gate.evaluate(id,{confirmed:true,adminAuthorized:true}).allowed,false,id);
  }
});
