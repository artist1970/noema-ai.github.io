import test from "node:test";
import assert from "node:assert/strict";
import {IntelligenceDirector} from "../core/intelligence-director.js";
import {LocalPlaceholderProvider} from "../providers/local-placeholder.js";
import {VerifierAgent} from "../research/verifier-agent.js";

function fakeCore() {
  return {
    verifier:new VerifierAgent(),
    route(message,{mode="personal"}={}) {
      return {
        message,
        role:"adult",
        mode:{id:mode,label:mode},
        modules:mode==="research"?[{id:"verifier",label:"The Verifier"}]:[],
        safety:{highStakes:false,categories:[]},
        privacy:{sensitive:false},
        ethics:{blocked:false,needsReview:false,constitutionVersion:"1"},
        context:{memory:{relevant:[]},continuity:[]}
      };
    }
  };
}

test("research conversation carries verifier status into provider result",async()=>{
  const core=fakeCore();
  const director=new IntelligenceDirector({core,provider:new LocalPlaceholderProvider()});
  const result=await director.respond("Please verify the latest news.",{mode:"research"});
  assert.equal(result.research.required,true);
  assert.equal(result.research.verifiedLabelAllowed,false);
  assert.match(result.response.text,/will not label the claim verified/i);
});

test("ordinary personal conversation can remain non-verification",async()=>{
  const core=fakeCore();
  const director=new IntelligenceDirector({core,provider:new LocalPlaceholderProvider()});
  const result=await director.respond("Help me brainstorm a birthday card.",{mode:"personal"});
  assert.equal(result.research.required,false);
});
