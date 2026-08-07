import test from "node:test";
import assert from "node:assert/strict";
import {SpecialistExecutor} from "../orchestration/specialist-executor.js";

const core={
  accountServer:{connected:false}
};

test("Moirai produces handoff rather than fake execution",()=>{
  const ex=new SpecialistExecutor({core});
  const result=ex.execute(
    {id:"visual",specialistId:"moirai"},
    {message:"Draw a garden",route:{mode:{id:"creative"}},context:{}}
  );
  assert.equal(result.status,"handoff");
  assert.equal(result.output.executed,false);
});

test("Verifier local state can execute",()=>{
  const ex=new SpecialistExecutor({core});
  const result=ex.execute(
    {id:"verify",specialistId:"verifier"},
    {
      context:{},
      verifierSession:{
        analysis:{domain:"science"},
        verdict:{status:"unexamined",canUseVerifiedLabel:false,missingRequiredLanes:["arshif"]}
      }
    }
  );
  assert.equal(result.status,"complete");
  assert.equal(result.output.verifiedLabelAllowed,false);
});
