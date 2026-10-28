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

test("Kindergarten read-along routes to Eiren without automatic Archaemenes handoff",()=>{
  const plan=buildTaskPlan({
    message:"Help me read this story and talk about the new words.",
    route:{mode:{id:"learning"}},
    researchDecision:{required:false},
    context:{enrollment:{ageBand:"child-under-13",stage:"kindergarten"}}
  });
  assert.ok(plan.tasks.some(t=>t.id==="early-literacy" && t.specialistId==="eiren"));
  assert.ok(!plan.tasks.some(t=>t.id==="academic" && t.specialistId==="archaemenes"));
});

test("general Kindergarten academic learning still routes to Archaemenes",()=>{
  const plan=buildTaskPlan({
    message:"Help me understand this science lesson.",
    route:{mode:{id:"learning"}},
    researchDecision:{required:false},
    context:{enrollment:{ageBand:"child-under-13",stage:"kindergarten"}}
  });
  assert.ok(plan.tasks.some(t=>t.id==="academic" && t.specialistId==="archaemenes"));
});
