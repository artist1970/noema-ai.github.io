import test from "node:test";
import assert from "node:assert/strict";
import {TaskGraph} from "../orchestration/task-graph.js";

test("task graph respects dependencies",()=>{
  const g=new TaskGraph([
    {id:"a",label:"A",requires:[]},
    {id:"b",label:"B",requires:["a"]}
  ]);
  assert.equal(g.get("a").status,"ready");
  assert.equal(g.get("b").status,"pending");
  g.start("a");
  g.settle("a",{status:"complete"});
  assert.equal(g.get("b").status,"ready");
});

test("handoff counts as settled but not complete execution",()=>{
  const g=new TaskGraph([{id:"a",label:"A",requires:[]}]);
  g.start("a");
  g.settle("a",{status:"handoff",output:{executed:false}});
  assert.equal(g.summary().complete,true);
  assert.equal(g.get("a").status,"handoff");
});
