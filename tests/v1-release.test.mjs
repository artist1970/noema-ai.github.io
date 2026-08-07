import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("v1 release exposes integrated intelligence plan",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/NOEMA \/ v1\.0/);
  assert.match(html,/Intelligence Plan/);
});
