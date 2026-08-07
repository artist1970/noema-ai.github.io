import test from "node:test";
import assert from "node:assert/strict";
import { getNoemaIdentity } from "../core/identity.js";
import { inferMode, getMode } from "../core/mode-router.js";

test("NOEMA has her own adult intelligence identity", () => {
  const identity = getNoemaIdentity();
  assert.equal(identity.name, "Noema");
  assert.equal(identity.descriptor, "Sovereign Adult Intelligence");
  assert.ok(identity.audiences.includes("adult"));
});

test("creative requests route to Moirai-capable mode", () => {
  const mode = getMode(inferMode("Help me design an illustration"));
  assert.equal(mode.id, "creative");
  assert.ok(mode.modules.includes("moirai"));
});
