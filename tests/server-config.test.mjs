import test from "node:test";
import assert from "node:assert/strict";
import { normalizeServerConfig } from "../config/server-config.js";

test("server remains disabled by default shape", () => {
  const result = normalizeServerConfig({ enabled: false, baseUrl: "http://evil.example" });
  assert.equal(result.enabled, false);
  assert.equal(result.baseUrl, "");
});

test("remote http server is rejected", () => {
  assert.throws(() => normalizeServerConfig({
    enabled: true,
    baseUrl: "http://example.com"
  }), /HTTPS/);
});

test("https server is accepted", () => {
  const result = normalizeServerConfig({
    enabled: true,
    baseUrl: "https://noema.example.org/"
  });
  assert.equal(result.enabled, true);
  assert.equal(result.baseUrl, "https://noema.example.org");
});

test("credentials embedded in URL are rejected", () => {
  assert.throws(() => normalizeServerConfig({
    enabled: true,
    baseUrl: "https://user:secret@noema.example.org"
  }), /Credentials/);
});
