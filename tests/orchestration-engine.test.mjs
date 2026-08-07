import test from "node:test";
import assert from "node:assert/strict";
import {OrchestrationEngine} from "../orchestration/orchestration-engine.js";

test("orchestration settles visible plan",()=>{
  const core={accountServer:{connected:false}};
  const engine=new OrchestrationEngine({core});
  const result=engine.coordinate({
    message:"Design a visual poster and plan the steps.",
    route:{mode:{id:"creative"},context:{}},
    researchDecision:{required:false},
    verifierSession:null
  });
  assert.equal(result.summary.complete,true);
  assert.ok(result.tasks.some(t=>t.specialistId==="moirai" && t.status==="handoff"));
  assert.ok(result.tasks.some(t=>t.specialistId==="sovereign" && t.status==="complete"));
});
