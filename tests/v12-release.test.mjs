import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("release lineage exposes public directory discovery without protected-runtime coupling",()=>{
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
  const gateway=fs.readFileSync(new URL("../search/gateway-search.js",import.meta.url),"utf8");
  assert.match(html,/Public Directory/);
  assert.match(gateway,/DIRECTORY_URL\s*=\s*["']\.\/directory\/ecosystem\.json["']/);
  assert.doesNotMatch(gateway,/Authorization|api[_-]?key|token|password/i);
  assert.doesNotMatch(html,/app\/noema-app\.js/);
});
