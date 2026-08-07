import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("v1.3 retains integrated intelligence plan under NAIB",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/NAIB \/ v1\.3/);
  assert.match(html,/Intelligence Plan/);
});
