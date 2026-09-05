import test from "node:test";
import assert from "node:assert/strict";
import {buildTaskPlan} from "../orchestration/task-planner.js";

test("research learning request coordinates verifier and mentor",()=>{
  const plan=buildTaskPlan({
    message:"Research this science topic and explain it to my student.",
    route:{mode:{id:"learning"}},
    researchDecision:{required:true},
    context:{}
  });
  assert.ok(plan.tasks.some(t=>t.specialistId==="verifier"));
  assert.ok(plan.tasks.some(t=>t.specialistId==="mentor"));
});

test("visual design request prepares Zelle task",()=>{
  const plan=buildTaskPlan({
    message:"Design an illustrated poster.",
    route:{mode:{id:"creative"}},
    researchDecision:{required:false},
    context:{}
  });
  assert.ok(plan.tasks.some(t=>t.specialistId==="zelle"));
  assert.ok(!plan.tasks.some(t=>t.specialistId==="moirai"));
});

test("music creation request prepares Moirai task",()=>{
  const plan=buildTaskPlan({
    message:"Write a melody and chord progression for a new song.",
    route:{mode:{id:"creative"}},
    researchDecision:{required:false},
    context:{}
  });
  assert.ok(plan.tasks.some(t=>t.specialistId==="moirai"));
});
