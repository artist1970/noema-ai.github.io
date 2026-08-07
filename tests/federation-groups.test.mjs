import test from "node:test";
import assert from "node:assert/strict";
import {groupResources} from "../resources/resource-groups.js";

test("grouping separates current school games extensions and research",()=>{
  const groups=groupResources([
    {id:"school-course",sourceId:"khaemenes.high",sourceTier:"current-school",resourceType:"course"},
    {id:"game",sourceId:"verve.arcade-learning",sourceTier:"educational-games",resourceType:"game"},
    {id:"archive",sourceId:"verve.arshif",sourceTier:"archive-extension",resourceType:"reference"},
    {id:"research",sourceId:"verve.plera-search",sourceTier:"outer-research",resourceType:"portal"}
  ],"khaemenes.high");

  assert.ok(groups.find(g=>g.id==="school")?.results.length);
  assert.ok(groups.find(g=>g.id==="games")?.results.length);
  assert.ok(groups.find(g=>g.id==="extensions")?.results.length);
  assert.ok(groups.find(g=>g.id==="research")?.results.length);
});
