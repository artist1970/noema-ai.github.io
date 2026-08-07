import test from "node:test";
import assert from "node:assert/strict";
import { CapabilityLedger } from "../permissions/capability-ledger.js";
import { ActionGate } from "../permissions/action-gate.js";

test("ordinary resource search is allowed", () => {
  const ledger = new CapabilityLedger();
  const gate = new ActionGate({ ledger });
  assert.equal(gate.evaluate("resources.search").allowed, true);
});

test("message send requires confirmation", () => {
  const ledger = new CapabilityLedger();
  const gate = new ActionGate({ ledger });

  assert.equal(gate.evaluate("messages.send").allowed, false);
  assert.equal(gate.evaluate("messages.send", { confirmed: true }).allowed, true);
});

test("canonical deployment requires administrator approval", () => {
  const ledger = new CapabilityLedger();
  const gate = new ActionGate({ ledger });

  assert.equal(gate.evaluate("code.deploy-canonical").allowed, false);
  assert.equal(gate.evaluate("code.deploy-canonical", { adminAuthorized: true }).allowed, true);
});

test("self privilege elevation remains blocked even with adminAuthorized flag", () => {
  const ledger = new CapabilityLedger();
  const gate = new ActionGate({ ledger });

  const result = gate.evaluate("permissions.elevate-self", { adminAuthorized: true, confirmed: true });
  assert.equal(result.allowed, false);
  assert.equal(result.state, "blocked");
});
