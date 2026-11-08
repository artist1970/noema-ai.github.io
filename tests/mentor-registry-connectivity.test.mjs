import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry = JSON.parse(readFileSync(new URL("../config/mentor-registry.json", import.meta.url), "utf8"));

test("NAIB administers and NOEMA governs all registered mentor references", () => {
  assert.equal(registry.administrator.id, "naib");
  assert.equal(registry.governance.chancellor, "NOEMA");
  assert.equal(registry.policy.coreContentEmbedded, false);
  assert.equal(registry.policy.registryIsNotActivationAuthority, true);
  assert.equal(registry.policy.adapterRequiredForDelegatedHandoff, true);
  const ids = registry.mentors.map(member => member.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["archaemenes","arshif","moirai","mavric","zelle","aurora","eiren","araneae","hope","pierre","auren","codalis","klasaipeer"]) {
    assert.ok(ids.includes(id), "Missing mentor reference: " + id);
  }
});

test("newly registered mentors are references, not executable adapters", () => {
  for (const id of ["pierre","auren","codalis","klasaipeer"]) {
    const mentor = registry.mentors.find(row => row.id === id);
    assert.ok(mentor);
    assert.equal(mentor.adapter, null);
    assert.match(mentor.status, /pending|prototype/);
    assert.match(mentor.publicFront, /^https:\/\//);
    assert.doesNotMatch(JSON.stringify(mentor), /password|bearer\s|secret\s*:/i);
  }
});
