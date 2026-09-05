import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("v1.3 intelligence runtime remains preserved behind the neutral gateway",()=>{
  const migration=fs.readFileSync(new URL("../docs/NAIB_CANONICAL_FRONT_MIGRATION.md",import.meta.url),"utf8");
  const sw=fs.readFileSync(new URL("../service-worker.js",import.meta.url),"utf8");
  assert.match(migration,/Internal intelligence runtime/);
  assert.match(migration,/artist1970\/noema-ai\.github\.io/);
  assert.match(migration,/Canonical public front/);
  assert.match(migration,/artist1970\/NAIB\.github\.io/);
  assert.match(sw,/\.\/front\/naib-facade\.js/);
  assert.match(sw,/\.\/storage\/internal-cloud\.js/);
  assert.match(sw,/\.\/app\/noema-app\.js/);
});
