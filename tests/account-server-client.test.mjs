import test from "node:test";
import assert from "node:assert/strict";
import { AccountServerClient } from "../adapters/account-server-client.js";

test("client is disconnected when server config is disabled", () => {
  const client = new AccountServerClient({
    enabled: false,
    baseUrl: "",
    apiPrefix: "/api/v1",
    timeoutMs: 2000,
    credentialsMode: "include",
    expectedHealthPath: "/health"
  }, async () => { throw new Error("should not run"); });

  assert.equal(client.connected, false);
  assert.equal(client.status().browserTokenStorage, false);
});

test("remote calls use credentials include and do not require browser bearer tokens", async () => {
  let seen = null;

  const client = new AccountServerClient({
    enabled: true,
    baseUrl: "https://noema.example.org",
    apiPrefix: "/api/v1",
    timeoutMs: 2000,
    credentialsMode: "include",
    expectedHealthPath: "/health"
  }, async (url, options) => {
    seen = { url, options };
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ id: "person_1" })
    };
  });

  await client.me();
  assert.equal(seen.options.credentials, "include");
  assert.equal("Authorization" in seen.options.headers, false);
});
