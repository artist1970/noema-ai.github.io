import test from "node:test";
import assert from "node:assert/strict";
import {
  audienceFromEnrollment,
  requestedAudienceFromQuery,
  resolveLearningContext
} from "../resources/learning-context.js";

test("grade 10 resolves to high school and high-school source",()=>{
  const context={
    enrollment:{
      ageBand:"teen-13-17",
      learning:{gradeLevel:"grade-10",favoriteSubject:"mathematics",interests:[]}
    }
  };
  const out=resolveLearningContext({query:"help with algebra",context});
  assert.equal(out.effectiveAudience,"high");
  assert.equal(out.currentSchoolSourceId,"khaemenes.high");
});

test("adult may explicitly browse elementary resources without changing enrollment",()=>{
  assert.equal(requestedAudienceFromQuery("show me elementary geometry","adult"),"elementary");
  const out=resolveLearningContext({
    query:"show me elementary geometry",
    context:{
      enrollment:{
        ageBand:"adult-18-plus",
        learning:{gradeLevel:"adult-continuing",interests:[]}
      }
    }
  });
  assert.equal(out.enrolledAudience,"higher-learning");
  assert.equal(out.requestedAudience,"elementary");
  assert.equal(out.currentSchoolSourceId,"khaemenes.elementary");
});

test("minor query cannot override audience upward to adult",()=>{
  assert.equal(requestedAudienceFromQuery("show me adult resources","high"),"");
});
