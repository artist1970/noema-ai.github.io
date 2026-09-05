import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("legacy v1 release lineage now delegates the root to the neutral gateway",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  const gatewayReadme=fs.readFileSync(new URL("../README_GATEWAY.md",import.meta.url),"utf8");
  assert.match(html,/INTELLIGENCE GATEWAY/);
  assert.match(html,/Meet NAIB/);
  assert.match(gatewayReadme,/neutral public gateway/i);
  assert.match(gatewayReadme,/NAIB public front/i);
});
