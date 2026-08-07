import test from "node:test";
import assert from "node:assert/strict";
import {ResourceDirector} from "../resources/resource-director.js";

test("adult research can discover approved PLERA resources but keeps freshness requirement",()=>{
  const director=new ResourceDirector({fetchImpl:async()=>{throw new Error("offline")}});
  const out=director.discover({
    query:"find current research tools",
    mode:"research",
    context:{},
    sourceIds:["verve.plera-search"],
    maxResults:20
  });
  const plera=out.results.find(r=>r.sourceId==="verve.plera-search");
  assert.ok(plera);
  assert.equal(plera.executionState,"DISCOVERED");
  assert.equal(plera.verified,false);
  assert.equal(plera.freshnessStatus,"required");
});

test("ordinary high-school archive query does not surface faith resources without match",()=>{
  const director=new ResourceDirector({fetchImpl:async()=>{throw new Error("offline")}});
  const out=director.discover({
    query:"find an archive reading resource",
    mode:"archive",
    context:{
      enrollment:{
        ageBand:"teen-13-17",
        learning:{gradeLevel:"grade-10",interests:[]}
      }
    }
  });
  assert.equal(out.results.some(r=>r.tags?.includes("faith")),false);
  assert.ok(out.withheld.some(r=>r.reasons.includes("preference-match-required")));
});

test("explicit Bible-history request may discover matching ARSHIF resource",()=>{
  const director=new ResourceDirector({fetchImpl:async()=>{throw new Error("offline")}});
  const out=director.discover({
    query:"I want to study Bible history",
    mode:"archive",
    context:{
      enrollment:{
        ageBand:"teen-13-17",
        learning:{gradeLevel:"grade-10",interests:[]}
      }
    }
  });
  assert.ok(out.results.some(r=>r.id==="bible-history"));
});
