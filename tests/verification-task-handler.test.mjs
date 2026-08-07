import test from "node:test";
import assert from "node:assert/strict";
import {VerificationTaskHandler} from "../research/verification-task-handler.js";

test("dependent verification task cannot start early",()=>{
  const h=new VerificationTaskHandler([
    {id:"a",label:"A",requires:[]},
    {id:"b",label:"B",requires:["a"]}
  ]);
  h.refresh();
  assert.equal(h.start("b").ok,false);
  assert.equal(h.start("a").ok,true);
  h.complete("a");
  assert.equal(h.start("b").ok,true);
});
