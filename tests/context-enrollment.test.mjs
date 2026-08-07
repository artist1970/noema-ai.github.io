import test from "node:test";
import assert from "node:assert/strict";
import { buildNoemaContext } from "../core/context-builder.js";

test("context receives enrollment without avatar appearance inference", () => {
  const context = buildNoemaContext({
    mode: "learning",
    enrollmentProfile: {
      personId: "p1",
      displayName: "Learner",
      ageBand: "teen-13-17",
      accountPathway: "guardian-linked-teen",
      learning: {
        gradeLevel: "grade-10",
        learningStage: "Geometry",
        educationSetting: "homeschool",
        favoriteSubject: "art",
        interests: ["art", "music"]
      }
    }
  });

  assert.equal(context.enrollment.learning.gradeLevel, "grade-10");
  assert.deepEqual(context.enrollment.learning.interests, ["art", "music"]);
  assert.equal("skinTone" in context.enrollment, false);
  assert.equal("hairColor" in context.enrollment, false);
});
