import test from "node:test";
import assert from "node:assert/strict";
import { MentorRelationshipStore } from "../identity/mentor-relationship-store.js";

function storageHarness() {
  const map = new Map();
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: key => map.delete(key)
  };
}

test("person receives stable local mentor relationship", () => {
  const storage = storageHarness();
  const store = new MentorRelationshipStore(storage);

  const first = store.ensure({ personId: "person_alpha" });
  const second = store.ensure({ personId: "person_alpha" });

  assert.equal(first.relationshipId, second.relationshipId);
  assert.equal(first.mentorId, second.mentorId);
  assert.equal(first.supervisor, "noema");
});
