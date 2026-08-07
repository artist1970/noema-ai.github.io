import test from "node:test";
import assert from "node:assert/strict";
import {buildTaskPlan} from "../orchestration/task-planner.js";

test("learning request adds approved resource discovery task",()=>{
  const plan=buildTaskPlan({
    message:"Find a lesson to help me study algebra.",
    route:{mode:{id:"learning"}},
    researchDecision:{required:false},
    context:{}
  });
  assert.ok(plan.tasks.some(t=>t.specialistId==="resource-director"));
});
