import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("public shell is NAIB v1.1 and explains NOEMA administration",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/NAIB \/ v1\.1/);
  assert.match(html,/Public Intelligence Director/);
  assert.match(html,/NOEMA remains the administrative intelligence/);
});
