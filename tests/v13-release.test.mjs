import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("v1.3 shell keeps NAIB public identity and grouped learning discovery",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/NAIB \/ v1\.3/);
  assert.match(html,/Resource Discovery/);
  assert.match(html,/DISCOVERED ≠ VERIFIED/);

  const app=fs.readFileSync(new URL("../app/noema-app.js",import.meta.url),"utf8");
  assert.match(app,/resource-group/);
  assert.match(app,/games do not outrank direct coursework/i);
});
