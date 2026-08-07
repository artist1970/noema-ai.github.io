import test from "node:test";
import assert from "node:assert/strict";
import {CapabilityLedger} from "../permissions/capability-ledger.js";
import {ActionGate} from "../permissions/action-gate.js";

test("fake execution and orchestration self-authorization are blocked",()=>{
  const gate=new ActionGate({ledger:new CapabilityLedger()});
  assert.equal(gate.evaluate("orchestration.fake-execution",{confirmed:true,adminAuthorized:true}).allowed,false);
  assert.equal(gate.evaluate("orchestration.self-authorize-action",{confirmed:true,adminAuthorized:true}).allowed,false);
  assert.equal(gate.evaluate("mentor.infer-from-appearance",{confirmed:true,adminAuthorized:true}).allowed,false);
});
