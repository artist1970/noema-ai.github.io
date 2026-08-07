import test from "node:test";
import assert from "node:assert/strict";
import {buildSpecialistContext} from "../orchestration/specialist-context.js";

test("provider is told that handoff was not executed",()=>{
  const ctx=buildSpecialistContext({
    tasks:[{
      id:"visual",label:"Visual",specialistId:"moirai",status:"handoff",
      output:{url:"https://example.com",brief:{prompt:"x"}}
    }]
  });
  assert.equal(ctx[0].executed,false);
  assert.equal(ctx[0].status,"handoff");
});
