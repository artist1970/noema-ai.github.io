import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("public metadata identifies NAIB while preserving NOEMA administration",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/NAIB — Public Intelligence Director/);
  assert.match(html,/governed behind the scenes by NOEMA/);
});
