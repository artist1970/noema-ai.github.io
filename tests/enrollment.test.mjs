import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAgeFromMonthYear,
  normalizePersonProfile,
  accountPathwayForAge
} from "../identity/person-schema.js";
import { EnrollmentStore } from "../identity/enrollment-store.js";

function storageHarness() {
  const map = new Map();
  return {
    storage: {
      getItem: key => map.get(key) ?? null,
      setItem: (key, value) => map.set(key, value),
      removeItem: key => map.delete(key)
    },
    map
  };
}

test("age and learning placement remain independent", () => {
  const profile = normalizePersonProfile({
    displayName: "Learner",
    birthMonth: 1,
    birthYear: 2010,
    gradeLevel: "college",
    learningStage: "Calculus II",
    educationSetting: "higher-learning",
    now: new Date("2026-08-07")
  });

  assert.equal(profile.learning.gradeLevel, "college");
  assert.equal(profile.learning.learningStage, "Calculus II");
});

test("account pathway follows age rather than grade", () => {
  assert.equal(accountPathwayForAge(8), "guardian-managed-child");
  assert.equal(accountPathwayForAge(15), "guardian-linked-teen");
  assert.equal(accountPathwayForAge(30), "independent-adult");
});

test("local enrollment contains no password or credential field", () => {
  const { storage } = storageHarness();
  const store = new EnrollmentStore(storage);
  const result = store.save({
    displayName: "Alex",
    birthMonth: 1,
    birthYear: 2000,
    gradeLevel: "adult-continuing",
    educationSetting: "independent",
    favoriteSubject: "science",
    interests: ["music", "art"]
  });

  assert.equal(result.ok, true);
  const text = JSON.stringify(result.profile).toLowerCase();
  assert.equal(text.includes("password"), false);
  assert.equal(text.includes("token"), false);
  assert.equal(text.includes("credential"), false);
});
