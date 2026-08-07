import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("v1.3 preserves NAIB public / NOEMA administrative split",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/NAIB \/ v1\.3/);
  assert.match(html,/NOEMA remains the administrative intelligence/);
});
