import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("v1.2 shell exposes resource discovery while keeping NAIB public identity",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/NAIB \/ v1\.2/);
  assert.match(html,/Resource Discovery/);
  assert.match(html,/DISCOVERED ≠ VERIFIED/);
});
