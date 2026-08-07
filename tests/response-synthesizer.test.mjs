import test from "node:test";
import assert from "node:assert/strict";
import {synthesizeIntegratedResponse} from "../orchestration/response-synthesizer.js";

test("synthesis preserves handoff and verifier state",()=>{
  const out=synthesizeIntegratedResponse({
    providerResponse:{text:"Answer",provider:"local",generatedByModel:false},
    orchestration:{
      plan:{goal:"x"},
      summary:{total:2,finished:2},
      tasks:[
        {id:"m",specialistId:"mentor",status:"complete",output:{adaptation:{available:true,audience:"student"}}},
        {id:"v",specialistId:"moirai",status:"handoff",output:{url:"https://example.com"}}
      ]
    },
    research:{required:true,domain:"science",status:"unexamined",verifiedLabelAllowed:false},
    route:{ethics:{blocked:false,needsReview:false}}
  });
  assert.equal(out.coordination.handoffs[0].executed,false);
  assert.equal(out.research.verifiedLabelAllowed,false);
});
