import test from "node:test";
import assert from "node:assert/strict";
import { getNoemaIdentity } from "../core/identity.js";
import { inferMode, getMode } from "../core/mode-router.js";

test("NOEMA has her current protected institutional identity", () => {
  const identity = getNoemaIdentity();
  assert.equal(identity.name, "Noema");
  assert.equal(identity.descriptor, "Chancellor of Institutional Integrity");
  assert.equal(identity.role, "institutional-governance");
  assert.ok(identity.audiences.includes("adult"));
});

test("creative requests route to a creative specialist-capable mode", () => {
  const mode = getMode(inferMode("Help me design an illustration"));
  assert.equal(mode.id, "creative");
  assert.ok(mode.modules.includes("moirai"));
});
