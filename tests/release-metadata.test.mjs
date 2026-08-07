import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("v0.9 metadata no longer labels NOEMA as adult-only",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/NOEMA \/ v0\.9/);
  assert.match(html,/Sovereign Intelligence Director/);
  assert.equal(html.includes("Sovereign Adult Intelligence"),false);
});
