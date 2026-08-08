import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const identity = fs.readFileSync(new URL("../front/naib-identity.js", import.meta.url), "utf8");
const ui = fs.readFileSync(new URL("../front/aurora-dictionary-ui.js", import.meta.url), "utf8");
const serviceWorker = fs.readFileSync(new URL("../service-worker.js", import.meta.url), "utf8");

test("NAIB loads the Aurora dictionary UI", () => {
  assert.match(identity, /import\s+["']\.\/aurora-dictionary-ui\.js["']/);
});

test("dictionary control is wired and drawer is minimized by default", () => {
  assert.match(ui, /button\.id\s*=\s*["']dictionaryBtn["']/);
  assert.match(ui, /button\.addEventListener\(["']click["'],\s*openDictionary\)/);
  assert.match(ui, /drawer\.hidden\s*=\s*true/);
  assert.match(ui, /form\.addEventListener\(["']submit["']/);
  assert.match(ui, /dictionaryClose/);
});

test("dictionary integration is offline-ready without blocking live Aurora freshness", () => {
  assert.match(serviceWorker, /naib-shell-v1\.3\.7/);
  assert.match(serviceWorker, /DICTIONARY_CACHE\s*=\s*["']naib-aurora-dictionary-v1["']/);
  assert.match(serviceWorker, /PRESERVED_CACHES/);
  assert.match(serviceWorker, /url\.origin\s*!==\s*self\.location\.origin/);
  assert.match(serviceWorker, /\.\/resources\/aurora-dictionary\.js/);
  assert.match(serviceWorker, /\.\/front\/aurora-dictionary-ui\.js/);
  assert.match(serviceWorker, /\.\/styles\/naib-dictionary\.css/);
});
