import test from "node:test";
import assert from "node:assert/strict";
import { NoemaCore } from "../core/noema-core.js";

test("NOEMA marks high-stakes adult requests", () => {
  const noema = new NoemaCore();
  const route = noema.route("I need medical advice about a medication dose");
  assert.equal(route.safety.highStakes, true);
  assert.ok(route.safety.categories.includes("medical"));
});

test("NOEMA flags credential-like privacy content", () => {
  const noema = new NoemaCore();
  const route = noema.route("Here is my API key");
  assert.equal(route.privacy.sensitive, true);
});

test("NOEMA keeps Hope distinct from identity", () => {
  const noema = new NoemaCore();
  const route = noema.route("I want to reflect on something");
  assert.equal(route.modules.some(module => module.id === "hope"), false);
});
