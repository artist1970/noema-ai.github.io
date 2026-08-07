import test from "node:test";
import assert from "node:assert/strict";
import {normalizeAvatarManifest} from "../avatars/avatar-schema.js";

test("appearance never enables learner or demographic inference",()=>{
  const avatar=normalizeAvatarManifest({
    mentorId:"mentor_12345678",
    displayName:"Luna",
    creationMode:"sketch",
    appearance:{skinTone:"tone-08",hairColor:"violet",eyeColor:"green"}
  });
  assert.equal(avatar.inferenceBoundary.appearanceUsedForLearnerInference,false);
  assert.equal(avatar.inferenceBoundary.appearanceUsedForDemographicInference,false);
  assert.equal(avatar.inferenceBoundary.drawingUsedForPsychologicalInference,false);
});

test("traits and collaboration remain bounded",()=>{
  const avatar=normalizeAvatarManifest({
    mentorId:"mentor_12345678",
    traits:["patient","funny","creative","calm","direct","not-a-real-trait"],
    collaboration:["ask-questions","show-examples","let-me-try","step-by-step","go-deep"]
  });
  assert.equal(avatar.traits.length,4);
  assert.equal(avatar.collaboration.length,4);
});
