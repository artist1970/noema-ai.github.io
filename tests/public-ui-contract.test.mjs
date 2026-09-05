import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const gateway = fs.readFileSync(new URL("../search/gateway-search.js", import.meta.url), "utf8");
const presentation = fs.readFileSync(new URL("../front/public-presentation.js", import.meta.url), "utf8");

test("neutral gateway exposes only current public navigation controls", () => {
  for (const id of ["gatewaySearch", "gatewayQuery", "directoryToggle", "directoryPanel", "searchResults", "resultHeading"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `${id} is missing from index.html`);
  }
  assert.match(html, /search\/gateway-search\.js/);
  assert.doesNotMatch(html, /app\/noema-app\.js/);
});

test("gateway handlers are wired to the current public controls", () => {
  assert.match(gateway, /#gatewaySearch/);
  assert.match(gateway, /#gatewayQuery/);
  assert.match(gateway, /#directoryToggle/);
  assert.match(gateway, /addEventListener\(["']submit["']/);
  assert.match(gateway, /addEventListener\(["']click["']/);
});

test("neutral gateway routes users to the canonical NAIB front", () => {
  assert.match(html, /https:\/\/artist1970\.github\.io\/NAIB\.github\.io\//);
  assert.match(html, /Meet NAIB/);
});

test("legacy compatibility diagnostics remain collapsed", () => {
  assert.match(presentation, /prepareProcessDisclosure/);
  assert.match(presentation, /prepareModuleDisclosure/);
  assert.match(presentation, /collapseResponseDiagnostics/);
  assert.doesNotMatch(presentation, /details\.open\s*=\s*true/);
});

test("public landing copy does not expose the internal administrative name", () => {
  assert.doesNotMatch(html, />[^<]*NOEMA[^<]*</i);
  assert.doesNotMatch(html, /(aria-label|title|placeholder|content)=["'][^"']*NOEMA[^"']*["']/i);
});
