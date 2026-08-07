import test from "node:test";
import assert from "node:assert/strict";
import {LearningFederation} from "../resources/learning-federation.js";

function offline(){throw new Error("offline")}

test("elementary geometry request prioritizes current school geometry game",()=>{
  const federation=new LearningFederation({fetchImpl:offline});
  const out=federation.discover({
    query:"I want a geometry game",
    mode:"learning",
    context:{
      enrollment:{
        ageBand:"child-under-13",
        learning:{
          gradeLevel:"grade-04",
          favoriteSubject:"mathematics",
          interests:["games"]
        }
      }
    }
  });
  assert.equal(out.learningContext.currentSchoolSourceId,"khaemenes.elementary");
  assert.equal(out.results[0].id,"geometry-game");
  assert.equal(out.results[0].educationalGame.eligibleForEducationalRanking,true);
});

test("high-school algebra request prefers direct high-school mathematics over unrelated games",()=>{
  const federation=new LearningFederation({fetchImpl:offline});
  const out=federation.discover({
    query:"help me with algebra",
    mode:"learning",
    context:{
      enrollment:{
        ageBand:"teen-13-17",
        learning:{
          gradeLevel:"grade-10",
          favoriteSubject:"mathematics",
          interests:[]
        }
      }
    }
  });
  assert.equal(out.results[0].id,"high-mathematics");
  const firstGame=out.results.findIndex(r=>r.resourceType==="game");
  const course=out.results.findIndex(r=>r.id==="high-mathematics");
  assert.ok(course>=0);
  assert.ok(firstGame===-1 || course<firstGame);
});

test("finance simulator is discoverable as learning extension without pretending source-owned manifest",()=>{
  const federation=new LearningFederation({fetchImpl:offline});
  const out=federation.discover({
    query:"supply demand economics simulator",
    mode:"learning",
    context:{
      enrollment:{
        ageBand:"teen-13-17",
        learning:{gradeLevel:"grade-11",favoriteSubject:"social-studies",interests:[]}
      }
    }
  });
  const result=out.results.find(r=>r.id==="supply-demand-simulator");
  assert.ok(result);
  assert.equal(result.resourceType,"simulator");
  assert.equal(result.manifestProvenance,"admin-approved-inventory-snapshot");
  assert.equal(result.verified,false);
});

test("Bazaar unknown-objective game is withheld from ordinary art learning recommendation",()=>{
  const federation=new LearningFederation({fetchImpl:offline});
  const out=federation.discover({
    query:"teach me art",
    mode:"learning",
    context:{
      enrollment:{
        ageBand:"teen-13-17",
        learning:{gradeLevel:"grade-10",favoriteSubject:"art",interests:["art"]}
      }
    }
  });
  assert.equal(out.results.some(r=>r.id==="palette-forge"),false);
  assert.ok(out.withheld.some(r=>r.id==="palette-forge" && r.reasons.includes("educational-game-objective-not-established")));
});

test("explicit game request may show matching unknown-value game without calling it educational",()=>{
  const federation=new LearningFederation({fetchImpl:offline});
  const out=federation.discover({
    query:"show me the Palette Forge game",
    mode:"learning",
    context:{
      enrollment:{
        ageBand:"teen-13-17",
        learning:{gradeLevel:"grade-10",favoriteSubject:"art",interests:["art","games"]}
      }
    }
  });
  const result=out.results.find(r=>r.id==="palette-forge");
  assert.ok(result);
  assert.equal(result.learningValue,"unknown");
  assert.equal(result.educationalGame.eligibleForEducationalRanking,false);
});

test("middle school honestly returns school portal when deeper middle resources are not indexed",()=>{
  const federation=new LearningFederation({fetchImpl:offline});
  const out=federation.discover({
    query:"show me unit 3 mathematics",
    mode:"learning",
    context:{
      enrollment:{
        ageBand:"teen-13-17",
        learning:{gradeLevel:"grade-07",favoriteSubject:"mathematics",interests:[]}
      }
    }
  });
  assert.equal(out.learningContext.currentSchoolSourceId,"khaemenes.middle");
  assert.equal(out.coverage.requestedGranularity,"unit");
  assert.equal(out.coverage.indexed,false);
  assert.match(out.coverage.gap,/does not currently index/i);
});
