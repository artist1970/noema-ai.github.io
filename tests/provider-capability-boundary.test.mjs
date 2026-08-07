import test from "node:test";
import assert from "node:assert/strict";
import {CapabilityLedger} from "../permissions/capability-ledger.js";
import {ActionGate} from "../permissions/action-gate.js";

test("provider cannot change permissions, write memory or override verifier",()=>{
  const gate=new ActionGate({ledger:new CapabilityLedger()});
  assert.equal(gate.evaluate("provider.change-permissions",{confirmed:true,adminAuthorized:true}).allowed,false);
  assert.equal(gate.evaluate("provider.write-memory",{confirmed:true,adminAuthorized:true}).allowed,false);
  assert.equal(gate.evaluate("provider.override-verifier",{confirmed:true,adminAuthorized:true}).allowed,false);
  assert.equal(gate.evaluate("voice.background-listen",{confirmed:true,adminAuthorized:true}).allowed,false);
  assert.equal(gate.evaluate("voice.store-audio",{confirmed:true,adminAuthorized:true}).allowed,false);
});
