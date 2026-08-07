import test from "node:test";
import assert from "node:assert/strict";
import {evaluateEvidence} from "../research/evidence-matrix.js";

test("one repeated source family cannot produce verified fact",()=>{
  const result=evaluateEvidence({
    claimAnalysis:{domain:"general",requiresFreshness:false,contested:false},
    completedLaneIds:["arshif","khaemenes","verifier"],
    freshnessSatisfied:true,
    sources:[
      {id:"1",level:"primary",relation:"supporting",confidence:"high",independenceFamily:"same"},
      {id:"2",level:"secondary",relation:"supporting",confidence:"high",independenceFamily:"same"}
    ]
  });
  assert.equal(result.canUseVerifiedLabel,false);
});

test("credible opposition produces disputed status",()=>{
  const result=evaluateEvidence({
    claimAnalysis:{domain:"general",requiresFreshness:false,contested:false},
    completedLaneIds:["arshif","khaemenes","verifier"],
    freshnessSatisfied:true,
    sources:[
      {id:"1",level:"primary",relation:"supporting",confidence:"high",independenceFamily:"a"},
      {id:"2",level:"primary",relation:"opposing",confidence:"high",independenceFamily:"b"}
    ]
  });
  assert.equal(result.status,"disputed");
});

test("medical verification requires Medicament lane and independent families",()=>{
  const result=evaluateEvidence({
    claimAnalysis:{domain:"medical",requiresFreshness:true,contested:false},
    completedLaneIds:["arshif","khaemenes","medicament"],
    freshnessSatisfied:true,
    sources:[
      {id:"1",level:"primary",relation:"supporting",confidence:"high",independenceFamily:"a"},
      {id:"2",level:"secondary",relation:"supporting",confidence:"high",independenceFamily:"b"},
      {id:"3",level:"secondary",relation:"supporting",confidence:"high",independenceFamily:"c"}
    ]
  });
  assert.equal(result.canUseVerifiedLabel,true);
});


test("medical evidence cannot be called verified before ARSHIF and Khaemenes checks",()=>{
  const result=evaluateEvidence({
    claimAnalysis:{domain:"medical",requiresFreshness:true,contested:false},
    completedLaneIds:["medicament"],
    freshnessSatisfied:true,
    sources:[
      {id:"1",level:"primary",relation:"supporting",confidence:"high",independenceFamily:"a"},
      {id:"2",level:"secondary",relation:"supporting",confidence:"high",independenceFamily:"b"},
      {id:"3",level:"secondary",relation:"supporting",confidence:"high",independenceFamily:"c"}
    ]
  });
  assert.equal(result.canUseVerifiedLabel,false);
  assert.ok(result.missingRequiredLanes.includes("arshif"));
  assert.ok(result.missingRequiredLanes.includes("khaemenes"));
});
