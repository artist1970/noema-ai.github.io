import test from "node:test";
import assert from "node:assert/strict";
import {buildMentorAdaptation} from "../orchestration/mentor-adaptation.js";

test("mentor adaptation uses preferences but preserves factual standards",()=>{
  const a=buildMentorAdaptation({
    enrollment:{
      ageBand:"child-under-13",
      learning:{interests:["music"],favoriteSubject:"science",learningStage:"grade 4"}
    },
    avatar:{
      displayName:"Luna",
      temperament:"curious",
      collaboration:["show-examples","step-by-step"],
      sharedInterests:["art"],
      appearance:{skinTone:"tone-09"}
    }
  });
  assert.equal(a.audience,"child");
  assert.equal(a.factualStandardsUnchanged,true);
  assert.ok(a.directives.some(x=>/examples/i.test(x)));
  assert.equal(JSON.stringify(a).includes("tone-09"),false);
});
