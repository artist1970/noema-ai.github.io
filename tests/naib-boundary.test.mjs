import test from "node:test";
import assert from "node:assert/strict";
import {CapabilityLedger} from "../permissions/capability-ledger.js";
import {ActionGate} from "../permissions/action-gate.js";

test("NAIB cannot override or impersonate NOEMA administration",()=>{
  const gate=new ActionGate({ledger:new CapabilityLedger()});
  assert.equal(gate.evaluate("naib.admin-access",{confirmed:true,adminAuthorized:true}).allowed,false);
  assert.equal(gate.evaluate("naib.override-noema",{confirmed:true,adminAuthorized:true}).allowed,false);
  assert.equal(gate.evaluate("naib.impersonate-admin",{confirmed:true,adminAuthorized:true}).allowed,false);
});
