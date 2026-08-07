import test from "node:test";
import assert from "node:assert/strict";
import {refineSketch,mirrorStroke,removeAccidentalStrokes} from "../avatars/sketch-refiner.js";

test("tiny accidental marks are removed",()=>{
  const strokes=[
    {points:[{x:0,y:0},{x:1,y:1}]},
    {points:[{x:0,y:0},{x:10,y:0},{x:20,y:0},{x:30,y:0}]}
  ];
  assert.equal(removeAccidentalStrokes(strokes).length,1);
});

test("refinement preserves source stroke without mutating it",()=>{
  const source=[{color:"#111",width:5,points:[{x:0,y:0},{x:8,y:5},{x:16,y:8},{x:24,y:10},{x:32,y:12}]}];
  const original=JSON.stringify(source);
  const refined=refineSketch(source);
  assert.ok(refined[0].points.length>=2);
  assert.equal(JSON.stringify(source),original);
  assert.equal(refined[0].color,"#111");
});

test("symmetry mirrors across requested axis",()=>{
  const mirrored=mirrorStroke({points:[{x:10,y:20},{x:20,y:30}]},50);
  assert.deepEqual(mirrored.points.map(p=>p.x),[90,80]);
});
