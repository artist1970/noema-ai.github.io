import test from "node:test";
import assert from "node:assert/strict";
import {LearningFederation} from "../resources/learning-federation.js";

test("personalized health wording marks Medicament results as Verifier-required",()=>{
  const federation=new LearningFederation({fetchImpl:async()=>{throw new Error("offline")}});
  const out=federation.discover({
    query:"what health treatment should I use for my symptoms",
    mode:"learning",
    context:{
      enrollment:{
        ageBand:"adult-18-plus",
        learning:{gradeLevel:"adult-continuing",interests:[]}
      }
    }
  });
  const medical=out.results.find(r=>r.sourceId==="verve.medicament");
  if(medical) assert.equal(medical.verifierRequired,true);
});

test("dynamic finance resources preserve freshness required and unverified state",()=>{
  const federation=new LearningFederation({fetchImpl:async()=>{throw new Error("offline")}});
  const out=federation.discover({
    query:"current finance news",
    mode:"research",
    context:{
      enrollment:{
        ageBand:"adult-18-plus",
        learning:{gradeLevel:"adult-continuing",interests:[]}
      }
    }
  });
  const news=out.results.find(r=>r.id==="finance-news");
  assert.ok(news);
  assert.equal(news.freshnessStatus,"required");
  assert.equal(news.verified,false);
});
