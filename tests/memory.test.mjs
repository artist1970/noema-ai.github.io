import test from "node:test";
import assert from "node:assert/strict";
import { PreferenceStore } from "../memory/preference-store.js";
import { ContinuityStore } from "../memory/continuity-store.js";

function storageHarness() {
  const map = new Map();
  return {
    map,
    storage: {
      getItem: key => map.get(key) ?? null,
      setItem: (key, value) => map.set(key, value),
      removeItem: key => map.delete(key)
    }
  };
}

test("NOEMA preference reset does not clear other apps", () => {
  const { map, storage } = storageHarness();
  map.set("other_app", "preserve");
  const store = new PreferenceStore(storage);
  store.save({ lastMode: "creative" });
  store.reset();
  assert.equal(map.get("other_app"), "preserve");
  assert.equal(map.has("noema_preferences_v1"), false);
});

test("continuity is bounded and namespaced", () => {
  const { map, storage } = storageHarness();
  const store = new ContinuityStore(storage);
  for (let i = 0; i < 30; i++) {
    store.add({ user: `u${i}`, assistant: `a${i}`, mode: "personal" });
  }
  assert.equal(store.list().length, 24);
  assert.ok(map.has("noema_continuity_v1"));
});
