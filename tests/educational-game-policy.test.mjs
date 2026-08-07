import test from "node:test";
import assert from "node:assert/strict";
import {educationalGameStatus} from "../resources/educational-game-policy.js";

test("educational game requires established learning objective",()=>{
  assert.equal(educationalGameStatus({
    resourceType:"game",
    learningValue:"supplemental",
    learningObjectives:["geometry"]
  }).eligibleForEducationalRanking,true);

  const unknown=educationalGameStatus({
    resourceType:"game",
    learningValue:"unknown",
    learningObjectives:[]
  });
  assert.equal(unknown.eligibleForEducationalRanking,false);
  assert.equal(unknown.reason,"learning-objective-not-established");
});
