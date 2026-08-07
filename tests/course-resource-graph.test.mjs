import test from "node:test";
import assert from "node:assert/strict";
import {CourseResourceGraph} from "../resources/course-resource-graph.js";

test("course graph contains only supplied sources/resources",()=>{
  const graph=new CourseResourceGraph();
  const status=graph.rebuild([{
    source:{id:"school",label:"School",tier:"current-school"},
    manifest:{
      name:"School",
      resources:[
        {id:"math",title:"Math Course",resourceType:"course",subjects:["mathematics"],learningObjectives:[],url:"https://example.com/math"}
      ]
    }
  }]);
  assert.equal(status.nodes,2);
  assert.equal(status.edges,1);
  assert.equal(status.inventedNodes,0);
});

test("missing requested unit is reported as coverage gap not invented",()=>{
  const graph=new CourseResourceGraph();
  const out=graph.coverageForQuery("show me unit 6 science",[
    {resourceType:"course",title:"Science"}
  ]);
  assert.equal(out.requestedGranularity,"unit");
  assert.equal(out.indexed,false);
  assert.match(out.gap,/does not currently index a unit-level resource/i);
});
