import test from "node:test";
import assert from "node:assert/strict";
import {learningMetadata} from "../resources/learning-metadata.js";

test("game with source-supplied skills gains supplemental learning value",()=>{
  const out=learningMetadata({
    title:"Geometry Game",
    tags:["game"],
    skills:["geometry","spatial-reasoning"],
    domains:["mathematics"]
  },{classification:"educational"});
  assert.equal(out.resourceType,"game");
  assert.equal(out.learningValue,"supplemental");
  assert.deepEqual(out.learningObjectives,["geometry","spatial-reasoning"]);
  assert.equal(out.objectiveProvenance,"source-supplied-skills");
});

test("game without objectives remains unknown rather than invented",()=>{
  const out=learningMetadata({
    title:"Palette Game",
    tags:["game"],
    skills:[],
    domains:["art"]
  },{classification:"creative-education"});
  assert.equal(out.resourceType,"game");
  assert.equal(out.learningValue,"unknown");
  assert.deepEqual(out.learningObjectives,[]);
  assert.equal(out.objectiveProvenance,"not-specified");
});
